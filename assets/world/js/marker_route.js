function Marker(poiData) {

    this.poiData = poiData;
    this.isSelected = false;

    this.animationGroup_idle = null;
    this.animationGroup_selected = null;

    var offsetY_clustering = poiData.offset;


    // create the AR.GeoLocation from the poi data
    //var markerLocation = new AR.GeoLocation(poiData.latitude, poiData.longitude, poiData.altitude);
    var markerLocation = new AR.GeoLocation(poiData.latitude, poiData.longitude);

    // create an AR.ImageDrawable for the marker in idle state
    this.markerDrawable = new AR.ImageDrawable(World.markerDrawable, 2.0, {
        zOrder: 0,
        opacity: 0.8,
        offsetY: offsetY_clustering,
        onClick: Marker.prototype.getOnClickTrigger(this)
    });

    // *** HIDE BUTTON ***************************

    // create an AR.ImageDrawable for the Play Button
    this.markerDrawable_hide = new AR.ImageDrawable(World.markerDrawable_hide, 0.7, {
        zOrder: 0,
        offsetX: 3.8,
        opacity: 0.8,
        offsetY: -0.8 + offsetY_clustering,
        enabled: true,
        onClick: Marker.prototype.hideObject(this)
    });

    this.getHereLabel = new AR.Label("Get here and", 0.4, {
        zOrder: 1,
        offsetX: 0.2,
        offsetY: 0.5 + offsetY_clustering,
        style: {
            textColor: '#00144d',
            fontStyle: AR.CONST.FONT_STYLE.BOLD
        }
    });

    
    this.titleLabel = new AR.Label(poiData.name.trunc(40), 0.4, {
        zOrder: 1,
        offsetX: 0.2,
        offsetY: 0.15 + offsetY_clustering,
        style: {
            textColor: '#00144d',
            fontStyle: AR.CONST.FONT_STYLE.BOLD
        }
    });

    this.distanceLabel = new AR.Label(poiData.distance, 0.3, {
        zOrder: 1,
        offsetX: 0.15,
        offsetY: -0.5 + offsetY_clustering,
        style: {
            textColor: '#00144d'
        }
    });


    this.directionIndicatorDrawable = new AR.ImageDrawable(World.markerDrawable_directionIndicator, 0.2, {
        enabled: true,
        verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP
    });

    this.radarCircle = new AR.Circle(0.045, {
        horizontalAnchor: AR.CONST.HORIZONTAL_ANCHOR.CENTER,
        //opacity: 0.8,
        style: {
            fillColor: "#DE0034"
        }
    });

    this.radarCircleSelected = new AR.Circle(0.06, {
        horizontalAnchor: AR.CONST.HORIZONTAL_ANCHOR.CENTER,
        //opacity: 0.8,
        style: {
            fillColor: "#00bcd4"
        }
    });

    this.radardrawables = [];
    this.radardrawables.push(this.radarCircle);

    this.radardrawablesSelected = [];
    this.radardrawablesSelected.push(this.radarCircleSelected);

    /*  
        Note that indicator and radar-drawables were added
    */
    this.markerObject = new AR.GeoObject(markerLocation, {
        //the function executed when the GeoObject enters the field of vision
        onEnterFieldOfVision : function(){ World.onShowStraightArrow(); },
        //the function executed when the GeoObject exits the field of vision
        onExitFieldOfVision : function(){ World.onHideStraightArrow(); },
        drawables: {
            cam: [this.markerDrawable, this.markerDrawable_hide, this.getHereLabel, this.titleLabel, this.distanceLabel],
            indicator: this.directionIndicatorDrawable,
            radar: this.radardrawables
        },
        enabled: false
    });

    return this;
}

Marker.prototype.getOnClickTrigger = function(marker) {

    return function() {
        World.onHideStraightArrow();
        World.onNextStep();
        return true;
    };
};


Marker.prototype.hideObject = function(marker) {

    return function() {
        marker.markerObject.enabled = false;
        World.onHideStraightArrow();
        return;
    }

};

// will truncate all strings longer than given max-length "n". e.g. "foobar".trunc(3) -> "foo..."
String.prototype.trunc = function(n) {
    return this.substr(0, n - 1) + (this.length > n ? '...' : '');
};