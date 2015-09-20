package com.gm.sailar;

public class NotificationsViewModel {

	protected String notiTitle;
	protected String notiDate;
	protected String notiMessage;
	protected String notiImage;
	

	public NotificationsViewModel(String notiTitle, String notiDate, String notiMessage, String notiImage) {
		this.notiTitle = notiTitle;
		this.notiDate = notiDate;
		this.notiMessage = notiMessage;
		this.notiImage = notiImage;
	}

	public String getNotiTitle() {
		return notiTitle;
	}

	public void setNotiTitle(String notiTitle) {
		this.notiTitle = notiTitle;
	}

	public String getNotiDate() {
		return notiDate;
	}

	public void setNotiDate(String notiDate) {
		this.notiDate = notiDate;
	}

	public String getNotiMessage() {
		return notiMessage;
	}

	public void setNotiMessage(String notiMessage) {
		this.notiMessage = notiMessage;
	}

	public String getNotiImage() {
		return notiImage;
	}

	public void setNotiImage(String notiImage) {
		this.notiImage = notiImage;
	}
}
