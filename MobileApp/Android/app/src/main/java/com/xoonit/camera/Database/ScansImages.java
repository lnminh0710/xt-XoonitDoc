package com.xoonit.camera.Database;

import org.parceler.Parcel;

public class ScansImages {

    //local Variables
    private int idScansImage;
    private String ImagePath;
    private String ImageName;
    private String CreateDate;
    private int LotItemId;
    private int PageNr;
    private boolean mCheckBoxState;
    private int IdDocumentTree;
    private String Notes;
    private int IdRepScansDocumentType;
    private String imgURL;


    public boolean getCheckboxState() {
        return mCheckBoxState;
    }

    public void setCheckboxState(boolean state) {
        this.mCheckBoxState = state;
    }

    public int getGroupNr() {
        return GroupNr;
    }

    public void setGroupNr(int groupNr) {
        GroupNr = groupNr;
    }

    private int GroupNr;
    //endregion

    //region Constructors
    public ScansImages(int idScansImage, String imagePath, String imageName, String createDate, int lotItemId, int pageNr, int groupNr, int idRepScansDocumentType) {
        this.idScansImage = idScansImage;
        ImagePath = imagePath;
        ImageName = imageName;
        CreateDate = createDate;
        LotItemId = lotItemId;
        PageNr = pageNr;
        GroupNr = groupNr;
        IdRepScansDocumentType = idRepScansDocumentType;
    }

    public ScansImages(int idScansImage) {
        this.setIdScansImage(idScansImage);
    }

    public ScansImages() {
    }
    //endregion

    //region Properties

    public int getIdScansImage() {
        return idScansImage;
    }

    public void setIdScansImage(int idScansImage) {
        this.idScansImage = idScansImage;
    }

    public String getImagePath() {
        return ImagePath;
    }

    public void setImagePath(String imagePath) {
        ImagePath = imagePath;
    }

    public String getImageName() {
        return ImageName;
    }

    public void setImageName(String imageName) {
        ImageName = imageName;
    }

    public String getCreateDate() {
        return CreateDate;
    }

    public void setCreateDate(String createDate) {
        CreateDate = createDate;
    }

    public int getPageNr() {
        return PageNr;
    }

    public void setPageNr(int pageNr) {
        PageNr = pageNr;
    }

    public int getLotItemId() {
        return LotItemId;
    }

    public void setLotItemId(int lotItemId) {
        LotItemId = lotItemId;
    }

    public int getIdDocumentTree() {
        return IdDocumentTree;
    }

    public void setIdDocumentTree(int idRepScansDocumentType) {
        IdDocumentTree = idRepScansDocumentType;
    }

    public String getNotes() {
        return Notes;
    }

    public void setNotes(String notes) {
        Notes = notes;
    }
    public int getIdRepScansDocumentType() {
        return IdRepScansDocumentType;
    }

    public void setIdRepScansDocumentType(int idRepScansDocumentType) {
        IdRepScansDocumentType = idRepScansDocumentType;
    }

    public String getImgURL() {
        return imgURL;
    }

    public void setImgURL(String imgURL) {
        this.imgURL = imgURL;
    }

    //endregion
}