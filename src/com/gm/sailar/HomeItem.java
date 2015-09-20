package com.gm.sailar;

import android.content.Context;

public class HomeItem {

    String ItemName;
    String title;
    int imgResID;
    boolean isSpinner;

    public HomeItem(String itemName, int imgResID) {
          super();
          ItemName = itemName;
          this.imgResID = imgResID;
    }
    
    public HomeItem(String title) {
            this(null, 0);
            this.title = title;
    }

    public HomeItem(Context ct, int all, int imgResID) {
        super();
        ItemName = ct.getResources().getString(all);
        this.imgResID = imgResID;
   }

   public String getItemName() {
          return ItemName;
    }
    public void setItemName(String itemName) {
          ItemName = itemName;
    }
    public int getImgResID() {
          return imgResID;
    }
    public void setImgResID(int imgResID) {
          this.imgResID = imgResID;
    }

}
