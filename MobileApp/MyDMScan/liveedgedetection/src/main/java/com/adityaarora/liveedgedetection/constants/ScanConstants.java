package com.adityaarora.liveedgedetection.constants;

import android.graphics.Bitmap;
import android.widget.EditText;
import android.widget.TextView;

import com.adityaarora.liveedgedetection.Database.ScansContainer;
import com.adityaarora.liveedgedetection.Database.ScansContainerItem;
import com.adityaarora.liveedgedetection.Database.ScansImages;
import com.adityaarora.liveedgedetection.Database.User;

/**
 * This class defines constants
 */

public class ScanConstants {
    //// For images
    public static final String SCANNED_RESULT = "scannedResult";
    public static final String LotItemId = "LotItemId";
    public static String IMAGE_NAME = "image";
    public static final int HIGHER_SAMPLING_THRESHOLD = 2200;
    public static String path;

    //// For manage scanmode and doc
    public static int ScanMode = 1;
    public static int CurrentLotId = 0;
    public static int CurrentIdScansContainerItem = 0;
    public static int IdRepScanDocumentType = 1;
    public static int CurrentPageNr = 0;


    public static String EditText;
    public static Bitmap bitmap;

    //// For handle app operation
    public static boolean IsStart = true;
    public static User CurrentUser;

    //// Scan default user
    public static int DefaultUserIdLogin = 1;
    public static String DefaultUserLoginName = "rfi_xena";
    public static String DefaultUserPassWord = "Zeus2017!";
    public static String DefaultUserCompany = "Xoontec";
    public static String DefaultUserUserCode = "RF";

//    public static int DefaultUserIdLogin = 1;
//    public static String DefaultUserLoginName = "boris";
//    public static String DefaultUserPassWord = "Zeus2017!";
//    public static String DefaultUserCompany = "Xoontec";
//    public static String DefaultUserUserCode = "BG";

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
    //CH server
//    public static String PrefixHostOrderProcessing = "http://dms.xoontec.vn/api/";
//    public static String PrefixHostMailingScanAPI = "http://mailing.xoontec.vn/api/MailingScan/";

    //Local server
    public static String PrefixHostDocumentProcessing = "http://mydmsaot.xena.local/api/";
//    public static String PrefixHostDocumentProcessing = "http://mydms.xoontec.vn/api/";
//    public static String PrefixHostDocumentProcessing = "http://expense-api.xena.local/api/MailingScan/";

//    public static String PrefixHostOrderProcessing = "http://orderprocessing.xena.local/api/";
//    public static String PrefixHostMailingScanAPI = "http://expense-api.xena.local/api/ConvertImage/UploadImages";
}
