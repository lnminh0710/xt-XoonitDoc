package com.xoonit.camera.Activities;

import android.annotation.SuppressLint;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Build;
import android.os.Handler;
import android.util.Base64;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.GridView;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.widget.AppCompatCheckBox;

import com.squareup.picasso.Picasso;
import com.xoonit.camera.Activities.Base.BaseActivity;
import com.xoonit.camera.Database.DatabaseHelper;
import com.xoonit.camera.Database.Images;
import com.xoonit.camera.Database.ScansContainerItem;
import com.xoonit.camera.Database.ScansImages;
import com.xoonit.camera.Database.UploadImages;
import com.xoonit.camera.Model.UploadImageResponse;
import com.xoonit.camera.R;
import com.xoonit.camera.api.core.ApiCallBack;
import com.xoonit.camera.api.core.ApiClient;
import com.xoonit.camera.fragments.MainActivity;
import com.xoonit.camera.utils.CustomToastUpload;
import com.xoonit.camera.utils.Logger;
import com.xoonit.camera.utils.ScanConstants;

import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.ViewById;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.TimeZone;
import java.util.UUID;

@SuppressLint("Registered")
@EActivity(R.layout.activity_photos)
public class ActivityPhotos extends BaseActivity implements View.OnClickListener, AdapterView.OnItemClickListener, AdapterView.OnItemLongClickListener {
    @ViewById(R.id.btnBack)
    ImageButton btnBack;
    @ViewById(R.id.grid_photos)
    GridView gridviewPhoto;
    @ViewById(R.id.btnUpload)
    ImageButton btnUpload;
    @ViewById(R.id.btnDeleteAll)
    ImageButton btnDeleteAll;
    @ViewById(R.id.btnGroup)
    ImageButton btnGroup;
    @ViewById(R.id.btnCancel)
    TextView txtCancel;
    @ViewById(R.id.progress_upload)
    ProgressBar progressBarUpload;
    @ViewById(R.id.upload_image)
    Button BtnUploadImg;
    private AppCompatCheckBox checkBox;
    private DatabaseHelper databaseHelper;
    private CustomPhotoAdapter customPhotoAdapter;
    private ArrayList<ScansImages> scansImagesList;
    private Thread thread;
    private Handler handler;
    private boolean isUploadSuccess = true;
    private BroadcastReceiver broadcastReceiver;

    private void init() {
        databaseHelper = new DatabaseHelper(this);
        btnGroup.setOnClickListener(this);
        BtnUploadImg.setOnClickListener(this);
        btnDeleteAll.setOnClickListener(this);
        gridviewPhoto.setOnItemClickListener(this);
        gridviewPhoto.setOnItemLongClickListener(this);
        initGridview();
    }

    private void initGridview() {
        scansImagesList = databaseHelper.getScansImagesSingle();
        customPhotoAdapter = new CustomPhotoAdapter(this, R.layout.custom_photos, scansImagesList);
        gridviewPhoto.setAdapter(customPhotoAdapter);
        if (scansImagesList.size() > 0) {
            // click item and enable checkbox
            customPhotoAdapter.checkAllCheckBox(true);
            customPhotoAdapter.showAllCheckBox(true);
            BtnUploadImg.setEnabled(true);
            BtnUploadImg.setVisibility(View.VISIBLE);
            btnBack.setVisibility(View.INVISIBLE);
            txtCancel.setVisibility(View.VISIBLE);

            gridviewPhoto.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                @Override
                public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                    checkBox = view.findViewById(R.id.checkbox_photos);
                    checkBox.performClick();
                    if (checkBox.isChecked()) {
                        scansImagesList.get(position).setCheckboxState(true);
                    } else {
                        scansImagesList.get(position).setCheckboxState(false);
                    }
                }
            });
        } else {
            btnBack.setVisibility(View.VISIBLE);
            txtCancel.setVisibility(View.INVISIBLE);
            BtnUploadImg.setEnabled(false);
            BtnUploadImg.setVisibility(View.GONE);
        }
        txtCancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                editUi();
            }
        });
        btnBack.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intentBack = new Intent(ActivityPhotos.this, MainActivity.class);
                startActivity(intentBack);
            }
        });
    }

    private void registerNetworkBroadcastForNougat() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            registerReceiver(broadcastReceiver, new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION));
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            registerReceiver(broadcastReceiver, new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION));
        }
    }

    protected void unregisterNetworkChanges() {
        try {
            unregisterReceiver(broadcastReceiver);
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        registerNetworkBroadcastForNougat();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        unregisterNetworkChanges();
    }

    @Override
    protected void afterViews() {
        init();
    }

    @Override
    public void onClick(View v) {
        int id = v.getId();
        switch (id) {
            case R.id.upload_image: {
                try {
                    UploadCloud(v);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    @SuppressLint("RestrictedApi")
    private void editUi() {
        customPhotoAdapter.showAllCheckBox(false);
        customPhotoAdapter.checkAllCheckBox(false);
        btnBack.setVisibility(View.VISIBLE);
        txtCancel.setVisibility(View.INVISIBLE);
        BtnUploadImg.setEnabled(false);
        BtnUploadImg.setVisibility(View.GONE);
        gridviewPhoto.setOnItemClickListener(this);
    }

    public void UploadCloud(@Nullable View view) throws IOException {
        ArrayList<UploadImages> requestArray = new ArrayList<>();
        if (scansImagesList != null && scansImagesList.size() > 0) {
            //region Upload Single Mode
            for (int i = 0; i < scansImagesList.size(); i++) {
                Log.d("CheckboxState", "Position: " + i + "checkstate: " + scansImagesList.get(i).getCheckboxState());
                if (scansImagesList.get(i).getCheckboxState()) {
                    List<Images> imagesArrayList = new ArrayList<>();
                    ScansImages scansImages = scansImagesList.get(i);
                    File file = new File(scansImages.getImagePath(), scansImages.getImageName());
                    byte[] bytes = convertFiletoByteArray(file);
                    String basre64_string = Base64.encodeToString(bytes, Base64.DEFAULT);
                    String strbase64 = basre64_string.replace("\n", "");
                    Images images = new Images();
                    images.setBase64_string(strbase64);
                    String filename = scansImages.getImageName();
                    images.setFileName(filename);
                    imagesArrayList.add(images);
                    // add ImagesArraylist to uploadRequest
                    UploadImages Request = new UploadImages();
                    Request.setImages(imagesArrayList);
                    //create ScanContainer
                    Request.setScanningLotItemData(getScanImagesRequest(scansImages.getIdRepScansDocumentType()));
                    //add single images to request
                    requestArray.add(Request);
                }
            }
            if (requestArray.size() > 0) {
                startProgressBar(requestArray.size());
                //Run async task
                if (isOnline(getApplicationContext())) {
                    for (UploadImages requestsItem : requestArray) {
                        uploadImageToServer(requestsItem);
                    }

                }
                //Reset
                ScanConstants.CurrentLotId = 0;
                ScanConstants.CurrentIdScansContainerItem = 0;
                ScanConstants.CurrentPageNr = 0;
            }
        }

    }

    private byte[] convertFiletoByteArray(File file) throws IOException {
        byte[] bytes = new byte[(int) file.length()];
        FileInputStream fis = null;
        try {
            fis = new FileInputStream(file);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        fis.read(bytes);
        fis.close();
        return bytes;
    }

    private boolean isOnline(Context context) {
        try {
            ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
            NetworkInfo netInfo = null;
            if (cm != null) {
                netInfo = cm.getActiveNetworkInfo();
            }
            //should check null because in airplane mode it will be null
            return (netInfo != null && netInfo.isConnected());
        } catch (NullPointerException e) {
            e.printStackTrace();
            return false;
        }

    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        Intent i = new Intent(ActivityPhotos.this, MainActivity.class);
        startActivity(i);
        finish();
    }

    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        AlertDialog.Builder builder = new AlertDialog.Builder(ActivityPhotos.this);
        view = getLayoutInflater().inflate(R.layout.custom_dialog_review, null);
        builder.setView(view);
        final AlertDialog dialogs = builder.create();

        ImageView img = view.findViewById(R.id.img_dialog);
        ImageButton btnclose = view.findViewById(R.id.button_close_dialog);

        ScansImages scansImages = scansImagesList.get(position);
        File image = new File(scansImages.getImagePath(), scansImages.getImageName());
        btnclose.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                dialogs.dismiss();
            }
        });

        Picasso.with(getApplicationContext())
                .load(image)
                .noFade()
                .fit()
                .into(img);

        dialogs.requestWindowFeature(Window.FEATURE_NO_TITLE);
        Objects.requireNonNull(dialogs.getWindow()).setLayout(WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.MATCH_PARENT);
        WindowManager.LayoutParams wmlp = dialogs.getWindow().getAttributes();
        wmlp.gravity = Gravity.TOP | Gravity.CENTER;
        wmlp.y = 50;
        dialogs.getWindow().setAttributes(wmlp);
        dialogs.getWindow().addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND);
        dialogs.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        dialogs.show();
    }

    @SuppressLint("RestrictedApi")
    @Override
    public boolean onItemLongClick(AdapterView<?> parent, View view, int position, long id) {
        // click item and enable checkbox
        customPhotoAdapter.checkAllCheckBox(true);
        customPhotoAdapter.showAllCheckBox(true);
        btnBack.setVisibility(View.INVISIBLE);
        txtCancel.setVisibility(View.VISIBLE);
        BtnUploadImg.setVisibility(View.VISIBLE);
        BtnUploadImg.setEnabled(true);
        gridviewPhoto.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {

                checkBox = view.findViewById(R.id.checkbox_photos);
                checkBox.performClick();
                if (checkBox.isChecked()) {
                    customPhotoAdapter.getItem(position).setCheckboxState(true);
                } else {
                    customPhotoAdapter.getItem(position).setCheckboxState(false);
                }
            }
        });
        return true;
    }

    private void startProgressBar(int arrayList) {
        progressBarUpload.setProgress(0);
        progressBarUpload.setMax(arrayList);
        progressBarUpload.setVisibility(View.VISIBLE);
        Logger.Spam();
        thread = new Thread(() -> {
            try {
                while (progressBarUpload.getProgress() <= progressBarUpload
                        .getMax()) {
                    Logger.Spam();
                    Thread.sleep(200);
                    if (progressBarUpload.getProgress() == progressBarUpload
                            .getMax()) {
                        Logger.Spam();
                    }
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        thread.start();
    }

    private void incrementLoadingProgress() {
        if (progressBarUpload != null && this != null) {
            Logger.Spam();
            progressBarUpload.incrementProgressBy(1);
            handler = new Handler();
            handler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    if (progressBarUpload.getProgress() == progressBarUpload.getMax()) {
                        progressBarUpload.setVisibility(View.GONE);
                        if (isUploadSuccess) {
                            CustomToastUpload.makeText(ActivityPhotos.this, "Successfully uploaded ! ", Toast.LENGTH_SHORT).show();
                        } else {
                            CustomToastUpload.makeErrorText(ActivityPhotos.this, "Upload failed ! ", Toast.LENGTH_SHORT).show();
                        }
                    }
                }

            }, 200);

        }
//            tvCount.setText(mContext.getString(R.string.upload_count, progressBar.getProgress(), maxValue));
    }

    private void onUploadImageResponse(UploadImages uploadImages, UploadImageResponse uploadImageResponse) {
        Logger.Debug("Upload image success: " + uploadImageResponse);
        uploadImageResponse.getItem();
        if (uploadImageResponse.getItem().getResult() != null && uploadImageResponse.getItem().getResult().isSuccess()) {
            if (uploadImages.getImages().size() == 1) {
                for (ScansImages scanImage : scansImagesList) {
                    if (scanImage.getImageName().equals(uploadImages.getImages().get(0).getFileName())) {
                        databaseHelper.deleteSingleScansImagesbyId(scanImage.getIdScansImage());
                        scansImagesList.remove(scanImage);
                        customPhotoAdapter.notifyDataSetChanged();
                        break;
                    }
                }
            }
        } else {
            onUploadImageFailed(uploadImages.getImages().get(0).getFileName());
        }
    }

    private void onUploadImageFailed(String fileName) {
        isUploadSuccess = false;
        Logger.Debug("Upload image failed: " + fileName);
        Toast.makeText(getApplicationContext(), "Fail to upload image: " + fileName, Toast.LENGTH_SHORT).show();
    }


    private void uploadImageToServer(UploadImages uploadImages) {
        String token = mSharePref.accessToken().getOr("");
        if (token != null) {
            ApiClient.getService().uploadImage(uploadImages)
                    .enqueue(new ApiCallBack<UploadImageResponse>(this) {
                        @Override
                        public void success(UploadImageResponse uploadImageResponse) {
                            onUploadImageResponse(uploadImages, uploadImageResponse);
                            incrementLoadingProgress();
                        }

                        @Override
                        public void failure(List<String> listError) {
                            onUploadImageFailed(uploadImages.getImages().get(0).getFileName());
                            incrementLoadingProgress();
                        }
                    });
        }
    }

    private ScansContainerItem getScanImagesRequest(int idRepScansDocumentType) {
        ScansContainerItem scansContainerItem = new ScansContainerItem();
        scansContainerItem.setIdRepScansContainerType(1);
        scansContainerItem.setIdRepScanDeviceType(2);
        scansContainerItem.setCustomerNr("1");
        scansContainerItem.setMediaCode("1");
        TimeZone tz1 = TimeZone.getTimeZone("UTC");
        SimpleDateFormat sdformat2 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
        sdformat2.setTimeZone(tz1);
        scansContainerItem.setScannedDateUTC(sdformat2.format(new Date()));
        scansContainerItem.setCoordinatePageNr(0);
//        scansItemMulti.setNumberOfImages(ScanConstants.GroupNr);
        scansContainerItem.setNumberOfImages(1);
        scansContainerItem.setSourceScanGUID(UUID.randomUUID().toString());
        scansContainerItem.setSynced(true);
        scansContainerItem.setIsActive("1");
        scansContainerItem.setUserClicked(true);
        scansContainerItem.setIdRepScansDocumentType(1);
        return scansContainerItem;
    }

}
