'use strict';

var sfmc = require('../lib/sfmc');

/*
 * GET handler for /event/:id/action/fields route of App.
 */
exports.getEventDataFieldsById = function(req, res, next) {
	var id = req.params.id;
	console.log(id);
	sfmc.getEventColumns(id, function(err, data) {
		if(err) {
			return next(err);
		}
		var results = [];
		
		var contactKey = {};
		contactKey.key = "contactKey";
		contactKey.label = "Contact Key";
		results.push(contactKey);
		
		for(var i = 0; i < data.length; i++) {
			var item = data[i];
            var result = {};
            result.key = item.name;
            result.label = item.name;
			results.push(result);
		}
		res.json(results);
		//res.json(data);
	});	
};

/*
 * GET handler for /attributeSetDefinitions route of App.
 */
exports.getAttributeSetDefinitions = function(req, res, next) {
	sfmc.listAttributeSetDefinitions(function(err, data) {
		if(err) {
			return next(err);
		}
		var results = [];
		for(var i = 0; i < data.length; i++) {
			var item = data[i];
			var result = {};
			result.id = item.id;
            result.key = item.key;
			result.name = item.name;
            //result.attributes = item.attributes;
			results.push(result);
		}
        //console.log( results.length );
		res.json(results);
	});	
};

/*
 * GET handler for /attributeSetDefinitionFields/:name route of App.
 */
exports.getAttributeSetDefinitionFieldsByName = function(req, res, next) {
	var name = req.params.name;
    sfmc.listAttributeSetDefinition(name, function(err, data) {
		if(err) {
			return next(err);
		}
        var items = data.attributes;
        console.log( items );
		var results = [];
		for(var i = 0; i < items.length; i++) {
			var item = items[i];
			var result = {};
			result.id = item.id;
            result.key = item.key;
			result.name = item.name;
			results.push( result );
		}
		res.json( results );
	});	
};