package com.caminada.camera.model;

import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;

public class ListDocumentTreeResponse {

    private long statusCode;
    private String resultDescription;
    private ArrayList<DocumentTreeItem> item;

    @SerializedName("statusCode")
    public long getStatusCode() {
        return statusCode;
    }

    @SerializedName("statusCode")
    public void setStatusCode(long value) {
        this.statusCode = value;
    }

    @SerializedName("resultDescription")
    public String getResultDescription() {
        return resultDescription;
    }

    @SerializedName("resultDescription")
    public void setResultDescription(String value) {
        this.resultDescription = value;
    }

    @SerializedName("item")
    public ArrayList<DocumentTreeItem> getItem() {
        return item;
    }

    @SerializedName("item")
    public void setItem(ArrayList<DocumentTreeItem> value) {
        this.item = value;
    }
}

