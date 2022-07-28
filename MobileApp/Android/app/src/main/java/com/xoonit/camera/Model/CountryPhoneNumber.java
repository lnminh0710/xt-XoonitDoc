package com.xoonit.camera.Model;

public class CountryPhoneNumber {

    private int imgCountry ;
    private String firstNumber;

    public CountryPhoneNumber(int imgCountry){
        this.imgCountry=imgCountry;
    }
    public CountryPhoneNumber(int imgCountry, String firstNumber) {
        this.imgCountry = imgCountry;
        this.firstNumber = firstNumber;
    }

    public int getImgCountry() {
        return imgCountry;
    }

    public void setImgCountry(int imgCountry) {

        this.imgCountry = imgCountry;
    }

    public String getFirstNumber() {
        return firstNumber;
    }

    public void setFirstNumber(String firstNumber) {
        this.firstNumber = firstNumber;
    }

}
