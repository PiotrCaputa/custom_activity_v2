'use strict';

var util = require( 'util' );
var request = require( 'request' );

exports.logExecuteData = [];

function logData( req ) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
        console.log( "body: " + util.inspect( req.body ) );
        console.log( "headers: " + req.headers );
        console.log( "trailers: " + req.trailers );
        console.log( "method: " + req.method );
        console.log( "url: " + req.url );
        console.log( "params: " + util.inspect( req.params ) );
        console.log( "query: " + util.inspect( req.query ) );
        console.log( "route: " + req.route );
        console.log( "cookies: " + req.cookies );
        console.log( "ip: " + req.ip );
        console.log( "path: " + req.path );
        console.log( "host: " + req.host );
        console.log( "fresh: " + req.fresh );
        console.log( "stale: " + req.stale );
        console.log( "protocol: " + req.protocol );
        console.log( "secure: " + req.secure );
        console.log( "originalUrl: " + req.originalUrl );
}

/*
 * POST handler for / route of Activity (this is the edit route).
 */
exports.edit = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData( req );
    res.status(200).send( 'Edit' );
};

/*
 * POST handler for /save/ route of Activity.
 */
exports.save = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData( req );
    res.status(200).send( 'Save' );
};

/*
 * POST handler for /publish/ route of Activity.
 */
exports.publish = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData( req );
    res.status(200).send( 'Publish' );
};

/*
 * POST handler for /validate/ route of Activity.
 */
exports.validate = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData( req );
    res.status(200).send( 'Validate' );
};

/*
 * POST handler for /execute/ route of Activity.
 */
exports.execute = function( req, res ) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData( req );
    
    var activity = req.body;
    // Since activity.inArguments is of the format  [{"FirstName":"Foo1"},{"LastName":"Spam1"},{"EmailAddress":"foo1.spam@eggs.com"},{"ID":"customevent1"},{"Phone":"15780270981"}]
    // it must be one JSON string { "FirstName": "Test", "LastName": "User", "EmailAddress": "test.user@spotcap.com", "ID": "customevent", "Phone": "15780270989" }
    var data = makeJson( activity.inArguments );
    var headers = {'User-Agent': 'sfmc-custom-activity-webhook'};
    var webhookUrl = activity.inArguments[0].webhookUrl;
    // Make a POST request to the given endpoint
    executeHttpRequest( webhookUrl, "POST", headers, data, "json" );
    
    res.status(200).send( 'Execute' );
};

function makeJson(data) {
    var result = {};
    for (var i = 0; i < data.length; i++){
        for(var key in data[i]){
            result[key] = data[i][key];
        }
    }
    return result;
}

function executeHttpRequest(url, method, headers, data, dataType) {
    var options = {
		url: url,
		method: method,
		headers: headers,
        json: data
	};
    request(options, function (err, resp, body) {	
		if(!err) {
			if(resp.statusCode === 200) {
				console.log( method + " request to " + url + " with body: " + JSON.stringify(data) + " - OK");
			}
			else {
                console.log( "request Invalid Status Code:"  + resp.statusCode);

			}
		}
		else {
			console.log( "request error" + err);
		}
	});
}