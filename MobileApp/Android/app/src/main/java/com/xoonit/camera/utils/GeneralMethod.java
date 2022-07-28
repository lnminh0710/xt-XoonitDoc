package com.xoonit.camera.utils;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.widget.EditText;
import android.widget.TextView;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.xoonit.camera.BuildConfig;
import com.xoonit.camera.Model.LoginItem;
import com.xoonit.camera.Model.LoginSuccessResponse;
import com.xoonit.camera.XoonitApplication;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class GeneralMethod {
    public static void saveUserData(LoginItem loginItem) {
        SharePref_ sharePref = XoonitApplication.getInstance().getSharePref();
        sharePref.accessToken().put(loginItem.getAccessToken());
        sharePref.refreshToken().put(loginItem.getRefreshToken());
        sharePref.timeRefreshToken().put((System.currentTimeMillis() / 1000) + loginItem.getExpiresIn() - 10);
    }

    public static void clearUserData() {
        SharePref_ sharePref = XoonitApplication.getInstance().getSharePref();
        sharePref.accessToken().put("");
        sharePref.refreshToken().put("");
        sharePref.userName().put("");
        sharePref.nickName().put("");
        sharePref.timeRefreshToken().put(0L);
    }

    public static boolean shouldRefreshAccessToken() {
        SharePref_ sharePref = XoonitApplication.getInstance().getSharePref();
        String refreshToken = sharePref.refreshToken().getOr("");
        long refreshDate = sharePref.timeRefreshToken().getOr(0L);
        if (!refreshToken.isEmpty()) {
            return refreshDate > 0 && System.currentTimeMillis() / 1000 >= refreshDate;
        }
        return false;
    }


    public static boolean refreshToken() throws IOException {
        SharePref_ sharePref = XoonitApplication.getInstance().getSharePref();
        String refreshToken = sharePref.refreshToken().getOr("");
        URL refreshUrl = new URL(BuildConfig.SERVER_DOMAIN_NAME + "authenticate/refreshtoken");
        HttpURLConnection urlConnection = (HttpURLConnection) refreshUrl.openConnection();
        urlConnection.setDoInput(true);
        urlConnection.setRequestMethod("POST");
        urlConnection.setRequestProperty("Content-Type", "application/json");
        urlConnection.setRequestProperty("Authorization", "Bearer " + refreshToken);
        urlConnection.setUseCaches(false);
        urlConnection.setDoOutput(true);
        DataOutputStream wr = new DataOutputStream(urlConnection.getOutputStream());
        wr.flush();
        wr.close();

        int responseCode = urlConnection.getResponseCode();

        if (responseCode == 200) {
            BufferedReader in =
                    new BufferedReader(new InputStreamReader(urlConnection.getInputStream()));
            String inputLine;
            StringBuilder response = new StringBuilder();

            while ((inputLine = in.readLine()) != null) {
                response.append(inputLine);
            }
            in.close();

            // this gson part is optional , you can read response directly from Json too
            Gson gson = new Gson();
            LoginSuccessResponse loginSuccessResponse =
                    gson.fromJson(response.toString(), LoginSuccessResponse.class);

            if (loginSuccessResponse != null) {
                loginSuccessResponse.getLoginItem();
                GeneralMethod.saveUserData(loginSuccessResponse.getLoginItem());
            } else {
                GeneralMethod.clearUserData();
                return false;
            }
            return true;
        } else {
            //cannot refresh
            GeneralMethod.clearUserData();
            return false;
        }
    }

    public static <T> T transformJsonStringToObject(String jsonString, Class<T> type) {
        T meta;
        try {
            Gson gson = new Gson();
            JsonElement jsonElement = gson.fromJson(jsonString, JsonElement.class);
            JsonObject jsonObject = jsonElement.getAsJsonObject();
            meta = gson.fromJson(jsonObject, type);
        } catch (Exception e) {
            return null;
        }
        return meta;
    }

    private static String getFileContents(InputStream inputStream) {
        StringBuilder queryBuffer = new StringBuilder();
        try {
            InputStreamReader inputStreamReader = new InputStreamReader(inputStream);
            BufferedReader bufferedReader = new BufferedReader(inputStreamReader);
            for (String line; (line = bufferedReader.readLine()) != null; )
                queryBuffer.append(line);
            inputStreamReader.close();
            bufferedReader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return queryBuffer.toString();
    }

    public static String readFile(String fileName, Context context) {
        String rootFolder = "mock";
        StringBuilder text = new StringBuilder();
        String absolute = rootFolder + "/" + fileName;
        try {
            return getFileContents(context.getAssets().open(absolute));
        } catch (IOException e) {
            e.printStackTrace();
        }
        return "";
    }

    public static void setTextViewText(TextView textView, String text) {
        if (text != null) {
            textView.setText(text);
        }

    }

    public static void setEditTextText(EditText editText, String text) {
        if (text != null) {
            editText.setText(text);
        }

    }

    public static String MockGetDocumentUrl(String documentLocalPath, String documentLocalName) {
        String baseURL = "http://mydmsaot.xena.local/api/FileManager/GetFile?name=";
        return baseURL + documentLocalPath + "\\" + documentLocalName + "&mode=6";
    }

    public static void requestPermissionStorage(Activity context) {
        if (ContextCompat.checkSelfPermission(context,
                Manifest.permission.WRITE_EXTERNAL_STORAGE)
                != PackageManager.PERMISSION_GRANTED) {
            // No explanation needed; request the permission
            ActivityCompat.requestPermissions(context,
                    new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
                    ConstantUtils.REQUEST_CODE_FOR_STORAGE_PERMISSION);

            // MY_PERMISSIONS_REQUEST_READ_CONTACTS is an
            // app-defined int constant. The callback method gets the
            // result of the request.

        }
    }

    public static boolean checkPermissionStorageEnable(Activity context) {
        if (ContextCompat.checkSelfPermission(context,
                Manifest.permission.WRITE_EXTERNAL_STORAGE)
                != PackageManager.PERMISSION_GRANTED) {
            return false;
        }
        return true;
    }

}
