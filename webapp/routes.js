// Module scoped vars
'use strict';
var configRoutes;

// public methods
configRoutes = function(app, server) {

	app.get('/', function(request, response) {

		response.redirect('/spa.html');
	});

	app.all('/:obj_type/*?', function(request, response, next) {
		response.contentType('json');
		next();
	});

	app.get('/:obj_type/list', function(request, response) {
		response.send({ title: request.params.obj_type + ' list' });
	});

	// Create
	// app.post('/user/create/', function(req, res) ...
	app.post('/:obj_type/create', function(request, response) {
		response.send({ title: request.params.obj_type + ' created' });
	});

	// Read
	app.get('/:obj_type/read/:id([0-9]+)', function(request, response) {
		response.send({
			title: request.params.obj_type + ' with id ' + request.params.id + ' found'
		});
	});

	// Update
	app.post('/:obj_type/update/:id([0-9]+)', function(request, response) {
		response.send({
			title: request.params.obj_type + ' with id ' + request.params.id + ' updated'
		});
	});

	// Delete
	app.get('/:obj_type/delete/:id([0-9]+)', function(request, response) {
		response.send({
			title: request.params.obj_type + ' with id ' + request.params.id + ' deleted'
		});
	});

};


// public methods
// configRoutes = function(app, server) {
// 	app.get('/', function(req, res) {
// 		res.redirect('/spa.html');
// 	});
// 	};

// 	app.all( '/:obj_type/*?', function ( request, response, next ) {
// 		response.contentType( 'json' );
// 		next();
// 	});

// 	app.get( '/:obj_type/list', function ( request, response ) {
// 		response.send({ title: request.params.obj_type + ' list' });
// 	});

// 	// Create
// 	app.post( '/:obj_type/create', function ( request, response ) {
// 		response.send({ title: request.params.obj_type + ' created' });
// 	});

// 	// Read
// 	app.get( '/:obj_type/read/:id([0-9]+)', function ( request, response ) {
// 		response.send({
// 			title: request.params.obj_type
// 			+ ' with id ' + request.params.id + ' found'
// 		});
// 	});

// 	// Update
// 	app.post( '/:obj_type/update/:id([0-9]+)', function ( request, response ) {
// 		response.send({
// 			title: request.params.obj_type
// 			+ ' with id ' + request.params.id + ' updated'
// 		});
// 	});

// 	// Delete
// 	app.get( '/:obj_type/delete/:id([0-9]+)', function ( request, response ) {
// 		response.send({
// 			title: request.params.obj_type
// 			+ ' with id ' + request.params.id + ' deleted'
// 			});
// 	});
// };


// teleport
module.exports = { configRoutes : configRoutes };