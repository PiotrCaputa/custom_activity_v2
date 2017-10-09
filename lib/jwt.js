'use strict';

module.exports = (body, secret, cb) => {
	if (!body) {
		return cb(new Error('invalid jwtdata'));
	}
    //console.log( 'jwt => ', JSON.stringify(body), ' secret => ', secret );
	require('jsonwebtoken').verify( body.toString('utf8'), secret, {
		algorithm: 'HS256'
	}, cb);
};