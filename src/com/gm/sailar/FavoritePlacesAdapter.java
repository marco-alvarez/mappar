package com.gm.sailar;

import java.util.List;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heyapp.hey.R;
import com.parse.FindCallback;
import com.parse.ParseException;
import com.parse.ParseObject;
import com.parse.ParseQuery;
import com.squareup.picasso.Picasso;
import com.wikitude.samples.SampleCamActivity;

public class FavoritePlacesAdapter extends RecyclerView.Adapter<FavoritePlacesAdapter.PlaceViewHolder> 
implements View.OnClickListener{

	private List<FavoritePlacesViewModel> items;
	private OnRecyclerViewItemClickListener<FavoritePlacesViewModel> itemClickListener;
	private int itemLayout;
	private TextView noResults;
	private RecyclerView rvList;
	private static Context context;

	@SuppressWarnings("static-access")
	public FavoritePlacesAdapter(List<FavoritePlacesViewModel> placesList,int itemLayout, TextView noResults, RecyclerView rvList, Context ctx) {
		this.items = placesList;
		this.itemLayout = itemLayout;
		this.context = ctx;
		this.noResults = noResults;
		this.rvList = rvList;
	}

	@Override
	public PlaceViewHolder onCreateViewHolder(ViewGroup viewGroup, int i) {
		View itemView = LayoutInflater.from(viewGroup.getContext()).inflate(itemLayout, viewGroup, false);
		viewGroup.setOnClickListener(this);
		return new PlaceViewHolder(itemView);
	}

	@Override public void onClick(View view) {
		if (itemClickListener != null) {
			FavoritePlacesViewModel model = (FavoritePlacesViewModel) view.getTag();
			itemClickListener.onItemClick(view, model);
		}
	}

	public void setOnItemClickListener(OnRecyclerViewItemClickListener<FavoritePlacesViewModel> listener) {
		this.itemClickListener = listener;
	}

	@Override
	public int getItemCount() {
		return items.size();
	}

	public void add(FavoritePlacesViewModel item, int position) {
		items.add(position, item);
		notifyItemInserted(position);
	}

	public void remove(FavoritePlacesViewModel item) {
		int position = items.indexOf(item);
		items.remove(position);
		notifyItemRemoved(position);
	}

	@Override
	public void onBindViewHolder(PlaceViewHolder PlaceViewHolder, int position) {
		FavoritePlacesViewModel item = items.get(position);

		PlaceViewHolder.currentItem = items.get(position);

		Picasso.with(PlaceViewHolder.iv_card.getContext())
		.load(item.getPlaceImage())
		.resize(400,400)
		.centerCrop()
		.placeholder(R.drawable.placeholder)
		.error(R.drawable.placeholder)
		.into(PlaceViewHolder.iv_card);

		PlaceViewHolder.tv_card_name.setText(item.getPlaceName());

	}



	public class PlaceViewHolder extends RecyclerView.ViewHolder {

		protected ImageView iv_card;
		protected LinearLayout ll_card_nameinfo;
		protected TextView tv_card_name;
		protected TextView tv_card_info;
		protected ImageButton ib_card_link;
		protected ImageButton ib_card_route;
		protected ImageButton ib_card_share;
		protected ImageButton ib_card_fav;

		// click listener
		public FavoritePlacesViewModel currentItem;

		public PlaceViewHolder(View v) {
			super(v);
			iv_card = (ImageView) v.findViewById(R.id.iv_card);
			tv_card_name = (TextView) v.findViewById(R.id.tv_card_name);
			tv_card_info = (TextView) v.findViewById(R.id.tv_card_info);
			ib_card_link = (ImageButton) v.findViewById(R.id.ib_card_link);
			ib_card_route = (ImageButton) v.findViewById(R.id.ib_card_route);
			ib_card_share = (ImageButton) v.findViewById(R.id.ib_card_share);
			ib_card_fav = (ImageButton) v.findViewById(R.id.ib_card_fav);

			ll_card_nameinfo = (LinearLayout) v.findViewById(R.id.ll_card_nameinfo);
			ll_card_nameinfo.setOnClickListener(new OnClickListener() {
				@Override
				public void onClick(View v) {
					if(tv_card_info.getText().equals("More info ...")){
						tv_card_info.setText(currentItem.getPlaceInfo());
					}else{
						tv_card_info.setText("More info ...");
					}
				}
			});
			
			ib_card_link.setOnClickListener(new OnClickListener() {
				@Override
				public void onClick(View v) {
					Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(currentItem.getPlaceLink()));
					context.startActivity(browserIntent);
				}
			});
			
			ib_card_route.setOnClickListener(new OnClickListener() {
				@Override
				public void onClick(View v) {
					// Obtengo datos para pasarlos a la actividad
					
					// O no hay puntos registrados o la condicion de complete se cumplio
					Intent intent = new Intent(context, SampleCamActivity.class);
					intent.putExtra("destLat", currentItem.getPlaceLatitude());
					intent.putExtra("destLong", currentItem.getPlaceLongitude());
					intent.putExtra("categoryId", currentItem.getPlaceCategory());
					intent.putExtra("categoryName","Route to " + currentItem.getPlaceName());
					intent.putExtra("categoryType", "route");

					context.startActivity(intent);

					Activity activity = (Activity) context;
					activity.overridePendingTransition(R.anim.right_to_center,R.anim.center_to_left);
				}
			});

			ib_card_share.setOnClickListener(new OnClickListener() {
				@Override
				public void onClick(View v) {
					sharePlace(currentItem.getPlaceName());
				}
			});

			ib_card_fav.setOnClickListener(new OnClickListener() {
				@Override
				public void onClick(View v) {

					ParseQuery<ParseObject> query = ParseQuery.getQuery("FavPlaces");
					query.whereEqualTo("placeId", currentItem.getPlaceId());
					query.fromLocalDatastore();
					query.findInBackground(new FindCallback<ParseObject>() {
						public void done(List<ParseObject> placesList, ParseException e) {
							if (e == null) {
								// QUERY SUCCESS
								placesList.get(0).unpinInBackground();
								items.remove(getPosition());
								notifyItemRemoved(getPosition());
								
								if(items.size() == 0){
									noResults.setText(R.string.no_favorite_places);
									noResults.setVisibility(View.VISIBLE);
									rvList.setVisibility(View.GONE);
								}
							} else {
								// QUERY ERROR
							}
						}
					});
				}
			});

		}
	}

	private static void sharePlace(String placeName) {
		Intent share = new Intent(android.content.Intent.ACTION_SEND);
		share.setType("text/plain");
		share.putExtra(Intent.EXTRA_SUBJECT, "Explore Pensilvanya");
		share.putExtra(Intent.EXTRA_TEXT, placeName + " could be interesting for you. Explore the city thorugh SailAR.");
		context.startActivity(Intent.createChooser(share, "Share with friends!"));
	}
}
