package com.xoonit.camera.Activities;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Handler;
import android.text.TextUtils;
import android.widget.Toast;

import com.xoonit.camera.Activities.Base.BaseActivity;
import com.xoonit.camera.BuildConfig;
import com.xoonit.camera.Database.DocumentTreeArray;
import com.xoonit.camera.Database.DocumentTreeItem;
import com.xoonit.camera.R;
import com.xoonit.camera.XoonitApplication;
import com.xoonit.camera.api.core.ApiCallBack;
import com.xoonit.camera.api.core.ApiClient;
import com.xoonit.camera.fragments.MainActivity;
import com.xoonit.camera.utils.ConstantUtils;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;
import com.xoonit.camera.utils.GeneralMethod;

import java.util.ArrayList;
import java.util.List;


public class SplashActivity extends BaseActivity {
    private final int SPLASH_DISPLAY_LENGTH = 500;

    @Override

    public void onCreate(Bundle icicle) {
        super.onCreate(icicle);
        setContentView(R.layout.activity_splashscreen);


        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                /* Create an Intent that will start the Menu-Activity. */
                String accessToken = mSharePref.accessToken().getOr("");
                if (TextUtils.isEmpty(accessToken)) {
                    Intent mainIntent = new Intent(SplashActivity.this, LoginActivity_.class);
                    SplashActivity.this.startActivity(mainIntent);
                    SplashActivity.this.finish();
                } else {
                    getDocumentTree();
                }
            }
        }, SPLASH_DISPLAY_LENGTH);
    }

    @Override
    protected void afterViews() {
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            //resume tasks needing this permission
            switch (requestCode) {
                case ConstantUtils.REQUEST_CODE_FOR_STORAGE_PERMISSION: {
                    Toast.makeText(this, "Permission granted", Toast.LENGTH_SHORT).show();
                }

            }
        }
    }

    private void getDocumentTree() {
        if (BuildConfig.USE_MOCK_DATA) {
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    String documentTreeJson = GeneralMethod.readFile("DocumentTree.json", SplashActivity.this);
                    DocumentTreeArray documentTreeArray = GeneralMethod.transformJsonStringToObject(documentTreeJson, DocumentTreeArray.class);
                    handleGetDocumentTreeResponse(documentTreeArray);
                }
            }, 2000);
        } else {
            ApiClient.getService().getDocumentTree()
                    .enqueue(new ApiCallBack<DocumentTreeArray>(this) {
                        @Override
                        public void success(DocumentTreeArray documentTreeArray) {
                            handleGetDocumentTreeResponse(documentTreeArray);
                        }

                        @Override
                        public void failure(List<String> listError) {
                            getDocumentTreeFail();
                        }
                    });
        }
    }

    private void handleGetDocumentTreeResponse(DocumentTreeArray documentTreeArray) {
        ArrayList<DocumentTreeItem> arrayListData = new ArrayList<>();
        if (documentTreeArray != null
                && documentTreeArray.getDocumentTreeItem() != null
                && documentTreeArray.getDocumentTreeItem().size() > 0) {
            for (int i = 0; i < documentTreeArray.getDocumentTreeItem().size(); i++) {
                DocumentTreeItem docToAdd = documentTreeArray.getDocumentTreeItem().get(i);
                docToAdd.setRoot(true);
                arrayListData.add(docToAdd);
            }
            XoonitApplication.getInstance().setDocumentTreeItemList(arrayListData);
            startActivityWithPushAnimation(new Intent(this, ActivityHome_.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK));
            SplashActivity.this.finish();
        } else {
            getDocumentTreeFail();
        }
    }

    private void getDocumentTreeFail() {
        GeneralMethod.clearUserData();
        Intent mainIntent = new Intent(SplashActivity.this, LoginActivity_.class);
        SplashActivity.this.startActivity(mainIntent);
        SplashActivity.this.finish();
    }


}

