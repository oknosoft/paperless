/**
 * Created by unpete on 20.12.2014.
 */

var net = require('net'),
	http = require('http'),
	querystring = require('querystring'),
	queue = [];


function ontimer(){
	var prm = queue.pop();
	if(!prm)
		return;

	try{
		var host = net.connect(prm.remotePort, prm.remoteHost, function() {
			host.write(prm.send_str);
			setTimeout(function () {
				if(host)
					host.end();
			}, 500);
		});
		host.on('end', function() {
			if(console)
				console.log("Ok");
		});

	}catch(e){
		if(console)
			console.log(e);
	}
}

function onRequest(request, response) {
	try{

		response.writeHead(200,
			{"Content-Type": "text/plain",
			"Access-Control-Allow-Origin": "*"});

		queue.push(JSON.parse(querystring.parse(request.url.substr(2)).m));
		response.write("Ok");
		response.end();

	}
	catch (e){
		response.write(e);
		response.end();
	}

}

http.createServer(onRequest).listen(8080);

setInterval(ontimer, 1200);



