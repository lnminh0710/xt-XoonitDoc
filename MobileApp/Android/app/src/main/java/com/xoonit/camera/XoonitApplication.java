package com.xoonit.camera;

import android.app.Application;
import android.content.Context;

import androidx.annotation.NonNull;
import androidx.camera.camera2.Camera2Config;
import androidx.camera.core.CameraXConfig;
import androidx.lifecycle.LifecycleObserver;

import com.xoonit.camera.Database.DocumentTreeItem;
import com.xoonit.camera.api.core.ApiClient;
import com.xoonit.camera.api.core.ApiConfig;
import com.xoonit.camera.utils.Logger;
import com.xoonit.camera.utils.SharePref_;

import org.androidannotations.annotations.EApplication;
import org.androidannotations.annotations.sharedpreferences.Pref;

import java.util.ArrayList;

@EApplication
public class XoonitApplication extends Application implements LifecycleObserver, CameraXConfig.Provider {

    private static XoonitApplication sInstance;

    private ArrayList<DocumentTreeItem> documentTreeItemList;
    private DocumentTreeItem currentDocumentTreeItem;
    private Context mContext;

    @Pref
    SharePref_ mSharePref;

    @Override
    public void onCreate() {
        super.onCreate();
        Logger.Spam();
        sInstance = this;
        mContext = getApplicationContext();
        ApiConfig apiConfig = new ApiConfig();
        apiConfig.setContext(mContext);
        apiConfig.setBaseUrl(BuildConfig.SERVER_DOMAIN_NAME);
        currentDocumentTreeItem = new DocumentTreeItem();
        ApiClient.getInstance().init(apiConfig);
    }

    public static synchronized XoonitApplication getInstance() {
        return sInstance;
    }

    public SharePref_ getSharePref() {
        return mSharePref;
    }

    public Context getmContext() {
        return mContext;
    }

    public void setmContext(Context mContext) {
        this.mContext = mContext;
    }

    public ArrayList<DocumentTreeItem> getDocumentTreeItemList() {
        return documentTreeItemList;
    }

    public void setDocumentTreeItemList(ArrayList<DocumentTreeItem> documentTreeItemList) {
        this.documentTreeItemList = documentTreeItemList;
    }

    public DocumentTreeItem getCurrentDocumentTreeItem() {
        return currentDocumentTreeItem;
    }

    public void setCurrentDocumentTreeItem(DocumentTreeItem currentDocumentTreeItem) {
        this.currentDocumentTreeItem = currentDocumentTreeItem;
    }

    @NonNull
    @Override
    public CameraXConfig getCameraXConfig() {
        return Camera2Config.defaultConfig();
    }
}
