package com.gm.sailar;

import java.util.List;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heyapp.hey.R;
import com.squareup.picasso.Picasso;
import com.wikitude.samples.SampleCamActivity;

public class CategoriesPlacesAdapter extends RecyclerView.Adapter<CategoriesPlacesAdapter.CategoryViewHolder> {

	private static final int ITEM_VIEW_TYPE_HEADER = 0;
	private static final int ITEM_VIEW_TYPE_ITEM = 1;

	private final View header;
	private List<CategoriesViewModel> items;
	private int itemLayout;
	private static Context context;

	@SuppressWarnings("static-access")
	public CategoriesPlacesAdapter(View header, List<CategoriesViewModel> categoryList,int itemLayout, Context ctx) {
		if (header == null) {
			throw new IllegalArgumentException("header may not be null");
		}
		this.header = header;
		this.items = categoryList;
		this.itemLayout = itemLayout;
		this.context = ctx;
	}

	public boolean isHeader(int position) {
		return position == 0;
	}

	@Override
	public CategoryViewHolder onCreateViewHolder(ViewGroup viewGroup, int i) {
		if (i == ITEM_VIEW_TYPE_HEADER) {
			return new CategoryViewHolder(header);
		}
		View itemView = LayoutInflater.from(viewGroup.getContext()).inflate(itemLayout, viewGroup, false);
		return new CategoryViewHolder(itemView);
	}

	@Override
	public int getItemCount() {
		return items.size() + 1;
	}

	@Override
	public int getItemViewType(int position) {
		return isHeader(position) ? ITEM_VIEW_TYPE_HEADER : ITEM_VIEW_TYPE_ITEM;
	}

	@Override
	public void onBindViewHolder(CategoryViewHolder CategoryViewHolder, int position) {
		if (isHeader(position)) {
			return;
		}
		CategoriesViewModel item = items.get(position - 1);

		CategoryViewHolder.currentItem = items.get(position - 1);

		Picasso.with(CategoryViewHolder.ivCategoryLogo.getContext())
		.load(item.getCategoryLogo())
		.resize(250, 250)
		.centerCrop()
		.placeholder(R.drawable.placeholder)
		.error(R.drawable.placeholder)
		.into(CategoryViewHolder.ivCategoryLogo);

		CategoryViewHolder.tvCategoryName.setText(item.getCategoryName());

	}



	public static class CategoryViewHolder extends RecyclerView.ViewHolder {

		protected ImageView ivCategoryLogo;
		protected TextView tvCategoryName;
		protected LinearLayout llCategory;

		// click listener
		public CategoriesViewModel currentItem;

		public CategoryViewHolder(View v) {
			super(v);
			ivCategoryLogo = (ImageView) v.findViewById(R.id.iv_category);
			tvCategoryName = (TextView) v.findViewById(R.id.tv_category);
			llCategory = (LinearLayout) v.findViewById(R.id.ll_category);

			llCategory.setOnClickListener(new OnClickListener() {

				@Override
				public void onClick(View v) {
					// Obtengo datos para pasarlos a la actividad
					String categoryId = ( currentItem == null ) ? "aroundme" : currentItem.getCategoryId();
					String categoryName = ( currentItem == null ) ? "Around Me" : currentItem.getCategoryName();
							
					// O no hay puntos registrados o la condicion de complete se cumplio
					Intent intent = new Intent(context, SampleCamActivity.class);
					intent.putExtra("categoryId", categoryId);
					intent.putExtra("categoryName", categoryName);
					intent.putExtra("categoryType", "places");

					context.startActivity(intent);

					Activity activity = (Activity) context;
					activity.overridePendingTransition(R.anim.right_to_center,R.anim.center_to_left);


				}
			});

		}
	}
}
