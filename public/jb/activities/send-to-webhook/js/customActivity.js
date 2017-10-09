define( function( require ) {
    'use strict';
	var Postmonger = require( 'postmonger' );
    var connection = new Postmonger.Session();
    var toJbPayload = {};   // Journey Builder Interaction payload
                            // 'toJbPayload' is initialized on 'initActivity' above.
                            // Journey Builder sends an initial payload with defaults
                            // set by this activity's config.json file. Any property
                            // may be overridden as desired.
	var tokens;
	var endpoints;
    var eventDefinitionKey = '';
    var eventDefinitionId = '';
    var webhookUrl = '';
    var eventDataHistory = [];  // List of pre-existing values for Event Data Fields
    var contactDataHistory = []; // List of pre-existing values for Contact Data Fields
    var eventDataFields = []; // List of objects
    var contactAttributeSets = []; // List of objects
    var contactAttributeSetsWithDefinitions = {}; // Object of lists where key=AttributeSet, and value=[field1, field2, ...]
    var step = 1;
    var eventDataLoaded = false; // flag that indicates if Event Data has been loaded
    var contactDataLoaded = false; // flag that indicates if Contact Data has been loaded  
    
    const TEST_MODE = false;
    const LOAD_DATA_IN_TEST_MODE = true;
    // 
    if ( document.readyState === "complete" ||
        ( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {
        window.setTimeout( onRender );
    } else {
        document.addEventListener( "DOMContentLoaded", onRender );
    }
    
    function onRender() {
        //console.log('onRender');
        
        // This event allows to get the Interaction (Journey) details
        connection.trigger( 'requestInteraction' );    
        
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger( 'ready' );
        
        connection.trigger( 'requestTokens' );
        
        connection.trigger( 'requestEndpoints' );
        
        // This event allows to get Interaction (Journey) Defaults - get Channel Address Priority info
        //
        //connection.trigger('requestInteractionDefaults');
    };
    
    
    /* Event handlers */
    
    // TESTING LOCALY - initActivity is usually called when the 'ready' event is fired.
    // For testing purpose it must be fired manually
    //
    if ( TEST_MODE ) {
        toJbPayload.metaData = {};
        toJbPayload.arguments = {};
        toJbPayload.arguments.execute = {};
        toJbPayload.arguments.execute.inArguments = [{webhookUrl:''}];
        
        eventDataLoaded = !LOAD_DATA_IN_TEST_MODE;
        contactDataLoaded = !LOAD_DATA_IN_TEST_MODE;

        eventDefinitionKey = 'ContactEvent-325c4248-7981-05bb-6c78-b4d7fe0198d1';
        eventDefinitionId = 'eb5cea22-076c-4682-94ce-c594e8695bdf';
        
        connection.trigger('initActivity');
    }
    
    // When the activity is dragged from the activity list initially (meaning that it has no existing data),
    // the default activity structure is pulled from the custom application's config.json. 
    // If the activity is a configured activity, the existing saved JSON structure of the activity is passed.
    connection.on( 'initActivity', initialize );
    
    // This listens for Journey Builder to send tokens
    connection.on( 'requestedTokens', onGetTokens );
    
    // This listens for Journey Builder to send endpoints
    connection.on( 'requestedEndpoints', onGetEndpoints );
    
    // Fired in response to a requestInteractionDefaults event called by the Custom Activity.
    // Journey Builder passes back an object containing the current journey default settings for activities.
    //
    //connection.on('requestedInteractionDefaults', onGetInteractionDefaults);
    
    connection.on( 'clickedNext', onClickedNext );
    
    connection.on( 'clickedBack', onClickedBack );

    connection.on( 'requestedInteraction', onRequestInteraction );
    
    /* Event handler functions */

    function initialize ( payload ) {

        //console.log( 'initialize' );
        
        // Get preconfigured data
        if ( payload || TEST_MODE ) {
            toJbPayload = payload;
                        
            // Parse existing payload and prepopulate with existing values
            var inArguments = toJbPayload.arguments.execute.inArguments;
            var len = inArguments.length;
            for( var i = 0; i < len; i++ ) {
                if( inArguments[i].webhookUrl ) {
                    webhookUrl = inArguments[i].webhookUrl;
                     
                } else if( JSON.stringify(inArguments[i]).indexOf( "Event." ) > 0 ) {
                    for( var key in inArguments[i] ) {
                        eventDataHistory.push( key );
                    }
                } else if( JSON.stringify(inArguments[i]).indexOf( "Contact." ) > 0 ) {
                    for( var key in inArguments[i] ) {
                        contactDataHistory.push( key );
                    }
                }
                //console.log( 'inArguments[i]: ', inArguments[i] );
            }
            //console.log( 'eventDataHistory: ', eventDataHistory );
            //console.log( 'contactDataHistory: ', contactDataHistory );
            //console.log( 'webhookUrl: ', webhookUrl );
            
            /** Prepopulate elements - Start (should run only once when initialized) **/
            // Webhook URL
            $( "#txtWebhookUrl" ).val( webhookUrl );
            // Event Data Fields
            for ( var i = 0; i < eventDataHistory.length; i++ ) {
                if ( i === (eventDataHistory.length - 1) ) { // First element
                    $( ".selEventDataField:first" ).append("<option value='" + eventDataHistory[i] + "' selected>" +  eventDataHistory[i] + "</option>");
                } else {
                    var lastElem = $( ".eventDataField" ).first();
                    var newElem = lastElem.clone();
                    // Insert afet the last
                    lastElem.after( newElem );
                    // Display the Remove Button
                    newElem.find( "button" ).removeClass( "hidden" );
                    // Hide the Add button if there are no more fields left
                    if ( $( ".eventDataField" ).length === eventDataHistory.length ) {
                        $( this ).addClass( "hidden" );
                    }
                    newElem.find( ".selEventDataField" ).append("<option value='" + eventDataHistory[i] + "' selected>" +  eventDataHistory[i] + "</option>");
                }
            }
            /** Prepopulate elements - End **/

        }

        gotoStep( step );
    }

    function onRequestInteraction ( interaction ) {
        //console.log( 'requestedInteraction' );
        //console.log( 'interaction: ' + JSON.stringify(interaction) );
        if ( interaction ) {
            if ( interaction.triggers[0] ) {
                if ( interaction.triggers[0].metaData ) {
                    eventDefinitionKey = interaction.triggers[0].metaData.eventDefinitionKey;
                    eventDefinitionId = interaction.triggers[0].metaData.eventDefinitionId;
                } else {
                    console.log( 'triggers metaData data of the current interaction is not available' );
                }
            } else {
                console.log( 'triggers data of the current interaction is not available' );
            }
        } else {
            console.log( 'interaction data is not available' );
        }

    }
    
    // Parameter is either the tokens data or an object with an
	// "error" property containing the error message
    function onGetTokens ( data ) {
        
        //console.log('onGetTokens');
        
		if( data.error ) {
			//console.error( data.error );
		} else {
			tokens = data;
            //console.log('Tokens: ', tokens);
		}
	}
    
    // Parameter is either the endpoints data or an object with an
	// "error" property containing the error message    
    function onGetEndpoints ( data ) {
        
        //console.log('onGetEndpoints');
        
		if( data.error ) {
			//console.error( data.error );
		} else {
			endpoints = data;
            //console.log('Endpoints: ', endpoints);
		}
	}
        
    function onClickedNext() {
        //console.log( 'onClickedNext' );
        
        if ( validate() ) {
            step++;
            gotoStep( step );
        }
        connection.trigger( 'ready' );
    }
    
    function onClickedBack() {
        //console.log( 'onClickedBack' );
        
        step--;
        gotoStep( step );
        connection.trigger( 'ready' );
    }
    
    function save() { 

        // Build a list of objects - parameters that the Interaction will use while executing a Journey
        var inArguments = [];
        
        // Webhook URL
        webhookUrl = getWebhookUrl();
        inArguments.push( {webhookUrl: webhookUrl} );
        
        // Event Data Fields
        var selectedEventDataFields = getSelectedEventDataFields();
        //console.log( 'selectedEventDataFields: ', selectedEventDataFields );
        for ( var i = 0; i < selectedEventDataFields.length; i++ ) {
            var item = {};
            // { 'Task:Who:Contact:FirstName': '{{Event.' + eventDefinitionKey + '.\"Task:Who:Contact:FirstName\"}}' }
            item["" + selectedEventDataFields[i] + ""] = '{{Event.' + eventDefinitionKey + '.\"' + selectedEventDataFields[i] + '\"}}';

            inArguments.push( item );
        }
        
        // Contact Data Fields
        var selectedContactDataFields = getSelectedContactDataFields();
        //console.log( 'selectedContactDataFields: ', selectedContactDataFields );
        for ( var i = 0; i < selectedContactDataFields.length; i++ ) {
            var item = {};
            var attributeSetName = selectedContactDataFields[i].split('.')[0];
            var attributeName = selectedContactDataFields[i].split('.')[1];
            item["" + attributeSetName + ":" + attributeName + ""] = '{{Contact.Attribute.\"' + attributeSetName + '\".\"' + attributeName + '\"}}';
            inArguments.push( item );
        }
        
        //console.log( 'inArguments: ', inArguments );
        
        // Write values to the Journey Builder payload
        toJbPayload['arguments'].execute.inArguments = inArguments;
        toJbPayload.metaData.isConfigured = true;
        console.log( 'Updated toJbPayload: ', JSON.stringify( toJbPayload ) );
        
        // Trigger the updateActivity event. It is called when the activity modal should be closed, 
        // with the data saved to the activity on the canvas.
        connection.trigger('updateActivity', toJbPayload);
    }
    
    function gotoStep( step ) {
        $('.step').hide();
        
        switch( step ) {
            case 1:
                $( '#step1' ).show();
                connection.trigger( 'updateButton', { button: 'back', visible: false } );
                connection.trigger( 'updateButton', { button: 'next', text: 'next', enabled: true } );
                break;
            case 2:
                if ( eventDataLoaded ) {
                    $( '#step2' ).show();
                } else {
                    loadEventData().done( function() {
                        $( '#step2' ).show();
                    });
                    eventDataLoaded = true;
                }
                connection.trigger( 'updateButton', { button: 'back', visible: true } );
                connection.trigger( 'updateButton', { button: 'next', text: 'next', visible: true } );
                break;
            case 3:
                if ( contactDataLoaded ) {
                    $( '#step3' ).show();
                } else {
                    loadContactData().done( function() {
                        $( '#step3' ).show();
                    });
                    contactDataLoaded = true;
                }
                connection.trigger( 'updateButton', { button: 'back', visible: true } );
                connection.trigger( 'updateButton', { button: 'next', text: 'done', visible: true } );
                break;
            case 4: // this is the final step - save
                save();
                break;
            default:
                console.log( "Unexpected step" );
        }
        
    }
    
   /* Helper functions */
   
   // Get data from input field in the index.html form
    function getWebhookUrl() {      
        return $.trim( $("#txtWebhookUrl").val() );
    }
    
    // Function that populates select controls with data
    // -- data - is an array of objects [{},{},...]
    function fillSelectControlWithData ( control, data ) {
        //console.log( "[fillSelectControlWithData]: " + data );
        if ( data ) {
            var conrtolValues = [];
            control.find( "option" ).each( function( index, element ) {
                conrtolValues.push( element.value );
            });
            //console.log( 'conrtolValues: ' + conrtolValues );
            
            var len = data.length;
            for ( var i = 0; i < len; i++ ) {
                var item = data[i];

                for ( var key in item ) {
                    //console.log( key );
                    // Do not all if value is already in the options
                    if ( conrtolValues.includes( key ) ) continue;
                    control.append("<option value='" + key + "'>" +  item[key] + "</option>");
                }
            }
        }
    }
    
    function loadEventData() {
        var dfrd1 = $.Deferred();
        
        if ( !eventDefinitionId ) {
            dfrd1.resolve();
            return $.when( dfrd1 ).done(function() {
                console.log('Callout was not made');
            }).promise();
        }
        
        // Load event data
        $.get( "/event/" + eventDefinitionId + "/action/fields", function( data ) {
            $.each( data, function(i, item) {
                //eventDataFields[item.key] = item.label;
                var obj = {};
                obj[item.key] = item.label;
                eventDataFields[i] = obj;
            });
             //console.log( eventDataFields );
             $( ".selEventDataField" ).each( function ( index, element ) {
                 fillSelectControlWithData( $( element ), eventDataFields );
             });
             dfrd1.resolve();
        });
        return $.when( dfrd1 ).done(function() {
                //console.log('Callout completed');
            }).promise();
    }
    
    function loadContactData() {
         var dfrd1 = $.Deferred();
        // Load contact meta data
        $.get( "/attributeSetDefinitions", function( data ) {
            $.each(data, function(i, item) {
                //console.log( item );
                var obj = {};
                obj[item.name] = item.name;
                contactAttributeSets.push( obj );
            });
            //console.log( contactAttributeSets );
            $( ".selContactAttributeSet" ).each( function ( index, element ) {
                fillSelectControlWithData( $( element ), contactAttributeSets );
            });
            dfrd1.resolve();
        });
        return $.when( dfrd1 ).done(function() {
                //console.log('Callout completed');
            }).promise();
    }
    
    $( document ).ready( function() {
        
        /** Event Data Field  **/
        // Add new Event Data Field
        $( "#addEventDataField" ).click( function () {
            
            // Add new element by clonnig its sibling only if there are enought items in the list
            if ( $( ".eventDataField" ).length < eventDataFields.length ) {
                var lastElem = $( ".eventDataField" ).last();
                var newElem = lastElem.clone();
                // Insert afet the last
                lastElem.after( newElem );

                // Display the Remove Button
                newElem.find( "button" ).removeClass( "hidden" );
                
                // Hide the Add button if there are no more fields left
                if ( $( ".eventDataField" ).length === eventDataFields.length ) {
                    $( this ).addClass( "hidden" );
                }
            }
        });
        
        // Remove Event Data Field
        $( ".eventDataFieldsContainer" ).on("click", ".removeEventDataField", function () {
            // Do not remove if this is the only element left
            if ( $( ".eventDataField" ).length > 1 ) {
                $( this ).parent().parent().remove();
                // Show the Add button
                $( "#addEventDataField" ).removeClass( "hidden" );
            }
        });
        
        /** Contact Attribute Set Field  **/
        // Add new Contact Attribute Set Field
        $( ".contactAttributeFieldsContainer" ).on("click", ".addContactAttributeField", function () {
            //console.log( this );
            var lastElem = $( this ).parent().find( ".contactAttributeSetField" ).last();
            var newElem = lastElem.clone();
            // Insert afet the last
            lastElem.after( newElem );
            // Display the Remove Button
            newElem.find( "button" ).removeClass( "hidden" );
            // Clear the value of the new control
            newElem.find( "input" ).val( "" );
        });
        
        // Remove Contact Attribute Set Field
        $( ".contactAttributeFieldsContainer" ).on("click", ".removeContactAttributeField", function () {
            // Do not remove if this is the only element left
            if ( $( ".contactAttributeSetField" ).length > 1 ) {
                $( this ).parent().parent().remove();
                // Show the Add button
                $( this ).parent().parent().find( ".addContactAttributeField" ).removeClass( "hidden" );
            }
        });
        
        /** Contact Attribute Set  **/
        // Add new Contact Attribute Set
        $( "#addContactAttributeSet" ).click( function () {
            var lastElem = $( ".attributeSet" ).first();
            var newElem = lastElem.clone();
            // Insert afet the last
            lastElem.after( newElem );
            
            // Remove all Attribute Set Fields except the first
            var firstElem = $( newElem ).find( ".contactAttributeSetField" ).first();
            $( newElem ).find( ".contactAttributeSetField" ).not( firstElem ).each( function( index, element ) {
                $( element ).remove();
            });
            // Empty the options for the first item
            firstElem.find( ".selContactAttributeSetField" ).empty();
            firstElem.find( ".selContactAttributeSetField" ).append("<option value='' disabled selected>--Please Select--</option>");
            
            // Display the Remove Button
            newElem.find( "button.removeContactAttributeSet" ).removeClass( "hidden" );
        });
        // Remove Contact Attribute Set
        $( ".contactAttributeFieldsContainer" ).on("click", ".removeContactAttributeSet", function () {
            // Do not remove if this is the only element left
            if ( $( ".attributeSet" ).length > 1 ) {
                $( this ).parent().parent().parent().remove();
                // Show the Add button
                $( this ).parent().parent().parent().find( ".addContactAttributeSet" ).removeClass( "hidden" );
            }
        });
        
        /** Contact Attribute Set Select Changed **/
        // Populate Attribute Set Fields of the related Attribute Set
        $( ".contactAttributeFieldsContainer" ).on("change", ".selContactAttributeSet", function () {
            var selThis = $( this );
            var attributeSetName = selThis.val();
            //console.log( attributeSetName );
            //console.log( this.id );
            
            // Remove all Attribute Set Fields except the first
            var firstElem = $( selThis ).parent().parent().parent().find( ".contactAttributeSetField" ).first();
            $( selThis ).parent().parent().parent().find( ".contactAttributeSetField" ).not( firstElem ).each( function( index, element ) {
                $( element ).remove();
            });
            // Empty the options for the first item
            firstElem.find( ".selContactAttributeSetField" ).empty();
            firstElem.find( ".selContactAttributeSetField" ).append("<option value='' disabled selected>--Please Select--</option>");
            
            
            // Populate the select element
            if ( contactAttributeSetsWithDefinitions[attributeSetName] ) {
                console.log( "Adding from cache..." );
                // Value exists in cache
                $( selThis ).parent().parent().parent().find( ".selContactAttributeSetField" ).each( function( index, element ) {
                    fillSelectControlWithData( $( element ), contactAttributeSetsWithDefinitions[attributeSetName] );
                });
             } else { 
                console.log( "Making an API request..." );
                // Get data for the field list from API
                $.get( "/attributeSetDefinitionFields/" + attributeSetName, function( data ) {
                    //console.log( "Looking up fields for :" + attributeSetName );
                    var attributeSetFields = []; // Array of objects
                    $.each(data, function(i, item) {
                        var obj = {};
                        obj[attributeSetName + '.' + item.key] = item.name;
                        attributeSetFields.push( obj );
                    });
                    
                    // Add into cache
                    contactAttributeSetsWithDefinitions[attributeSetName] = attributeSetFields;
                    
                    $( selThis ).parent().parent().parent().find( ".selContactAttributeSetField" ).each( function( index, element ) {

                        fillSelectControlWithData( $( element ), contactAttributeSetsWithDefinitions[attributeSetName] );
                    });
                    //console.log( "Fields for " + attributeSetName + " have been found: " + attributeSetFields );
                });
            }
            
        });
        
        // TESTING
        if ( TEST_MODE ) {
            $( "[id*='test']" ).removeClass( "hidden" );
            //$( "[id*='test']" ).addClass( "hidden" );
        
            $( "#test-save" ).click(function() {
                save();
            });
            $( "#test-next" ).click(function() {
                if ( validate() ) {
                    step++;
                    gotoStep(step);
                }
            });
             $( "#test-prev" ).click(function() {
                step--;
                gotoStep(step);
            });
        }
        
    });
            
    function getSelectedEventDataFields () {
        var values = [];
        $( ".selEventDataField" ).each( function( index, element ) {
            //console.log( element );

            // Select only values which ate not empty
            if ( element.value ) {
                values.push( element.value );
            }
        });
        return values;
    }
    
    function getSelectedContactDataFields() {
        var values = [];
        $( ".selContactAttributeSetField" ).each( function( index, element ) {
            //console.log( element );

            // Select only values which ate not empty
            if ( element.value ) {
                values.push( element.value );
            }
        });
        return values;
    }
    
    function validate() {
        var valid = true;
        var message = '';
        switch( step ) {
            case 1:
                if( $( "#txtWebhookUrl" ).val().length < 1 ) {
                    valid = false;
                    message = 'You must provide Webhook URL!';
                }
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
                break;    
            default:
                console.log( "Unexpected step" );
        }
        if ( valid ) {
            $( "#message" ).hide();
        } else {
            $( "#message" ).show();
            $( "#message" ).find( ".text" ).text( message );
        }
        return valid;
    }

});