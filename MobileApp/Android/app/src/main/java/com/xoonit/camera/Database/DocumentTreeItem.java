package com.xoonit.camera.Database;

import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;

public class DocumentTreeItem {
    private ArrayList<DocumentTreeItem> children;
    private DocumentTree data;
    private DocumentTree root;
    private boolean isRoot;

    @SerializedName("children")
    public ArrayList<DocumentTreeItem> getChildren() { return children; }
    @SerializedName("children")
    public void setChildren(ArrayList<DocumentTreeItem> value) { this.children = value; }

    @SerializedName("data")
    public DocumentTree getData() { return data; }
    @SerializedName("data")
    public void setData(DocumentTree value) { this.data = value; }

    @SerializedName("root")
    public DocumentTree getRoot() { return root; }
    @SerializedName("root")
    public void setRoot(DocumentTree value) { this.root = value; }

    public boolean isRoot() {
        return isRoot;
    }

    public void setRoot(boolean root) {
        isRoot = root;
    }
}
