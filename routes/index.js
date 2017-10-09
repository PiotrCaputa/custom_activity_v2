'use strict';

/*
 * GET handler for the '/' route.
 */
exports.index = function(req, res) {
    console.log( 'GET Homepage: ', req.body );
    res.status(200).send("Homepage");
};
/*
 * POST handler for the '/login' route.
 */
exports.login = function( req, res ) {
    console.log( 'req.body: ', req.body );
    //res.redirect( '/' );
    res.status(200).send("Login");
};
/*
 * POST handler for the '/logout' route.
 */
exports.logout = function( req, res ) {
    //req.session.token = '';
    res.status(200).send("Logout");
};
