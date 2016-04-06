'use strict';

// Windows command line for environment
// setx NODE_ENV development|production
// Mac, NODE_ENV=production node app.js

// Module scoped vars
var http    = require('http'),
	express = require('express'),
	app     = express(),
	server  = http.createServer(app);


// Server config
app.configure(function() {
	app.use(express.bodyParser()); 		// decodes forms
	app.use(express.methodOverride()); 	// creating restful services
	app.use(express.static(__dirname + '/public')); //root directory for static files as <current_directory>/public
	app.use(app.router);						   // Add the router middleware after the static files
});


// For dev environment
app.configure('development', function() {
	app.use(express.logger());			// log the things
	app.use(express.errorHandler({		// dump exceptions, show stack trace
		dumpExceptions : true,
		showStack	   : true
	}));
});


// For prod environment
app.configure('production', function() {
	app.use(express.errorHandler);
});


// all configurations below are for routes
app.get('/', function(req, res) {
	res.redirect('/spa.html');
});

// app.all('/user/*?', function(req, res, next) {
app.all('/:obj_type/*?', function(req, res, next) {
	res.contentType('json');
	next();
});

// app.get('/user/list', function(req, res) {
app.get('/:obj_type/list', function(req, res) {
	// res.send({title: 'user list'});
	res.send({title: req.params.obj_type + ' list'});
});

// create a user obj
// app.post('/user/create/', function(req, res) {
app.post('/:obj_type/create/', function(req, res) {
	res.send({title: req.params.obj_type + ' created'})
});

// read a user obj w/numbers only regex
// app.get('/user/read/:id([0-9]+)', function(req, res) {
app.get('/:obj_type/read/:id([0-9]+)', function(req, res) {
	res.send({
		title: req.params.obj_type + ' with id ' + req.params.id + ' found'
	});
});

// update user
// app.post('/user/update/:id([0-9]+)', function(req, res) {
app.post('/:obj_type/update/:id([0-9]+)', function(req, res) {
	res.send({
		title: req.params.obj_type + ' with id ' + req.params.id + ' updated'
	});
});

// delete user
// app.get('/user/delete/:id([0-9]+)', function(req, res) {
app.get('/:obj_type/delete/:id([0-9]+)', function(req, res) {
	res.send({
		title: req.params.obj_type + ' with id ' + req.params.id + ' deleted'
	});
});

// ---------------
// Fire it up, man
server.listen(3000);
console.log(
	'Listening on port %d in %s mode.', 
	server.address().port, app.settings.env
);