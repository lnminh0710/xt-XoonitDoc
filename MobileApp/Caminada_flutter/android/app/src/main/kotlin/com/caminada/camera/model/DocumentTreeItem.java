package com.caminada.camera.model;

import com.google.gson.annotations.SerializedName;

public class DocumentTreeItem {
    private Object children;
    private DocumentTree data;
    private Object root;

    @SerializedName("children")
    public Object getChildren() { return children; }
    @SerializedName("children")
    public void setChildren(Object value) { this.children = value; }

    @SerializedName("data")
    public DocumentTree getData() { return data; }
    @SerializedName("data")
    public void setData(DocumentTree value) { this.data = value; }

    @SerializedName("root")
    public Object getRoot() { return root; }
    @SerializedName("root")
    public void setRoot(Object value) { this.root = value; }
}
