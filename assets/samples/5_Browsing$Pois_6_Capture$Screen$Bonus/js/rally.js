function Logo(poiData) {

    this.poiData = poiData;
    
    var logoDrawable_idle = null;
    var animGroupLogo = null;
    var logoAnimation1 = null;
    var logoAnimation2 = null;
    var hasToAnimateLogo = false;

    

    // create the AR.GeoLocation from the poi data
    var logoLocation = new AR.GeoLocation(poiData.latitude, poiData.longitude, poiData.altitude);

    // create an AR.ImageDrawable for the logo in idle state
    this.logoDrawable_idle = new AR.ImageDrawable(World.logoDrawable, 2.5, {
        zOrder: 0,
        opacity: 1.0,
        offsetY: 4.0,

        /*
            To react on user interaction, an onClick property can be set for each AR.Drawable. The property is a function which will be called each time the user taps on the drawable. The function called on each tap is returned from the following helper function defined in logo.js. The function returns a function which checks the selected state with the help of the variable isSelected and executes the appropriate function. The clicked logo is passed as an argument.
        */
        onClick: Logo.prototype.getOnClickTrigger(this,poiData.rallyNr,poiData.rallyName,poiData.rallyImage)
    });

    this.distanceLabel = new AR.Label(poiData.distance, 0.30, {
        zOrder: 1,
        offsetY: 4.0,
        style: {
            textColor: '#FFFFFF'
        }
    });

    /*
        Create an AR.ImageDrawable using the AR.ImageResource for the direction indicator which was created in the World. Set options regarding the offset and anchor of the image so that it will be displayed correctly on the edge of the screen.
    */
    this.directionIndicatorDrawable = new AR.ImageDrawable(World.markerDrawable_directionIndicator, 0.1, {
        enabled: true,
        verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP
    });

    /*
        The representation of an AR.GeoObject in the radar is defined in its drawables set (second argument of AR.GeoObject constructor). 
        Once drawables.radar is set the object is also shown on the radar e.g. as an AR.Circle
    */
    this.radarCircle = new AR.Circle(0.05, {
        horizontalAnchor: AR.CONST.HORIZONTAL_ANCHOR.CENTER,
        opacity: 0.8,
        style: {
            fillColor: "#ed8b00"
        }
    });


    this.radardrawables = [];
    this.radardrawables.push(this.radarCircle);

    /*  
        Note that indicator and radar-drawables were added
    */
    this.logoObject = new AR.GeoObject(logoLocation, {
        drawables: {
            cam: [this.logoDrawable_idle],
            indicator: this.directionIndicatorDrawable,
            radar: this.radardrawables
        }
    });

    
    Logo.prototype.startSmileyAnimation(this);


    return this;
}

Logo.prototype.getOnClickTrigger = function(logo,rallyNumber,rallyName,rallyImage) {

    /*
        The setSelected and setDeselected functions are prototype logo functions. 
        Both functions perform the same steps but inverted.
    */

    return function() {

        logo.logoObject.destroy();

        World.rallyCounter[rallyNumber]--;
            
        if( World.rallyCounter[rallyNumber] == 0){
            World.updateStatusMessage('¡Felicidades! Rally ' + rallyName + ' completado.');
            //Codigo promocion
            var architectSdkUrl = "architectsdk://markerselected?imageurl=" + rallyImage;
            document.location = architectSdkUrl;    
            return;
        }

        if( World.rallyCounter[rallyNumber] == 1){
            //alert(World.rallyCounter + ' logos restantes para completar el Rally.' )
            World.updateStatusMessage('¡Wow! Sólo un logo más para completar el Rally ' + rallyName);
            return;
        }

        World.updateStatusMessage(World.rallyCounter[rallyNumber] + ' logos restantes para completar el Rally ' + rallyName);
        

    }
};

Logo.prototype.startSmileyAnimation= function(logo) {

    if(logoAnimation1 == null){
            var logoAnimation1 = new AR.PropertyAnimation(logo.logoDrawable_idle, "tilt", 0, 45, 500, {type: AR.CONST.EASING_CURVE_TYPE.EASE_IN_OUT_QUAD});

            var logoAnimation2 = new AR.PropertyAnimation(logo.logoDrawable_idle, "tilt", 45, 0, 500, {type: AR.CONST.EASING_CURVE_TYPE.EASE_IN_OUT_QUAD});

            var logoAnimation3 = new AR.PropertyAnimation(logo.logoDrawable_idle, "tilt", 0, -45, 500, {type: AR.CONST.EASING_CURVE_TYPE.EASE_IN_OUT_QUAD});

            var logoAnimation4 = new AR.PropertyAnimation(logo.logoDrawable_idle, "tilt", -45, 0, 500, {type: AR.CONST.EASING_CURVE_TYPE.EASE_IN_OUT_QUAD});

            var arr_anims = new Array(
                logoAnimation1, 
                logoAnimation2, 
                logoAnimation3, 
                logoAnimation4
            );

            animGroupLogo = new AR.AnimationGroup(
                    AR.CONST.ANIMATION_GROUP_TYPE.SEQUENTIAL,
                    arr_anims
                );
        }
        
        hasToAnimateLogo = true;
        animGroupLogo.start(-1);


}