package com.xoonit.camera.Activities;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Handler;

import com.xoonit.camera.Activities.Base.BaseActivity;
import com.xoonit.camera.BuildConfig;
import com.xoonit.camera.Database.DocumentTreeArray;
import com.xoonit.camera.Database.DocumentTreeItem;
import com.xoonit.camera.R;
import com.xoonit.camera.XoonitApplication;
import com.xoonit.camera.api.core.ApiCallBack;
import com.xoonit.camera.api.core.ApiClient;
import com.xoonit.camera.utils.GeneralMethod;

import org.androidannotations.annotations.EActivity;

import java.util.ArrayList;
import java.util.List;


@SuppressLint("Registered")
@EActivity(R.layout.activity_congratulations)
public class ActivityCongrat extends BaseActivity {

    @Override
    protected void afterViews() {
        new Handler().postDelayed(() -> getDocumentTree(), 2000);
    }

    private void getDocumentTree() {
        if (BuildConfig.USE_MOCK_DATA) {
            new Handler().postDelayed(() -> {
                String documentTreeJson = GeneralMethod.readFile("DocumentTree.json", ActivityCongrat.this);
                DocumentTreeArray documentTreeArray = GeneralMethod.transformJsonStringToObject(documentTreeJson, DocumentTreeArray.class);
                handleGetDocumentTreeResponse(documentTreeArray);
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
        }
    }


}
