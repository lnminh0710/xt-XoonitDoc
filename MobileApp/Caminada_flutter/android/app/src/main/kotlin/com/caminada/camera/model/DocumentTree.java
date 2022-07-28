package com.caminada.camera.model;

import com.google.gson.annotations.SerializedName;

public class DocumentTree {

    private int idDocumentTree;
    private int idDocumentTreeParent;
    private long idRepDocumentGUIType;
    private String groupName;
    private long sortingIndex;
    private String iconName;
    private long quantity;
    private boolean isActive;
    private boolean isReadOnly;

    @SerializedName("idDocumentTree")
    public int getIDDocumentTree() { return idDocumentTree; }
    @SerializedName("idDocumentTree")
    public void setIDDocumentTree(int value) { this.idDocumentTree = value; }

    @SerializedName("idDocumentTreeParent")
    public int getIDDocumentTreeParent() { return idDocumentTreeParent; }
    @SerializedName("idDocumentTreeParent")
    public void setIDDocumentTreeParent(int value) { this.idDocumentTreeParent = value; }

    @SerializedName("idRepDocumentGuiType")
    public long getIDRepDocumentGUIType() { return idRepDocumentGUIType; }
    @SerializedName("idRepDocumentGuiType")
    public void setIDRepDocumentGUIType(long value) { this.idRepDocumentGUIType = value; }

    @SerializedName("groupName")
    public String getGroupName() { return groupName; }
    @SerializedName("groupName")
    public void setGroupName(String value) { this.groupName = value; }

    @SerializedName("sortingIndex")
    public long getSortingIndex() { return sortingIndex; }
    @SerializedName("sortingIndex")
    public void setSortingIndex(long value) { this.sortingIndex = value; }

    @SerializedName("iconName")
    public String getIconName() { return iconName; }
    @SerializedName("iconName")
    public void setIconName(String value) { this.iconName = value; }

    @SerializedName("quantity")
    public long getQuantity() { return quantity; }
    @SerializedName("quantity")
    public void setQuantity(long value) { this.quantity = value; }

    @SerializedName("isActive")
    public boolean getIsActive() { return isActive; }
    @SerializedName("isActive")
    public void setIsActive(boolean value) { this.isActive = value; }

    @SerializedName("isReadOnly")
    public boolean getIsReadOnly() { return isReadOnly; }
    @SerializedName("isReadOnly")
    public void setIsReadOnly(boolean value) { this.isReadOnly = value; }
}
