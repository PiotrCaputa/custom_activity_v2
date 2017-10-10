'use strict';

// Module Dependencies
const express     = require('express');
const bodyParser  = require('body-parser');
const logger      = require('morgan');
const http        = require('http');
const path        = require('path');
const routes      = require('./routes');
const activity    = require('./routes/routesCustomActivity');
const sfmc        = require('./routes/routesSFMC');
const config      = require('./config/config.json');
// Helper utility for verifying and decoding the jwt sent from Salesforce Marketing Cloud.
const verifyJwt   = require( path.join(__dirname, 'lib', 'jwt.js') );

// Custom security middleware - Will be used later
function tokenFromJWT( req, res, next ) {
    /*
	verifyJwt(req.body, config.jwtSecret, (err, decoded) => {
		// verification error -> unauthorized request
		
        
        if (err) {
            console.log( 'tokenFromJWT => failed');
            return res.status(401).send( 'Not Authorized' );
        }
        
        console.log( 'tokenFromJWT => passed');
		//return res.status(200).json({success: true});
        next();
	});
    */
    next();
}

// Express application
const app = express();

// Specify the port in the application environment
app.set( 'port', process.env.PORT || 3000 );
// Specify the logging middleware and level
app.use( logger('dev') );
// For parsing application/json
app.use( bodyParser.json() );
// Register middleware that parses the request payload.
/*
app.use( bodyParser.raw( {
	type: 'application/jwt'
}));
*/

// Serve the custom activity's interface, config, etc.
app.use( express.static(path.join(__dirname, 'public')) );

// HubExchange Routes
app.get( '/', tokenFromJWT, routes.index );
app.post( '/login', tokenFromJWT, routes.login );
app.post( '/logout', tokenFromJWT, routes.logout );
// Routes for saving, publishing and validating the custom activity.
app.post( '/jb/activities/send-to-webhook/save/', activity.save );
app.post( '/jb/activities/send-to-webhook/validate/', activity.validate );
app.post( '/jb/activities/send-to-webhook/publish/', activity.publish );
// Route that is called for every contact who reaches the custom activity
app.post( '/jb/activities/send-to-webhook/execute/', activity.execute );
// Routes that are called from the Custom Activity UI
app.get( '/event/:id/action/fields', sfmc.getEventDataFieldsById );
app.get( '/attributeSetDefinitions', sfmc.getAttributeSetDefinitions );
app.get( '/attributeSetDefinitionFields/:name', sfmc.getAttributeSetDefinitionFieldsByName );

// catch 404
app.use( function (req, res, next) {
  res.status(404).send( "Sorry can't find that!" );
});

// Start the server and listen on the port specified by the application environment
http.createServer( app ).listen( app.get('port'), function(){
  console.log('Server is listening on port ' + app.get('port'));
});
