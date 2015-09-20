package com.gm.sailar;

import java.util.ArrayList;
import java.util.List;

import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarActivity;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.widget.GridLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.support.v7.widget.Toolbar;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;
import android.widget.Toast;

import com.heyapp.hey.R;

public class HomeActivity extends ActionBarActivity {

	private final static int FAV_PLACES = 0;
	private final static int NOTIFICATIONS = 1;

	private DrawerLayout mDrawerLayout;
	private ListView mDrawerList;
	private ActionBarDrawerToggle mDrawerToggle;
	public Toolbar mToolbar;

	HomeAdapter adapter;

	List<HomeItem> dataList;
	
	public static Context publicContext;

	private RecyclerView mRecyclerView;
	List<CategoriesViewModel> items;
	CategoriesPlacesAdapter adapterCategories;


	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_home);

		// Acciones de la toolbar
		setToolbar();

		// INITIALIZATION
		publicContext = getApplicationContext();

		// CAJON DE LA IZQUIERDA
		dataList = new ArrayList<HomeItem>();
		mDrawerLayout = (DrawerLayout) findViewById(R.id.drawer_layout);
		mDrawerList = (ListView) findViewById(R.id.left_drawer);
		mDrawerLayout.setDrawerShadow(R.drawable.drawer_shadow,GravityCompat.START);

		dataList.add(new HomeItem("Favorite places", R.drawable.ic_box_places));
		dataList.add(new HomeItem("Notifications", R.drawable.ic_box_noti));

		adapter = new HomeAdapter(this, R.layout.item_menu_izquierda,dataList);

		mDrawerList.setAdapter(adapter);
		mDrawerList.setOnItemClickListener(new DrawerItemClickListener());

		// DRAWER LAYOUT
		mDrawerLayout.setDrawerListener(mDrawerToggle);
		mDrawerToggle = new ActionBarDrawerToggle(this, mDrawerLayout, mToolbar, R.string.drawer_open, R.string.drawer_close);
		mDrawerLayout.setDrawerListener(mDrawerToggle);
		mDrawerToggle.syncState();

		// UI
		// RecycleView
		mRecyclerView = (RecyclerView) findViewById(R.id.recycler_view_list);
		mRecyclerView.setHasFixedSize(true);

		final GridLayoutManager layoutManager = new GridLayoutManager(publicContext, 2);
		mRecyclerView.setLayoutManager(layoutManager);

		View header = LayoutInflater.from(publicContext).inflate(R.layout.item_category_pennu, mRecyclerView, false);

		header.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View v) {
				Toast.makeText(v.getContext(), "Click on header", Toast.LENGTH_SHORT).show();
			}
		});

		adapterCategories = new CategoriesPlacesAdapter(header, getCategories(), R.layout.item_category, this);
		mRecyclerView.setAdapter(adapterCategories);

		layoutManager.setSpanSizeLookup(new GridLayoutManager.SpanSizeLookup() {
			@Override
			public int getSpanSize(int position) {
				return adapterCategories.isHeader(position) ? layoutManager.getSpanCount() : 1;
			}
		});


	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		//		getMenuInflater().inflate(R.menu.main_navigator, menu);
		return true;
	}

	private class DrawerItemClickListener implements ListView.OnItemClickListener {
		@Override
		public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
			SelectItem(position);
		}
	}

	@Override
	protected void onResume() {
		super.onResume();
	}

	@Override
	protected void onPause() {
		super.onPause();
	}


	public void SelectItem(int position) {
		Intent intent = null;
		switch(position){
		case FAV_PLACES:
			intent = new Intent(getApplicationContext(), com.gm.sailar.FavoritePlacesActivity.class);
			break;
		case NOTIFICATIONS:
			intent = new Intent(getApplicationContext(), com.gm.sailar.NotificationsActivity.class);
			break;
		}
		// Se lanza el intento corresponediente
		startActivity(intent);
		this.overridePendingTransition(R.anim.right_to_center,R.anim.center_to_left);
		mDrawerList.setItemChecked(position, true);
	}



	@Override
	public void onConfigurationChanged(Configuration newConfig) {
		super.onConfigurationChanged(newConfig);
		mDrawerToggle.onConfigurationChanged(newConfig);
	}

	@Override
	protected void onPostCreate(Bundle savedInstanceState) {
		super.onPostCreate(savedInstanceState);
		// Sync the toggle state after onRestoreInstanceState has occurred.
		mDrawerToggle.syncState();
	}

	private void setToolbar(){
		mToolbar = (Toolbar) findViewById(R.id.main_toolbar);
		mToolbar.showOverflowMenu();
		setSupportActionBar(mToolbar);
		getSupportActionBar().setDisplayHomeAsUpEnabled(true);
		getSupportActionBar().setHomeButtonEnabled(true);
		getSupportActionBar().setDisplayShowTitleEnabled(false);
	}
	
	public List<CategoriesViewModel> getCategories() {
		items = new ArrayList<CategoriesViewModel>();

		items.add(new CategoriesViewModel("museums", "Museums", R.drawable.museums));
		items.add(new CategoriesViewModel("historicsites", "Historic Sites", R.drawable.historic));
		items.add(new CategoriesViewModel("monumentsstatues", "Monuments & Statues", R.drawable.monuments));
		items.add(new CategoriesViewModel("entertainment", "Entertainment", R.drawable.enter));
		items.add(new CategoriesViewModel("educational", "Educational", R.drawable.educ));
		items.add(new CategoriesViewModel("religious", "Religious Sites", R.drawable.rel));
		items.add(new CategoriesViewModel("theatre", "Theatre & Concerts", R.drawable.theat));
		items.add(new CategoriesViewModel("nature", "Nature & Parks", R.drawable.park));
		items.add(new CategoriesViewModel("amusement", "Amusement Parks", R.drawable.amuse));
		items.add(new CategoriesViewModel("shopping", "Shopping", R.drawable.shop));
		items.add(new CategoriesViewModel("nightlife", "Nightlife", R.drawable.nightlife));
		items.add(new CategoriesViewModel("arenasstadiums", "Arenas & Stadiums", R.drawable.arena));

		return items;

	}

	@Override
	public void onBackPressed() {
		finish();
		this.overridePendingTransition(R.anim.left_to_center,R.anim.center_to_right);
	}

}
