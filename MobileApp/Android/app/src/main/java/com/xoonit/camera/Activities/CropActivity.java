//package com.caminada.camera.Activities;
//
//
//import android.annotation.SuppressLint;
//import android.app.Activity;
//import android.content.Context;
//import android.graphics.Bitmap;
//import android.graphics.Point;
//import android.graphics.PointF;
//import android.os.Bundle;
//import android.util.Log;
//import android.view.Display;
//import android.view.Gravity;fi
//import android.view.Window;
//import android.view.WindowManager;
//import android.widget.FrameLayout;
//import android.widget.ImageView;
//
//import com.caminada.camera.R;
//import com.caminada.camera.utils.Contants;
//
//
//import org.opencv.android.Utils;
//import org.opencv.core.CvType;
//import org.opencv.core.Mat;
//import org.opencv.imgproc.Imgproc;
//
//import java.util.ArrayList;
//import java.util.HashMap;
//import java.util.Map;
//import java.util.Stack;
//
//public class CropActivity extends Activity {
////    public final static Stack<PolygonPoints> allDraggedPointsStack = new Stack<>();
//
//    ImageView ImageCrop;
//    private PolygonView polygonView;
//    private Bitmap CopyBitmap;
//    private FrameLayout frameLayout;
//    private Context context;
//
//    @Override
//    protected void onCreate(Bundle savedInstanceState) {
//        super.onCreate(savedInstanceState);
//        requestWindowFeature(Window.FEATURE_NO_TITLE);
//        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
//        setContentView(R.layout.activity_crop);
//        ImageCrop = findViewById(R.id. crop_image_view);
//        frameLayout = findViewById(R.id.crop_layout);
//        polygonView = findViewById(R.id.polygon_view);
//        CopyBitmap = Contants.BitmapSelect;
//        SelectBitmap(CopyBitmap);
//
//    }
//    private void SelectBitmap(Bitmap bitmap){
//        try {
//            CopyBitmap = bitmap.copy(Bitmap.Config.ARGB_8888, true);
//            // from screen
//            Display display = getWindowManager().getDefaultDisplay();
//            Point size = new Point();
//            display.getSize(size);
//            int screenWidth = (size.x);
//            int screenHeight = (size.y);
//            Log.d("ScreenSize ", "width: " + screenWidth + " height: " + screenHeight);
//            CopyBitmap = ScanUtils.resizeToScreenContentSize(CopyBitmap, screenWidth, screenHeight);
//
//            Mat originalMat = new Mat(screenWidth, screenHeight, CvType.CV_8UC1);
//            Utils.bitmapToMat(CopyBitmap, originalMat);
//            ArrayList<PointF> points;
//            @SuppressLint("UseSparseArrays") Map<Integer, PointF> pointFs = new HashMap<>();
//            try {
//                Quadrilateral quad = ScanUtils.detectLargestQuadrilateral(originalMat);
//                if (null != quad) {
//                    double resultArea = Math.abs(Imgproc.contourArea(quad.contour));
//                    double previewArea = originalMat.rows() * originalMat.cols();
//                    if (resultArea > previewArea * 0.08) {
//                        points = new ArrayList<>();
//                        points.add(new PointF((float) quad.points[0].x, (float) quad.points[0].y));
//                        points.add(new PointF((float) quad.points[1].x, (float) quad.points[1].y));
//                        points.add(new PointF((float) quad.points[3].x, (float) quad.points[3].y));
//                        points.add(new PointF((float) quad.points[2].x, (float) quad.points[2].y));
//                    } else {
//                        points = ScanUtils.getPolygonDefaultPoints(CopyBitmap);
//                    }
//
//                } else {
//                    points = ScanUtils.getPolygonDefaultPoints(CopyBitmap);
//                }
//
//                int index = -1;
//                for (PointF pointF : points) {
//                    pointFs.put(++index, pointF);
//                }
//
//                polygonView.setPoints(pointFs);
//                int padding = (int)getResources().getDimension(R.dimen.scan_padding);
////                FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(copyBitmap.getWidth() , copyBitmap.getHeight() );
//                FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(screenWidth + 2 * padding, (screenHeight + 2 * padding));
//                layoutParams.gravity = Gravity.CENTER;
//                polygonView.setLayoutParams(layoutParams);
////                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT)
////                    TransitionManager.beginDelayedTransition(containerScan);
////                cropLayout.setVisibility(View.VISIBLE);
//                ImageCrop.setImageBitmap(CopyBitmap);
//                ImageCrop.setScaleType(ImageView.ScaleType.FIT_XY);
//            } catch (Exception e) {
//            }
//        } catch (Exception e) {
//
//        }
//    }
//    static {
//        System.loadLibrary("opencv_java3");
//    }
//
//}
//
//
