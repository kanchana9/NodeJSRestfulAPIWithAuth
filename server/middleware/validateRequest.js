// JavaScript source code

var jwt = require('jsonwebtoken');
var jwtSecret = require('../../app/models/secret');
var validateUser = require('../routes/auth').validateUser;

module.exports = function (req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.queryCommandEnabled.token || req.headers['x-access-token'];
    var key = (req.body && req.body.x_key) || (req.query && req.query.x_key) || req.headers['x-key'];

    //decode token
    if (token || key) {

       // var decoded = jwt.decode(token, jwtSecret());

        jwt.verify(token, jwtSecret(), function (err, decodedToken) {
            if (err) {
                return res.JSON({
                    success: false,
                    message: 'Failed to authenticate the token'
                });
            } else {
                req.decodedToken = decodedToken;
                next();
            }
        });


        //Now validate whether the user can access the resources using key
        //var dbUser = validateUser(key);
        //if (dbUser) {
            
        //}

    } else {

        return res.status(403).send({
            success: false,
            message: 'Token has not been provided'
        });
    }

}