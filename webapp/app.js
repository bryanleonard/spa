'use strict';

// Windows command line for environment
// setx NODE_ENV development|production
// Mac, NODE_ENV=production node app.js

// Module scoped vars
var http    = require('http'),
	express = require('express'),
	routes  = require('./routes'),
	app     = express(),
	server  = http.createServer(app);


// ---------------
// Server config
// ---------------
app.configure(function() {
	app.use(express.bodyParser()); 		// decodes forms
	app.use(express.methodOverride()); 	// creating restful services
	app.use(express.basicAuth('user', 'spa'));		// basic user auth, not production quality
	app.use(express.static(__dirname + '/public')); // root directory for static files as <current_directory>/public
	app.use(app.router);						    // add the router middleware after the static files
});


// ---------------
// Environments
// Dev 
// ---------------
app.configure('development', function() {
	app.use(express.logger());			// log the things
	app.use(express.errorHandler({		// dump exceptions, show stack trace
		dumpExceptions : true,
		showStack	   : true
	}));
});

// Prod 
app.configure('production', function() {
	app.use(express.errorHandler);
});


// ---------------
// Route this sucka
// ---------------
routes.configRoutes( app, server );


// ---------------
// Fire it up, man
// ---------------
server.listen(3000);
console.log(
	'Listening on port %d in %s mode.', 
	server.address().port, app.settings.env
);