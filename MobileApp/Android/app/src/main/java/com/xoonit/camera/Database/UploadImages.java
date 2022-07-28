package com.xoonit.camera.Database;

import com.google.gson.annotations.SerializedName;

import java.util.List;

public class UploadImages {
    @SerializedName("Images")
    private List<Images> Images;
    @SerializedName("ScanningLotItemData")
    private ScansContainerItem ScanningLotItemData;


    public List<Images> getImages() {
        return Images;
    }

    public void setImages(List<Images> images) {
        Images = images;
    }

    public ScansContainerItem getScanningLotItemData() {
        return ScanningLotItemData;
    }

    public void setScanningLotItemData(ScansContainerItem scanningLotItemData) {
        ScanningLotItemData = scanningLotItemData;
    }

}
