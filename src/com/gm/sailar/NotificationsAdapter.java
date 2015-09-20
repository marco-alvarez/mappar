package com.gm.sailar;

import java.util.List;

import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import com.heyapp.hey.R;
import com.squareup.picasso.Picasso;

public class NotificationsAdapter extends RecyclerView.Adapter<NotificationsAdapter.PlaceViewHolder> 
implements View.OnClickListener{

	private List<NotificationsViewModel> items;
	private OnRecyclerViewItemClickListener<NotificationsViewModel> itemClickListener;
	private int itemLayout;

	public NotificationsAdapter(List<NotificationsViewModel> notiList,int itemLayout) {
		this.items = notiList;
		this.itemLayout = itemLayout;
	}

	@Override
	public PlaceViewHolder onCreateViewHolder(ViewGroup viewGroup, int i) {
		View itemView = LayoutInflater.from(viewGroup.getContext()).inflate(itemLayout, viewGroup, false);
		viewGroup.setOnClickListener(this);
		return new PlaceViewHolder(itemView);
	}

	@Override public void onClick(View view) {
		if (itemClickListener != null) {
			NotificationsViewModel model = (NotificationsViewModel) view.getTag();
			itemClickListener.onItemClick(view, model);
		}
	}

	public void setOnItemClickListener(OnRecyclerViewItemClickListener<NotificationsViewModel> listener) {
		this.itemClickListener = listener;
	}

	@Override
	public int getItemCount() {
		return items.size();
	}

	public void add(NotificationsViewModel item, int position) {
		items.add(position, item);
		notifyItemInserted(position);
	}

	public void remove(NotificationsViewModel item) {
		int position = items.indexOf(item);
		items.remove(position);
		notifyItemRemoved(position);
	}

	@Override
	public void onBindViewHolder(PlaceViewHolder PlaceViewHolder, int position) {
		NotificationsViewModel item = items.get(position);

		PlaceViewHolder.currentItem = items.get(position);

		Picasso.with(PlaceViewHolder.iv_noti.getContext())
		.load(item.getNotiImage())
		.resize(200,200)
		.centerCrop()
		.placeholder(R.drawable.placeholder)
		.error(R.drawable.placeholder)
		.into(PlaceViewHolder.iv_noti);

		PlaceViewHolder.tv_title.setText(item.getNotiTitle());
		PlaceViewHolder.tv_date.setText(item.getNotiDate());
		PlaceViewHolder.tv_message.setText(item.getNotiMessage());
	}


	public class PlaceViewHolder extends RecyclerView.ViewHolder {

		protected ImageView iv_noti;
		protected TextView tv_title;
		protected TextView tv_date;
		protected TextView tv_message;

		// click listener
		public NotificationsViewModel currentItem;

		public PlaceViewHolder(View v) {
			super(v);
			iv_noti = (ImageView) v.findViewById(R.id.iv_noti);
			tv_title = (TextView) v.findViewById(R.id.tv_title);
			tv_date = (TextView) v.findViewById(R.id.tv_date);
			tv_message = (TextView) v.findViewById(R.id.tv_message);


		}
	}

}
