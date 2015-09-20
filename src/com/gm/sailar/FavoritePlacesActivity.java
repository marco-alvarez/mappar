package com.gm.sailar;

import java.util.ArrayList;
import java.util.List;

import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.support.v7.widget.Toolbar;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.heyapp.hey.R;
import com.parse.FindCallback;
import com.parse.ParseException;
import com.parse.ParseObject;
import com.parse.ParseQuery;

public class FavoritePlacesActivity extends ActionBarActivity{

	private RecyclerView mRecyclerView;
	List<FavoritePlacesViewModel> items;
	FavoritePlacesAdapter adapter;

	TextView noResults;
	ProgressBar loadingBar;

	Toolbar mToolbar;

	Boolean cardsView = true;


	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		setContentView(R.layout.activity_recyclerview);

		// Toolbar actions
		setToolbar();

		// NoFavPlaces text and loading
		noResults = (TextView) findViewById(R.id.tv_no_results);
		loadingBar = (ProgressBar) findViewById(R.id.pb_loading);

		mRecyclerView = (RecyclerView) findViewById(R.id.rv_list);
		mRecyclerView.setHasFixedSize(true);
		mRecyclerView.setLayoutManager(new LinearLayoutManager(this));
		mRecyclerView.setAdapter(adapter = new FavoritePlacesAdapter(getFavPlacesList(), R.layout.item_card_fav_place, noResults, mRecyclerView, this));


	}

	public List<FavoritePlacesViewModel> getFavPlacesList() {


		items = new ArrayList<FavoritePlacesViewModel>();

		ParseQuery<ParseObject> query = ParseQuery.getQuery("FavPlaces");
		query.fromLocalDatastore();
		query.findInBackground(new FindCallback<ParseObject>() {
			public void done(List<ParseObject> placesList, ParseException e) {
				if (e == null) {
					// QUERY SUCCESS
					if(placesList.isEmpty()){
						noResults.setText(R.string.no_favorite_places);
						noResults.setVisibility(View.VISIBLE);
						mRecyclerView.setVisibility(View.GONE);

					} else{
						for(int i=0;i<placesList.size();i++){

							String placeId = placesList.get(i).getString("placeId");
							String placeName = placesList.get(i).getString("placeName");
							String placeInfo = placesList.get(i).getString("placeInfo");
							String placeLink = placesList.get(i).getString("placeLink");
							String placeImage = placesList.get(i).getString("placeImage");
							String category = placesList.get(i).getString("category");
							String placeLatitude = placesList.get(i).getString("placeLatitude");
							String placeLongitude = placesList.get(i).getString("placeLongitude");

							items.add(new FavoritePlacesViewModel(placeId, placeName, placeInfo, placeLink, placeImage, category, placeLatitude, placeLongitude));
						}
						adapter.notifyDataSetChanged();
						// me aseguro que la lista este visible
						if(mRecyclerView.getVisibility() == View.GONE){
							noResults.setVisibility(View.GONE);
							mRecyclerView.setVisibility(View.VISIBLE);
						}
					}
					// quito el loader (siempre)
					loadingBar.setVisibility(View.GONE);

				} else {
					// QUERY ERROR
				}
			}
		});
		return items;
	}

	public void switchView(int itemLayout){
		items.clear();
		mRecyclerView.setAdapter(adapter = new FavoritePlacesAdapter(getFavPlacesList(), itemLayout, noResults, mRecyclerView, this));
	}


	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		getMenuInflater().inflate(R.menu.menu_fav_saved, menu);
		return true;
	}


	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		switch (item.getItemId()) {
		case R.id.button_switch_view:
			if(cardsView){
				cardsView = false;
				item.setIcon(R.drawable.ic_view_cards);
				switchView(R.layout.item_list_fav_place);
			} else{
				cardsView = true;
				item.setIcon(R.drawable.ic_view_list);
				switchView(R.layout.item_card_fav_place);
			}
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
			//		mToolbar.setNavigationIcon(R.drawable.ic_action_back);
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
