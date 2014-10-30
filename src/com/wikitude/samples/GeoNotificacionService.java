package com.wikitude.samples;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

import com.esri.android.geotrigger.GeotriggerBroadcastReceiver;
import com.esri.android.geotrigger.GeotriggerService;

public class GeoNotificacionService extends Service implements 
GeotriggerBroadcastReceiver.ReadyListener
{    
    
	private GeotriggerBroadcastReceiver mGeotriggerBroadcastReceiver;
   
	// Create a new application at https://developers.arcgis.com/en/applications
	private static final String AGO_CLIENT_ID = "XRohoSaxxgwb8Add";

	// The project number from https://cloud.google.com/console
	private static final String GCM_SENDER_ID = "718397264148";
   
	// A list of initial tags to apply to the device.
	// Triggers created on the server for this application, with at least one of these same tags,
	// will be active for the device.
	private static final String[] TAGS = new String[] {"some_tag", "another_tag", "marco_test1"};
    
	@Override
    public int onStartCommand(Intent intent, int flags, int startId) {
       
		GeotriggerService.init(getApplicationContext(), 
               AGO_CLIENT_ID, GCM_SENDER_ID, TAGS, 
               GeotriggerService.TRACKING_PROFILE_ADAPTIVE);
		
       mGeotriggerBroadcastReceiver = new GeotriggerBroadcastReceiver();
       
       registerReceiver(mGeotriggerBroadcastReceiver,
               GeotriggerBroadcastReceiver.getDefaultIntentFilter());
        
        return super.onStartCommand(intent, flags, startId);
    }

    
    @Override
    public IBinder onBind(Intent intent) {
        // TODO Auto-generated method stub
        return null;
    }


    @Override
    public void onReady() {
        Log.e("Servicio", "GeoServicioNotificacion esta ready!!");
    }
   
}
