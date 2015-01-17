<!DOCTYPE html>
<html>
<head>
	<title>Your DJ is You</title>
	<link rel="stylesheet" href="css/bootstrap.css">
	<link rel="stylesheet" href="css/style.css">
	<link href='http://fonts.googlepais.com/css?family=Lato:100,300,400,700,900' rel='stylesheet' type='text/css'>
	<script type="text/javascript" src="js/jquery-1.11.2.min.js"></script>
	<script src="js/bootstrap.min.js"></script>
  <script src="js/socket.io.js"></script>
	
</head>
  <body>

    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <div id="player"></div>
        </div>
        <div id="playlist" class="col-xs-6">
          <table>
            
            <thead>
              <tr>
                <th>Playlist now . .</th>
              </tr>
            </thead>
            <tbody id="list-playing">
              <tr>
                <td class="list">เพลง กอ ไก่</td>
              </tr>
               <tr>
                <td class="list">เพลง ขอ ไข่</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div id="content">
        <ul>      Playing with youtube         </ul>
      </div>

      <div id="control">
       
          <div class="form-group">
            <label for="music">Youtube Url or video id  : </label>
            <input type="text" class="form-control" id="music" placeholder="https://www.youtube.com/watch?v=pTzSJ8GPBTQ  , h160O3_9Crw">
          </div>
          <button type="submit" id="btn_submit" class="btn btn-default">Submit</button>
         <button type="submit" id="btn_together" class="btn btn-default">together</button>
        
      </div>
    </div>
    <script>
  
       var socket = io.connect('http://127.0.0.1:9998');
       socket.emit("cRoom", prompt("Insert room number : "));
       var json ={
          "roomid":"1",
          "playnow":"P1g99XOn5VY",
          "time":"20",
          "playlist":["h160O3_9Crw","RR2Hu3xnH-4","-s6a0YT0y44","7kmxk4h3MGU"]
        };


 //youtube iFrame
      // 2. This code loads the IFrame Player API code asynchronously.
      var tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      // 3. This function creates an <iframe> (and YouTube player)
      //    after the API code downloads.
      var player;
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          height: '300',
          width: '390',
          videoId: json.playnow,
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError':onPlayerError
          }
        });
      }
      function onPlayerReady(event) {
        event.target.playVideo();
       next();
      }

      var done = false;

      function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING && !done) {
          
          // setTimeout(stopVideo, 6000);
          // done = true;
        }else if(event.data == YT.PlayerState.ENDED){
        
         
          //next();
          //socket.emit('playlistDEL',playnow);
          
     

        }else if(event.data==YT.PlayerState.PAUSED){
          
        }
        
      }

      function onPlayerError(event){
       
       
      }

/// login to ROOM 
    socket.on('cRoom', function(data) {
        json=data;
        console.log(json);
        
      });


    </script>
  </body>
</html>