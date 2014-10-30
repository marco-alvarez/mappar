
function Gif(){

	var gifImg = new AR.ImageResource("assets/minion.png");
	
	var gifAnimDrawable = new AR.AnimatedImageDrawable(gifImg, 5.0, 855, 1024, {
	    offsetY : -3
	    });

	var arr_frames = new Array(0, 1);

	var loc = new AR.RelativeLocation(null, 20, 15, 0);

	geoObject = new AR.GeoObject(loc, {drawables: {cam: gifAnimDrawable}});

	gifAnimDrawable.animate(arr_frames, 300, -1);

}