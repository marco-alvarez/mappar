package com.wikitude.samples;

import java.io.File;
import java.io.FileOutputStream;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.hardware.GeomagneticField;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.location.Location;
import android.location.LocationListener;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.support.v4.app.Fragment;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Toast;

import com.google.android.gms.maps.model.LatLng;
import com.heyapp.hey.R;
import com.wikitude.architect.ArchitectView;
import com.wikitude.architect.ArchitectView.ArchitectUrlListener;
import com.wikitude.architect.ArchitectView.CaptureScreenCallback;
import com.wikitude.architect.ArchitectView.SensorAccuracyChangeListener;

public class SampleCamActivity extends AbstractArchitectCamActivity implements SensorEventListener{

	public Toolbar mToolbar;

	private static final String TAG = "SampleCamActivity";

	private SensorManager sensorManager;
	private Sensor accelerometer;
	private Sensor magnetometer;
	private float[] mGravity;
	private float[] mGeomagnetic;

	private int lastPitch;
	private int delta;
	private int aux;
	private int auxBearing;

	LatLng myCoordinates;
	protected Location mLastLocation;
	
	Fragment mapFragment;

	float mDeclination;
	private Boolean bearingListener = false;

	String worldType; 

	Boolean isRangeOpen = false;


	@Override
	@SuppressLint("NewApi")
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		worldType = getCategoryType();

		// Acciones de la toolbar
		setToolbar();

		// Setup the sensors
		sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
		accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
		if (accelerometer == null) {
			Log.d(TAG, "accelerometer is null");
		}
		magnetometer = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
		if (magnetometer == null) {
			Log.d(TAG, "magnetometer is null");
		}


	}

	/**
	 * last time the calibration toast was shown, this avoids too many toast shown when compass needs calibration
	 */
	private long lastCalibrationToastShownTimeMillis = System.currentTimeMillis();

	@Override
	public String getCategoryId() {
		// Get the string from the intent
		Intent intent = getIntent();
		String categoryId = intent.getStringExtra("categoryId");
		return categoryId;
	}

	@Override
	public String getCategoryName() {
		// Get the string from the intent
		Intent intent = getIntent();
		String categoryName = intent.getStringExtra("categoryName");
		return categoryName;
	}

	@Override
	public String getCategoryType() {
		// Get the string from the intent
		Intent intent = getIntent();
		String categoryType = intent.getStringExtra("categoryType");
		return categoryType;
	}

	@Override
	public String getDestLat() {
		// Get the string from the intent
		Intent intent = getIntent();
		String destLat = intent.getStringExtra("destLat");
		return destLat;
	}

	@Override
	public String getDestLong() {
		// Get the string from the intent
		Intent intent = getIntent();
		String destLong = intent.getStringExtra("destLong");
		return destLong;
	}

	@Override
	public int getContentViewId() {
		return R.layout.ar_view;
	}

	@Override
	public int getArchitectViewId() {
		return R.id.architectView;
	}

	@Override
	public String getWikitudeSDKLicenseKey() {
		return WikitudeSDKConstants.WIKITUDE_SDK_KEY;
	}

	@Override
	public SensorAccuracyChangeListener getSensorAccuracyListener() {
		return new SensorAccuracyChangeListener() {
			@Override
			public void onCompassAccuracyChanged( int accuracy ) {
				/* UNRELIABLE = 0, LOW = 1, MEDIUM = 2, HIGH = 3 */
				if ( accuracy < SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM && SampleCamActivity.this != null && !SampleCamActivity.this.isFinishing() && System.currentTimeMillis() - SampleCamActivity.this.lastCalibrationToastShownTimeMillis > 5 * 1000) {
					Toast.makeText( SampleCamActivity.this, R.string.compass_accuracy_low, Toast.LENGTH_LONG ).show();
					SampleCamActivity.this.lastCalibrationToastShownTimeMillis = System.currentTimeMillis();
				}
			}
		};
	}

	@Override
	public ArchitectUrlListener getUrlListener() {
		return new ArchitectUrlListener() {

			@Override
			public boolean urlWasInvoked(String uriString) {

				Uri invokedUri = Uri.parse(uriString);

				// Show route between current location and selected marker - PLACES
				if ("viewShowRoutePlaces".equalsIgnoreCase(invokedUri.getHost())) {

					

				}

				// Show route between current location and selected marker - EVENTS
				else if ("viewShowRouteEvents".equalsIgnoreCase(invokedUri.getHost())) {

					

				}

				// Reset Places Map
				else if ("resetMapPlaces".equalsIgnoreCase(invokedUri.getHost())) {
					bearingListener = false;
					
				}

				// Reset Places Map Around
				else if ("resetMapPlacesAround".equalsIgnoreCase(invokedUri.getHost())) {
					bearingListener = false;

				}

				// Open Dialog with info for a Place
				else if ("openInfoDialogPlaces".equalsIgnoreCase(invokedUri.getHost())) {

					
				}

				return true;
			}
		};
	}

	@Override
	public ILocationProvider getLocationProvider(final LocationListener locationListener) {
		return new LocationProvider(this, locationListener);
	}

	@Override
	public float getInitialCullingDistanceMeters() {
		// you need to adjust this in case your POIs are more than 50km away from user here while loading or in JS code (compare 'AR.context.scene.cullingDistance')
		return ArchitectViewHolderInterface.CULLING_DISTANCE_DEFAULT_METERS;
	}

	@Override
	protected boolean hasGeo() {
		return true;
	}

	@Override
	protected boolean hasIR() {
		return false;
	}

	@Override
	protected com.wikitude.architect.StartupConfiguration.CameraPosition getCameraPosition() {
		return com.wikitude.architect.StartupConfiguration.CameraPosition.DEFAULT;
	}

	@Override
	protected void onResume() {
		super.onResume();
		bearingListener = false;
		sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_NORMAL);
		sensorManager.registerListener(this, magnetometer, SensorManager.SENSOR_DELAY_NORMAL);
	}

	@Override
	protected void onPause() {
		super.onPause();
		bearingListener = false;
		sensorManager.unregisterListener(this);
	}


	@Override
	protected void onStop() {
		super.onStop();
	}



	@Override
	public void onSensorChanged(SensorEvent event) {
		if (event.values == null) {
			Log.w(TAG, "event.values is null");
			return;
		}
		int sensorType = event.sensor.getType();
		switch (sensorType) {
		case Sensor.TYPE_ACCELEROMETER:
			mGravity = event.values;
			break;
		case Sensor.TYPE_MAGNETIC_FIELD:
			mGeomagnetic = event.values;
			break;
		default:
			Log.w(TAG, "Unknown sensor type " + sensorType);
			return;
		}
		if (mGravity == null) {
			Log.w(TAG, "mGravity is null");
			return;
		}
		if (mGeomagnetic == null) {
			Log.w(TAG, "mGeomagnetic is null");
			return;
		}
		float R[] = new float[9];
		if (! SensorManager.getRotationMatrix(R, null, mGravity, mGeomagnetic)) {
			return;
		}

		float orientation[] = new float[9];
		SensorManager.getOrientation(R, orientation);
		// Orientation contains: azimuth, pitch and roll - we'll use roll
		float pitch = orientation[1];
		int pitchDeg = (int) Math.round(Math.toDegrees(pitch));

		aux++;
		if(aux == 5){

			auxBearing++;
			if(auxBearing == 2){
				float bearing = (float) (Math.toDegrees(orientation[0]) + mDeclination);
				if(bearingListener){
					//TODO updateCamera(bearing);
					System.out.println(bearing);
				}
				auxBearing = 0;
			}

			delta = Math.abs(pitchDeg - lastPitch);
			// cambio significativo -> no es solo ruido // que el mapa ya exista
			if(delta > 1){
				//TODO log
				System.out.println("cambio significativo**********");
			}
			aux = 0;
		}

		lastPitch = pitchDeg;
	}


	@Override
	public void onAccuracyChanged(Sensor sensor, int accuracy) {

	}

	public void onLocationChanged(Location location) {
		GeomagneticField field = new GeomagneticField(
				(float)location.getLatitude(),
				(float)location.getLongitude(),
				(float)location.getAltitude(),
				System.currentTimeMillis()
				);

		// getDeclination returns degrees
		mDeclination = field.getDeclination();

	}

	private void captureScreen(){
		SampleCamActivity.this.architectView.captureScreen(ArchitectView.CaptureScreenCallback.CAPTURE_MODE_CAM_AND_WEBVIEW, new CaptureScreenCallback() {

			@Override
			public void onScreenCaptured(final Bitmap screenCapture) {
				// store screenCapture into external cache directory
				final File screenCaptureFile = new File(Environment.getExternalStorageDirectory().toString(), "screenCapture_" + System.currentTimeMillis() + ".jpg");

				// 1. Save bitmap to file & compress to jpeg. You may use PNG too
				try {
					final FileOutputStream out = new FileOutputStream(screenCaptureFile);
					screenCapture.compress(Bitmap.CompressFormat.JPEG, 90, out);
					out.flush();
					out.close();

					// 2. create send intent
					final Intent share = new Intent(Intent.ACTION_SEND);
					share.setType("image/jpg");
					share.putExtra(Intent.EXTRA_STREAM, Uri.fromFile(screenCaptureFile));

					// 3. launch intent-chooser
					final String chooserTitle = "Share";
					SampleCamActivity.this.startActivity(Intent.createChooser(share, chooserTitle));

				} catch (final Exception e) {
					// should not occur when all permissions are set
					SampleCamActivity.this.runOnUiThread(new Runnable() {

						@Override
						public void run() {
							// show toast message in case something went wrong
							Toast.makeText(SampleCamActivity.this, "¡Ups! Something went wrong. Please try again." + e, Toast.LENGTH_LONG).show();	
						}
					});
				}
			}
		});
	}

	private void reloadContentInAr(){
		this.architectView.callJavascript("World.reloadWorld()");
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		getMenuInflater().inflate(R.menu.menu_arview, menu);
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		switch (item.getItemId()) {
		case R.id.button_take_screen:
			captureScreen();
			return true;
		case R.id.button_open_rangebox:
			if(isRangeOpen){
				this.architectView.callJavascript("World.hideRange()");
				isRangeOpen = false;
			} else{
				this.architectView.callJavascript("World.showRange()");
				isRangeOpen = true;
			}
			return true;
		case R.id.button_reload_content:
			AlertDialog.Builder builder = new AlertDialog.Builder(this);
			builder.setMessage("Would you like to show all hidden elements?");
			builder.setPositiveButton("Yes", new DialogInterface.OnClickListener() {
				public void onClick(DialogInterface dialog, int which) {
					reloadContentInAr();
				}
			});
			builder.setNegativeButton(R.string.cancel, new DialogInterface.OnClickListener() {
				@Override
				public void onClick(DialogInterface dialog, int which) {
					dialog.dismiss();
				}
			});

			AlertDialog alert = builder.create();
			alert.show();
			return true;
		default:
			return super.onOptionsItemSelected(item);
		}
	}

	private void setToolbar() {
		mToolbar = (Toolbar) findViewById(R.id.toolbar);
		if (mToolbar != null) {
			setSupportActionBar(mToolbar);
			getSupportActionBar().setDisplayHomeAsUpEnabled(true);
			getSupportActionBar().setDisplayShowHomeEnabled(true);
			getSupportActionBar().setDisplayShowTitleEnabled(true);
			getSupportActionBar().setTitle(getCategoryName());
			mToolbar.setNavigationOnClickListener(new View.OnClickListener() {
				@Override
				public void onClick(View v) {
					onBackPressed();
				}
			});

		}
	}

	@Override
	public void onBackPressed() {
		finish();
		this.overridePendingTransition(R.anim.left_to_center,R.anim.center_to_right);
	}

}
