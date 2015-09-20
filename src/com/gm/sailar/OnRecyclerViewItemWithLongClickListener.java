package com.gm.sailar;

import android.view.View;

public interface OnRecyclerViewItemWithLongClickListener<Model> {
    public void onItemClick(View view, Model model, boolean isLongClick);
}
