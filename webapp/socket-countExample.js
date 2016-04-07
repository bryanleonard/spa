
'use strict';

var countUp,
	http     = require('http'),
	express  = require('express'),
	socketIo = require('socket.io'),
	app      = express(),
	server   = http.createServer(app),
	io       = socketIo.listen(server),
	countIdx = 0;


// ---------------
// utility methods
// ---------------
countUp = function() {
	countIdx++;
	console.log(countIdx);
	io.sockets.send(countIdx);
}


// ---------------
// Server config
// ---------------
app.configure(function() {
	app.use(express.static(__dirname + '/'));
});

app.get('/', function(req, res) {
	res.redirect('/socket.html');
});

// ---------------
// Fire it up, man!
// ---------------
server.listen(3000);
console.log(
	'Exress on port %d in %s mode',
	server.address().port, app.settings.env
);

setInterval(countUp, 100);