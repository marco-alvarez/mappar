// implementation of AR-Experience (aka "World")
var World = {

	// URL json provider
    serverUrl: null,

    // URL json provider
    serverUrlRally: null,

    //ID
    idOfClient: null,

	//  user's latest known location, accessible via userLocation.latitude, userLocation.longitude, userLocation.altitude
	userLocation: null,

	// you may request new data from server periodically, however: in this sample data is only requested once
	isRequestingData: false,
	isPlayingAudio: false,

	// true once data was fetched
	initiallyLoadedData: false,

	// true when world initialization is done
	initialized: false,

	// different POI-Marker assets
	markerDrawable_idle: null,
	markerDrawable_selected: null,
	markerDrawable_directionIndicator: null,

	markerListUnclustered: [],

	// list of AR.GeoObjects that are currently shown in the scene / World
	markerList: [],
	logoList: [],

	// this is the container for the Clusters
	placeGeoObjects: [],

	// The last selected marker
	currentMarker: null,

	locationUpdateCounter: 0,
	updatePlacemarkDistancesEveryXLocationUpdates: 10,
	rallyCounter: [],

	//called to build URL json provider
    didReceivedNewId: function didReceivedNewIdFn(ARidClient){
    	idOfClient = ARidClient;
        $('body').addClass('ui-loading');
        serverUrl = "http://heymx.com/api/public/tags.php?nick=";
        serverUrlRally = "http://heymx.com/api/public/rallies.php?category=";
        serverUrl += ARidClient;
        serverUrlRally += ARidClient;
        
        //alert(serverUrl);
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
		World.logoList = [];

		// start loading marker assets
		World.markerDrawable_idle = new AR.ImageResource("assets/marker_idle.png");
		World.markerDrawable_selected = new AR.ImageResource("assets/marker_selected.png");
		World.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");

		World.numPromociones = poiData.tags.length;


		// loop through POI-information and create an AR.GeoObject (=Marker) per POI
        for (var currentPlaceNr = 0; currentPlaceNr < poiData.tags.length; currentPlaceNr++) {

        	var poiLocation = new AR.GeoLocation(parseFloat(poiData.tags[currentPlaceNr].latitude),parseFloat(poiData.tags[currentPlaceNr].longitude));
			var distancePoi = poiLocation.distanceToUser();

			//set a "nice" number to be showed in the marker
			var distancePoi = (distancePoi > 999) ? ((distancePoi / 1000).toFixed(2) + " km") : (Math.round(distancePoi) + " m");


			var singlePoi = {
                "id": String(poiData.tags[currentPlaceNr].id),
                "latitude": parseFloat(poiData.tags[currentPlaceNr].latitude),
                "longitude": parseFloat(poiData.tags[currentPlaceNr].longitude),
                "altitude": parseFloat(poiData.tags[currentPlaceNr].altitude),
                "title": poiData.tags[currentPlaceNr].tag_name,
                "description": poiData.tags[currentPlaceNr].description,
                "image_path": poiData.tags[currentPlaceNr].image_path,
                "url": poiData.tags[currentPlaceNr].url,
                "audio_path": poiData.tags[currentPlaceNr].audio_path,
                "video_path": poiData.tags[currentPlaceNr].video_path,
                "facebook": poiData.tags[currentPlaceNr].facebook,
                "twitter": poiData.tags[currentPlaceNr].twitter,
                "distance": distancePoi,
                "offset": 0             
            };

 

			//here just the POI list is being created out of the JSON file
			World.markerListUnclustered.push(singlePoi);

		}

		//CLUSTERING
		//the first parameter 20 is for the angle in which pois will be clustered 


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

	    Gif();
	   
		// updates distance information of all placemarks
		World.updateDistanceToUserValues();

		// set distance slider to 100%
		$("#panel-distance-range").val(100);
		$("#panel-distance-range").slider("refresh");

	},

	// called to inject new POI data RALLY
	loadPoisFromJsonDataRally: function loadPoisFromJsonDataRallyFn(poiData) {


		for (var currentRallyNr = 0; currentRallyNr < poiData.rallies.length; currentRallyNr++) {

			World.logoDrawable = new AR.ImageResource(poiData.rallies[currentRallyNr].tag_image);

			World.rallyCounter[currentRallyNr] = 0;

			// loop para markers de un rally
	        for (var currentPlaceNr = 0; currentPlaceNr < poiData.rallies[currentRallyNr].position.length; currentPlaceNr++) {

				var singlePoi = {
	                "latitude": parseFloat(poiData.rallies[currentRallyNr].position[currentPlaceNr].position.latitude),
	                "longitude": parseFloat(poiData.rallies[currentRallyNr].position[currentPlaceNr].position.longitude),
	                "altitude": parseFloat(poiData.rallies[currentRallyNr].position[currentPlaceNr].position.altitude),
	                "rallyNr": parseFloat(currentRallyNr),
	                "rallyName": String(poiData.rallies[currentRallyNr].name),
	                "rallyImage": poiData.rallies[currentRallyNr].rally_image

	            };

	            World.rallyCounter[currentRallyNr]++;


	            //Rally mode
	            World.logoList.push(new Logo(singlePoi));

			}

			$('body').removeClass('ui-loading');

		}


			if(World.numPromociones == 1) { 
				promoPalabra = '1 promoción y ';
			}else{
				promoPalabra = World.numPromociones + ' promociones y ';
			}

			if(currentRallyNr == 1) { 
				rallyPalabra = '1 rally encontrados';
			}else{
				rallyPalabra = currentRallyNr + ' rallys encontrados';
			}

		World.updateStatusMessage( promoPalabra + rallyPalabra);

		World.initialized = true;
	},

	// sets/updates distances of all makers so they are available way faster than calling (time-consuming) distanceToUser() method all the time
	updateDistanceToUserValues: function updateDistanceToUserValuesFn() {
		for (var i = 0; i < World.markerList.length; i++) {
			World.markerList[i].distanceToUser = World.markerList[i].markerObject.locations[0].distanceToUser();
		}
	},

	// updates status message shon in small "i"-button aligned bottom center
	updateStatusMessage: function updateStatusMessageFn(message, isWarning) {

		$("#status-message").html(message);

	},

	/*
		It may make sense to display POI details in your native style. 
		In this sample a very simple native screen opens when user presses the 'More' button in HTML. 
		This demoes the interaction between JavaScript and native code.
	*/
	// user clicked "More" button in POI-detail panel -> fire event to open native screen
	onPoiDetailMoreButtonClicked: function onPoiDetailMoreButtonClickedFn() {
		var currentMarker = World.currentMarker;
		var architectSdkUrl = "architectsdk://markerselected?id=" + encodeURIComponent(currentMarker.poiData.id) + "&title=" + encodeURIComponent(currentMarker.poiData.title) + "&description=" + encodeURIComponent(currentMarker.poiData.description);
		/*
			The urlListener of the native project intercepts this call and parses the arguments. 
			This is the only way to pass information from JavaSCript to your native code. 
			Ensure to properly encode and decode arguments.
			Note: you must use 'document.location = "architectsdk://...' to pass information from JavaScript to native. 
			! This will cause an HTTP error if you didn't register a urlListener in native architectView !
		*/
		document.location = architectSdkUrl;
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

    //play a Sound
    onPlaySound: function onPlaySoundFn(urlAudio){
        
        if (World.isPlayingAudio){

            $("#poi-detail-audio").css("opacity", "1");
            preloadedSound.stop();
            $('body').removeClass('ui-loading');
            World.isPlayingAudio = false;

        }

        else{
        $("#poi-detail-audio").css("opacity", "0.3");
        $('body').addClass('ui-loading');
        preloadedSound = new AR.Sound(urlAudio, {
                        onError : function(){
                            $("#poi-detail-audio").css("opacity", "1");
                            $('body').removeClass('ui-loading');
                            alert('Unable to load audio!');
                            World.isPlayingAudio = false;
                        },
                        onFinishedPlaying : function(){
                            $("#poi-detail-audio").css("opacity", "1");
                            $('body').removeClass('ui-loading');    
                            World.isPlayingAudio = false;               
                        }
                    });
        preloadedSound.play();
        World.isPlayingAudio = true;

        }
    },

    //open VIDEO in Wikitude Player
    onPlayVideo: function onPlayVideoFn(urlVideo){
        AR.context.startVideoPlayer(urlVideo);
    },

    //open MAP URL
    onShowMap: function onShowMapFn(urlMap){
        AR.context.openInBrowser(urlMap);
    },

    //open FB URL
    onOpenUrlFb: function onOpenUrlFbFn(urlFb){
        AR.context.openInBrowser(urlFb);
    },

    //open TW URL
    onOpenUrlTw: function onOpenUrlTwFn(urlTw){
        AR.context.openInBrowser(urlTw);
    },



	// fired when user pressed maker in cam
	onMarkerSelected: function onMarkerSelectedFn(marker) {
		// deselect previous marker
		if (World.currentMarker) {
			//when is the same marker than previous one
			if (World.currentMarker.poiData.id == marker.poiData.id) {
				//Hide icons without information
				if(marker.poiData.facebook == ''){
					$("#fbIcon").css("display", "none");
				}
				if(marker.poiData.twitter == ''){
					$("#twIcon").css("display", "none");
				}	
				if(marker.poiData.audio_path == ''){
					$("#audioIcon").css("display", "none");
				}	
				if(marker.poiData.video_path == ''){
					$("#videoIcon").css("display", "none");
				}	
				//alert("ID IGUALES");
				//alert('tracker2');
				document.location = "architectsdk://trackID?id=" + idOfClient + "&tag=" + marker.poiData.title;
				World.onHideElements();
				marker.setSelected(marker);
				return;
				
			}
			//alert("handle PREVIOUS");
			//When there was a marker selected and It is just necessary to change the info in the Display and deselected the previous one
			World.currentMarker.setDeselected(World.currentMarker);
		}

		// highlight current one
		//alert('tracker1');
		document.location = "architectsdk://trackID?id=" + idOfClient + "&tag=" + marker.poiData.title;
		
		World.onHideElements();
		marker.setSelected(marker);
		World.currentMarker = marker;

		//Hide icons without information
				if(marker.poiData.facebook == ''){
					$("#fbIcon").css("display", "none");
				}
				if(marker.poiData.twitter == ''){
					$("#twIcon").css("display", "none");
				}	
				if(marker.poiData.audio_path == ''){
					$("#audioIcon").css("display", "none");
				}	
				if(marker.poiData.video_path == ''){
					$("#videoIcon").css("display", "none");
				}	


		var mapWidth = $(".myMap").width();
		var mapHeight = $(".myIcons").height() - 17;

		// update panel values
		$("#poi-detail-title").html(marker.poiData.title);
		$("#poi-detail-image").attr('src', String(marker.poiData.image_path));
		$("#poi-detail-description").html(marker.poiData.description);
		$("#poi-detail-url").attr("href","javascript: World.onOpenUrl('" + String(marker.poiData.url) + "','" + String(marker.poiData.title) + "');");
		$("#poi-detail-audio").attr("href","javascript: World.onPlaySound('" + String(marker.poiData.audio_path) + "');");
		$("#poi-detail-video").attr("href","javascript: World.onPlayVideo('" + String(marker.poiData.video_path) + "');");
		$("#poi-detail-map-preview").attr('src', 'http://maps.googleapis.com/maps/api/staticmap?center=' + marker.poiData.latitude + ',' + marker.poiData.longitude + '&zoom=15&size=' + mapWidth + 'x' + mapHeight + '&markers=icon:http://illut.io/webapps/apps/geodisplay/public/img/marker.png%7C' + marker.poiData.latitude + ',' + marker.poiData.longitude + '&key=AIzaSyBoyBBdG47Q_a5JXROveUKPb5V2-nktZ20');
		$("#poi-detail-map").attr("href","javascript: World.onShowMap('https://maps.google.com/maps?f=d&source=s_d&dirflg=w&saddr=" + World.userLocation.latitude + "," + World.userLocation.longitude + "&daddr=" + marker.poiData.latitude + "," + marker.poiData.longitude + "');");
        $("#poi-detail-map-img").attr("href","javascript: World.onShowMap('https://maps.google.com/maps?f=d&source=s_d&dirflg=w&saddr=" + World.userLocation.latitude + "," + World.userLocation.longitude + "&daddr=" + marker.poiData.latitude + "," + marker.poiData.longitude + "');");
        $("#poi-detail-facebook").attr("href","javascript: World.onOpenUrlFb('" + marker.poiData.facebook + "');");
        $("#poi-detail-twitter").attr("href","javascript: World.onOpenUrlTw('" + marker.poiData.twitter + "');");
        

		var distanceToUserValue = (marker.distanceToUser > 999) ? ((marker.distanceToUser / 1000).toFixed(2) + " km") : (Math.round(marker.distanceToUser) + " m");

		$("#poi-detail-distance").html(distanceToUserValue);
	},

	//Hide elements and Show DISPLAY
	onHideElements: function onHideElementsFn(){
		//hide radar
		PoiRadar.hide();
		//Hide Range Button
		$( ".range" ).css( "display", "none" );
		//Hide Share Button
		$( ".share" ).css( "display", "none" );
		//Hide Info
		$( ".alert" ).css( "display", "none" );
		//SHOW INFO
		$( ".container" ).css( "display", "block" );


	},

	//Show Elements and Hide DISPLAY
	onShowElements: function onShowElementsFn(){
		//Show radar
		PoiRadar.show();
		//Show Range Button
		$( ".range" ).css( "display", "block" );
		//Show Share Button
		$( ".share" ).css( "display", "block" );
		//Show Info
		$( ".alert" ).css( "display", "block" );
		//HIDE INFO
		$( ".container" ).css( "display", "none" );


	},

	onStopCurrentAudio: function onStopCurrentAudioFn(){
		if (World.isPlayingAudio){
            $("#poi-detail-audio").css("opacity", "1");
            preloadedSound.stop();
            $('body').removeClass('ui-loading');
            World.isPlayingAudio = false;
        }
	},

	//close Button was clicked
	onMarkerDeselectedFirst: function onMarkerDeselectedFirstFn(){
		//alert( "Handler boton X " );
		World.onShowElements();
		World.currentMarker.setDeselected(World.currentMarker);
	},

	// screen was clicked but no geo-object was hit
	onScreenClick: function onScreenClickFn() {
		// you may handle clicks on empty AR space too
		//alert( "Handler EMPTY " );
		//If there was a marker selected, I deselected it
		if (World.currentMarker) {
			World.onShowElements();
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
		$("#panel-distance-value").html(maxRangeValue);
		$("#panel-distance-places").html((placesInRange != 1) ? (placesInRange + " Places") : (placesInRange + " Place"));

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

	handlePanelMovements: function handlePanelMovementsFn() {

		$("#panel-distance").on("panelclose", function(event, ui) {
			$("#radarContainer").addClass("radarContainer_left");
			$("#radarContainer").removeClass("radarContainer_right");
			PoiRadar.updatePosition();
		});

		$("#panel-distance").on("panelopen", function(event, ui) {
			$("#radarContainer").removeClass("radarContainer_left");
			$("#radarContainer").addClass("radarContainer_right");
			PoiRadar.updatePosition();
		});
	},


	// display range slider
	showRange: function showRangeFn() {
		if (World.markerList.length > 0) {

			// update labels on every range movement
			$('#panel-distance-range').change(function() {
				World.updateRangeValues();
			});

			World.updateRangeValues();
			World.handlePanelMovements();

			// open panel
			$("#panel-distance").trigger("updatelayout");
			$("#panel-distance").panel("open", 1234);
		} else {

			// no places are visible, because the are not loaded yet
			World.updateStatusMessage('No hay promociones disponibles', true);
		}
	},


	/*
		This sample shows you how to use the function captureScreen to share a snapshot with your friends. C
		oncept of interaction between JavaScript and native code is same as in the POI Detail page sample but the urlListener now handles picture sharing instead. 
		The "Snapshot"-button is on top right in the title bar. 
		Once clicked the current screen is captured and user is prompted to share it (Handling of picture sharing is done in native code and cannot be done in JavaScript)
	*/
	// reload places from content source
	captureScreen: function captureScreenFn() {
		if (World.initialized) {
			document.location = "architectsdk://button?action=captureScreen";
		}
	},

	// request POI data
	requestDataFromServer: function requestDataFromServerFn(lat, lon) {

		$('body').addClass('ui-loading');

		// set helper var to avoid requesting places while loading
		World.isRequestingData = true;
		World.updateStatusMessage('Obteniendo información');

		
		//alert(serverUrl);

		var jqxhr = $.getJSON(serverUrl, function(data) {
				//alert(data);
				World.loadPoisFromJsonData(data);
			})
			.error(function(err) {
				/*
					Under certain circumstances your web service may not be available or other connection issues can occur. 
					To notify the user about connection problems a status message is updated.
					In your own implementation you may e.g. use an info popup or similar.
				*/
				World.updateStatusMessage("Error al cargar las promociones", true);
				World.isRequestingData = false;
			})
			.complete(function() {

						var jqxhrRally = $.getJSON(serverUrlRally, function(data) {
						World.loadPoisFromJsonDataRally(data);
						})

						.error(function(err) {
							/*
								Under certain circumstances your web service may not be available or other connection issues can occur. 
								To notify the user about connection problems a status message is updated.
								In your own implementation you may e.g. use an info popup or similar.
							*/
							World.updateStatusMessage("Error al cargar el Rally", true);
							World.isRequestingData = false;
						})

						.complete(function() {
							World.isRequestingData = false;
						});

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