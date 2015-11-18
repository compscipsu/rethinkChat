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
    socket.on('create_message', function(data) {
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

    socket.on('create_room', function(data) {
        socket.leaveAll();
        socket.join(data['name']);

        r.connect({
            host: 'localhost',
            port: 28015,
            db: 'chat'
        }, function(err, conn) {
            if (err)
                console.log(err);
            else
                r.table('room').insert(data).run(conn, function(err) {
                    if (err)
                        console.log(err);
                });
        });
    });

    socket.on('join_room', function(data) {
        socket.leaveAll();
        socket.join(data['name']);

        r.connect({
            host: 'localhost',
            port: 28015,
            db: 'chat'
        }, function(err, conn) {
            r.table('message').filter({room: data['name']}).run(conn, function(err, cursor) {
                if (err)
                    console.log(err);
                else
                    cursor.each(function(err, row) {
                        if (err)
                            console.log(err);

                        socket.emit("add_message", { message: row['message'] })
                    });
            });
        });

    });

    r.connect({
        host: 'localhost',
        port: 28015,
        db: 'chat'
    }, function(err, conn) {
        if (err)
            console.log(err);
        else
            r.table('room').run(conn, function(err, cursor) {
                if (err)
                    console.log(err);
                else
                    cursor.each(function(err, row) {
                        if (err)
                            console.log(err);

                        socket.emit("add_room", { message: row['name'] })
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

            io.sockets.to(row['new_val']['room']).emit("add_message", { message: row['new_val']['message'], author:  row['new_val']['author']})
          });
   });
});

r.connect({
    host: 'localhost',
    port: 28015,
    db: 'chat'
}, function(err, conn) {
    r.table('room').changes({includeInitial: false}).run(conn, function(err, cursor) {
        if (err)
            console.log(err);
        else
            cursor.each(function(err, row) {
                if (err)
                    console.log(err);

                io.sockets.emit("add_room", { message: row['new_val']['name'] })
            });
    });
});