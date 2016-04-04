'use strict';

// Windows command line for environment
// setx NODE_ENV development|production

// Module scoped vars
var http    = require('http'),
	express = require('express'),
	app     = express(),
	server  = http.createServer(app);

// Server config
app.configure(function() {
	app.use(express.bodyParser()); 		// decodes forms
	app.use(express.methodOverride()); 	// creating restful services
});

app.configure('development', function() {
	app.use(express.logger());			// log the things
	app.use(express.errorHandler({		// dump exceptions, show stack trace
		dumpExceptions : true,
		showStack	   : true
	}));
});

app.configure('production', function() {
	app.use(express.errorHandler);
});

app.get('/', function(req, res) {
	res.send('Hello Express');
});

// Fire it up, man
server.listen(3000);
console.log(
	'Listening on port %d in %s mode.', 
	server.address().port, app.settings.env
);