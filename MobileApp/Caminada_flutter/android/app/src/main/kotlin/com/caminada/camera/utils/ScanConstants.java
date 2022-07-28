package com.caminada.camera.utils;

import android.graphics.Bitmap;


import com.caminada.camera.model.DocumentTreeItem;

import org.jetbrains.annotations.Nullable;

import java.util.ArrayList;

/**
 * This class defines constants
 */

public class ScanConstants {
    //// For images
    public static final String LotItemId = "LotItemId";
    public static final String StrGroupNr = "GroupNr";
    public static final String StrImageId = "IdScansImage";
    @Nullable
    public static Bitmap BitmapSelect;
    public static final int HIGHER_SAMPLING_THRESHOLD = 5000;
    public static String path;

    //// For manage scanmode and doc
    public static int CurrentLotId = 0;
    public static int CurrentIdScansContainerItem = 0;
    //    public static int IdDocumentTree = 0;
    public static int CurrentPageNr = 0;
    public static int GroupNr = 0;
    public static int ViewMode = 0;
    public static String textVoice;
    public static String EditText;
    public static Bitmap bitmap;

    //// For handle app operation
    public static boolean IsStart = true;

    //// Scan default user
    public static int DefaultUserIdLogin = 1;
    //    public static String DefaultUserLoginName = "rfi_xena";
//    public static String DefaultUserPassWord = "Zeus2017!";
//    public static String DefaultUserNickName = "Rocky";
    public static String DefaultUserCompany = "Xoontec";
    public static String DefaultUserUserCode = "RF";


//    public static int DefaultUserIdLogin = 1;
//    public static String DefaultUserLoginName = "florian";
//    public static String DefaultUserPassWord = "Zeus2017!";
//    public static String DefaultUserCompany = "Caminada";
//    public static String DefaultUserUserCode = "FB";

//6

//    public static int DefaultUserIdLogin = 1;
//    public static String DefaultUserLoginName = "fb_cam";
//    public static String DefaultUserPassWord = "Zeus2017!";
//    public static String DefaultUserCompany = "Caminada";
//    public static String DefaultUserUserCode = "FB";

//    public static int DefaultUserIdLogin = 1;
//    public static String DefaultUserLoginName = "mv_cam";
//    public static String DefaultUserPassWord = "Zeus2017!";
//    public static String DefaultUserCompany = "Caminada";
//    public static String DefaultUserUserCode = "MV";

//    public static int DefaultUserIdLogin = 1;
//    public static String DefaultUserLoginName = "test_cam";
//    public static String DefaultUserPassWord = "Zeus2017!";
//    public static String DefaultUserCompany = "Caminada";
//    public static String DefaultUserUserCode = "TEST";

    //// For connection to the server
//    public static String PrefixHostOrderProcessing = "http://dms.xoontec.vn/api/";
//    public static String PrefixHostMailingScanAPI = "http://mailing.xoontec.vn/api/FileManager/";

    //    public static String PrefixHostMailingScanAPI = "http://mailing.xoontec.vn/api/FileManager/";
    //CH server Caminada
//    public static String CamanadaHostMailingScanAPI = "http://caminada.xoontec.vn/api/";
    // Local server Caminada
    public static String CamanadaHostMailingScanAPI = "http://caminada.xena.local/api/";
    //    public static String PrefixHostOrderProcessing = "http://orderprocessing.xena.local/api/";
//    public static String PrefixHostMailingScanAPI = "http://expense-api.xena.local/api/MailingScan/";
    //Local server myDM
//    public static String PrefixHostDocumentProcessing = "http://mydmsaot.xena.local/api/";
//    public static Bitmap BitmapSelectCrop;
    public static Bitmap CropBitmap;
    public static int ViewContainer = 1;

    //    public static TextView docType;
    //CH server myDM
//    public static String PrefixHostDocumentProcessing = "http://mydms.xoontec.vn/api/";
//    public static String PrefixHostDocumentProcessing = "http://expense-api.xena.local/api/MailingScan/";
    @Nullable
    public static ArrayList<DocumentTreeItem> listDocumentTree;
    @Nullable
    public static DocumentTreeItem currentDocumentTree;
}
