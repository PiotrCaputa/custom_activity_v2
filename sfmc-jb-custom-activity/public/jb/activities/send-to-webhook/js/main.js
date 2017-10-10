'use strict';

requirejs.config({
    paths: {
        vendor: './vendor',
		postmonger: 'vendor/postmonger',
        jquery: 'vendor/jquery.min'
    },
    shim: {
        'jquery': {
            exports: '$'
        },
		'customActivity': {
			deps: ['jquery', 'postmonger']
		}
    }
});

requirejs( ['jquery', 'customActivity'], function( $, customActivity ) {
	//console.log( 'REQUIRE LOADED' );
});

requirejs.onError = function( err ) {
	//console.log( "REQUIRE ERROR: ", err );
	if( err.requireType === 'timeout' ) {
		console.log( 'modules: ' + err.requireModules );
	}

	throw err;
};