function VideoTranspRender(){


	// Create play button which is used for starting the video
		var playButtonImg = new AR.ImageResource("assets/playButton.png");
		var playButton = new AR.ImageDrawable(playButtonImg, 2.5, {
			enabled: false,
			clicked: false,
			onClick: function playButtonClicked() {
				video.play(1);
				video.playing = true;
				playButton.clicked = true;
			},
			offsetY: -3
		});

		/*
			Besides images, text and HTML content you are able to display videos in augmented reality. With the help of AR.VideoDrawables you can add a video on top of any image recognition target (AR.Trackable2DObject) or have it displayed at any geo location (AR.GeoObject). Like any other drawable you can position, scale, rotate and change the opacity of the video drawable.

			The video we use for this example is "video.mp4". As with all resources the video can be loaded locally from the application bundle or remotely from any server. In this example the video file is already bundled with the application.

			The URL and the size are required when creating a new AR.VideoDrawable. Optionally the offsetX and offsetY parameters are set to position the video on the target. The values for the offsets are in SDUs. If you want to know more about SDUs look up the code reference.

			The class AR.VideoDrawable offers functions and triggers to control playback of the video and get notified of playback states. The following implementation makes use of the triggers and states to display an image of a play button on top of the target. Once the user clicks the play button the video starts to play. Additionally the video will be paused/resumed whenever the target is lost so the user does not miss any video content when looking away.

			Once the user clicks the button the video is played once: video.play(1). Starting the playback fires the onPlaybackStarted trigger and hides the playButton. When playback finishes the onFinishedPlaying trigger is called that shows the playButton again.

			To give the user the possibility to pause the video the AR.VideoDrawable's click trigger is used. If the video is playing and the user is clicking the function pause() is called which then pauses playback. Clicking the video again resumes playback.
		*/
		var video = new AR.VideoDrawable("assets/transparentVideo.mp4", 10, {
			enabled: false,
			offsetY: playButton.offsetY,
			onLoaded: function videoLoaded() {
				console.log('LISTOOO*****');
				playButton.enabled = true;
			},
			onPlaybackStarted: function videoPlaying() {
				playButton.enabled = false;
				video.enabled = true;
			},
			onFinishedPlaying: function videoFinished() {
				playButton.enabled = true;
				video.playing = false;
				video.enabled = false;
			},
			onClick: function videoClicked() {
				if (playButton.clicked) {
					playButton.clicked = false;
				} else if (video.playing) {
					video.pause();
					video.playing = false;
				} else {
					video.resume();
					video.playing = true;
				}
			},
			isTransparent: true
		});
		

	//var videoLoc = new AR.GeoLocation(54.972696, -1.609154);
	var videoLoc = new AR.RelativeLocation(null, 20, -15, 0);

    // a GeoObject with triggers and drawables set on creation date 
	var geoVideoObject = new AR.GeoObject(videoLoc, {
	  //the function executed when the GeoObject enters the field of vision
	  onEnterFieldOfVision : function(){ 
		  	if (video.playing) {
				video.resume();
			}
	  },
	  //the function executed when the GeoObject exits the field of vision
	  onExitFieldOfVision : function(){  
	  		if (video.playing) {
				video.pause();
			}
	  },
	  drawables : { 
	      cam: [video, playButton]
	  }
	});



}



