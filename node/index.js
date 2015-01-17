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
  "playnow": "P1g99XOn5VY",
  "Vtime": "20",
  "playlist": [""]
};
var countData = 0;

io.sockets.on('connection', function(socket) {

  socket.on('cRoom', function(data) {
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
              console.log("Had ROOM"+roomId);
              json[i].pass = null;
              socket.emit("cRoom", json[i]);
              roomHas = true;
              socket.join(roomId);
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
            json2.owner=socket.id;
            json2.playnow = "xpFavEX4KN8";
            json2.Vtime = "0";
            json[json.length] = json2;
            console.log(json);
            var strjson = JSON.stringify(json);
            fs.writeFile('json/listroom.json', strjson, function(err) {
              if (err) throw err;
              // io.sockets.emit('playlist', strjson);
              console.log('It\'s saved! >>> roomId = '+roomId);
            });
          }
        }

      }
    });
  });

  socket.on('disconnect', function() {
      console.log('Got disconnect! >>>> '+socket.id);

   });

});
server.listen(9998);