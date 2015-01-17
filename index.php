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
      //var pass = prompt("Please enter your password?", "");

      var json ={"playnow": "P1g99XOn5VY","playlist":["h160O3_9Crw","RR2Hu3xnH-4","-s6a0YT0y44","7kmxk4h3MGU"]};
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
          videoId: 'P1g99XOn5VY',
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError':onPlayerError
          }
        });
      }
   
      function next(){

         var playnow = json.playnow;
        var url= json.playlist[0];
        json.playnow=url;
        json.playlist.splice(0,1);
        player.loadVideoById(url, 0,"small");
        socket.emit('playlistDEL',playnow);
      }
      // 4. The API will call this function when the video player is ready.
      function onPlayerReady(event) {
        event.target.playVideo();
       next();
      }

      // 5. The API calls this function when the player's state changes.
      //    The function indicates that when playing a video (state=1),
      //    the player should play for six seconds and then stop.
      var done = false;
      function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING && !done) {
          update();
          socket.emit('play',"");
          // setTimeout(stopVideo, 6000);
          // done = true;
        }else if(event.data == YT.PlayerState.ENDED){
        
          //update();
          //var playnow = json.playnow;
          next();
          //socket.emit('playlistDEL',playnow);
          
     

        }else if(event.data==YT.PlayerState.PAUSED){
           socket.emit('stop',"");
        }
        
      }
      function onPlayerError(event){
        next();
       
      }
      

      function update(){
        $('#list-playing .list').remove();
        for(var i=0;i<json.playlist.length;i++){
            loadInfo(json.playlist[i]);
        }
      }
      function loadInfo(videoId){
         var gdata = document.createElement("script");
        gdata.src = "http://gdata.youtube.com/feeds/api/videos/" + videoId + "?v=2&alt=jsonc&callback=storeInfo";
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(gdata);
      }

      function storeInfo (info) {
         $('#list-playing').append('<tr><td class="list">'+info.data.title+'</td></tr>');
      };
      function youtube_parser(url){
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match&&match[7].length==11){
            return match[7];
        }else{
            return false;
        }
      }
// sleep(1000, function() {
   
// });


      var socket = io.connect('http://127.0.0.1:9998');
      socket.on('playlist', function(data) {
        console.log(json);
        json=JSON.parse(data);
        update();
        console.log(json);
      });
      socket.emit('playlist',"req");
       var btn_submit = document.getElementById('btn_submit');
           btn_submit.addEventListener('click', function() { 
              var message = $('#music').val();
              $('#music').val("");
              var temp = youtube_parser(message);
              if(temp==false){
                socket.emit('playlistADD',message);
                console.log(message);
              }else{
                socket.emit('playlistADD',temp);
                console.log(temp);
              }
                    
                    
                   // socket.emit('playlistADD',message);
             }, false);

 var btn_together = document.getElementById('btn_together');
           btn_together.addEventListener('click', function() { 
                var time = player.getCurrentTime();
                console.log(time);
                socket.emit('playTogether',time);
                player.seekTo(time, true);
              }); 
       socket.on('playTogether', function(data) {
          socket.emit('playlist',"");
          setTimeout(function(){
           player.loadVideoById(json.playnow, data,"small");
         },300);
          
            
         
          
          //player.seekTo(data, true);
      });
                
      socket.on('stop', function(data) {
          player.stopVideo();
      });    
      socket.on('play', function(data) {
          player.playVideo();
      });   

    </script>
  </body>
</html>