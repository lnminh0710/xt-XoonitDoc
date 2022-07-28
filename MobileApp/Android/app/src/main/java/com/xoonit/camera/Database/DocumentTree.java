package com.xoonit.camera.Database;

import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;

public class DocumentTree {

    private int idDocumentTree;
    private int idDocumentTreeParent;
    private long idRepDocumentGUIType;
    private String groupName;
    private long sortingIndex;
    private String iconName;
    private int quantity;
    private int quantityParent;
    private boolean isActive;
    private boolean isReadOnly;
    private ArrayList<DocumentTree> children;

    @SerializedName("idDocumentTree")
    public int getIDDocumentTree() {
        return idDocumentTree;
    }

    @SerializedName("idDocumentTree")
    public void setIDDocumentTree(int value) {
        this.idDocumentTree = value;
    }

    @SerializedName("idDocumentTreeParent")
    public int getIDDocumentTreeParent() {
        return idDocumentTreeParent;
    }

    @SerializedName("idDocumentTreeParent")
    public void setIDDocumentTreeParent(int value) {
        this.idDocumentTreeParent = value;
    }

    @SerializedName("idRepDocumentGuiType")
    public long getIDRepDocumentGUIType() {
        return idRepDocumentGUIType;
    }

    @SerializedName("idRepDocumentGuiType")
    public void setIDRepDocumentGUIType(long value) {
        this.idRepDocumentGUIType = value;
    }

    @SerializedName("groupName")
    public String getGroupName() {
        return groupName;
    }

    @SerializedName("groupName")
    public void setGroupName(String value) {
        this.groupName = value;
    }

    @SerializedName("sortingIndex")
    public long getSortingIndex() {
        return sortingIndex;
    }

    @SerializedName("sortingIndex")
    public void setSortingIndex(long value) {
        this.sortingIndex = value;
    }

    @SerializedName("iconName")
    public String getIconName() {
        return iconName;
    }

    @SerializedName("iconName")
    public void setIconName(String value) {
        this.iconName = value;
    }

    @SerializedName("quantity")
    public int getQuantity() {
        return quantity;
    }

    @SerializedName("quantity")
    public void setQuantity(int value) {
        this.quantity = value;
    }

    @SerializedName("isActive")
    public boolean getIsActive() {
        return isActive;
    }

    @SerializedName("isActive")
    public void setIsActive(boolean value) {
        this.isActive = value;
    }

    @SerializedName("isReadOnly")
    public boolean getIsReadOnly() {
        return isReadOnly;
    }

    @SerializedName("isReadOnly")
    public void setIsReadOnly(boolean value) {
        this.isReadOnly = value;
    }

    @SerializedName("children")
    public ArrayList<DocumentTree> getChildren() {
        return children;
    }

    @SerializedName("children")
    public void setChildren(ArrayList<DocumentTree> children) {
        this.children = children;
    }

    @SerializedName("quantityParent")
    public int getQuantityParent() {
        return quantityParent;
    }

    @SerializedName("quantityParent")
    public void setQuantityParent(int quantityParent) {
        this.quantityParent = quantityParent;
    }
}
