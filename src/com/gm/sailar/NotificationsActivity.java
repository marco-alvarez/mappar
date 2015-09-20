package com.gm.sailar;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.heyapp.hey.R;
import com.parse.FindCallback;
import com.parse.ParseException;
import com.parse.ParseObject;
import com.parse.ParseQuery;

public class NotificationsActivity extends ActionBarActivity{

	private RecyclerView mRecyclerView;
	List<NotificationsViewModel> items;
	NotificationsAdapter adapter;
	
	SimpleDateFormat formatter;

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
		mRecyclerView.setAdapter(adapter = new NotificationsAdapter(getNotificationsList(), R.layout.item_notification));


	}

	public List<NotificationsViewModel> getNotificationsList() {

		formatter = new SimpleDateFormat("yyyy-MM-dd",java.util.Locale.getDefault());
		items = new ArrayList<NotificationsViewModel>();

		ParseQuery<ParseObject> query = ParseQuery.getQuery("Notification");
		query.findInBackground(new FindCallback<ParseObject>() {
			public void done(List<ParseObject> notiList, ParseException e) {
				if (e == null) {
					// QUERY SUCCESS
					if(notiList.isEmpty()){
						noResults.setText(R.string.no_notifications);
						noResults.setVisibility(View.VISIBLE);
						mRecyclerView.setVisibility(View.GONE);

					} else{
						for(int i=0;i<notiList.size();i++){

							String notiTitle = notiList.get(i).getString("notiTitle");
							String notiMessage = notiList.get(i).getString("notiMessage");
							String notiImage = notiList.get(i).getParseFile("notiImage").getUrl();
							Date createdAt = notiList.get(i).getCreatedAt();

							String createdAtString = formatter.format(createdAt);

							items.add(new NotificationsViewModel(notiTitle, createdAtString, notiMessage, notiImage));
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
