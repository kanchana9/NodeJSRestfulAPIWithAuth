// JavaScript source code

var jwt = require('jsonwebtoken');
var User = require('../../app/models/user');
var jwtSecret = require('../../app/models/secret');
var morgan = require('morgan');


var mongoose = require('mongoose');
var express = require('express');
var app = express();
var logger = require('morgan');
app.use(logger('dev'));
var bodyParser = require('body-parser');
app.use(bodyParser.json());
//logging requests to console
app.use(morgan('dev'));
//mongoose.connect('mongodb://localhost/MySampleDatabase', function (err) {
//    if (err) throw err;
//    console.log('Connected to Mongodb sucessfully');
//});


var auth = {

    login: function (req, res) {

        var username = req.body.username || '';
        var password = req.body.password || '';

        if (username == '' || password == '') {
            res.status(401);
            res.json({
                success: false,
                status: 401,
                message: "Please provide Username and Password!"
            });
            return;
        }

        // Fire a query to your DB and check if the credentials are valid
        var dbUserObj = auth.validate(username, password);

        console.log("dbUserObj : " + dbUserObj);

        //if (!dbUserObj) { // If authentication fails, we send a 401 back
            
        //    res.status(401);
        //    res.json({
        //        success: false,
        //        status: 401,
        //        message: "Invalid credentials.User not found!"
        //    });
        //    return;
        //}



        //if user is existing
        if (dbUserObj) {

            // If authentication is success, we will generate a token
            // and dispatch it to the client

            //check if password is matching
            dbUserObj.comparePassword(password, function (err, isMatch) {
                if (err) throw err;
                console.log('Password : ', isMatch); // true
                if (!isMatch) {
                    res.json(
                        {
                            status: 401,
                            success: false,
                            message: "Authentication failed. Invalid password"
                        });
                    return;
                }
            });

            //res.json(genToken(dbUserObj));
            genToken(dbUserObj);
        }

    },

    validate: function (uname, pwd) {
        //// spoofing the DB response for simplicity
        //var dbUserObj = { // spoofing a userobject from the DB. 
        //    name: 'arvind',
        //    role: 'admin',
        //    username: 'arvind@myapp.com'
        //};

        //return dbUserObj;

        //User userObj;

        //User.findOne({ username: uname }, function (err, user) {
        //    if (err) {
        //        console.log("Error : " + err);
        //        throw err;
        //    }
        //    console.log("user : " + user.username);
        //    //return user;
        //    userObj = user
        //});
        //console.log("userObj : " + userObj);
        //return userObj;

        //finding the user first
        User.findOne({ username: uname, password : pwd }, function (err, user) {
            if (err) {
                console.log("Error : " + err);
                throw err;
            }
            if (!user) {
                res.json({ success: false, message: " User not found!" });
            } else if (user) {

                //check if password is matching
                user.comparePassword(password, function (err, isMatch) {
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
                userModel.username = username;
                userModel.password = password;

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


    },

    validateUser: function (username) {
        // spoofing the DB response for simplicity
        //var dbUserObj = { // spoofing a userobject from the DB. 
        //    name: 'arvind',
        //    role: 'admin',
        //    username: 'arvind@myapp.com'
        //};

        //return dbUserObj;

        User.findOne({ username: username }, function (err, user) {
            if (err) {
                console.log("Error : " + err);
                throw err;
            }
            return user;
        });
    },
}

// private method
function genToken(user) {
    //var expires = expiresIn(7); // 7 days
    //var token = jwt.encode({
    //    exp: expires
    //}, require('../config/secret')());

    //return {
    //    token: token,
    //    expires: expires,
    //    user: user
    //};

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
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = auth;