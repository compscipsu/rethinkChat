var http = require('http'),
    fs = require('fs'),
    r = require('rethinkdb');

var app = http.createServer(function (request, response) {
    fs.readFile("client.html", 'utf-8', function (error, data) {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    });
}).listen(1337);

var io = require('socket.io').listen(app);

io.sockets.on('connection', function(socket) {
    socket.on('message_to_server', function(data) {
	
	r.connect({
	    host: 'localhost',
	    port: 28015,
	    db: 'chat'
	}, function(err, conn) {
           if (err)
              console.log(err);
           else
               r.table('message').insert(data).run(conn, function(err) {
                  if (err)
                     console.log(err);
               });
	});
   });
});

r.connect({
  host: 'localhost',
  port: 28015,
  db: 'chat'
}, function(err, conn) {
   r.table('message').changes({includeInitial: false}).run(conn, function(err, cursor) {
      if (err)
         console.log(err);
      else
          cursor.each(function(err, row) {
            if (err)
               console.log(err);

            io.sockets.emit("message_to_client", { message: row['new_val']['message'] })
          });
   });
});
