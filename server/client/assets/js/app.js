$(document).on('ready', function () {
  var IO_HOST = $('#io-host').text();
  var IO_PORT = $('#io-port').text();
  var socketio = io.connect(IO_HOST + ":" + IO_PORT);
  socketio.on("add_message", function (data) {
    var message = data.message;
    var author = data.author;
    var time = new Date(data.time);
    if (!author) {
      author = "Anonymous";
    }

    //I'm sure angular can do this somehow
    var hourFormat = time.getHours() > 12 ? time.getHours() - 12 : time.getHours();
    if (hourFormat < 10) {
      hourFormat = '0' + hourFormat;
    }
    var ending = time.getHours() > 12 ? 'PM' : 'AM';

    var minFormat = time.getMinutes();
    if (minFormat < 10) {
      minFormat = '0' + minFormat;
    }

    var secFormat = time.getSeconds();
    if (secFormat < 10) {
      secFormat = '0' + secFormat;
    }
    $('#chatlog').append("<hr/>" + author + "( " + hourFormat + ":" + minFormat + ":" + secFormat + " " + ending + " ):  " + message);
    $(".messages").animate({ scrollTop: $('.messages')[0].scrollHeight}, 10);

  });

  socketio.on("add_room", function (data) {
    var rooms = $("#rooms");
    rooms.append(document.createElement('br'));

    var a = document.createElement('a');
    var linkText = document.createTextNode(data.message);
    a.appendChild(linkText);
    a.title = data.message;
    a.onclick = function () {
      document.getElementById("chatlog").innerHTML = '';
      socketio.emit("join_room", {name: data.message});
      document.getElementById("room_header").innerHTML = data.message;
    };
    rooms.append(a);
  });

  $('#send-message').click(function () {
    var msg = $("#message_input").val();
    var room = $("#room_header").html();
    var author = $("#author").val();
    if (!author || author === '') {
      author = "Anonymous";
    }
    socketio.emit("create_message", {message: msg, room: room, author: author});
    $("#message_input").val('');
  });
  $('#add-room').click(function () {
    var msg = $("#room_input").val();
    socketio.emit("create_room", {name: msg});
    $('#room_header').html(msg);
    $('#chatlog').html('');
    $('#room_input').html('');
  });
});
