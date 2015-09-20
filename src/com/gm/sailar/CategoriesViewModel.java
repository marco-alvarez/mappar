package com.gm.sailar;

public class CategoriesViewModel {

	protected String categoryId;
	protected String categoryName;	
	protected int categoryLogo;


	public CategoriesViewModel(String categoryId, String categoryName, int categoryLogo) {
		this.categoryId = categoryId;
		this.categoryName = categoryName;
		this.categoryLogo = categoryLogo;
	}

	public String getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(String categoryId) {
		this.categoryId = categoryId;
	}

	public String getCategoryName() {
		return categoryName;
	}

	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}

	public int getCategoryLogo() {
		return categoryLogo;
	}

	public void setCategoryLogo(int categoryLogo) {
		this.categoryLogo = categoryLogo;
	}


}
