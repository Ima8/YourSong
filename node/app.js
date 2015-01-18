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
              //socket.emit("sRoom", json[i]);
              roomHas = true;
              socket.room = roomId;
              socket.join(roomId);
              console.log(socket.room);
              io.sockets.to(socket.room).emit("playlistUpdate", json[i]);
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
          if ((json[i].pass == pass) || (json[i].pass == null)) {
            json[i].owner = socket.id;

            //together
            setTimeout(function() {
              socket.emit("together", json[i]);
            }, 3000);

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

  // update playlist
  socket.on('nextSong', function(data) {
    var song = data;
    fs.readFile('json/listroom.json', function(err, data) {
      var json = JSON.parse(data);

      for (var i = 0; i < json.length; i++) {
        // had room
        if ((json[i].roomId == socket.room) && (json[i].owner == socket.id && json[i].playnow != null)) {

          json[i].playnow = json[i].playlist[0];
          json[i].Vtime = "0";
          json[i].playlist.splice(0, 1);
          var tempJson = json[i]
          tempJson.pass = null;
          console.log("read json : " + json[i]);
          var strjson = JSON.stringify(json);
          fs.writeFile('json/listroom.json', strjson, function(err) {
            if (err) throw err;
            console.log(socket.id + " nextSong  : Save >> " + socket.room);

          });
          io.sockets.to(socket.room).emit("nextSong", tempJson);
          console.log("read json2 : " + json[i]);
          console.log(socket.id + " nextSong : Room Ok & Owner Ok >> " + socket.room);
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
            var jsonEmit;
            // json.playlist.splice(0,1);
            for (var i = 0; i < json.length; i++) {
              // had room
             // if ((json[i].roomId == socket.room) && (json[i].owner == socket.id)) {
              if ((json[i].roomId == socket.room)) {
                var tempJson = json[i];
                tempJson.pass = null;
                if (json[i].playnow == null) {
                  json[i].playnow = newItem;
                  io.sockets.to(socket.room).emit("nextSong", json[i]);
                }
                json[i].playlist[json[i].playlist.length] = newItem;
                console.log(json[i].playlist.length);
                var strjson = JSON.stringify(json);

                // emit update
                console.log("emit to room : " + jsonEmit);
                io.sockets.to(socket.room).emit("playlistUpdate", tempJson);

                fs.writeFile('json/listroom.json', strjson, function(err) {
                  if (err) throw err;
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

  socket.on('together', function(data) {
    var vJson = data;
    fs.readFile('json/listroom.json', function(err, data) {
      var json = JSON.parse(data);

      for (var i = 0; i < json.length; i++) {
        // had room
        if ((json[i].roomId == socket.room) && (json[i].owner == socket.id && json[i].playnow != null)) {
          //console.log(socket.id + " together " + socket.room);
          json[i].Vtime = vJson.Vtime;
          json[i].playnow = vJson.playnow;
          json[i].pass = null;
          var temp = json[i];
          setTimeout(function() {
            console.log(temp.playnow+" = "+temp.Vtime);
            socket.emit("together", temp);
            socket.broadcast.to(socket.room).emit('getTogether', temp);
          }, 900);
        }
      }
    });
  });



  socket.on('stop', function(data) {
    console.log(socket.id + " onStop : noting >> " + socket.room);
    fs.readFile('json/listroom.json', function(err, data) {
      var json = JSON.parse(data);
      for (var i = 0; i < json.length; i++) {

        if ((json[i].roomId == socket.room) && (json[i].owner == socket.id)) {
          console.log(socket.id + " onStop : User OK >> " + socket.room);
          io.sockets.to(socket.room).emit('stop', json[i]);
        } else {
          console.log(socket.id + " onStop : User wrong >> " + socket.room);
        }

      }
    });
  });

  socket.on('play', function(data) {
    console.log(socket.id + " onPlay : noting >> " + socket.room);
    fs.readFile('json/listroom.json', function(err, data) {
      var json = JSON.parse(data);
      for (var i = 0; i < json.length; i++) {
        if ((json[i].roomId == socket.room) && (json[i].owner == socket.id)) {
          console.log(socket.id + " onPlay : User OK >> " + socket.room);
          io.sockets.to(socket.room).emit('play', json[i]);
        } else {
          console.log(socket.id + " onPlay : User wrong >> " + socket.room);
        }
      }
    });
  });

  socket.on('disconnect', function() {
    console.log('Got disconnect! >>>> ' + socket.id);

  });

  function checkPermission() {
    var check = false;
    fs.readFile('json/listroom.json', function(err, data) {
      for (var i = 0; i < json.length; i++) {
        // had room
        if (json[i].roomId == socket.room) {
          if (json[i].owner == socket.id) {
            console.log(socket.id + " checkPermission : User OK >> " + socket.room);
            check = true;
          } else {
            console.log(socket.id + " checkPermission : User wrong >> " + socket.room);
            check = false;
          }
        }
      }
    });
    return check;
  }



});
server.listen(9998);