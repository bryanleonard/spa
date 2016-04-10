'use strict';

var setWatch,
	http     = require('http'),
	express  = require('express'),
	socketIo = require('socket.io'),
	fsHandle = require('fs'),
	app      = express(),
	server   = http.createServer(app),
	io       = socketIo.listen(server),
	watchMap = {};
	
// ---------------
// utility methods
// ---------------
setWatch = function(url_path, file_type) {
	console.log('setWatch called on %s', url_path);

	if (!watchMap[url_path]) {
		console.log('setting watch on ' + url_path);

		fsHandle.watchFile(
			url_path.slice(1), // trim '/' to get relative path from curr dir
			function(curr, prev) {
				console.log('file accessed');
				if (curr.time !== prev.mtime) {
					console.log('file changed');
					io.sockets.emit(file_type, url_path); // emit a script or CSS event indicating file changed
				}
			}
		);
		watchMap[url_path] = true;
	}
};

// ---------------
// server config
// ---------------
app.configure(function() {
	app.use(function(req, res, next) {
		if (req.url.indexOf('/js/') >= 0) {
			setWatch(req.url, 'script');
		}
		else if (req.url.indexOf('/css/') >= 0) {
			setWatch(req.url, 'stylesheet');
		}
		next();
	});

	app.use(express.static(__dirname + '/'));
});

app.get('/', function(req, res) {
	res.redirect('/socket.html')
});

server.listen(3000);
console.log(
 	'Express on port %d in %s mode',
	server.address().port, app.settings.env
);