var http = require('http'),
    fs = require('fs'),
    r = require('rethinkdb'),
    express = require('express'),
    path = require('path'),
    app = express();

app.get('/', function(req, res) {
  res.sendfile('client.html');
});

app.use(express.static(path.join(__dirname, 'client/assets')));

var server = http.createServer(app).listen(1337);

var io = require('socket.io').listen(server);

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
