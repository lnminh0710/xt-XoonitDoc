package com.xoonit.camera.utils;

public class ConstantUtils {
    public static String RESPONSE_SUCCESS_STRING = "Successfully";
    public static final int ALL_FOLDER_MENU_ID = 100001;
    public static final int ABOUT_MENU_ID = 100002;
    public static final int LOGOUT_MENU_ID = 100003;
    public static final int REQUEST_OPEN_PHOTO = 10004;
    public static final int REQUEST_OPEN_CROP = 10005;
    public static final int REQUEST_CODE_FOR_STORAGE_PERMISSION = 10006;
    public static final String BROADCAST_OPEN_FOLDER = "broadcast_open_folder";
    public static final String BROADCAST_FOLDER_TO_OPEN = "folder_to_open";
    public static final String BROADCAST_FOLDER_NAME_TO_OPEN = "folder_name_to_open";
    public static final String IS_CROP_SUCCESS = "is_crop_success";
    public static final String IS_OPEN_PHOTO = "is_open_photo";
    public interface EXTENSION_TYPE {
        String PDF = "pdf";
        String PNG = "png";
        String TIFF = "tiff";
        String JPEG = "jpeg";
        String JPG = "jpg";
    }
    public interface SYNC_STATUS{
        String DONE = "Done";
        String LOADING = "Loading";
        String ERROR = "Error";
    }
}
