var app = require('express')();
var fs = require('fs');
var youtube = require("youtube-feeds");
var obj;
var server = require('http').createServer(app);
var io = require('socket.io')(server);
console.log("server start");
var name = {};
var roommodel = {
  "roomId": "1",
  "owner": "123",
  "pass": null,
  "playnow": "P1g99XOn5VY",
  "Vtime": "20",
  "playlist": [""]
};
var countData = 0;

io.sockets.on('connection', function(socket) {

  ///
  socket.on('sRoom', function(data) {
    var roomId = data;
    var roomHas = false;
    console.log(data);
    fs.readFile('json/listroom.json', function(err, data) {
      if (err) {
        console.error(err);
      } else {
        var json = JSON.parse(data);
        console.log("ListROOM : " + json.length);

        et1_checkRoom(function() {
          et2_addNewRoom();
        });

        function et1_checkRoom(callback) {
          for (var i = 0; i < json.length; i++) {
            // had room
            if (json[i].roomId == roomId) {
              console.log("Had ROOM : " + roomId);
              json[i].pass = null;
              socket.emit("sRoom", json[i]);
              roomHas = true;
              socket.room = roomId;
              socket.join(roomId);
              console.log(socket.room);
              //socket.to("1").emit("cRoom", "joined ");
            }
          }
          callback();
        }

        function et2_addNewRoom() {
          if (roomHas == false) {
            console.log(roommodel);
            //var json2 = JSON.parse(roommodel);
            var json2 = roommodel;
            json2.roomId = roomId;
            json2.owner = socket.id;
            // save room id for this socket
            socket.room = roomId;
            socket.join(roomId);
            json2.playnow = "xpFavEX4KN8";
            json2.Vtime = "0";
            json2.pass = null;
            json[json.length] = json2;
            console.log(json);
            var strjson = JSON.stringify(json);
            fs.writeFile('json/listroom.json', strjson, function(err) {
              if (err) throw err;
              // io.sockets.emit('playlist', strjson);
              console.log('It\'s saved! >>> roomId = ' + roomId);
            });
          }
        }

      }
    });
  });

  socket.on('chowner', function(data) {
    var pass = data;
    fs.readFile('json/listroom.json', function(err, data) {
      var json = JSON.parse(data);
      for (var i = 0; i < json.length; i++) {
        // had room
        if (json[i].roomId == socket.room) {
          if ((json[i].pass == pass)||(json[i].pass==null)) {
            json[i].owner = socket.id;
            fs.writeFile('json/listroom.json', JSON.stringify(json), function(err) {
              if (err) throw err;
              console.log(socket.id + " chowner : Save >> " + socket.room);
            });
          } else {
            console.log(socket.id + " chowner : pass wrong >> " + socket.room);

          }
        }
      }
    });
  });


  /// newSong
  socket.on('newSong', function(data) {
    var youtubeId = data;
    youtube.video(youtubeId, function(err, result) { // check vaild youtube id

      if (result.id === youtubeId) {
        fs.readFile('json/listroom.json', function(err, data) {
          if (err) {
            console.error(err);
          } else {
            var json = JSON.parse(data);
            var newItem = youtubeId;
            // json.playlist.splice(0,1);
            for (var i = 0; i < json.length; i++) {
              // had room
              if ((json[i].roomId == socket.room) && (json[i].owner == socket.id)) {
                json[i].playlist[json[i].playlist.length] = newItem;
                console.log(json[i].playlist.length);
                var strjson = JSON.stringify(json);
                fs.writeFile('json/listroom.json', strjson, function(err) {
                  if (err) throw err;
                  // io.sockets.emit('playlist', strjson);
                  console.log(socket.id + " newSong " + youtubeId + " : Save >> " + socket.room);

                });
                console.log(socket.id + " newSong : Room Ok & Owner Ok >> " + socket.room);
              }
            }
          }
        });
      }
    });
    console.log(data);
  });



  socket.on('disconnect', function() {
    console.log('Got disconnect! >>>> ' + socket.id);

  });

  function checkPermission(id) {
    fs.readFile('json/listroom.json', function(err, data) {
      for (var i = 0; i < json.length; i++) {
        // had room
        if (json[i].roomId == socket.room) {
          if (json[i].owner == id) {
            console.log(socket.id + " checkPermission : User OK >> " + socket.room);
            return true;
          } else {
            console.log(socket.id + " checkPermission : User wrong >> " + socket.room);
            return false;
          }
        }
      }
    });
    return false;
  }



});
server.listen(9998);