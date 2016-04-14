// Module scoped vars
'use strict';
var configRoutes,
	mongodb = require('mongodb'),
	mongoServer = new mongodb.Server(
		'local',
		mongodb.Connection.DEFAULT_PORT
	),
	dbHandle = new mongodb.Db(
		'spa', mongoServer, {safe: true}
	);

dbHandle.open(function() {
	console.log('** Connected to MongoDB ** ');
});

// public methods
configRoutes = function(app, server) {

	app.get('/', function(request, response) {
		response.redirect('/spa.html');
	});

	app.all('/:obj_type/*?', function(request, response, next) {
		response.contentType('json');
		next();
	});


// 
// var findRestaurants = function(db, callback) {
//    var cursor =db.collection('restaurants').find( );
//    cursor.each(function(err, doc) {
//       assert.equal(err, null);
//       if (doc != null) {
//          console.dir(doc);
//       } else {
//          callback();
//       }
//    });
// };

	app.get('/:obj_type/list', function(request, response) {


	// console.log(request.params.obj_type);

		// var cursor = dbHandle.collection(request.params.obj_type).find();
		//var cursor = dbHandle[request.params.obj_type];

		// cursor.each(function(err, doc) {
	 	//		console.log(doc);
		// });


		dbHandle.collection( request.params.obj_type, function(outer_error, collection) {

				collection.find().toArray(
					function(inner_error, map_list) {

						console.log('response:', map_list);
						//response.send(map_list);		// Send the JSON back to the client
					}
				);
			}
		);
		// response.send({ title: request.params.obj_type + ' list' });
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