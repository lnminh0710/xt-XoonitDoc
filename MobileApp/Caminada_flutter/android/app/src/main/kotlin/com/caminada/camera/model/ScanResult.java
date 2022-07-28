package com.caminada.camera.model;

import com.google.gson.annotations.SerializedName;

public class ScanResult {
    private int idDocumentTree;
    private String imgPath;

    @SerializedName("idDocumentTree")
    public int getIDDocumentTree() {
        return idDocumentTree;
    }

    @SerializedName("idDocumentTree")
    public void setIDDocumentTree(int value) {
        this.idDocumentTree = value;
    }

    @SerializedName("imgPath")
    public String getImgPath() {
        return imgPath;
    }

    @SerializedName("imgPath")
    public void setImgPath(String imgPath) {
        this.imgPath = imgPath;
    }
}
