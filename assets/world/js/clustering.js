
/** helper to get clustering-cloud out of given poi-data (ensure to have lat/lon attribtes present as double values) */
var ClusterHelper = {

	/** caluclates angle between user (lat1,lon1) and a place (lat2,lon2) */
	angleBetween: function(lat1, lon1, lat2, lon2){
		var usrLocationMercator = ClusterHelper.toMercator(lat1, lon1);
		var otherLocationMercator = ClusterHelper.toMercator(lat2, lon2);
		var theta = Math.atan2(-1 * (otherLocationMercator.y - usrLocationMercator.y), otherLocationMercator.x - usrLocationMercator.x);
		if (theta<0) {
			theta += 2 * Math.PI;
		}
		return theta * (180 / Math.PI);
	},
	
	/** caluclates center/average point of given pois, ensure pois have .lat and .lon double values */
	centerPoint: function(pois) {
		var avgLatX = 0;
		var avgLonY = 0;
		for (var i=0; i<pois.length; i++) {
			var mercator = ClusterHelper.toMercator(pois[i][1], pois[i][2]);
			avgLatX+=mercator.x;
			avgLonY+=mercator.y;
		}
		avgLatX = avgLatX / pois.length;
		avgLonY = avgLonY / pois.length;
		var center = ClusterHelper.toLatLon(avgLatX, avgLonY);
		
		return {'lat': (center.lat), 'lon': (center.lon)};
	},
	
	/** convert lat lon to {x, y} */
	toMercator: function(lat, lon) {
		var x = lon * 20037508.34 / 180;
		var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
		y = y * 20037508.34 / 180;
		return {'x': x, 'y': y};
	},
	
	/** convert {x, y} to {lat, lon} */
	toLatLon: function(mercX,mercY) {
		var rMajor = 6378137; //Equatorial Radius, WGS84
	    var shift  = Math.PI * rMajor;
	    var lon    = mercX / shift * 180.0;
	    var lat    = mercY / shift * 180.0;
	    lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180.0)) - Math.PI / 2.0);
	 
	    return { 'lon': lon, 'lat': lat };
	},

	/** 
	* clusteredAngle: the angle consumed by the marker/bubble
	* usrLocation: e.g. { 'lat': 47.7732725, 'lon': 13.0695639 }
	* array of places, whereat every poi must hat lat & lon attribute (as in usrLocation)
	*
	* returns array of clustered places, each having "lat", "lon", "places" (as defined in placesArray, lenght = 1 if type is 'poi', length>1 if 'cluster') and "type" ('poi' or 'cluster') attribute
	**/
   	createClusteredPlaces: function(clusterAngle, usrLocation,  placesArray) {
  	/* */
  	clusterAngle = Math.round(clusterAngle);

    var clusters = new Array();
    
    for (var i=0; i<placesArray.length; i++) {

      var poi = placesArray[i];
      
      poi.lat = poi.latitude;
      poi.lon = poi.longitude;
      usrLocation.lat = usrLocation.latitude;
      usrLocation.lon = usrLocation.longitude;

      /* angle between user and place */
      var angle = Math.round(ClusterHelper.angleBetween(usrLocation.lat, usrLocation.lon, poi.lat, poi.lon));
      
      /* mapped in best matching direction */
      var mappedAngle = (Math.round(angle/clusterAngle))*clusterAngle;
      
      /* create array for mapped places, if necessary */
      if (typeof(clusters[mappedAngle]) === 'undefined' || clusters[mappedAngle] == null) {
        clusters[mappedAngle] = new Array();
      }

      /* push current poi */
      clusters[mappedAngle].push(poi);
    }

    /* contains clusters and places (.type = 'poi' or 'cluster') */
    var clusteredPois = new Array();

    /* helper to ensure array only contains non empty indices */
    var clusterLength = 0;

    /* loop through angles */
    for (var i=0; i<360/clusterAngle; i++) {
      var cluster = clusters[i*clusterAngle];
      var clusterValue = null;
        
        /* this angle cluster exists (there are places in this direction */
        if (typeof(cluster) !== 'undefined' && cluster != null) {
          
          /* is there any poi available in this angle =*/
          if (cluster.length>0) {

          	/* in case there is only one poi present -> use original lat/lon of poi */
            if (cluster.length==1) {
              clusterValue = {'lat': cluster[0].lat, 'lon': cluster[0].lon, 'places': cluster, 'type': 'poi'};
            }
            /* otherwise calculate center poi out of clustered pois and store pois in "places" attribute */
            else {
              var centerPoint = ClusterHelper.centerPoint(cluster);
              clusterValue = {'lat': centerPoint.lat, 'lon': centerPoint.lon, 'places': cluster, 'type': 'cluster'};
            } 

            /* fill clusteredPOIs array */
            clusteredPois[clusterLength] = clusterValue;
            clusterLength++;
        }
      }
    }

    return clusteredPois;

  }
	
};