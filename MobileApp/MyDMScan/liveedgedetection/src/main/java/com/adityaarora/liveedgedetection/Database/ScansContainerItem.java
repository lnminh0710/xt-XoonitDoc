package com.adityaarora.liveedgedetection.Database;

public class ScansContainerItem {

    //region Variables
    private int LotItemId;
    private int IdScansContainerItem;
    private int LotId;
    private int IdScansContainer;
    private int IdRepScansContainerType = 1;
    private String ScannerTwainDllVersion;
    private String ScannerDevice;
    private String CustomerNr = "1";
    private String MediaCode = "1";
    private String ScannedPath;
    private String ScannedFilename;
    private boolean Checked;
    private String ScannedDateUTC;
    private String CoordinateX;
    private String CoordinateY;
    private int CoordinatePageNr;
    private String IsWhiteMail;
    private String IsCheque;
    private int NumberOfImages = 1;
    private String SourceScanGUID;
    private String IsMediaCodeValid;
    private String IsCustomerNrValid;
    private String IsCustomerNrEnteredManually;
    private String IsMediaCodeEnteredManually;
    private boolean IsSynced = false;
    private String IsActive = "1";
    private int ElapsedTime;
    private boolean IsLocalDeleted = false;
    private String IsOnlyGamer = "0";
    private int IdRepScansDocumentType;
    private String Notes;
    private boolean IsUserClicked = false;
    //endregion

    //region Constructor
    public ScansContainerItem() {}

    public ScansContainerItem(int lotItemId, int lotId, String scannedFilename, String scannedPath, int idRepScansDocumentType, String scannedDateUTC, String notes) {
        this.setLotItemId(lotItemId);
        this.setLotId(lotId);
        this.setScannedPath(scannedPath);
        this.setScannedFilename(scannedFilename);
        this.setIdRepScansDocumentType(idRepScansDocumentType);
        this.setScannedDateUTC(scannedDateUTC);
        this.setNotes(notes);
        this.setNumberOfImages(1);
    }
    //endregion

    //region Properties
    public String getScannedDateUTC() {
        return ScannedDateUTC;
    }

    public void setScannedDateUTC(String scannedDateUTC) {
        ScannedDateUTC = scannedDateUTC;
    }

    public void setNumberOfImages(int numberOfImages) {
        NumberOfImages = numberOfImages;
    }

    public String getSourceScanGUID() {
        return SourceScanGUID;
    }

    public void setSourceScanGUID(String sourceScanGUID) {
        SourceScanGUID = sourceScanGUID;
    }

    public String getNotes() {
        return Notes;
    }

    public void setNotes(String notes) {
        Notes = notes;
    }

    public boolean isSynced() {
        return IsSynced;
    }

    public void setSynced(boolean synced) {
        IsSynced = synced;
    }

    public void setLotItemId(int lotItemId) {
        LotItemId = lotItemId;
    }

    public int getLotItemId() {
        return LotItemId;
    }

    public String getCustomerNr() {
        return CustomerNr;
    }

    public String getMediaCode() {
        return MediaCode;
    }

    public int getNumberOfImages() {
        return NumberOfImages;
    }

    public String getIsActive() {
        return IsActive;
    }

    public String getIsOnlyGamer() {
        return IsOnlyGamer;
    }

    public int getLotId() {
        return LotId;
    }

    public void setLotId(int lotId) {
        LotId = lotId;
    }

    public int getIdScansContainer() {
        return IdScansContainer;
    }

    public void setIdScansContainer(int idScansContainer) {
        IdScansContainer = idScansContainer;
    }

    public String getScannedPath() {
        return ScannedPath;
    }

    public void setScannedPath(String scannedPath) {
        ScannedPath = scannedPath;
    }

    public String getScannedFilename() {
        return ScannedFilename;
    }

    public void setScannedFilename(String scannedFilename) {
        ScannedFilename = scannedFilename;
    }

    public int getIdRepScansDocumentType() {
        return IdRepScansDocumentType;
    }

    public void setIdRepScansDocumentType(int idRepScanDocumentType) {
        IdRepScansDocumentType = idRepScanDocumentType;
    }

    public boolean isChecked() {
        return Checked;
    }

    public void setChecked(boolean checked) {
        this.Checked = checked;
    }

    public boolean isUserClicked() {
        return IsUserClicked;
    }

    public void setUserClicked(boolean userClicked) {
        IsUserClicked = userClicked;
    }
    //endregion
}
