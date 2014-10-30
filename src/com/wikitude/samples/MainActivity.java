package com.wikitude.samples;



import java.util.HashMap;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.opengl.GLES20;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.BaseAdapter;
import android.widget.GridView;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.gms.analytics.GoogleAnalytics;
import com.google.android.gms.analytics.HitBuilders;
import com.google.android.gms.analytics.Tracker;
import com.heyapp.hey.R;
import com.parse.ParseObject;
import com.parse.ParseUser;


/**
 * Activity launched when pressing app-icon.
 * It uses very basic ListAdapter for UI representation
 */
public class MainActivity extends Activity{
	
	private ParseUser currentUser;
	
	
	// The following line should be changed to include the correct property id.
    private static final String PROPERTY_ID = "UA-47031425-12";

    public static int GENERAL_TRACKER = 0;
	
	public enum TrackerName {
	    APP_TRACKER, // Tracker used only in this app.
	    GLOBAL_TRACKER, // Tracker used by all the apps from a company. eg: roll-up tracking.
	    ECOMMERCE_TRACKER, // Tracker used by all ecommerce transactions from a company.
	  }

	  HashMap<TrackerName, Tracker> mTrackers = new HashMap<TrackerName, Tracker>();
	  
	  synchronized Tracker getTracker(TrackerName trackerId) {
		    if (!mTrackers.containsKey(trackerId)) {

		      GoogleAnalytics analytics = GoogleAnalytics.getInstance(this);
		      Tracker t = (trackerId == TrackerName.APP_TRACKER) ? analytics.newTracker(PROPERTY_ID)
		          : (trackerId == TrackerName.GLOBAL_TRACKER) ? analytics.newTracker(R.xml.global_tracker)
		              : analytics.newTracker(R.xml.ecommerce_tracker);
		      mTrackers.put(trackerId, t);

		    }
		    return mTrackers.get(trackerId);
		  }
	
	GridView grid;
	  String[] web = {
	      "Hora Feliz",
	      "Museos",
	      "Cafeterías",
	      "Automotriz",
	      "Regalos",
	      "Viajes",
	      "Salud",
	      "Moda",
	      "Parques"
	  } ;
	  
	  int[] imageId = {
	      R.drawable.bar,
	      R.drawable.bank,
	      R.drawable.cafe,
	      R.drawable.taxi_stand,
	      R.drawable.shop,
	      R.drawable.airport,
	      R.drawable.hospital,
	      R.drawable.hotel,
	      R.drawable.park
	  };
	
	public final static String EXTRA_MESSAGE = "algo";

	
	@Override
	protected void onCreate( Bundle savedInstanceState ) {
		super.onCreate( savedInstanceState );
		setContentView(R.layout.activity_main);
		
		Intent i = new Intent(getApplicationContext(), GeoNotificacionService.class);
	    startService(i);
        
        CustomGrid adapter = new CustomGrid(MainActivity.this, web, imageId);
        grid=(GridView)findViewById(R.id.grid);
            grid.setAdapter(adapter);
            grid.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, View view,
                                            int position, long id) {
                    	
                    	Intent intent;
                    	
            			try {
            				
            				intent = new Intent(getApplicationContext(),Class.forName("com.wikitude.samples.SampleCamCaptureScreenActivity"));
            				
            				String message;
            				
            				switch(position) {
            			    case 0:
            			    	message = "HoraFeliz";
            			        break;
            			    case 1:
            			    	message = "Museos";
            			        break;
            			    case 2:
            			    	message = "Cafeterias";
            			        break;
            			    case 3:
            			    	message = "Automotriz";
            			        break;
            			    case 4:
            			    	message = "Regalos";
            			        break;
            			    case 5:
            			    	message = "Viajes";
            			        break;
            			    case 6:
            			    	message = "Salud";
            			        break;
            			    case 7:
            			    	message = "Moda";
            			        break;
            			    case 8:
            			    	message = "Parques";
            			        break;
            			    default:
            			    	message = "Regalos";
            				}
            				
            				System.out.println(position);
            				System.out.println(message);
            
            				
            				intent.putExtra(MainActivity.EXTRA_MESSAGE, message);
            				
            				/* launch activity */
            				startActivity( intent );
            			
            			} catch (Exception e) {
            				Toast.makeText(getApplicationContext(), "class not defined/accessible",
            						Toast.LENGTH_SHORT).show();
            			}
                        //Toast.makeText(MainActivity.this, "You Clicked at " +web[+ position], Toast.LENGTH_SHORT).show();
                    }
                });
            
            Tracker t = ((MainActivity) this).getTracker(
                    TrackerName.APP_TRACKER);
            t.setScreenName("HOME");
            t.send(new HitBuilders.AppViewBuilder().build());
				
	}

	/**
	 * helper to check if video-drawables are supported by this device. recommended to check before launching ARchitect Worlds with videodrawables
	 * @return true if AR.VideoDrawables are supported, false if fallback rendering would apply (= show video fullscreen)
	 */
	public static final boolean isVideoDrawablesSupported() {
		String extensions = GLES20.glGetString( GLES20.GL_EXTENSIONS );
		return extensions != null && extensions.contains( "GL_OES_EGL_image_external" ) && android.os.Build.VERSION.SDK_INT >= 14 ;
	}
	
	public class CustomGrid extends BaseAdapter {
    	
    	private Context mContext;
        private final String[] web;
        private final int[] Imageid;
          public CustomGrid(Context c,String[] web,int[] Imageid ) {
              mContext = c;
              this.Imageid = Imageid;
              this.web = web;
          }
        @Override
        public int getCount() {
          // TODO Auto-generated method stub
          return web.length;
        }
        @Override
        public Object getItem(int position) {
          // TODO Auto-generated method stub
          return null;
        }
        @Override
        public long getItemId(int position) {
          // TODO Auto-generated method stub
          return 0;
        }
        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
          // TODO Auto-generated method stub
          View grid;
          LayoutInflater inflater = (LayoutInflater) mContext
            .getSystemService(Context.LAYOUT_INFLATER_SERVICE);
              if (convertView == null) {
                grid = new View(mContext);
                grid = inflater.inflate(R.layout.grid_single, null);
                TextView textView = (TextView) grid.findViewById(R.id.grid_text);
                ImageView imageView = (ImageView)grid.findViewById(R.id.grid_image);
                textView.setText(web[position]);
                imageView.setImageResource(Imageid[position]);
              } else {
                grid = (View) convertView;
              }
          return grid;
        }
    	
    }
	
	@Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }
	
	@Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();
        currentUser = ParseUser.getCurrentUser();
        
        if (id == R.id.userStatus && currentUser != null) {
        	
        	// User clicked to log out.
            ParseUser.logOut();
            item.setTitle("Log In");
            Toast.makeText(getApplicationContext(), "Haz cerrado sesión de forma exitosa",
					Toast.LENGTH_SHORT).show();
            
            return true;
        }else if(id == R.id.userStatus && currentUser == null){
        	Intent i = new Intent(MainActivity.this, com.heyapp.hey.SampleProfileActivity.class);
            startActivity(i);
            // close this activity
            finish();
        }
        return super.onOptionsItemSelected(item);
    }
	

}
