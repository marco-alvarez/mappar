package com.wikitude.samples;

import java.io.InputStream;
import java.net.URL;

import android.app.Activity;
import android.app.ProgressDialog;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.heyapp.hey.R;

public class SamplePoiDetailActivity extends Activity{

	public static final String EXTRAS_KEY_POI_IMAGE_URL = "imageurl";
	
    ImageView img;
    Bitmap bitmap;
    ProgressDialog pDialog;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		this.setContentView(R.layout.sample_poidetail);
		
		img = (ImageView)findViewById(R.id.imgRally);
		new LoadImage().execute( getIntent().getExtras().getString(EXTRAS_KEY_POI_IMAGE_URL) );
	}
	
	private class LoadImage extends AsyncTask<String, String, Bitmap> {
	    @Override
	        protected void onPreExecute() {
	            super.onPreExecute();
	            pDialog = new ProgressDialog(SamplePoiDetailActivity.this);
	            pDialog.setMessage("Cargando ....");
	            pDialog.show();
	    }
	       protected Bitmap doInBackground(String... args) {
	         try {
	               bitmap = BitmapFactory.decodeStream((InputStream)new URL(args[0]).getContent());
	        } catch (Exception e) {
	              e.printStackTrace();
	        }
	      return bitmap;
	       }
	       protected void onPostExecute(Bitmap image) {
	         if(image != null){
	           img.setImageBitmap(image);
	           pDialog.dismiss();
	         }else{
	           pDialog.dismiss();
	           Toast.makeText(SamplePoiDetailActivity.this, "Por favor, revisa tu conexión a internet e intenta de nuevo.", Toast.LENGTH_SHORT).show();
	         }
	       }
	   }
	

}
