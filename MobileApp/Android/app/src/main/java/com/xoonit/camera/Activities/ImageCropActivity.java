package com.xoonit.camera.Activities;

import android.app.Activity;
import android.content.Context;
import android.content.ContextWrapper;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.graphics.PointF;
import android.graphics.RectF;
import android.graphics.drawable.BitmapDrawable;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.xoonit.camera.Database.DatabaseHelper;
import com.xoonit.camera.Database.ScansContainer;
import com.xoonit.camera.Database.ScansImages;
import com.xoonit.camera.R;
import com.xoonit.camera.XoonitApplication;
import com.xoonit.camera.fragments.MainActivity;
import com.xoonit.camera.utils.ConstantUtils;
import com.xoonit.camera.utils.Contants;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;
import com.xoonit.camera.utils.NativeClass;
import com.xoonit.camera.utils.PolygonView;
import com.xoonit.camera.utils.ScanConstants;

import org.opencv.core.MatOfPoint2f;
import org.opencv.core.Point;

import java.io.File;
import java.io.FileOutputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class ImageCropActivity extends AppCompatActivity {

    FrameLayout holderImageCrop;
    ImageView imageView;
    PolygonView polygonView;
    Bitmap selectedImageBitmap;
    ImageButton btnImageEnhance;
    DatabaseHelper databaseHelper;
    Toolbar toolbar;
    TextView textHeader;

    NativeClass nativeClass;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        setContentView(R.layout.activity_image_crop);
        initializeElement();
        initialValues();

    }


    private void initializeElement() {
        nativeClass = new NativeClass();
        holderImageCrop = findViewById(R.id.crop_layout);
        toolbar = findViewById(R.id.toolbar_cropimmages);
        setSupportActionBar(toolbar);
        imageView = findViewById(R.id.crop_image);
        polygonView = findViewById(R.id.polygonView);
        databaseHelper = new DatabaseHelper(this);
        textHeader = findViewById(R.id.docHeader);
//        String documentTreeName = XoonitApplication.getInstance().getCurrentDocumentTreeItem().getData().getGroupName();
//        if (TextUtils.isEmpty(documentTreeName)) {
//            documentTreeName = getString(R.string.type_unknown);
//        }
//        textHeader.setText(documentTreeName);
        holderImageCrop.post(new Runnable() {
            @Override
            public void run() {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    initializeCropping();
                }
            }
        });


    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    private void initializeCropping() {

        selectedImageBitmap = Contants.BitmapSelect;
        Bitmap scaledBitmap = scaledBitmap(selectedImageBitmap, holderImageCrop.getWidth(), holderImageCrop.getHeight());
        imageView.setImageBitmap(scaledBitmap);
        Bitmap tempBitmap = ((BitmapDrawable) imageView.getDrawable()).getBitmap();
        Map<Integer, PointF> pointFs = getEdgePoints(tempBitmap);
        polygonView.setPoints(pointFs);
        polygonView.setVisibility(View.VISIBLE);
        int padding = (int) getResources().getDimension(R.dimen.activity_vertical_margin);
        FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(tempBitmap.getWidth() + 2 * padding, tempBitmap.getHeight() + 2 * padding);
        layoutParams.gravity = Gravity.CENTER;
        polygonView.setLayoutParams(layoutParams);

    }


    protected Bitmap getCroppedImage() {

        Map<Integer, PointF> points = polygonView.getPoints();
        float xRatio = (float) selectedImageBitmap.getWidth() / imageView.getWidth();
        float yRatio = (float) selectedImageBitmap.getHeight() / imageView.getHeight();
        float x1 = (points.get(0).x) * xRatio;
        float x2 = (points.get(1).x) * xRatio;
        float x3 = (points.get(2).x) * xRatio;
        float x4 = (points.get(3).x) * xRatio;
        float y1 = (points.get(0).y) * yRatio;
        float y2 = (points.get(1).y) * yRatio;
        float y3 = (points.get(2).y) * yRatio;
        float y4 = (points.get(3).y) * yRatio;

        return nativeClass.getScannedBitmap(selectedImageBitmap, x1, y1, x2, y2, x3, y3, x4, y4);
    }

    private Bitmap scaledBitmap(Bitmap bitmap, int width, int height) {
        Matrix m = new Matrix();
        m.setRectToRect(new RectF(0, 0, bitmap.getWidth(), bitmap.getHeight()), new RectF(0, 0, width, height), Matrix.ScaleToFit.CENTER);
        return Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), m, true);
    }

    private Map<Integer, PointF> getEdgePoints(Bitmap tempBitmap) {
        Map<Integer, PointF> orderedPoints = null;
        try {
            List<PointF> pointFs = getContourEdgePoints(tempBitmap);
            orderedPoints = orderedValidEdgePoints(tempBitmap, pointFs);
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return orderedPoints;

    }

    private List<PointF> getContourEdgePoints(Bitmap tempBitmap) {
        List<PointF> result = new ArrayList<>();
        try {
            MatOfPoint2f point2f = nativeClass.getPoint(tempBitmap);
            List<Point> points = Arrays.asList(point2f.toArray());
            for (int i = 0; i < points.size(); i++) {
                result.add(new PointF(((float) points.get(i).x), ((float) points.get(i).y)));
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        } finally {
            return result;
        }

    }

    private Map<Integer, PointF> getOutlinePoints(Bitmap tempBitmap) {

        Map<Integer, PointF> outlinePoints = new HashMap<>();
        outlinePoints.put(0, new PointF(0, 0));
        outlinePoints.put(1, new PointF(tempBitmap.getWidth(), 0));
        outlinePoints.put(2, new PointF(0, tempBitmap.getHeight()));
        outlinePoints.put(3, new PointF(tempBitmap.getWidth(), tempBitmap.getHeight()));
        return outlinePoints;
    }

    private Map<Integer, PointF> orderedValidEdgePoints(Bitmap tempBitmap, List<PointF> pointFs) {

        Map<Integer, PointF> orderedPoints = polygonView.getOrderedPoints(pointFs);
        if (!polygonView.isValidShape(orderedPoints)) {
            orderedPoints = getOutlinePoints(tempBitmap);
        }
        return orderedPoints;
    }

    public void cropReject(View view) {
        FireBaseManagement.logEventScreenTransition(this,
                ConstantFireBaseTracking.CAMERA_FRAGMENT,
                ConstantFireBaseTracking.IMAGE_CROP_ACTIVITY,
                ConstantFireBaseTracking.ACTION_REJECT_BUTTON);
        finish();
    }

    public void initialValues() {
        new Handler().postDelayed(() -> {
            if (ScanConstants.IsStart) {
                //Alert Dialog
//                    adSelectDoc.show();
                ScanConstants.IsStart = false;
            }
        }, 500);
    }

    public void addDoc(View view) {

        ScanConstants.CropBitmap = getCroppedImage();

        if (ScanConstants.CurrentLotId == 0) {
            int LotId = databaseHelper.getScansContainerMaxNext();
            String lotName = ScanConstants.DefaultUserCompany + "-"
                    + XoonitApplication.getInstance().getSharePref().userName().getOr("");
            ScansContainer scansContainer = new ScansContainer(LotId, lotName);
            ScanConstants.CurrentLotId = databaseHelper.insertScansContainer(scansContainer);
        }

        Date currentDate = new Date();
        String CreateDate = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.sss", Locale.US).format(currentDate);
        String dateInImage = new SimpleDateFormat("ddMMyy_HHmmss", Locale.US).format(currentDate);
        int maxIdImage = databaseHelper.getScansImageMaxNext();
        ScanConstants.CurrentPageNr = ScanConstants.CurrentPageNr + 1;
//        String documentTreeName = XoonitApplication.getInstance().getCurrentDocumentTreeItem().getData().getGroupName();
//        if (TextUtils.isEmpty(documentTreeName)) {
//            documentTreeName = "";
//        } else {
//            documentTreeName = documentTreeName + "_";
//        }
//        XoonitApplication.getInstance().getSharePref().userName().getOr("");
        String ImageName ="rfi_xena" + "_"
                + "Invoices" + "_"
                + dateInImage + ".tiff" + ".png";
        String ImagePath = saveToInternalMemory(ScanConstants.CropBitmap, "Lot" + ScanConstants.CurrentLotId,
                ImageName, ImageCropActivity.this, 100)[0];
        ScansImages scansImages = new ScansImages(maxIdImage
                , ImagePath
                , ImageName
                , CreateDate
                , 0
                , ScanConstants.CurrentPageNr
                , ScanConstants.GroupNr,1);
                //TODO remove harcode for idREP
//                , XoonitApplication.getInstance().getCurrentDocumentTree().getIDDocumentTree());
        databaseHelper.insertScansImage(scansImages);

        ScanConstants.CurrentPageNr = 0;
        FireBaseManagement.logEventScreenTransition(this,
                ConstantFireBaseTracking.HOME_ACTIVITY,
                ConstantFireBaseTracking.IMAGE_CROP_ACTIVITY,
                ConstantFireBaseTracking.ACTION_ACCEPT_BUTTON);
        Intent returnIntent = new Intent();
        returnIntent.putExtra(ConstantUtils.IS_CROP_SUCCESS,true);
        setResult(Activity.RESULT_OK,returnIntent);
        finish();

    }

    public static String[] saveToInternalMemory(Bitmap bitmap, String mFileDirectory, String
            mFileName, Context mContext, int mQuality) {

        String[] mReturnParams = new String[2];
        File mDirectory = getBaseDirectoryFromPathString(mFileDirectory, mContext);
        File mPath = new File(mDirectory, mFileName);
        try {
            FileOutputStream mFileOutputStream = new FileOutputStream(mPath);
//            bitmap.
            //Compress method used on the Bitmap object to write  image to output stream
            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, mFileOutputStream);
            mFileOutputStream.close();
        } catch (Exception e) {

        }
        mReturnParams[0] = mDirectory.getAbsolutePath();
        mReturnParams[1] = mFileName;
        return mReturnParams;
    }

    private static File getBaseDirectoryFromPathString(String mPath, Context mContext) {

        ContextWrapper mContextWrapper = new ContextWrapper(mContext);

        return mContextWrapper.getDir(mPath, Context.MODE_PRIVATE);
    }

    @Override
    public void onBackPressed() {
        Intent intent = new Intent(ImageCropActivity.this, MainActivity.class);
        startActivity(intent);
        finish();

    }
}

