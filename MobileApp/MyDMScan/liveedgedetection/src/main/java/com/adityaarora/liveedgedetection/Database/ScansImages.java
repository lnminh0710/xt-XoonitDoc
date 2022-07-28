package com.adityaarora.liveedgedetection.Database;

public class ScansImages {

    //region Variables
    private int idScansImage;
    private String ImagePath;
    private String ImageName;
    private String CreateDate;
    private int LotItemId;
    private int PageNr;
    //endregion

    //region Constructors
    public ScansImages(int idScansImage, String imagePath, String imageName, String createDate, int lotItemId, int pageNr) {
        this.idScansImage = idScansImage;
        ImagePath = imagePath;
        ImageName = imageName;
        CreateDate = createDate;
        LotItemId = lotItemId;
        PageNr = pageNr;
    }
    public ScansImages(int idScansImage) {
        this.setIdScansImage(idScansImage);
    }
    public ScansImages(){}
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
    //endregion
}