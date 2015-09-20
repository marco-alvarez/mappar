// implementation of AR-Experience (aka "World")
var World = {

	 //ID
    idOfCategory: null,

    //Destination
    destLat: null,
    destLong: null,

	//  user's latest known location, accessible via userLocation.latitude, userLocation.longitude, userLocation.altitude
	userLocation: null,

	// you may request new data from server periodically, however: in this sample data is only requested once
	isRequestingData: false,

	// true once data was fetched
	initiallyLoadedData: false,

	// true when world initialization is done
	initialized: false,

	// different POI-Marker assets
	markerDrawable: null,
	markerDrawable_hide: null,
	markerDrawable_directionIndicator: null,

	// list of AR.GeoObjects that are currently shown in the scene / World
	markerList: [],

	// variables 
	auxStepsCounter: null,
	currentMarkerStep: 0,

	// The last selected marker
	currentMarker: null,

	locationUpdateCounter: 0,
	updatePlacemarkDistancesEveryXLocationUpdates: 10,

	// called to build URL json provider
    didReceivedNewId: function didReceivedNewIdFn(ARidCategory,destLatitude,destLongitude){
    	idOfCategory = ARidCategory;   
    	destLat = destLatitude;   
    	destLong = destLongitude;

    	//alert(idOfCategory + "," + destLat + "," + destLong);
    },

    stripHtml: function stripHtmlFn(html){
    	var tmp = document.createElement("div");
	    tmp.innerHTML = html;
	    return tmp.textContent || tmp.innerText || "";
    },

	// called to inject new POI data
	loadPoisFromJsonData: function loadPoisFromJsonDataFn(directionResult) {

		// destroys all existing AR-Objects (markers & radar)
		AR.context.destroyAll();

		// show radar & set click-listener
		PoiRadar.show();
		$('#radarContainer').unbind('click');
		$("#radarContainer").click(PoiRadar.clickedRadar);

		// empty list of visible markers
		World.markerList = [];
		
		// For each step, place a marker, and add the text to the marker's
		// info window. Also attach the marker to an array so we
		// can keep track of it and remove it when calculating new
		// routes.
		var myRoute = directionResult.routes[0].legs[0];

		// total POIs of this tour
		World.auxStepsCounter =  myRoute.steps.length;
	
		// start loading marker assets
		World.markerDrawable = new AR.ImageResource("assets/marker.png");
		World.markerDrawable_hide = new AR.ImageResource("assets/hide.png");
		World.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");

		// loop through POI-information and create an AR.GeoObject (=Marker) per POI
		for (var i = 0; i < myRoute.steps.length; i++) {

			var stepInstruction = World.stripHtml(myRoute.steps[i].instructions);
			//stepInstruction = stepInstruction.replace(/<(?:.|\n)*?>/gm,'');

			var singlePoi = {
				"latitude": parseFloat(myRoute.steps[i].start_location.lat()),
				"longitude": parseFloat(myRoute.steps[i].start_location.lng()),
				"altitude": AR.CONST.UNKNOWN_ALTITUDE,
				"name": stepInstruction,
				"distance": myRoute.steps[i].distance.text,
                "offset": 0
			};

			World.markerList.push(new Marker(singlePoi)); 
		}

		// add destination Marker a t the end of the Markers Array
		var singlePoi = {
				"latitude": parseFloat(destLat),
				"longitude": parseFloat(destLong),
				"altitude": AR.CONST.UNKNOWN_ALTITUDE,
				"name": "Destination",
				"distance": "",
                "offset": 0
			};
		World.markerList.push(new Marker(singlePoi)); 

		// Enable first marker and increase currentMarkerStep
		World.markerList[World.currentMarkerStep].markerObject.enabled = true;
		// Disable Get Here label in last marker
		World.markerList[ World.auxStepsCounter].getHereLabel.enabled = false;

		$('body').removeClass('ui-loading');

	 	// updates distance information of all placemarks
		World.updateDistanceToUserValues();
		World.updateStatusMessage( (World.auxStepsCounter != 1) ? (World.auxStepsCounter + " steps to Destination") : (World.auxStepsCounter + " step to Destination") , false);
		
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

	// fired when user pressed maker in cam
	onMarkerSelected: function onMarkerSelectedFn(marker) {

		// deselect previous marker
		if (World.currentMarker) {
			//when is the same marker than previous one
			if (World.currentMarker.poiData.id == marker.poiData.id) {
				World.updateStatusMessage(marker.poiData.name, false);
				marker.setSelected(marker);
				return;
			}
			//alert("handle PREVIOUS");
			//When there was a marker selected and It is just necessary to change the info in the Display and deselected the previous one
			World.currentMarker.setDeselected(World.currentMarker);
		}

		marker.setSelected(marker);
		World.currentMarker = marker;

        World.updateStatusMessage(marker.poiData.name, false);
	},

	// go to next step
	onNextStep: function onNextStepFn(){

		if(World.auxStepsCounter == 0){
			alert("You have arrived to Destination");
			return;
		}
		// Enable first marker and increase currentMarkerStep
		World.markerList[World.currentMarkerStep].markerObject.enabled = false;
		World.currentMarkerStep++;
		World.auxStepsCounter--;
		World.markerList[World.currentMarkerStep].markerObject.enabled = true;

		World.updateStatusMessage( (World.auxStepsCounter != 1) ? (World.auxStepsCounter + " steps to Destination") : (World.auxStepsCounter + " step to Destination") , false);


	},

	onShowStraightArrow: function onShowStraightArrowFn(){
		$( ".myIndicators" ).css( "display", "block" );
	},

	onHideStraightArrow: function onHideStraightArrowFn(){
		$( ".myIndicators" ).css( "display", "none" );
	},

	// screen was clicked but no geo-object was hit
	onScreenClick: function onScreenClickFn() {
		// you may handle clicks on empty AR space too
		//alert( "Handler EMPTY " );
		//If there was a marker selected, I deselected it
		if (World.currentMarker) {
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

	// hide range slider
	hideRange: function showRangeFn() {
		$("#panel-distance").panel("close");
	},
	
	// request POI data
	requestDataFromServer: function requestDataFromServerFn(lat, lon) {

		$('body').addClass('ui-loading');

		// set helper var to avoid requesting places while loading
		World.isRequestingData = true;
		World.updateStatusMessage('Requesting Route Instructions');

		var directionsDisplay;

		directionsService = new google.maps.DirectionsService();

		var request = {
		      origin: new google.maps.LatLng(lat, lon),
		      destination: new google.maps.LatLng( parseFloat(destLat),parseFloat(destLong) ),
		      travelMode: google.maps.TravelMode.WALKING
		  };

		directionsService.route(request, function(response, status) {
		    if (status == google.maps.DirectionsStatus.OK) {
		      	World.loadPoisFromJsonData(response);
				$('body').removeClass('ui-loading');
				World.isRequestingData = false;
				World.initialized = true;
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