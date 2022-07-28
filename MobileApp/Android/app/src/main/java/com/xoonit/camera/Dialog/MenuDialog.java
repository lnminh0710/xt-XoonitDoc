package com.xoonit.camera.Dialog;

import android.app.Dialog;
import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.widget.ImageButton;

import androidx.annotation.NonNull;

import com.xoonit.camera.R;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;
import com.xoonit.camera.utils.Logger;

public class MenuDialog extends Dialog implements
        android.view.View.OnClickListener {

    private Context context;
    private ItemClickListener itemClickListener;
    private ImageButton btnMyDM, btnCapture, btnContact, btnScan, btnImport, btnExport, btnCloud, btnUser, btnHistory;

    public MenuDialog(@NonNull Context context) {
        super(context);
        this.context = context;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.menu_dialog);
        btnMyDM = findViewById(R.id.btnMyDM);
        btnCapture = findViewById(R.id.btnCapture);
        btnContact = findViewById(R.id.btnContact);
        btnScan = findViewById(R.id.btnScan);
        btnImport = findViewById(R.id.btnImport);
        btnExport = findViewById(R.id.btnExport);
        btnCloud = findViewById(R.id.btnCloud);
        btnUser = findViewById(R.id.btnUser);
        btnHistory = findViewById(R.id.btnHistory);
        FireBaseManagement.logFireBaseEvent(context, ConstantFireBaseTracking.MENU_DIALOG);
        initItemClickListener();
    }

    private void initItemClickListener() {
        if (itemClickListener != null) {
            btnMyDM.setOnClickListener(this);
            btnCapture.setOnClickListener(this);
            btnContact.setOnClickListener(this);
            btnScan.setOnClickListener(this);
            btnImport.setOnClickListener(this);
            btnExport.setOnClickListener(this);
            btnCloud.setOnClickListener(this);
            btnUser.setOnClickListener(this);
            btnHistory.setOnClickListener(this);
        }
    }

    public void setItemClickListener(ItemClickListener itemClickListener) {
        this.itemClickListener = itemClickListener;
    }

    @Override
    public void onClick(View v) {
        if (itemClickListener != null) {
            switch (v.getId()) {
                case R.id.btnMyDM:
                    Logger.Debug("on MyDM button Clicked");
                    itemClickListener.onMyDMItemClick();
                    break;
                case R.id.btnCapture:
                    Logger.Debug("on Capture button Clicked");
                    itemClickListener.onCaptureItemClick();
                    break;
                case R.id.btnContact:
                    Logger.Debug("on Contact button Clicked");
                    itemClickListener.onContactItemClick();
                    break;
                case R.id.btnScan:
                    Logger.Debug("on Scan button Clicked");
                    itemClickListener.onScanItemClick();
                    break;
                case R.id.btnImport:
                    Logger.Debug("on Import button Clicked");
                    itemClickListener.onImportItemClick();
                    break;
                case R.id.btnExport:
                    Logger.Debug("on Export button Clicked");
                    itemClickListener.onExportItemClick();
                    break;
                case R.id.btnCloud:
                    Logger.Debug("on Cloud button Clicked");
                    itemClickListener.onCloudItemClick();
                    break;
                case R.id.btnUser:
                    Logger.Debug("on User button Clicked");
                    itemClickListener.onUserGuideItemClick();
                    break;
                case R.id.btnHistory:
                    Logger.Debug("on History button Clicked");
                    itemClickListener.onHistoryItemClick();
                    break;

                default:
                    break;
            }
        }
        dismiss();
    }

    public interface ItemClickListener {
        void onMyDMItemClick();

        void onCaptureItemClick();

        void onContactItemClick();

        void onScanItemClick();

        void onImportItemClick();

        void onExportItemClick();

        void onCloudItemClick();

        void onUserGuideItemClick();

        void onHistoryItemClick();
    }
}
