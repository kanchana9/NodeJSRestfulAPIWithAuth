// Core functionality on server

var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var app = express();


var jwt = require('jsonwebtoken');
var User = require('./app/models/user');

var config = require('./config');
var jwtSecret = require('./app/models/secret');

//if any port variable is defined in the system environment variables, use that, or we can have defined port 8080
var port = process.env.PORT || 8080;

mongoose.connect('mongodb://localhost/MySampleDatabase', function(err) {
    if (err) throw err;
    console.log('Connected to Mongodb sucessfully');
});


app.use(bodyParser.urlencoded({ extended: false }));//earlier true
app.use(bodyParser.json());

//logging requests to console
app.use(morgan('dev'));

//********Not Using Router*********************************************

app.get('/', function(req, res) {
    res.send("Api is running at http://localhost:" + port + "/api");
});

app.get('/createuser', function (req, res) {
    // new user data
    var userData = new User({
        username: 'Apple',
        password: 'stevejobs',
        admin: true,
        location: 'LA'
    });

    //save user to database
    userData.save(function(err) {
        if (err) {
            console.log("\n Error occured while saving the user : " + err);
            throw err;
        } else {
            console.log("\n User is saved sucessfully!");
            res.json({ success: true });
        }
    })
})



//********Using Router*********************************************

var apiRoutes = express.Router();
app.use('/api', apiRoutes);


//********Route to authenticate a user*******

apiRoutes.post('/authenticate', function (req, res) {

    //finding the user first
    User.findOne({ username: req.body.username }, function (err, user) {
        if (err) {
            console.log("Error : " + err);
            throw err;
        }
        if (!user) {
            res.json({ success: false, message: " User not found!" });
        } else if (user) {

            //check if password is matching
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (err) throw err;
                console.log('Password : ', isMatch); // true
                if (!isMatch) {
                    res.json({ success: false, message: " Authentication failed. Invalid password" });
                }
            });

            //if (User.password != req.body.password) {
            //    res.json({ success: false, message: " Authentication failed. Invalid password" });
            //}
            //} else {
            //user is valid, create JWT token here

            var userModel = new User();
            userModel.username = req.body.username;
            userModel.password = req.body.password;

            userModel.save(function (err, user) {
                //user.token = jwt.sign(user, jwt_secret);
                var token = jwt.sign(user, jwtSecret());
                user.save(function (err, user1) {
                    res.json({
                        success: true,
                        data: user1,
                        token: token
                    });
                });
            });


            //var token = jwt.sign(user, app.get('superSecret'), {
            //    expireInMinutes: 1440 //24 hrs
            //});

            //return res.json({
            //    success: true,
            //    message: " Here is the token",
            //    token: token
            //});
        }
    });
})

//********Route middleware to authenticate a user*******

//apiRoutes.use(function(req, res, next) {
    


//})




//used the below endpoints when no auth is used
apiRoutes.get('/',function(req, res) {
    res.json({ message: "Welcome  to the API" });
})


apiRoutes.get('/users', function(req, res) {
    User.find({}, function(err, users) {
        res.json(users);
    });
});



//starting the server
app.listen(port);
console.log("Server is running at :" + port);