package com.adityaarora.liveedgedetection.activity;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.PointF;
import android.hardware.Camera;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.view.menu.MenuBuilder;
import android.support.v7.widget.Toolbar;
import android.transition.TransitionManager;
import android.util.Log;
import android.view.Gravity;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.adityaarora.liveedgedetection.Database.DatabaseHelper;
import com.adityaarora.liveedgedetection.Database.ScansContainer;
import com.adityaarora.liveedgedetection.Database.ScansContainerItem;
import com.adityaarora.liveedgedetection.R;
import com.adityaarora.liveedgedetection.Database.ScansImages;
import com.adityaarora.liveedgedetection.constants.ScanConstants;
import com.adityaarora.liveedgedetection.enums.ScanHint;
import com.adityaarora.liveedgedetection.interfaces.IScanner;
import com.adityaarora.liveedgedetection.util.ScanUtils;
import com.adityaarora.liveedgedetection.view.PolygonPoints;
import com.adityaarora.liveedgedetection.view.PolygonView;
import com.adityaarora.liveedgedetection.view.Quadrilateral;
import com.adityaarora.liveedgedetection.view.ScanSurfaceView;
import com.adityaarora.liveedgedetection.util.StringUtils;

import org.opencv.android.Utils;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.Point;
import org.opencv.imgproc.Imgproc;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Stack;

import static android.view.View.GONE;

/**
 * This class initiates btnCamera and detects edges on live view
 */
public class ScanActivity extends AppCompatActivity implements IScanner {

    //region Variables
    private static final String TAG = ScanActivity.class.getSimpleName();
    private static final int MY_PERMISSIONS_REQUEST_CAMERA = 101;

    private ViewGroup containerScan;
    private FrameLayout cameraPreviewLayout;
    private ScanSurfaceView mImageSurfaceView;
    private boolean isPermissionNotGranted;
    private static final String mOpenCvLibrary = "opencv_java3";
    private LinearLayout captureHintLayout;

    public final static Stack<PolygonPoints> allDraggedPointsStack = new Stack<>();
    private PolygonView polygonView;
    private ImageView cropImageView;

    ImageButton btnAddPage;
    ImageButton btnAddDoc;
    ImageButton btnModeSingle;
    ImageButton btnModeMulti;
    private Toolbar toolbarcrop;
    private Toolbar toolbarbottom;
    private Toolbar toolbarcrops;
    private Bitmap copyBitmap;
    private FrameLayout cropLayout;
    private TextView docHeader;
    private DatabaseHelper databaseHelper;
    private AlertDialog adSelectDoc;
    private String typeCreditor;
    private String typeReceivableAccounts;
    private String typeBankSiege;
    private String typeTaxes;
    private String typeExpenseReceipts;
    private String typeVarious;
    private String typeSelectDoc;

    TextView badgeList;
    public List<ScansContainerItem> LstScansContainerItem;
    private String[] permissions;
    //endregion

    //region Activity events
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        setContentView(R.layout.activity_scan);
        init();

    }

    @SuppressLint("SetTextI18n")
    private void init() {
        btnModeSingle = findViewById(R.id.btnModeSingle);
        btnModeMulti = findViewById(R.id.btnModeMulti);
        docHeader = findViewById(R.id.docHeader);
        btnAddPage = findViewById(R.id.btnAddPage);
        btnAddDoc = findViewById(R.id.btnAddDoc);

        containerScan = findViewById(R.id.container_scan);
        cameraPreviewLayout = findViewById(R.id.camera_preview);
        captureHintLayout = findViewById(R.id.capture_hint_layout);
        polygonView = findViewById(R.id.polygon_view);
        cropLayout = findViewById(R.id.crop_layout);
        cropImageView = findViewById(R.id.crop_image_view);
        databaseHelper = new DatabaseHelper(this);
        toolbarcrop = findViewById(R.id.toolbarbottomcrop);


        setSupportActionBar(toolbarcrop);
        toolbarbottom = findViewById(R.id.toolbarbottom);
        setSupportActionBar(toolbarbottom);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        toolbarbottom.setVisibility(View.VISIBLE);

        toolbarcrop.setVisibility(GONE);
        checkCameraPermissions();
        checkScanMode();

        typeCreditor = getString(R.string.type_creditor);
        typeReceivableAccounts = getString(R.string.type_receivable_accounts);
        typeBankSiege = getString(R.string.type_bank_siege);
        typeTaxes = getString(R.string.type_taxes);
        typeExpenseReceipts = getString(R.string.type_expense_receipts);
        typeVarious = getString(R.string.type_various);
        typeSelectDoc = getString(R.string.type_select_doc);

        docHeader.setText(StringUtils.GetDocumentTypeById(this, ScanConstants.IdRepScanDocumentType));
        buildListDocTypeDialog();
        databaseHelper = new DatabaseHelper(this);

        LstScansContainerItem = databaseHelper.getScansContainerItem(ScanConstants.CurrentLotId);
        badgeList = findViewById(R.id.badgeList);
        if (LstScansContainerItem.size() == 0) {
            badgeList.setVisibility(GONE);
        } else {
            badgeList.setText(String.valueOf(LstScansContainerItem.size()));
        }
//        if (ScanConstants.IsStart == true) {
//            //Start LogService
//            Intent intent = new Intent(this, LogService.class);
//            startService(intent);
//        }
        initialValues();
    }

    private void checkCameraPermissions() {
        if (ContextCompat.checkSelfPermission(this,
                Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            isPermissionNotGranted = true;

            if (ActivityCompat.shouldShowRequestPermissionRationale(this,
                    Manifest.permission.CAMERA)) {
                Toast.makeText(this, "Enable btnCamera permission from settings", Toast.LENGTH_SHORT).show();
            } else {
                ActivityCompat.requestPermissions(this,
                        new String[]{Manifest.permission.CAMERA},
                        MY_PERMISSIONS_REQUEST_CAMERA);
            }
        } else {
            if (!isPermissionNotGranted) {

                Camera camera = Camera.open();
                camera.startPreview();
                mImageSurfaceView = new ScanSurfaceView(ScanActivity.this, this);
                cameraPreviewLayout.addView(mImageSurfaceView);
            } else {
                isPermissionNotGranted = false;
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        this.permissions = permissions;
        switch (requestCode) {
            case MY_PERMISSIONS_REQUEST_CAMERA:
                onRequestCamera(grantResults);
                break;
            default:
                break;
        }
    }

    private void onRequestCamera(int[] grantResults) {
        if (grantResults.length > 0
                && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            mImageSurfaceView = new ScanSurfaceView(ScanActivity.this, ScanActivity.this);
                            cameraPreviewLayout.addView(mImageSurfaceView);
                        }
                    });
                }
            }, 10);

        } else {
            Toast.makeText(this, getString(R.string.camera_activity_permission_denied_toast), Toast.LENGTH_SHORT).show();
            this.finish();
        }
    }

    @SuppressLint("RestrictedApi")
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.menu_layout, menu);
        if (menu instanceof MenuBuilder) {

            MenuBuilder menuBuilder = (MenuBuilder) menu;
            menuBuilder.setOptionalIconsVisible(true);
        }
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle item selection
        int itemId = item.getItemId();
        if (itemId == R.id.abouts) {
            try {


                AlertDialog alertDialog = new AlertDialog.Builder(ScanActivity.this).create(); //Read Update
                alertDialog.setTitle("About");
                alertDialog.setMessage("Version 1.0");

                alertDialog.setButton("OK", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int which) {
//                     here you can add functions
                    }
                });

                alertDialog.show();  //<-- See This!
            } catch (Exception ignored) {
            }

            return true;
        }
//        else if (itemId == R.id.settings) {
//            Intent intent = new Intent(ScanActivity.this, SettingActivity.class);
//            startActivity(intent);
//        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    public void displayHint(ScanHint scanHint) {
        captureHintLayout.setVisibility(GONE);
        switch (scanHint) {
            case MOVE_CLOSER:
                //      captureHintText.setText(getResources().getString(R.string.move_closer));
                captureHintLayout.setBackground(getResources().getDrawable(R.drawable.hint_red));
                break;
            case MOVE_AWAY:
                //  captureHintText.setText(getResources().getString(R.string.move_away));
                captureHintLayout.setBackground(getResources().getDrawable(R.drawable.hint_red));
                break;
            case ADJUST_ANGLE:
                //   captureHintText.setText(getResources().getString(R.string.adjust_angle));
                captureHintLayout.setBackground(getResources().getDrawable(R.drawable.hint_red));
                break;
            case FIND_RECT:
                //   captureHintText.setText(getResources().getString(R.string.finding_rect));
                captureHintLayout.setBackground(getResources().getDrawable(R.drawable.hint_white));
//                break;
            case CAPTURING_IMAGE:
                // captureHintText.setText(getResources().getString(R.string.hold_still));
                captureHintLayout.setBackground(getResources().getDrawable(R.drawable.hint_green));
                break;
            case NO_MESSAGE:
                captureHintLayout.setVisibility(GONE);
                break;
            default:
                break;
        }
    }

    @Override
    public void onPictureClicked(final Bitmap bitmap) {
        toolbarbottom.setVisibility(GONE);
        toolbarcrop.setVisibility(View.VISIBLE);
        docHeader.setText(StringUtils.GetDocumentTypeById(this, ScanConstants.IdRepScanDocumentType));

        try {

            btnModeSingle.setEnabled(true);
            btnModeMulti.setEnabled(true);

            copyBitmap = bitmap.copy(Bitmap.Config.ARGB_8888, true);
            // from screen
            int height = getWindow().findViewById(Window.ID_ANDROID_CONTENT).getHeight();
            int width = getWindow().findViewById(Window.ID_ANDROID_CONTENT).getWidth();

            copyBitmap = ScanUtils.resizeToScreenContentSize(copyBitmap, width, height);

            Mat originalMat = new Mat(copyBitmap.getHeight(), copyBitmap.getWidth(), CvType.CV_8UC1);
            Utils.bitmapToMat(copyBitmap, originalMat);
            ArrayList<PointF> points;
            @SuppressLint("UseSparseArrays") Map<Integer, PointF> pointFs = new HashMap<>();
            try {
                Quadrilateral quad = ScanUtils.detectLargestQuadrilateral(originalMat);
                if (null != quad) {
                    double resultArea = Math.abs(Imgproc.contourArea(quad.contour));
                    double previewArea = originalMat.rows() * originalMat.cols();
                    if (resultArea > previewArea * 0.08) {
                        points = new ArrayList<>();
                        points.add(new PointF((float) quad.points[0].x, (float) quad.points[0].y));
                        points.add(new PointF((float) quad.points[1].x, (float) quad.points[1].y));
                        points.add(new PointF((float) quad.points[3].x, (float) quad.points[3].y));
                        points.add(new PointF((float) quad.points[2].x, (float) quad.points[2].y));
                    } else {
                        points = ScanUtils.getPolygonDefaultPoints(copyBitmap);
                    }

                } else {
                    points = ScanUtils.getPolygonDefaultPoints(copyBitmap);
                }

                int index = -1;
                for (PointF pointF : points) {
                    pointFs.put(++index, pointF);
                }

                polygonView.setPoints(pointFs);
                int padding = (int) getResources().getDimension(R.dimen.scan_padding);
                FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(copyBitmap.getWidth() + 2 * padding, copyBitmap.getHeight() + 2 * padding);
//                FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(copyBitmap.getWidth() + 2 * padding, copyBitmap.getHeight());
                layoutParams.gravity = Gravity.CENTER;
                polygonView.setLayoutParams(layoutParams);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT)
                    TransitionManager.beginDelayedTransition(containerScan);
                cropLayout.setVisibility(View.VISIBLE);

                cropImageView.setImageBitmap(copyBitmap);
                cropImageView.setScaleType(ImageView.ScaleType.FIT_XY);
            } catch (Exception e) {
                Log.e(TAG, e.getMessage(), e);
            }
        } catch (Exception e) {
            Log.e(TAG, e.getMessage(), e);
        }
    }
    //endregion

    //region User defined function
    private void buildListDocTypeDialog() {
        try {
            final CharSequence[] items = {typeCreditor, typeReceivableAccounts, typeBankSiege, typeTaxes, typeExpenseReceipts, typeVarious};
            AlertDialog.Builder alertDialogBuilder = new AlertDialog.Builder(ScanActivity.this); //Read Update
            alertDialogBuilder.setTitle(typeSelectDoc);
            int selectedIndex = ScanConstants.IdRepScanDocumentType;
            alertDialogBuilder.setSingleChoiceItems(items, selectedIndex, new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    ScanConstants.IdRepScanDocumentType = which+1;
                    docHeader.setText(StringUtils.GetDocumentTypeById(getApplicationContext(), ScanConstants.IdRepScanDocumentType));
                    if (adSelectDoc != null) {
                        adSelectDoc.cancel();
                    }
                }
            });
            adSelectDoc = alertDialogBuilder.create();
//          adSelectDoc.show();  //<-- See This!
        } catch (Exception ignored) {
        }
    }

    public void selectDocType(View view) {
        adSelectDoc.show();
    }

    public void takePhoto(View view) {
        if (captureHintLayout != null) {
            mImageSurfaceView.autoCapture(ScanHint.CAPTURING_IMAGE);
        }
    }

    private void checkScanMode() {
        if (ScanConstants.ScanMode == 1) {
            btnModeMulti.setImageResource(R.drawable.ic_scan_mode_multi_enabled);
            btnModeSingle.setImageResource(R.drawable.ic_scan_mode_single_selected);
            btnModeSingle.setEnabled(false);
            btnModeMulti.setEnabled(true);
            btnAddPage.setEnabled(false);
            btnAddPage.setImageResource(R.drawable.xt_addimageeenable);
            Toast toast1 = Toast.makeText(getApplicationContext(), getString(R.string.mode_single), Toast.LENGTH_SHORT);
            toast1.setGravity(Gravity.CENTER, 0, 0);
            toast1.show();
        } else {
            btnModeMulti.setImageResource(R.drawable.ic_scan_mode_multi_selected);
            btnModeSingle.setImageResource(R.drawable.ic_scan_mode_single_enabled);
            btnModeSingle.setEnabled(true);
            btnModeMulti.setEnabled(false);
            btnAddPage.setEnabled(true);
            btnAddPage.setImageResource(R.drawable.xt_addimage);
            Toast toast1 = Toast.makeText(getApplicationContext(), getString(R.string.mode_multiple), Toast.LENGTH_SHORT);
            toast1.setGravity(Gravity.CENTER, 0, 0);
            toast1.show();
        }
    }

    public void chooseSingleMode(View view) {
        ScanConstants.ScanMode = 1;
        checkScanMode();
    }

    public void chooseMultipleMode(View view) {
        ScanConstants.ScanMode = 2;
        checkScanMode();
    }

    public void initialValues(){
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                if (ScanConstants.IsStart){
                    //Alert Dialog
                    adSelectDoc.show();

                    ScanConstants.IsStart = false;
                    //Load user
                    if(ScanConstants.CurrentUser == null){
                        ScanConstants.CurrentUser = databaseHelper.getDefaultLocalUser();
                        if (ScanConstants.CurrentUser == null){
                            //Insert user
                            int result = databaseHelper.insertDefaultUser();
                            ScanConstants.CurrentUser = databaseHelper.getDefaultLocalUser();
                        }
                    }

                    //Load setting

                }
            }
        }, 500);
    }

    public void cropReject(View view) {
        cropLayout.setVisibility(View.INVISIBLE);
        TransitionManager.beginDelayedTransition(containerScan);
        mImageSurfaceView.setPreviewCallback();
        toolbarbottom.setVisibility(View.VISIBLE);
    }

    public void addPage(View view) {
        if (ScanConstants.ScanMode == 2) {
            if (ScanConstants.CurrentLotId == 0) {
                int LotId = databaseHelper.getScansContainerMaxNext();
                String lotName = ScanConstants.CurrentUser.getCompany() + "-" + ScanConstants.CurrentUser.getLoginName();
                ScansContainer scansContainer = new ScansContainer(LotId, lotName);
                // Images images = new Images();
                ScanConstants.CurrentLotId = databaseHelper.insertScansContainer(scansContainer);
                //ScanConstants.CurrentLotId = databaseHelper.insertScansImage(images);
            }

            Map<Integer, PointF> points = polygonView.getPoints();
            Bitmap croppedBitmap;

            if (ScanUtils.isScanPointsValid(points)) {
                Point point1 = new Point(points.get(0).x, points.get(0).y);
                Point point2 = new Point(points.get(1).x, points.get(1).y);
                Point point3 = new Point(points.get(2).x, points.get(2).y);
                Point point4 = new Point(points.get(3).x, points.get(3).y);
                croppedBitmap = ScanUtils.enhanceReceipt(copyBitmap, point1, point2, point3, point4);
            } else {
                croppedBitmap = copyBitmap;
            }

            Date currentDate = new Date();
            String CreateDate = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.sss").format(currentDate);
            String dateInImage = new SimpleDateFormat("yyMMdd").format(currentDate);

            int maxItemId = ScanConstants.CurrentIdScansContainerItem;
            ScanConstants.CurrentPageNr = ScanConstants.CurrentPageNr + 1;
            if (ScanConstants.CurrentIdScansContainerItem == 0) {
                maxItemId = databaseHelper.getScansContainerItemMaxNext();
            }
            String ImageName = ScanConstants.CurrentUser.getCompany() + ScanConstants.CurrentUser.getUserCode() + "_" + StringUtils.GetDocumentCodeById(ScanConstants.IdRepScanDocumentType) + "-" + dateInImage + "_" + maxItemId + ".tiff." + ScanConstants.CurrentPageNr + ".png";
            String ImagePath = ScanUtils.saveToInternalMemory(croppedBitmap, "Lot" + ScanConstants.CurrentLotId,
                    ImageName, ScanActivity.this, 90)[0];

            //TODO: Need filename + filepath, and convert to TIFF
            if (ScanConstants.CurrentIdScansContainerItem == 0) {
                ScansContainerItem scansContainerItem = new ScansContainerItem(maxItemId,
                        ScanConstants.CurrentLotId, ImageName, ImagePath,
                        ScanConstants.IdRepScanDocumentType, CreateDate, ScanConstants.EditText);
                ScanConstants.CurrentIdScansContainerItem = databaseHelper.insertScansContainerItem(scansContainerItem);
            }

//            databaseHelper.updateScansContainerItem(maxItemId, )

            int maxIdImage = databaseHelper.getScansImageMaxNext();
            ScansImages scansImages = new ScansImages(maxIdImage, ImagePath, ImageName, CreateDate, ScanConstants.CurrentIdScansContainerItem, ScanConstants.CurrentPageNr);
            databaseHelper.insertScansImage(scansImages);
            Intent intent = new Intent(getApplicationContext(), ScanActivity.class);
            startActivity(intent);
        }
    }

    public void addDoc(View view) {
        if (ScanConstants.ScanMode == 2 | ScanConstants.ScanMode == 1) {
            if (ScanConstants.CurrentLotId == 0) {
                int LotId = databaseHelper.getScansContainerMaxNext();
                String lotName = ScanConstants.CurrentUser.getCompany() + "-" + ScanConstants.CurrentUser.getLoginName();
                ScansContainer scansContainer = new ScansContainer(LotId, lotName);
                ScanConstants.CurrentLotId = databaseHelper.insertScansContainer(scansContainer);
            }

            Map<Integer, PointF> points = polygonView.getPoints();
            Bitmap croppedBitmap;

            if (ScanUtils.isScanPointsValid(points)) {
                Point point1 = new Point(points.get(0).x, points.get(0).y);
                Point point2 = new Point(points.get(1).x, points.get(1).y);
                Point point3 = new Point(points.get(2).x, points.get(2).y);
                Point point4 = new Point(points.get(3).x, points.get(3).y);
                croppedBitmap = ScanUtils.enhanceReceipt(copyBitmap, point1, point2, point3, point4);
            } else {
                croppedBitmap = copyBitmap;
            }

            Date currentDate = new Date();
            String CreateDate = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.sss").format(currentDate);
            String dateInImage = new SimpleDateFormat("yyMMdd").format(currentDate);

            int maxItemId = ScanConstants.CurrentIdScansContainerItem;
            if (ScanConstants.CurrentIdScansContainerItem == 0) {
                maxItemId = databaseHelper.getScansContainerItemMaxNext();
            }
            ScanConstants.CurrentPageNr = ScanConstants.CurrentPageNr + 1;
            String ImageName = ScanConstants.CurrentUser.getCompany() + ScanConstants.CurrentUser.getUserCode() + "_" + StringUtils.GetDocumentCodeById(ScanConstants.IdRepScanDocumentType) + "-" + dateInImage + "_" + maxItemId + ".tiff." + ScanConstants.CurrentPageNr + ".png";
            String ImagePath = ScanUtils.saveToInternalMemory(croppedBitmap, "Lot" + ScanConstants.CurrentLotId,
                    ImageName, ScanActivity.this, 90)[0];


            //TODO: Need filename + filepath, and convert to TIFF
//                int maxItemId = databaseHelper.getScansContainerItemMaxNext();
            if (ScanConstants.CurrentIdScansContainerItem == 0) {
                ScansContainerItem scansContainerItem = new ScansContainerItem(maxItemId, ScanConstants.CurrentLotId, ImageName, ImagePath, ScanConstants.IdRepScanDocumentType, CreateDate, ScanConstants.EditText);
                ScanConstants.CurrentIdScansContainerItem = databaseHelper.insertScansContainerItem(scansContainerItem);
            }

            int maxIdImage = databaseHelper.getScansImageMaxNext();
            ScansImages scansImages = new ScansImages(maxIdImage, ImagePath, ImageName, CreateDate, ScanConstants.CurrentIdScansContainerItem, ScanConstants.CurrentPageNr);
            databaseHelper.insertScansImage(scansImages);
            // Reset btnModeSingle id
            ScanConstants.CurrentIdScansContainerItem = 0;
            ScanConstants.CurrentPageNr = 0;
            Intent intent = new Intent(ScanActivity.this, ScanActivity.class);
            startActivity(intent);
        }
    }

    public void cropAccept(View view) {
        // Step1: Create lot
        if (ScanConstants.CurrentLotId == 0) {
            int LotId = databaseHelper.getScansContainerMaxNext();
            String lotName = ScanConstants.CurrentUser.getCompany() + "-" + ScanConstants.CurrentUser.getLoginName();
            ScansContainer scansContainer = new ScansContainer(LotId, lotName);
            ScanConstants.CurrentLotId = databaseHelper.insertScansContainer(scansContainer);
        }

        if (ScanConstants.ScanMode == 1) {
            // Step2: Save scan image
            Map<Integer, PointF> points = polygonView.getPoints();

            Bitmap croppedBitmap;

            if (ScanUtils.isScanPointsValid(points)) {
                Point point1 = new Point(points.get(0).x, points.get(0).y);
                Point point2 = new Point(points.get(1).x, points.get(1).y);
                Point point3 = new Point(points.get(2).x, points.get(2).y);
                Point point4 = new Point(points.get(3).x, points.get(3).y);
                croppedBitmap = ScanUtils.enhanceReceipt(copyBitmap, point1, point2, point3, point4);
            } else {
                croppedBitmap = copyBitmap;
            }

            Date currentDate = new Date();
            String CreateDate = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.sss").format(currentDate);
            String dateInImage = new SimpleDateFormat("yyMMdd").format(currentDate);

            int maxItemId = databaseHelper.getScansContainerItemMaxNext();
            ScanConstants.CurrentPageNr = ScanConstants.CurrentPageNr + 1;
            String ImageName = ScanConstants.CurrentUser.getCompany() + ScanConstants.CurrentUser.getUserCode() + "_" + StringUtils.GetDocumentCodeById(ScanConstants.IdRepScanDocumentType) + "-" + dateInImage + "_" + maxItemId + ".tiff." + ScanConstants.CurrentPageNr + ".png";
            String ImagePath = ScanUtils.saveToInternalMemory(croppedBitmap, "Lot" + ScanConstants.CurrentLotId,
                    ImageName, ScanActivity.this, 90)[0];

            // Step2: Create Scans Item
            if (ScanConstants.CurrentIdScansContainerItem == 0) {
                ScansContainerItem scansContainerItem = new ScansContainerItem(maxItemId, ScanConstants.CurrentLotId, ImageName, ImagePath, ScanConstants.IdRepScanDocumentType, CreateDate, ScanConstants.EditText);
                ScanConstants.CurrentIdScansContainerItem = databaseHelper.insertScansContainerItem(scansContainerItem);
            }
            // Save image into database
            int maxIdImage = databaseHelper.getScansImageMaxNext();
            ScansImages scansImages = new ScansImages(maxIdImage, ImagePath, ImageName, CreateDate, ScanConstants.CurrentIdScansContainerItem, ScanConstants.CurrentPageNr);
            databaseHelper.insertScansImage(scansImages);
        } else if (ScanConstants.ScanMode == 2) {
            if (ScanConstants.CurrentLotId == 0) {
                int LotId = databaseHelper.getScansContainerMaxNext();
                String lotName = ScanConstants.CurrentUser.getCompany() + "-" + ScanConstants.CurrentUser.getLoginName();
                ScansContainer scansContainer = new ScansContainer(LotId, lotName);
                ScanConstants.CurrentLotId = databaseHelper.insertScansContainer(scansContainer);
            }


            Map<Integer, PointF> points = polygonView.getPoints();
            Bitmap croppedBitmap;

            if (ScanUtils.isScanPointsValid(points)) {
                Point point1 = new Point(points.get(0).x, points.get(0).y);
                Point point2 = new Point(points.get(1).x, points.get(1).y);
                Point point3 = new Point(points.get(2).x, points.get(2).y);
                Point point4 = new Point(points.get(3).x, points.get(3).y);
                croppedBitmap = ScanUtils.enhanceReceipt(copyBitmap, point1, point2, point3, point4);
            } else {
                croppedBitmap = copyBitmap;
            }

            Date currentDate = new Date();
            String CreateDate = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.sss").format(currentDate);
            String dateInImage = new SimpleDateFormat("yyMMdd").format(currentDate);

            int maxItemId = ScanConstants.CurrentIdScansContainerItem;
            if (ScanConstants.CurrentIdScansContainerItem == 0) {
                maxItemId = databaseHelper.getScansContainerItemMaxNext();
            }
            ScanConstants.CurrentPageNr = ScanConstants.CurrentPageNr + 1;
            String ImageName = ScanConstants.CurrentUser.getCompany() + ScanConstants.CurrentUser.getUserCode() + "_" + StringUtils.GetDocumentCodeById(ScanConstants.IdRepScanDocumentType) + "-" + dateInImage + "_" + maxItemId + ".tiff." + ScanConstants.CurrentPageNr + ".png";
            String ImagePath = ScanUtils.saveToInternalMemory(croppedBitmap, "Lot" + ScanConstants.CurrentLotId,
                    ImageName, ScanActivity.this, 90)[0];

            //TODO: Need filename + filepath, and convert to TIFF
            if (ScanConstants.CurrentIdScansContainerItem == 0) {
                ScansContainerItem scansContainerItem = new ScansContainerItem(maxItemId, ScanConstants.CurrentLotId, ImageName, ImagePath, ScanConstants.IdRepScanDocumentType, CreateDate, ScanConstants.EditText);
                ScanConstants.CurrentIdScansContainerItem = databaseHelper.insertScansContainerItem(scansContainerItem);
            }

            int maxIdImage = databaseHelper.getScansImageMaxNext();
            ScansImages scansImages = new ScansImages(maxIdImage, ImagePath, ImageName, CreateDate, ScanConstants.CurrentIdScansContainerItem, ScanConstants.CurrentPageNr);
            databaseHelper.insertScansImage(scansImages);
        }

        // Reset btnModeSingle id
        ScanConstants.CurrentIdScansContainerItem = 0;
        ScanConstants.CurrentPageNr = 0;
        // Go to last screen
        Intent intent = new Intent(ScanActivity.this, ListViewActivity.class);
        startActivity(intent);
    }

    public void listDoc(View view){
        // Go to last screen
        Intent intent = new Intent(ScanActivity.this, ListViewActivity.class);
        startActivity(intent);
    }
    //endregion

    static {
        System.loadLibrary(mOpenCvLibrary);
    }
}



