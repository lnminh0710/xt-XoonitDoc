package com.xoonit.camera.Database;

public class ScansContainerItem {

    //region Variables
    private String LotItemId;
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

    private int IdRepScansDocumentType;


    private int IdRepScanDeviceType = 2;
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
    private String ElapsedTime;
    private String IsLocalDeleted;
    private String IsOnlyGamer = "0";
    private String IdDocumentTree;
    private String Notes;
    private boolean IsUserClicked = false;
    //endregion

    //region Constructor
    public ScansContainerItem() {
    }

    public ScansContainerItem(String scannedFilename, String scannedPath, String scannedDateUTC, String notes, int idRepScansDocumentType) {
        this.setScannedPath(scannedPath);
        this.setScannedFilename(scannedFilename);
        this.setIdRepScansDocumentType(idRepScansDocumentType);
        this.setScannedDateUTC(scannedDateUTC);
        this.setNotes(notes);
        this.setNumberOfImages(1);

    }
    //endregion

    //region Properties


    public String getLotItemId() {
        return LotItemId;
    }

    public void setLotItemId(String lotItemId) {
        LotItemId = lotItemId;
    }

    public int getIdScansContainerItem() {
        return IdScansContainerItem;
    }

    public void setIdScansContainerItem(int idScansContainerItem) {
        IdScansContainerItem = idScansContainerItem;
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

    public int getIdRepScansContainerType() {
        return IdRepScansContainerType;
    }

    public void setIdRepScansContainerType(int idRepScansContainerType) {
        IdRepScansContainerType = idRepScansContainerType;
    }

    public String getScannerTwainDllVersion() {
        return ScannerTwainDllVersion;
    }

    public void setScannerTwainDllVersion(String scannerTwainDllVersion) {
        ScannerTwainDllVersion = scannerTwainDllVersion;
    }

    public String getScannerDevice() {
        return ScannerDevice;
    }

    public void setScannerDevice(String scannerDevice) {
        ScannerDevice = scannerDevice;
    }

    public String getCustomerNr() {
        return CustomerNr;
    }

    public void setCustomerNr(String customerNr) {
        CustomerNr = customerNr;
    }

    public String getMediaCode() {
        return MediaCode;
    }

    public void setMediaCode(String mediaCode) {
        MediaCode = mediaCode;
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

    public int getIdRepScanDeviceType() {
        return IdRepScanDeviceType;
    }

    public void setIdRepScanDeviceType(int idRepScanDeviceType) {
        IdRepScanDeviceType = idRepScanDeviceType;
    }

    public String getScannedDateUTC() {
        return ScannedDateUTC;
    }

    public void setScannedDateUTC(String scannedDateUTC) {
        ScannedDateUTC = scannedDateUTC;
    }

    public String getCoordinateX() {
        return CoordinateX;
    }

    public void setCoordinateX(String coordinateX) {
        CoordinateX = coordinateX;
    }

    public String getCoordinateY() {
        return CoordinateY;
    }

    public void setCoordinateY(String coordinateY) {
        CoordinateY = coordinateY;
    }

    public int getCoordinatePageNr() {
        return CoordinatePageNr;
    }

    public void setCoordinatePageNr(int coordinatePageNr) {
        CoordinatePageNr = coordinatePageNr;
    }

    public String getIsWhiteMail() {
        return IsWhiteMail;
    }

    public void setIsWhiteMail(String isWhiteMail) {
        IsWhiteMail = isWhiteMail;
    }

    public String getIsCheque() {
        return IsCheque;
    }

    public void setIsCheque(String isCheque) {
        IsCheque = isCheque;
    }

    public int getNumberOfImages() {
        return NumberOfImages;
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

    public String getIsMediaCodeValid() {
        return IsMediaCodeValid;
    }

    public void setIsMediaCodeValid(String isMediaCodeValid) {
        IsMediaCodeValid = isMediaCodeValid;
    }

    public String getIsCustomerNrValid() {
        return IsCustomerNrValid;
    }

    public void setIsCustomerNrValid(String isCustomerNrValid) {
        IsCustomerNrValid = isCustomerNrValid;
    }

    public String getIsCustomerNrEnteredManually() {
        return IsCustomerNrEnteredManually;
    }

    public void setIsCustomerNrEnteredManually(String isCustomerNrEnteredManually) {
        IsCustomerNrEnteredManually = isCustomerNrEnteredManually;
    }

    public String getIsMediaCodeEnteredManually() {
        return IsMediaCodeEnteredManually;
    }

    public void setIsMediaCodeEnteredManually(String isMediaCodeEnteredManually) {
        IsMediaCodeEnteredManually = isMediaCodeEnteredManually;
    }

    public boolean isSynced() {
        return IsSynced;
    }

    public void setSynced(boolean synced) {
        IsSynced = synced;
    }

    public String getIsActive() {
        return IsActive;
    }

    public void setIsActive(String isActive) {
        IsActive = isActive;
    }

    public String getElapsedTime() {
        return ElapsedTime;
    }

    public void setElapsedTime(String elapsedTime) {
        ElapsedTime = elapsedTime;
    }

    public String isLocalDeleted() {
        return IsLocalDeleted;
    }

    public void setLocalDeleted(String localDeleted) {
        IsLocalDeleted = localDeleted;
    }

    public String getIsOnlyGamer() {
        return IsOnlyGamer;
    }

    public void setIsOnlyGamer(String isOnlyGamer) {
        IsOnlyGamer = isOnlyGamer;
    }

    public String getIdDocumentTree() {
        return IdDocumentTree;
    }

    public void setIdDocumentTree(String IdDocumentTree) {
        this.IdDocumentTree = IdDocumentTree;
    }

    public String getNotes() {
        return Notes;
    }

    public void setNotes(String notes) {
        Notes = notes;
    }

    public boolean isUserClicked() {
        return IsUserClicked;
    }

    public void setUserClicked(boolean userClicked) {
        IsUserClicked = userClicked;
    }

    public int getIdRepScansDocumentType() {
        return IdRepScansDocumentType;
    }

    public void setIdRepScansDocumentType(int idRepScansDocumentType) {
        IdRepScansDocumentType = idRepScansDocumentType;
    }
}
