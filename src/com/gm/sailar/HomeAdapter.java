package com.gm.sailar;

import java.util.List;

import android.app.Activity;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.heyapp.hey.R;

//MainActivity drawer adapter
public class HomeAdapter extends ArrayAdapter<HomeItem> {

	Context context;
	List<HomeItem> drawerItemList;
	int layoutResID;

	public HomeAdapter(Context context, int layoutResourceID, List<HomeItem> listItems) {
		super(context, layoutResourceID, listItems);
		this.context = context;
		this.drawerItemList = listItems;
		this.layoutResID = layoutResourceID;
	}

	@Override
	public View getView(int position, View convertView, ViewGroup parent) {

		DrawerItemHolder drawerHolder;
		View view = convertView;

		if (view == null) {
			LayoutInflater inflater = ((Activity) context).getLayoutInflater();
			drawerHolder = new DrawerItemHolder();

			view = inflater.inflate(layoutResID, parent, false);

			drawerHolder.ItemName = (TextView) view.findViewById(R.id.drawer_itemName);
			drawerHolder.icon = (ImageView) view.findViewById(R.id.drawer_icon);
			drawerHolder.drawerItem = (LinearLayout) view.findViewById(R.id.drawer_item);

			view.setTag(drawerHolder);

		} else {

			drawerHolder = (DrawerItemHolder) view.getTag();

		}

		HomeItem dItem = this.drawerItemList.get(position);

		drawerHolder.icon.setImageDrawable(view.getResources().getDrawable(dItem.getImgResID()));
		drawerHolder.ItemName.setText(dItem.getItemName());
		drawerHolder.drawerItem.setBackgroundColor(0);

		return view;
	}

	private static class DrawerItemHolder {
		TextView ItemName;
		ImageView icon;
		LinearLayout drawerItem;
	}
}
