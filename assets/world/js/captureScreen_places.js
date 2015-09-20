// implementation of AR-Experience (aka "World")
var World = {

    //ID
    idOfCategory: null,

	//  user's latest known location, accessible via userLocation.latitude, userLocation.longitude, userLocation.altitude
	userLocation: null,

	// you may request new data from server periodically, however: in this sample data is only requested once
	isRequestingData: false,

	// true once data was fetched
	initiallyLoadedData: false,

	// true when world initialization is done
	initialized: false,

	// different POI-Marker assets
	markerDrawable_idle: null,
	markerDrawable_selected: null,
	markerDrawable_hide: null,
	markerDrawable_directionIndicator: null,

	markerListUnclustered: [],

	// list of AR.GeoObjects that are currently shown in the scene / World
	markerList: [],

	// variables 
	totalPoisCounter: null,

	// this is the container for the Clusters
	placeGeoObjects: [],

	// The last selected marker
	currentMarker: null,

	locationUpdateCounter: 0,
	updatePlacemarkDistancesEveryXLocationUpdates: 10,

	// called to build URL json provider
    didReceivedNewId: function didReceivedNewIdFn(ARidCategory){
    	idOfCategory = ARidCategory;   
    },

	// called to inject new POI data
	loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {

		// destroys all existing AR-Objects (markers & radar)
		AR.context.destroyAll();

		// show radar & set click-listener
		PoiRadar.show();
		$('#radarContainer').unbind('click');
		$("#radarContainer").click(PoiRadar.clickedRadar);

		// empty list of visible markers
		World.markerList = [];
		World.markerListUnclustered = [];
		World.placeGeoObjects = [];  

		// total POIs of this tour
		World.totalPoisCounter = poiData.results.length;
	
		// start loading marker assets
		World.markerDrawable_idle = new AR.ImageResource("assets/" + idOfCategory + "_marker.png");
		World.markerDrawable_selected = new AR.ImageResource("assets/" + idOfCategory + "_marker.png");
		World.markerDrawable_hide = new AR.ImageResource("assets/hide.png");
		World.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");

		// loop through POI-information and create an AR.GeoObject (=Marker) per POI
		for (var currentPlaceNr = 0; currentPlaceNr < poiData.results.length; currentPlaceNr++) {

			var poiLocation = new AR.GeoLocation(parseFloat(poiData.results[currentPlaceNr].location.latitude),parseFloat(poiData.results[currentPlaceNr].location.longitude));
			var distancePoi = poiLocation.distanceToUser();

			//set a "nice" number to be showed in the marker
			var distancePoi = (distancePoi > 999) ? ((distancePoi / 1000).toFixed(2) + " km") : (Math.round(distancePoi) + " m");

			var singlePoi = {
				"id": poiData.results[currentPlaceNr].objectId,
				"latitude": poiData.results[currentPlaceNr].location.latitude,
				"longitude": poiData.results[currentPlaceNr].location.longitude,
				"altitude": AR.CONST.UNKNOWN_ALTITUDE,
				"image": poiData.results[currentPlaceNr].placeImage.url,
				"name": poiData.results[currentPlaceNr].placeName,
				"info": poiData.results[currentPlaceNr].placeInfo,
				"link": poiData.results[currentPlaceNr].placeLink,
				"category": poiData.results[currentPlaceNr].category,
				"distance": distancePoi,
                "offset": 0,
                "updatedAt": poiData.results[currentPlaceNr].updatedAt
			};

			World.markerListUnclustered.push(singlePoi);
		}

		//CLUSTERING - the first parameter 20 is for the angle in which pois will be clustered 

		World.placeGeoObjects  = ClusterHelper.createClusteredPlaces(20, World.userLocation, World.markerListUnclustered);
        
        	//World.placeGeoObjects.length -> number of clusters
        	//alert(World.placeGeoObjects.length);

			//go through all clusters
          	for (var i=0; i<World.placeGeoObjects.length; i++) {
          	//go through all items in each cluster
          	//World.placeGeoObjects[i].places.length -> number of places in each cluster
            //alert(World.placeGeoObjects[i].places.length);

	           for (var j=0; j<World.placeGeoObjects[i].places.length; j++) {
	           		singlePoi = World.placeGeoObjects[i].places[j];
	           		//Number in the cluster
	           		//alert('element' + i + ',' + 'cluster' + j);
	           		singlePoi.offset = j - 1;
					// Add pois to World
	           		World.markerList.push(new Marker(singlePoi));
	           }             
	        }


		$('body').removeClass('ui-loading');

	 	// updates distance information of all placemarks
		World.updateDistanceToUserValues();
		World.updateStatusMessage( (World.totalPoisCounter != 1) ? (World.totalPoisCounter + " places found") : (World.totalPoisCounter + " place found") , false);
		
		World.initialized = true;

	
	},



	// sets/updates distances of all makers so they are available way faster than calling (time-consuming) distanceToUser() method all the time
	updateDistanceToUserValues: function updateDistanceToUserValuesFn() {
		for (var i = 0; i < World.markerList.length; i++) {
			World.markerList[i].distanceToUser = World.markerList[i].markerObject.locations[0].distanceToUser();
		}
	},

	// updates status message shon in small "i"-button aligned bottom center
	updateStatusMessage: function updateStatusMessageFn(message,isWarning) {
		$("#status-message").html(message);
		if(!isWarning){
			$('.alert').css({"background-color":"#00bcd4"});
		}
	},
	
	// location updates, fired every time you call architectView.setLocation() in native environment
	locationChanged: function locationChangedFn(lat, lon, alt, acc) {
		// store user's current location in World.userLocation, so you always know where user is
		World.userLocation = {
			'latitude': lat,
			'longitude': lon,
			'altitude': alt,
			'accuracy': acc
		};
		// request data if not already present
		if (!World.initiallyLoadedData) {
			World.requestDataFromServer(lat, lon);
			World.initiallyLoadedData = true;
		} else if (World.locationUpdateCounter === 0) {
			// update placemark distance information frequently, you max also update distances only every 10m with some more effort
			World.updateDistanceToUserValues();
		}
		// helper used to update placemark information every now and then (e.g. every 10 location upadtes fired)
		World.locationUpdateCounter = (++World.locationUpdateCounter % World.updatePlacemarkDistancesEveryXLocationUpdates);
	},

	//open a page URL or make a search on GOOGLE
    onOpenUrl: function onOpenUrlFn(url,title){
        if(url == ''){
        	console.log(url);
            url = "http://www.google.com/search?q=" + title;
            url = url.replace(/\s/g,'-');
            AR.context.openInBrowser(url);
        }
        else{
            AR.context.openInBrowser(url);
        }
    },

	// fired when user pressed maker in cam
	onMarkerSelected: function onMarkerSelectedFn(marker) {

		// deselect previous marker
		if (World.currentMarker) {
			//when is the same marker than previous one
			if (World.currentMarker.poiData.id == marker.poiData.id) {
				World.updateStatusMessage(marker.poiData.name, false);
				World.onShowActions();
				marker.setSelected(marker);
				return;
			}
			//alert("handle PREVIOUS");
			//When there was a marker selected and It is just necessary to change the info in the Display and deselected the previous one
			World.currentMarker.setDeselected(World.currentMarker);
		}

		// highlight current one
		World.onShowActions();
		marker.setSelected(marker);
		World.currentMarker = marker;

        World.updateStatusMessage(marker.poiData.name, false);
	},

	openInfoDialog: function openInfoDialogFn(){
		document.location = "architectsdk://openInfoDialogPlaces?image=" + World.currentMarker.poiData.image 
														+ "&placeId=" + World.currentMarker.poiData.id 
														+ "&name=" + World.currentMarker.poiData.name 
														+ "&info=" + World.currentMarker.poiData.info 
														+ "&link=" + World.currentMarker.poiData.link
														+ "&category=" + World.currentMarker.poiData.category
														+ "&latitude=" + World.currentMarker.poiData.latitude.toString() 
														+ "&longitude=" + World.currentMarker.poiData.longitude.toString();
	},


	//Hide elements and Show DISPLAY
	onHideElements: function onHideElementsFn(){
		//hide radar
		PoiRadar.hide();
		//Hide Info
		$( ".alert" ).css( "display", "none" );
	},

	//Show Elements and Hide DISPLAY
	onShowElements: function onShowElementsFn(){
		//Show radar
		PoiRadar.show();
		//Show Info
		$( ".alert" ).css( "display", "block" );
	},


	onShowActions: function onShowActionsFn(){
		$( ".myIcons" ).css( "display", "block" );
	},

	onHideActions: function onShowActionsFn(){
		$( ".myIcons" ).css( "display", "none" );
	},

	// screen was clicked but no geo-object was hit
	onScreenClick: function onScreenClickFn() {
		// you may handle clicks on empty AR space too
		//alert( "Handler EMPTY " );
		//If there was a marker selected, I deselected it
		if (World.currentMarker) {
			World.onShowElements();
			World.onHideActions();
			World.currentMarker.setDeselected(World.currentMarker);
		}
	},


	// returns distance in meters of placemark with maxdistance * 1.1
	getMaxDistance: function getMaxDistanceFn() {

		// sort palces by distance so the first entry is the one with the maximum distance
		World.markerList.sort(World.sortByDistanceSortingDescending);

		// loop through list and stop once a placemark is out of range ( -> very basic implementation )
		for (var i = 0; i < World.markerList.length; i++) {
			if (World.markerList[i].distanceToUser < 20000) {
				var maxDistanceMeters = World.markerList[i].distanceToUser;
				break
			}
		};

		// return maximum distance times some factor >1.0 so ther is some room left and small movements of user don't cause places far away to disappear
		return maxDistanceMeters * 1.2;
	},

	// udpates values show in "range panel"
	updateRangeValues: function updateRangeValuesFn() {

		// get current slider value (0..100);
		var slider_value = $("#panel-distance-range").val();

		// max range relative to the maximum distance of all visible places
		var maxRangeMeters = Math.round(World.getMaxDistance() * (slider_value / 100));

		// range in meters including metric m/km
		var maxRangeValue = (maxRangeMeters > 999) ? ((maxRangeMeters / 1000).toFixed(2) + " km") : (Math.round(maxRangeMeters) + " m");

		// number of places within max-range
		var placesInRange = World.getNumberOfVisiblePlacesInRange(maxRangeMeters);

		// update UI labels accordingly
		$("#panel-distance-accuracy").html(World.userLocation.accuracy + ' m');
		$("#panel-distance-places").html((placesInRange != 1) ? (placesInRange + " places") : (placesInRange + " place"));
		$("#panel-distance-value").html(maxRangeValue);

		// update culling distance, so only places within given range are rendered
		AR.context.scene.cullingDistance = Math.max(maxRangeMeters, 1);

		// update radar's maxDistance so radius of radar is updated too
		PoiRadar.setMaxDistance(Math.max(maxRangeMeters, 1));
	},

	// returns number of places with same or lower distance than given range
	getNumberOfVisiblePlacesInRange: function getNumberOfVisiblePlacesInRangeFn(maxRangeMeters) {

		// sort markers by distance
		World.markerList.sort(World.sortByDistanceSorting);

		// loop through list and stop once a placemark is out of range ( -> very basic implementation )
		for (var i = 0; i < World.markerList.length; i++) {
			if (World.markerList[i].distanceToUser > maxRangeMeters) {
				return i;
			}
		};

		// in case no placemark is out of range -> all are visible
		return World.markerList.length;
	},


	// display range slider
	showRange: function showRangeFn() {
		if (World.markerList.length > 0) {

			// update labels on every range movement
			$('#panel-distance-range').change(function() {
				World.updateRangeValues();
			});

			World.updateRangeValues();

			// open panel
			$("#panel-distance").trigger("updatelayout");
			$("#panel-distance").panel("open", 1234);
		} else {

			// no places are visible, because the are not loaded yet
			World.updateStatusMessage('No places nearby', true);
		}
	},

	hideRange: function showRangeFn() {
		$("#panel-distance").panel("close");
	},

	// reload places from content source
	reloadWorld: function reloadWorldFn() {
		World.onScreenClick();
		World.currentMarker = false;
		if (!World.isRequestingData) {
			if (World.userLocation) {
				World.requestDataFromServer(World.userLocation.latitude, World.userLocation.longitude);
			} else {
				World.updateStatusMessage('Unknown user-location.', true);
			}
		} else {
			World.updateStatusMessage('Already requesting places...', true);
		}
	},

	// request POI data
	requestDataFromServer: function requestDataFromServerFn(lat, lon) {

		$('body').addClass('ui-loading');

		// set helper var to avoid requesting places while loading
		World.isRequestingData = true;
		World.updateStatusMessage('Requesting Places');

		var dataFilter = 'where={"category":"' + idOfCategory + '"}' ;

				$.ajax({
				  type: 'GET',
				  headers: {'X-Parse-Application-Id':'Mt0MUMRXn9PXBv5vlseP92iyLckWXirVpw6biqSw','X-Parse-REST-API-Key':'oc9RjpoDftOgBWJoo7f2ZiJvJRcJZdC5kGtXCfxB'},
				  url: "https://api.parse.com/1/classes/Place",
				  data: dataFilter,
				  contentType: "application/json",
				  success: function(data) { 
				  		World.loadPoisFromJsonData(data);
						$('body').removeClass('ui-loading');
						World.isRequestingData = false;
						World.initialized = true;
				  },
		          error: function() { 
		          	World.isRequestingData = false;
		          }
				});
	},

	// helper to sort places by distance
	sortByDistanceSorting: function(a, b) {
		return a.distanceToUser - b.distanceToUser;
	},

	// helper to sort places by distance, descending
	sortByDistanceSortingDescending: function(a, b) {
		return b.distanceToUser - a.distanceToUser;
	}

};


/* forward locationChanges to custom function */
AR.context.onLocationChanged = World.locationChanged;

/* forward clicks in empty area to World */
AR.context.onScreenClick = World.onScreenClick;