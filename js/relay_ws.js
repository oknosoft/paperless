/**
 * Created by unpete on 20.12.2014.
 */

var net = require('net');
var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({ port: 8080 });


wss.on('connection', function(ws) {
	// new client connection
	var connected = false,
		host = undefined;

	//console.log('Got data from %s, sending to client.', options[1]);

	ws.on('message', function(message) {
		if (!connected && message.substring(0, 4) == 'open') {
			var options = message.split(' ');
			//console.log('Trying %s at port %s...', options[1], options[2]);
			host = net.connect(options[2], options[1], function() {
				connected = true;
				ws.send('connected');
			});
			host.on('data', function(data) {
				//console.log('Got data from %s, sending to client.', options[1]);
				ws.send(data);
			});
			host.on('end', function() {
				//console.log('Host %s terminated connection.', options[1]);
				ws.close();
			});
		} else {
			//console.log('Got data from client, sending to host.');
			host.write(message);
			setTimeout(function () {
				host.end();
			}, 100);
		}
	});

});


