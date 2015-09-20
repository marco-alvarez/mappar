package com.gm.sailar;

public class FavoritePlacesViewModel {

	protected String placeId;
	protected String placeName;
	protected String placeInfo;
	protected String placeLink;
	protected String placeImage;
	protected String placeCategory;
	protected String placeLatitude;
	protected String placeLongitude;


	public FavoritePlacesViewModel(String placeId, String placeName, String placeInfo, String placeLink, String placeImage, String placeCategory, String placeLatitude, String placeLongitude) {
		this.placeId = placeId;
		this.placeName = placeName;
		this.placeInfo = placeInfo;
		this.placeLink = placeLink;
		this.placeImage = placeImage;
		this.placeCategory = placeCategory;
		this.placeLatitude = placeLatitude;
		this.placeLongitude = placeLongitude;
	}

	public String getPlaceId() {
		return placeId;
	}

	public void setPlaceId(String placeId) {
		this.placeId = placeId;
	}

	public String getPlaceName() {
		return placeName;
	}

	public void setPlaceName(String placeName) {
		this.placeName = placeName;
	}

	public String getPlaceInfo() {
		return placeInfo;
	}

	public void setPlaceInfo(String placeInfo) {
		this.placeInfo = placeInfo;
	}

	public String getPlaceLink() {
		return placeLink;
	}

	public void setPlaceLink(String placeLink) {
		this.placeLink = placeLink;
	}

	public String getPlaceImage() {
		return placeImage;
	}

	public void setPlaceImage(String placeImage) {
		this.placeImage = placeImage;
	}

	public String getPlaceCategory() {
		return placeCategory;
	}

	public void setPlaceCategory(String placeCategory) {
		this.placeCategory = placeCategory;
	}
	
	public String getPlaceLatitude() {
		return placeLatitude;
	}

	public void setPlaceLatitude(String placeLatitude) {
		this.placeLatitude = placeLatitude;
	}
	
	public String getPlaceLongitude() {
		return placeLongitude;
	}

	public void setPlaceLongitude(String placeLongitude) {
		this.placeLongitude = placeLongitude;
	}

}
