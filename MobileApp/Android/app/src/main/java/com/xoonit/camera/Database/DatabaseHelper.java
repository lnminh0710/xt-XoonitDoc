package com.xoonit.camera.Database;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

public class DatabaseHelper extends SQLiteOpenHelper {
    private static final int DATABASE_VERSION = 135;

    //region Constant String
    private static final String DATABASE_NAME = "ScansContainerItem.db";
    private static final String TBL_SCANS_CONTAINER = "ScansContainer";
    private static final String TBL_SCANS_CONTAINER_ITEM = "ScansContainerItem";
    private static final String TBL_SCANS_IMAGES = "ScansImages";
    private static final String TBL_USER = "User";
    private static final String TBL_SETTING = "Setting";
    private static final String COL_LotId = "LotId";
    private static final String COL_LotItemId = "LotItemId";
    private static final String COL_LotName = "LotName";
    private static final String COL_GroupNr = "GroupNr";
    private static final String COL_IdPerson = "idPerson";
    private static final String COL_ClientOpenDateUTC = "ClientOpenDateUTC";
    private static final String COL_ClientCloseDateUTC = "ClientCloseDateUTC";
    private static final String COL_AbortDateUTC = "AbortDateUTC";
    private static final String COL_IdScanContainer = "IdScanContainer";
    private static final String COL_IdScansContainerItem = "LotItemId";
    private static final String COL_ScannedPath = "ScannedPath";
    private static final String COL_ScannedFilename = "ScannedFilename";
    private static final String COL_CoordinatePageNr = "CoordinatePageNr";
    private static final String COL_IsSynced = "IsSynced";
    private static final String COL_IsActive = "IsActive";
    private static final String COL_CustomerNr = "CustomerNr";
    private static final String COL_MediaCode = "MediaCode";
    private static final String COL_IsOnlyGamer = "IsOnlyGamer";
    private static final String COL_IdRepScansContainerType = "IdRepScansContainerType";
    private static final String COL_ScannerTwainDllVersion = "ScannerTwainDllVersion";
    private static final String COL_IdRepScanDeviceType = "IdRepScanDeviceType";
    private static final String COL_ScannerDevice = "ScannerDevice";
    private static final String COL_ScannedDateUTC = "ScannedDateUTC";
    private static final String COL_CoordinateX = "CoordinateX";
    private static final String COL_CoordinateY = "CoordinateY";
    private static final String COL_IsWhiteMail = "IsWhiteMail";
    private static final String COL_IsCheque = "IsCheque";
    private static final String COl_NumberOfImages = "NumberOfImages";
    private static final String COL_SourceScanGUID = "SourceScanGUID";
    private static final String COL_IsMediaCodeValid = "IsMediaCodeValid";
    private static final String COL_IsCustomerNrValid = "IsCustomerNrValid";
    private static final String COL_IsCustomerNrEnteredManually = "IsCustomerNrEnteredManually";
    private static final String COL_IsMediaCodeEnteredManually = "IsMediaCodeEnteredManually";
    private static final String COL_ElapsedTime = "ElapsedTime";
    private static final String COL_IsLocalDeleted = "IsLocalDeleted";
    private static final String COL_IdRepScansDocumentType = "IdRepScansDocumentType";
    private static final String COL_ServerId = "ServerId";
    private static final String COL_IdScansImage = "IdScansImage";
    private static final String COL_ImageName = "ImageName";
    private static final String COL_ImagePath = "ImagePath";
    private static final String COL_CreatedDate = "CreatedDate";
    private static final String COL_PageNr = "PageNr";
    private static final String COL_ScannedNote = "Notes";
    private static final String COL_IdLogin = "IdLogin";
    private static final String COL_LoginName = "LoginName";
    private static final String COL_PassWord = "PassWord";
    private static final String COL_Email = "Email";
    private static final String COL_Company = "Company";

    private static final String COL_UserCode = "UserCode";
    private static final String COL_IsUserClicked = "IsUserClicked";

    private static final String COL_IdSetting = "IdSetting";
    private static final String COL_SettingName = "SettingName";
    private static final String COL_SettingValues = "SettingValue";
    private static final String TBL_DOCTYPE = "DocumentTree";
    //endregion

    //region Database
    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
        // mReadableDB = getReadableDatabase();
        SQLiteDatabase sqLiteDatabase = this.getWritableDatabase();
    }


    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("create table " + TBL_SCANS_CONTAINER + "( LotId INTEGER PRIMARY KEY AUTOINCREMENT , IdScanContainer INTEGER,LotName STRING,IdPerson STRING,ClientOpenDateUTC STRING,ClientCloseDateUTC STRING,AbortDateUTC STRING,IsSynced BOOLEAN,IsActive STRING, IsUserClicked BOOLEAN, ServerId INTEGER,IsLocalDeleted BOOLEAN,IsOnlyGamer STRING )");
        db.execSQL("create table " + TBL_SCANS_CONTAINER_ITEM + "( LotItemId INTEGER PRIMARY KEY AUTOINCREMENT , IdScansContainerItem INTEGER,LotId INTEGER, IdScanContainer INTEGER,IdRepScansContainerType INTEGER, ScannerTwainDllVersion STRING,ScannerDevice STRING, CustomerNr STRING,MediaCode STRING,ScannedPath STRING,ScannedFilename STRING,ScannedDateUTC STRING, CoordinateX STRING,CoordinateY STRING,CoordinatePageNr INTEGER, IsWhiteMail STRING,IsCheque STRING,NumberOfImages  INTEGER,SourceScanGUID STRING,IsMediaCodeValid STRING,IsCustomerNrValid STRING,IsCustomerNrEnteredManually STRING,IsMediaCodeEnteredManually STRING,IsSynced BOOLEAN,IsActive STRING, IsUserClicked BOOLEAN, ElapsedTime INTEGER, IsLocalDeleted BOOLEAN,IsOnlyGamer STRING,IdRepScansDocumentType INTEGER,Notes STRING,IdRepScanDeviceType STRING)");
        db.execSQL("create table " + TBL_SCANS_IMAGES + "(IdScansImage INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,ImagePath STRING NOT NULL,ImageName STRING NOT NULL,CreatedDate STRING,LotItemId INTEGER,PageNr INTEGER,GroupNr INTERGER,IdRepScansDocumentType INTEGER,Notes STRING)");
        db.execSQL("create table " + TBL_USER + "(IdLogin INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, LoginName STRING, PassWord STRING, Company STRING, UserCode STRING, Email STRING, PathSetting STRING, C)");
        db.execSQL("create table " + TBL_SETTING + "(IdSetting INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, SettingName STRING, SettingValue BOOLEAN)");
        db.execSQL("create table " + TBL_DOCTYPE + "(ID INTEGER PRIMARY KEY AUTOINCREMENT not null , IdDocumentTree INTEGER not null,GroupName String, DocumentCode String)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        if (newVersion > oldVersion) {
            String queryDropTableScansContainer = "DROP TABLE IF EXISTS " + TBL_SCANS_CONTAINER;
            String queryDropTableScansContainerItem = "DROP TABLE IF EXISTS " + TBL_SCANS_CONTAINER_ITEM;
            String queryDropTableScansImages = " DROP TABLE IF EXISTS " + TBL_SCANS_IMAGES;
            String queryDropTableUser = "DROP TABLE IF EXISTS " + TBL_USER;
            String queryDropTableSetting = " DROP TABLE IF EXISTS " + TBL_SETTING;
            String queryDropTableDoctype = " DROP TABLE IF EXISTS " + TBL_DOCTYPE;
            db.execSQL(queryDropTableScansImages);
            db.execSQL(queryDropTableScansContainer);
            db.execSQL(queryDropTableScansContainerItem);
            db.execSQL(queryDropTableUser);
            db.execSQL(queryDropTableSetting);
            db.execSQL(queryDropTableDoctype);
            onCreate(db);
        }
    }
    //endregion

    //region ScanContainer
    public int insertScansContainer(com.xoonit.camera.Database.ScansContainer scansContainer) {
        SQLiteDatabase database = this.getWritableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(COL_LotId, scansContainer.getLotId());
        contentValues.put(COL_IdScanContainer, scansContainer.getIdScansContainer());
        contentValues.put(COL_LotName, scansContainer.getLotName());
        contentValues.put(COL_IdPerson, 192293);
        contentValues.put(COL_ClientOpenDateUTC, scansContainer.getClientOpenDateUTC());
        contentValues.put(COL_ClientCloseDateUTC, scansContainer.getClientCloseDateUTC());
        contentValues.put(COL_AbortDateUTC, scansContainer.getAbortDateUTC());
        contentValues.put(COL_IsSynced, false);
        contentValues.put(COL_IsActive, "1");
        contentValues.put(COL_ServerId, 4);
        contentValues.put(COL_IsLocalDeleted, false);
        contentValues.put(COL_IsUserClicked, false);
        return (int) database.insert(TBL_SCANS_CONTAINER, null, contentValues);
    }

    public com.xoonit.camera.Database.ScansContainer getScansContainer() {
        SQLiteDatabase database = this.getReadableDatabase();
        Cursor cursor = database.query(TBL_SCANS_CONTAINER, null, null, null, null, null, null);
        if (cursor != null) {
            cursor.moveToFirst();
            com.xoonit.camera.Database.ScansContainer scansContainer = new com.xoonit.camera.Database.ScansContainer(cursor.getInt(0), cursor.getInt(1), cursor.getString(2),
                    cursor.getInt(3), cursor.getString(4), cursor.getString(5),
                    cursor.getString(6), cursor.getInt(7) == 1, cursor.getString(8),
                    cursor.getInt(9), cursor.getInt(10) == 1, cursor.getString(11));
            return scansContainer;
        }
        return getScansContainer();
    }

    public com.xoonit.camera.Database.ScansContainer getScansContainerById(int idScansContainer) throws SQLException {
        com.xoonit.camera.Database.ScansContainer scansContainer = new com.xoonit.camera.Database.ScansContainer();
        String selectQuery = " SELECT LotId, LotName , IdPerson, ClientOpenDateUTC, IsActive, ServerId, IsOnlyGamer FROM " + TBL_SCANS_CONTAINER + " Where IsSynced = 0 and LotId = " + idScansContainer;
        SQLiteDatabase database = this.getWritableDatabase();
        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            scansContainer = new com.xoonit.camera.Database.ScansContainer();
            scansContainer.setLotId(cursor.getInt(0));
            scansContainer.setLotName(cursor.getString(1));
            String IdPerson = cursor.getString(2);
            scansContainer.setIdPerson(Integer.parseInt(IdPerson));
            scansContainer.setClientOpenDateUTC(cursor.getString(3));
            scansContainer.setIsActive(cursor.getString(4));
            scansContainer.setServerId(cursor.getInt(5));
            scansContainer.setIsOnlyGamer(cursor.getString(6));
        }
        return scansContainer;

    }

    public List<com.xoonit.camera.Database.ScansContainer> getTopScansContainer(int top) throws SQLException {
        List<com.xoonit.camera.Database.ScansContainer> scansContainerList = new ArrayList<>();
        String selectQuery = " SELECT LotId, LotName , IdPerson, ClientOpenDateUTC, IsActive, ServerId, IsOnlyGamer FROM " + TBL_SCANS_CONTAINER + " Where IsSynced = 0 and IsUserClicked = 1 Order by LotId ASC limit " + top;
        SQLiteDatabase database = this.getWritableDatabase();
        Cursor cursor = database.rawQuery(selectQuery, null);
        while (cursor.moveToNext()) {
            com.xoonit.camera.Database.ScansContainer scansContainer = new com.xoonit.camera.Database.ScansContainer();
            scansContainer.setLotId(cursor.getInt(0));
            scansContainer.setLotName(cursor.getString(1));
            String IdPerson = cursor.getString(2);
            scansContainer.setIdPerson(Integer.parseInt(IdPerson));
            scansContainer.setClientOpenDateUTC(cursor.getString(3));
            scansContainer.setIsActive(cursor.getString(4));
            scansContainer.setServerId(cursor.getInt(5));
            scansContainer.setIsOnlyGamer(cursor.getString(6));
            scansContainerList.add(scansContainer);
        }
        if (cursor.isLast())
            cursor.close();
        database.close();

        return scansContainerList;

    }

    public int getScansContainerMaxNext() {
        SQLiteDatabase database = this.getReadableDatabase();
        Cursor cursor = database.query(TBL_SCANS_CONTAINER, new String[]{"MAX(" + COL_LotId + ")"}, null, null, null, null, null);
        int maxId = 0;
        if (cursor != null) {
            cursor.moveToFirst();
            maxId = cursor.getInt(0);
            maxId = maxId + 1;
        }
        return maxId;
    }

    public int getScansContainerCurrentMaxId() {
        SQLiteDatabase database = this.getReadableDatabase();
        Cursor cursor = database.query(TBL_SCANS_CONTAINER, new String[]{"MAX(" + COL_LotId + ")"}, null, null, null, null, null);
        int maxId = 0;
        if (cursor != null) {
            cursor.moveToFirst();
            maxId = cursor.getInt(0);
        }
        return maxId;
    }

    public boolean updateScansContainer(int lotId, int idScansContainer, boolean isSynced) {
        SQLiteDatabase database = this.getReadableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(COL_IdScanContainer, idScansContainer);
        contentValues.put(COL_IsSynced, isSynced);
        return database.update(TBL_SCANS_CONTAINER, contentValues, COL_LotId + "=" + lotId, null) > 0;
    }

    public boolean updateScansContainer(int lotId, int idScansContainer, boolean isSynced, boolean isUserClicked) {
        SQLiteDatabase database = this.getReadableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(COL_IdScanContainer, idScansContainer);
        contentValues.put(COL_IsSynced, isSynced);
        contentValues.put(COL_IsUserClicked, isUserClicked);
        return database.update(TBL_SCANS_CONTAINER, contentValues, COL_LotId + "=" + lotId, null) > 0;
    }

    public int deleteScansContainer(int lotId) {
        SQLiteDatabase database = this.getWritableDatabase();
        List<com.xoonit.camera.Database.ScansContainerItem> lstScansContainerItem = getScansContainerItem(lotId);
        int resultItem = 0;
        for (int i = 0; i < lstScansContainerItem.size(); i++) {
            int resultImages = database.delete(TBL_SCANS_IMAGES, COL_LotItemId + "=" + lstScansContainerItem.get(i).getLotItemId(), null);
            if (resultImages > 0) {
                resultItem = database.delete(TBL_SCANS_CONTAINER_ITEM, COL_LotItemId + "=" + lstScansContainerItem.get(i).getLotItemId(), null);
            }
        }
        if (resultItem > 0) {
            int result = database.delete(TBL_SCANS_CONTAINER, COL_LotId + "=" + lotId, null);
            return result;
        }
        return 0;
    }
    //endregion

    //region ScanContainerItem
    public int insertScansContainerItem(com.xoonit.camera.Database.ScansContainerItem scansContainerItem) {
        SQLiteDatabase database = this.getWritableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(COL_LotItemId, scansContainerItem.getLotItemId());
//        contentValues.put(COL_IdScansContainerItem, "");
        contentValues.put(COL_LotId, scansContainerItem.getLotId());
//        contentValues.put(COL_IdScanContainer, scansContainerItem.getIdScansContainer());
        contentValues.put(COL_IdRepScansContainerType, "1");
//        contentValues.put(COL_ScannerTwainDllVersion, "");
//        contentValues.put(COL_ScannerDevice, "");
        contentValues.put(COL_CustomerNr, "1");
        contentValues.put(COL_MediaCode, "1");
        contentValues.put(COL_ScannedPath, scansContainerItem.getScannedPath());
        contentValues.put(COL_ScannedFilename, scansContainerItem.getScannedFilename());
        SimpleDateFormat sdformat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
        contentValues.put(COL_ScannedDateUTC, sdformat.format(new Date()));
//        contentValues.put(COL_CoordinateX, "");
//        contentValues.put(COL_CoordinateY, "");
//        contentValues.put(COL_CoordinatePageNr, "");
//        contentValues.put(COL_IsWhiteMail, "");
//        contentValues.put(COL_IsCheque, "");
        contentValues.put(COl_NumberOfImages, scansContainerItem.getNumberOfImages());
        contentValues.put(COL_SourceScanGUID, UUID.randomUUID().toString());
//        contentValues.put(COL_IsMediaCodeValid, "");
//        contentValues.put(COL_IsCustomerNrValid, "");
//        contentValues.put(COL_IsCustomerNrEnteredManually, "");
//        contentValues.put(COL_IsMediaCodeEnteredManually, "");
        contentValues.put(COL_IsSynced, false);
        contentValues.put(COL_IsActive, "1");
//        contentValues.put(COL_ElapsedTime, "");
        contentValues.put(COL_IsLocalDeleted, false);
        contentValues.put(COL_IsOnlyGamer, "0");
        contentValues.put(COL_IdRepScansDocumentType, scansContainerItem.getIdDocumentTree());
        contentValues.put(COL_ScannedNote, scansContainerItem.getNotes());
        contentValues.put(COL_IsUserClicked, false);
        contentValues.put(COL_IdRepScanDeviceType, "2");
        return (int) database.insert(TBL_SCANS_CONTAINER_ITEM, null, contentValues);
    }

    public int getScansContainerItemMaxNext() {
        SQLiteDatabase database = this.getReadableDatabase();
        Cursor cursor = database.query(TBL_SCANS_CONTAINER_ITEM, new String[]{"MAX(" + COL_LotItemId + ")"}, null, null, null, null, null);
        int maxId = 0;
        if (cursor != null) {
            cursor.moveToFirst();
            maxId = cursor.getInt(0);
            maxId = maxId + 1;
        }
        return maxId;
    }

    public List<com.xoonit.camera.Database.ScansContainerItem> getScansContainerItem() {
        List<com.xoonit.camera.Database.ScansContainerItem> scansContainerItemList = new ArrayList<>();
        String selectQuery = " SELECT LotItemId, ScannedPath, ScannedFilename, IdRepScanDocumentType, SourceScanGUID FROM " + TBL_SCANS_CONTAINER_ITEM;
        SQLiteDatabase database = this.getWritableDatabase();
        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            do {
                com.xoonit.camera.Database.ScansContainerItem scansContainerItem = new com.xoonit.camera.Database.ScansContainerItem();
                scansContainerItem.setScannedPath(cursor.getString(1));
                scansContainerItem.setScannedFilename(cursor.getString(2));
                scansContainerItem.setIdDocumentTree(String.valueOf(cursor.getInt(3)));
                scansContainerItem.setSourceScanGUID(cursor.getString(4));
                scansContainerItemList.add(scansContainerItem);
            } while (cursor.moveToNext());
        }
        return scansContainerItemList;
    }

    public List<com.xoonit.camera.Database.ScansContainerItem> getScansContainerItem(int LotId) throws SQLException {
        List<com.xoonit.camera.Database.ScansContainerItem> scansContainerItemList = new ArrayList<>();
        String selectQuery = " SELECT LotItemId, ScannedPath, ScannedFilename, IdRepScansDocumentType,ScannedDateUTC,Notes, SourceScanGUID, NumberOfImages FROM " + TBL_SCANS_CONTAINER_ITEM + " Where LotId = " + LotId;
        SQLiteDatabase database = this.getWritableDatabase();
        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            do {
                com.xoonit.camera.Database.ScansContainerItem scansContainerItem = new com.xoonit.camera.Database.ScansContainerItem();
                scansContainerItem.setScannedPath(cursor.getString(1));
                scansContainerItem.setScannedFilename(cursor.getString(2));
                scansContainerItem.setIdDocumentTree(String.valueOf(cursor.getInt(3)));
                scansContainerItem.setScannedDateUTC(cursor.getString(4));
                scansContainerItem.setNotes(cursor.getString(5));
                scansContainerItem.setSourceScanGUID(cursor.getString(6));
                scansContainerItem.setNumberOfImages(cursor.getInt(7));

                scansContainerItemList.add(scansContainerItem);
            } while (cursor.moveToNext());
        }
        return scansContainerItemList;
    }

    public com.xoonit.camera.Database.ScansContainerItem getScansContainerItemById(int LotItemId) throws SQLException {
        com.xoonit.camera.Database.ScansContainerItem scansContainerItem = new com.xoonit.camera.Database.ScansContainerItem();
        String selectQuery = " SELECT LotItemId, ScannedPath, ScannedFilename, IdRepScansDocumentType,ScannedDateUTC,Notes, SourceScanGUID, NumberOfImages FROM " + TBL_SCANS_CONTAINER_ITEM + " Where LotItemId = " + LotItemId;
        SQLiteDatabase database = this.getWritableDatabase();
        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            scansContainerItem.setScannedPath(cursor.getString(1));
            scansContainerItem.setScannedFilename(cursor.getString(2));
            scansContainerItem.setIdDocumentTree(String.valueOf(cursor.getInt(3)));
            scansContainerItem.setScannedDateUTC(cursor.getString(4));
            scansContainerItem.setNotes(cursor.getString(5));
            scansContainerItem.setSourceScanGUID(cursor.getString(6));
            scansContainerItem.setNumberOfImages(cursor.getInt(7));
        }

        return scansContainerItem;
    }

    public boolean updateScansContainerItem(int lotItemId, int idScansContainer, boolean isSynced, String Note, int idScansContainerItem, int numberOfImages) {
        SQLiteDatabase database = this.getReadableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(COL_IdScanContainer, idScansContainer);
        contentValues.put(COL_IsSynced, isSynced);
        contentValues.put(COL_ScannedNote, Note);
        if (idScansContainerItem > 0) {
            contentValues.put(COL_IdScansContainerItem, idScansContainerItem);
        }
        if (numberOfImages > 1) {
            contentValues.put(COl_NumberOfImages, numberOfImages);
        }
        return database.update(TBL_SCANS_CONTAINER_ITEM, contentValues, COL_LotItemId + "=" + lotItemId, null) > 0;
    }

    public boolean updateScansContainerItem(int lotItemId, int idScansContainer, boolean isSynced, String Note, int idScansContainerItem, int numberOfImages, boolean isUserClicked) {
        SQLiteDatabase database = this.getReadableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(COL_IdScanContainer, idScansContainer);
        contentValues.put(COL_IsSynced, isSynced);
        contentValues.put(COL_ScannedNote, Note);
        if (idScansContainerItem > 0) {
            contentValues.put(COL_IdScansContainerItem, idScansContainerItem);
        }
        if (numberOfImages > 1) {
            contentValues.put(COl_NumberOfImages, numberOfImages);
        }
        contentValues.put(COL_IsUserClicked, isUserClicked);
        return database.update(TBL_SCANS_CONTAINER_ITEM, contentValues, COL_LotItemId + "=" + lotItemId, null) > 0;
    }

    public int deleteScansContainerItem(int lotItemId) {
        SQLiteDatabase database = this.getWritableDatabase();
        int resultImages = database.delete(TBL_SCANS_IMAGES, COL_LotItemId + "=" + lotItemId, null);
        if (resultImages > 0) {
            int result = database.delete(TBL_SCANS_CONTAINER_ITEM, COL_LotItemId + "=" + lotItemId, null);
            return result;
        }
        return 0;
    }
    //endregion

    //region ScanImages
    public int insertScansImage(com.xoonit.camera.Database.ScansImages scansImages) {
        SQLiteDatabase database = this.getReadableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(COL_IdScansImage, scansImages.getIdScansImage());
        contentValues.put(COL_ImagePath, scansImages.getImagePath());
        contentValues.put(COL_ImageName, scansImages.getImageName());
        contentValues.put(COL_CreatedDate, scansImages.getCreateDate());
        contentValues.put(COL_LotItemId, scansImages.getLotItemId());
        contentValues.put(COL_PageNr, scansImages.getPageNr());
        contentValues.put(COL_GroupNr, scansImages.getGroupNr());
        contentValues.put(COL_IdRepScansDocumentType, scansImages.getIdDocumentTree());
        return (int) database.insert(TBL_SCANS_IMAGES, null, contentValues);
    }

    public ArrayList<com.xoonit.camera.Database.ScansImages> getScansImagesById(int idScansImage) {
        ArrayList<com.xoonit.camera.Database.ScansImages> scansImagesList = new ArrayList<>();
        SQLiteDatabase database = this.getWritableDatabase();
        String selectQuery = " SELECT * FROM " + TBL_SCANS_IMAGES + " where IdScansImage = " + idScansImage;
        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            do {
                com.xoonit.camera.Database.ScansImages scansImages = new com.xoonit.camera.Database.ScansImages();
                scansImages.setIdScansImage(cursor.getInt(0));
                scansImages.setImagePath(cursor.getString(1));
                scansImages.setImageName(cursor.getString(2));
                scansImages.setCreateDate(cursor.getString(3));
                scansImages.setLotItemId(cursor.getInt(4));
                scansImages.setPageNr(cursor.getInt(5));
                scansImages.setGroupNr(cursor.getInt(6));
                scansImages.setIdDocumentTree(cursor.getInt(7));
                scansImagesList.add(scansImages);
            } while (cursor.moveToNext());
        }
        return scansImagesList;
    }

    public ArrayList<com.xoonit.camera.Database.ScansImages> getScansImagesByGroupNr(int groupNr) {
        List<com.xoonit.camera.Database.ScansImages> scansImagesList = new ArrayList<>();
        SQLiteDatabase database = this.getWritableDatabase();
        String selectQuery = " SELECT * FROM " + TBL_SCANS_IMAGES + " where GroupNr = " + groupNr;
        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            do {
                com.xoonit.camera.Database.ScansImages scansImages = new com.xoonit.camera.Database.ScansImages();
                scansImages.setIdScansImage(cursor.getInt(0));
                scansImages.setImagePath(cursor.getString(1));
                scansImages.setImageName(cursor.getString(2));
                scansImages.setCreateDate(cursor.getString(3));
                scansImages.setLotItemId(cursor.getInt(4));
                scansImages.setPageNr(cursor.getInt(5));
                scansImages.setGroupNr(cursor.getInt(6));
                scansImages.setIdDocumentTree(cursor.getInt(7));
                scansImagesList.add(scansImages);
            } while (cursor.moveToNext());
        }
        return (ArrayList<com.xoonit.camera.Database.ScansImages>) scansImagesList;
    }

    public ArrayList<com.xoonit.camera.Database.ScansImages> sortDataByCondition(String typesort, String column) {
        ArrayList<com.xoonit.camera.Database.ScansImages> mSortArray = new ArrayList<>();
        SQLiteDatabase database = this.getWritableDatabase();
        String selectQuery = " SELECT * FROM " + TBL_SCANS_IMAGES+ " where LotItemId=0 and GroupNr=0 " + " ORDER BY " + column + " " + typesort;
        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            do {
                com.xoonit.camera.Database.ScansImages scansImages = new com.xoonit.camera.Database.ScansImages();
                scansImages.setIdScansImage(cursor.getInt(0));
                scansImages.setImagePath(cursor.getString(1));
                scansImages.setImageName(cursor.getString(2));
                scansImages.setCreateDate(cursor.getString(3));
                scansImages.setLotItemId(cursor.getInt(4));
                scansImages.setPageNr(cursor.getInt(5));
                scansImages.setGroupNr(cursor.getInt(6));
                scansImages.setIdDocumentTree(cursor.getInt(7));
                mSortArray.add(scansImages);
            } while (cursor.moveToNext());
        }
        return mSortArray;
    }

    public ArrayList<com.xoonit.camera.Database.ScansImages> getScansImagesSingle() {
        ArrayList<com.xoonit.camera.Database.ScansImages> scansImagesList = new ArrayList<>();
        SQLiteDatabase database = this.getWritableDatabase();
        String selectQuery = " SELECT * FROM " + TBL_SCANS_IMAGES + " where LotItemId=0 and GroupNr=0 ";
        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            do {
                com.xoonit.camera.Database.ScansImages scansImages = new com.xoonit.camera.Database.ScansImages();
                scansImages.setIdScansImage(cursor.getInt(0));
                scansImages.setImagePath(cursor.getString(1));
                scansImages.setImageName(cursor.getString(2));
                scansImages.setCreateDate(cursor.getString(3));
                scansImages.setLotItemId(cursor.getInt(4));
                scansImages.setPageNr(cursor.getInt(5));
                scansImages.setGroupNr(cursor.getInt(6));
                scansImages.setIdDocumentTree(cursor.getInt(7));
                scansImagesList.add(scansImages);
            } while (cursor.moveToNext());
        }
        return scansImagesList;
    }

    public ArrayList<com.xoonit.camera.Database.ScansImages> getSizeAllPhoto() {
        ArrayList<com.xoonit.camera.Database.ScansImages> scansImagesList = new ArrayList<>();
        SQLiteDatabase database = this.getWritableDatabase();
        String selectQuery = " SELECT * FROM " + TBL_SCANS_IMAGES + " where LotItemId=0 ";
        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            do {
                com.xoonit.camera.Database.ScansImages scansImages = new com.xoonit.camera.Database.ScansImages();
                scansImages.setIdScansImage(cursor.getInt(0));
                scansImages.setImagePath(cursor.getString(1));
                scansImages.setImageName(cursor.getString(2));
                scansImages.setCreateDate(cursor.getString(3));
                scansImages.setLotItemId(cursor.getInt(4));
                scansImages.setPageNr(cursor.getInt(5));
                scansImages.setGroupNr(cursor.getInt(6));
                scansImages.setIdDocumentTree(cursor.getInt(7));
                scansImagesList.add(scansImages);
            } while (cursor.moveToNext());
        }
        return scansImagesList;
    }


    public ArrayList<com.xoonit.camera.Database.ScansImages> getListPhotoByIdDocumentTree(int idDocumentTree) {
        ArrayList<com.xoonit.camera.Database.ScansImages> scansImagesList = new ArrayList<>();
        SQLiteDatabase database = this.getWritableDatabase();
        String selectQuery = " SELECT * FROM " + TBL_SCANS_IMAGES + " where LotItemId=0 and IdRepScansDocumentType = "
                + idDocumentTree;
        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            do {
                com.xoonit.camera.Database.ScansImages scansImages = new com.xoonit.camera.Database.ScansImages();
                scansImages.setIdScansImage(cursor.getInt(0));
                scansImages.setImagePath(cursor.getString(1));
                scansImages.setImageName(cursor.getString(2));
                scansImages.setCreateDate(cursor.getString(3));
                scansImages.setLotItemId(cursor.getInt(4));
                scansImages.setPageNr(cursor.getInt(5));
                scansImages.setGroupNr(cursor.getInt(6));
                scansImages.setIdDocumentTree(cursor.getInt(7));
                scansImagesList.add(scansImages);
            } while (cursor.moveToNext());
        }
        return scansImagesList;
    }

    public ArrayList<com.xoonit.camera.Database.ScansImages> getScansImagesSingleByDocumentTreeId(int idDocumentTree) {
        ArrayList<com.xoonit.camera.Database.ScansImages> scansImagesList = new ArrayList<>();
        SQLiteDatabase database = this.getWritableDatabase();
        String selectQuery = " SELECT * FROM " + TBL_SCANS_IMAGES + " where LotItemId=0 and GroupNr=0 and IdRepScansDocumentType = "
                + idDocumentTree;
        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            do {
                com.xoonit.camera.Database.ScansImages scansImages = new com.xoonit.camera.Database.ScansImages();
                scansImages.setIdScansImage(cursor.getInt(0));
                scansImages.setImagePath(cursor.getString(1));
                scansImages.setImageName(cursor.getString(2));
                scansImages.setCreateDate(cursor.getString(3));
                scansImages.setLotItemId(cursor.getInt(4));
                scansImages.setPageNr(cursor.getInt(5));
                scansImages.setGroupNr(cursor.getInt(6));
                scansImages.setIdDocumentTree(cursor.getInt(7));
                scansImagesList.add(scansImages);
            } while (cursor.moveToNext());
        }
        return scansImagesList;
    }

    public ArrayList<com.xoonit.camera.Database.ScansImages> getScansImagesBatchByDocumentTreeId(int idDocumentTree) {
        ArrayList<com.xoonit.camera.Database.ScansImages> scansImagesList = new ArrayList<>();
        SQLiteDatabase database = this.getWritableDatabase();
        String selectQuery = ("SELECT gr.GroupNr,ImagePath,ImageName,CreatedDate,Count, IdRepScansDocumentType " +
                "FROM ScansImages sc JOIN " +
                "(SELECT GroupNr,count(GroupNr) AS Count FROM ScansImages WHERE LotItemId = 0 AND GroupNr > 0 GROUP BY GroupNr)gr " +
                "ON sc.IdScansImage = gr.GroupNr and sc.IdRepScansDocumentType = " + idDocumentTree);
        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            do {
                com.xoonit.camera.Database.ScansImages scansImages = new com.xoonit.camera.Database.ScansImages();
                scansImages.setGroupNr(cursor.getInt(0));
                scansImages.setImagePath(cursor.getString(1));
                scansImages.setImageName(cursor.getString(2));
                scansImages.setCreateDate(cursor.getString(3));
                scansImages.setPageNr(cursor.getInt(4));
                scansImages.setIdDocumentTree(cursor.getInt(5));
                scansImagesList.add(scansImages);
            } while (cursor.moveToNext());
        }
        return scansImagesList;
    }


    public ArrayList<com.xoonit.camera.Database.ScansImages> getScansImagesBatch() {
        ArrayList<com.xoonit.camera.Database.ScansImages> scansImagesList = new ArrayList<>();
        SQLiteDatabase database = this.getWritableDatabase();
        String selectQuery = ("SELECT gr.GroupNr,ImagePath,ImageName,CreatedDate,Count, IdRepScansDocumentType FROM ScansImages sc JOIN(SELECT GroupNr,count(GroupNr) AS Count FROM ScansImages WHERE LotItemId = 0 AND GroupNr > 0 GROUP BY GroupNr)gr ON sc.IdScansImage = gr.GroupNr");
        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            do {
                com.xoonit.camera.Database.ScansImages scansImages = new com.xoonit.camera.Database.ScansImages();
                scansImages.setGroupNr(cursor.getInt(0));
                scansImages.setImagePath(cursor.getString(1));
                scansImages.setImageName(cursor.getString(2));
                scansImages.setCreateDate(cursor.getString(3));
                scansImages.setPageNr(cursor.getInt(4));
                scansImages.setIdDocumentTree(cursor.getInt(5));
                scansImagesList.add(scansImages);
            } while (cursor.moveToNext());
        }
        return scansImagesList;
    }

    public List<com.xoonit.camera.Database.ScansImages> getScansImagesBatchDetails() {
        List<com.xoonit.camera.Database.ScansImages> scansImagesList = new ArrayList<>();
        SQLiteDatabase database = this.getWritableDatabase();
        String selectQuery = ("select GroupNr, IdScansImage, ImagePath, ImageName from ScansImages where GroupNr  order by IdScansImage");

        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            do {
                com.xoonit.camera.Database.ScansImages scansImages = new com.xoonit.camera.Database.ScansImages();
                scansImages.setGroupNr(cursor.getInt(0));
                scansImages.setIdScansImage(cursor.getInt(1));
                scansImages.setImagePath(cursor.getString(2));
                scansImages.setImageName(cursor.getString(3));
                scansImagesList.add(scansImages);
            } while (cursor.moveToNext());
        }
        return scansImagesList;
    }

    public int getScansImageMaxNext() {
        SQLiteDatabase database = this.getReadableDatabase();
        Cursor cursor = database.query(TBL_SCANS_IMAGES, new String[]{"MAX(" + COL_IdScansImage + ")"}, null, null, null, null, null);
        int maxIdImage = 0;
        if (cursor != null) {
            cursor.moveToFirst();
            maxIdImage = cursor.getInt(0);
            maxIdImage = maxIdImage + 1;
        }
        return maxIdImage;
    }

    public List<com.xoonit.camera.Database.ScansImages> getScansImages(int LotItemId) throws SQLException {
        List<com.xoonit.camera.Database.ScansImages> scansImagesList = new ArrayList<>();
        SQLiteDatabase database = this.getWritableDatabase();
        String selectQuery = " SELECT * FROM " + TBL_SCANS_IMAGES + " Where LotItemId =" + LotItemId;
        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            do {
                com.xoonit.camera.Database.ScansImages scansImages = new com.xoonit.camera.Database.ScansImages();
                scansImages.setIdScansImage(cursor.getInt(0));
                scansImages.setImagePath(cursor.getString(1));
                scansImages.setImageName(cursor.getString(2));
                scansImages.setCreateDate(cursor.getString(3));
                scansImages.setLotItemId(cursor.getInt(4));
                scansImages.setPageNr(cursor.getInt(5));
                scansImages.setGroupNr(cursor.getInt(6));
                scansImagesList.add(scansImages);
            } while (cursor.moveToNext());
        }
        return scansImagesList;
    }

    public void updateScansImagesByGroupNr(int IdScansImage, int Group) {
        SQLiteDatabase database = this.getReadableDatabase();
        ContentValues contentValues = new ContentValues();
//        contentValues.put(COL_LotId, LotId);
        contentValues.put(COL_IdScansImage, IdScansImage);
        contentValues.put(COL_GroupNr, Group);
        database.update(TBL_SCANS_IMAGES, contentValues, COL_IdScansImage + "=" + IdScansImage, null);
    }

    public void updateScansImagesByLotItemId(com.xoonit.camera.Database.ScansImages scansImages) {
        SQLiteDatabase database = this.getReadableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(COL_LotItemId, scansImages.getLotItemId());
        contentValues.put(COL_IdScansImage, scansImages.getIdScansImage());
        database.update(TBL_SCANS_IMAGES, contentValues, COL_IdScansImage + "=" + scansImages.getIdScansImage(), null);
    }

    public void updateScansImagesByNotes(com.xoonit.camera.Database.ScansImages scansImages) {
        SQLiteDatabase database = this.getReadableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(COL_ScannedNote, scansImages.getNotes());
        contentValues.put(COL_IdScansImage, scansImages.getIdScansImage());
        database.update(TBL_SCANS_IMAGES, contentValues, COL_IdScansImage + "=" + scansImages.getIdScansImage(), null);
    }

    public void updateScansImagesByNotesMultiple(int groupNr, String notes) {
        SQLiteDatabase database = this.getReadableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(COL_ScannedNote, notes);
        contentValues.put(COL_GroupNr, groupNr);
        database.update(TBL_SCANS_IMAGES, contentValues, COL_GroupNr + "=" + groupNr, null);
    }

    public int deleteScansImages() {
        SQLiteDatabase database = this.getWritableDatabase();
        int resultImages = database.delete(TBL_SCANS_IMAGES, null, null);
        if (resultImages > 0) {
            int result = database.delete(TBL_SCANS_IMAGES, null, null);
            return result;
        }
        return 0;
    }

    public int deleteSingleScansImagesbyId(int idScansImage) {
        SQLiteDatabase database = this.getWritableDatabase();
        int resultImages = database.delete(TBL_SCANS_IMAGES, COL_IdScansImage + "=" + idScansImage, null);
        return resultImages;
    }

    public int deleteGroupScansImagesbyGroupNr(int groupNr) {
        SQLiteDatabase database = this.getWritableDatabase();
        int resultImages = database.delete(TBL_SCANS_IMAGES, COL_GroupNr + "=" + groupNr, null);
        return resultImages;
    }
    //endregion

    //region DocumentTree
    public int insertDocumentTree(com.xoonit.camera.Database.DocumentTree data) {
        SQLiteDatabase sqLiteDatabase = this.getReadableDatabase();
        ContentValues content = new ContentValues();
        content.put("IdDocumentTree", data.getIDDocumentTree());
        content.put("GroupName", data.getGroupName());
//        content.put("DocumentCode",data.get);
        return (int) sqLiteDatabase.insert(TBL_DOCTYPE, null, content);
    }

    public ArrayList<com.xoonit.camera.Database.DocumentTree> getDocumentType() {

        SQLiteDatabase sqLiteDatabase = this.getWritableDatabase();
        String sql = "select * from " + TBL_DOCTYPE;
        Cursor cursor = sqLiteDatabase.rawQuery(sql, null);
        ArrayList<com.xoonit.camera.Database.DocumentTree> arrayList = new ArrayList<>();
        if (cursor.moveToFirst()) {
            do {
                com.xoonit.camera.Database.DocumentTree item = new com.xoonit.camera.Database.DocumentTree();
                item.setIDDocumentTree(cursor.getInt(1));
                item.setGroupName(cursor.getString(2));
                arrayList.add(item);
            } while (cursor.moveToNext());
        }
        return arrayList;
    }

    public void deleteDataDocumentTree() {
        SQLiteDatabase database = this.getWritableDatabase();
        database.delete(TBL_DOCTYPE, null, null);
    }
    //endregion DocumentTree

    public boolean updateUser(com.xoonit.camera.Database.User user) {
        SQLiteDatabase database = this.getReadableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(COL_IdLogin, user.getIdLogin());
        contentValues.put(COL_LoginName, user.getLoginName());
        contentValues.put(COL_PassWord, user.getPassword());
        contentValues.put(COL_Company, user.getCompany());
        contentValues.put(COL_UserCode, user.getUserCode());
        contentValues.put(COL_Email, user.getEmail());

        return database.update(TBL_USER, contentValues, COL_IdLogin + "=" + user.getIdLogin(), null) > 0;
    }
    //endregion

    //  region Setting
    public int insertSetting(com.xoonit.camera.Database.Setting setting) {
        SQLiteDatabase database = this.getWritableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(COL_IdSetting, setting.getIdSetting());
        contentValues.put(COL_SettingValues, setting.isSettingValues());
        contentValues.put(COL_SettingName, setting.getSettingName());
        return (int) database.insert(TBL_SETTING, null, contentValues);
    }

    public List<com.xoonit.camera.Database.Setting> getSetting() {
        List<com.xoonit.camera.Database.Setting> scansSettingList = new ArrayList<>();
        SQLiteDatabase database = this.getWritableDatabase();
        String selectQuery = " SELECT * FROM " + TBL_SETTING;
        Cursor cursor = database.rawQuery(selectQuery, null);
        if (cursor.moveToNext()) {
            do {
                com.xoonit.camera.Database.Setting setting = new com.xoonit.camera.Database.Setting();
                setting.setIdSetting(cursor.getInt(0));
                setting.setSettingName(cursor.getString(1));
                setting.setSettingValues(cursor.getInt(2) == 1);
                scansSettingList.add(setting);
            }
            while (cursor.moveToNext());
        }
        return scansSettingList;
    }

    public boolean updateSetting(int lotId, int idScansContainer, boolean isSynced) {
        SQLiteDatabase database = this.getReadableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(COL_IdScanContainer, idScansContainer);
        contentValues.put(COL_IsSynced, isSynced);
        return database.update(TBL_SCANS_CONTAINER, contentValues, COL_LotId + "=" + lotId, null) > 0;
    }
    // endregion
}





