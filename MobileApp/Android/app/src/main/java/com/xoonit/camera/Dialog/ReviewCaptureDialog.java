package com.xoonit.camera.Dialog;

import android.annotation.SuppressLint;
import android.app.Dialog;
import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;

import com.bumptech.glide.Glide;
import com.xoonit.camera.R;
import com.xoonit.camera.XoonitApplication;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;
import com.xoonit.camera.utils.Logger;

import java.util.ArrayList;
import java.util.Objects;

public class ReviewCaptureDialog extends Dialog implements View.OnClickListener {

    private Context mContext;
    private String strAddressCapture;
    private ArrayList<String> imageUrlList;
    private ImageView imageView;
    private ImageButton btnCloseDialog, btnCursor, btnRotationLeft, btnRotationRight, btnZoomIn, btnZoomOut, btnMoreChoiceSettings;
    private ScaleGestureDetector scaleGestureDetector;
    private float minScale = 0.5f;
    private float maxScale = 5.0f;
    //touch to drop & drag
    private float xCoordinate, yCoordinate;
    private int left, top, currentImageIndex = 0;

    public ReviewCaptureDialog(@NonNull Context context, @NonNull ArrayList<String> imageUrlList, @NonNull String resImg) {
        super(context);
        this.mContext = context;
        this.imageUrlList = imageUrlList;
        this.strAddressCapture = resImg;
    }

    @SuppressLint("ClickableViewAccessibility")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.custom_dialog_review_capture);
        Objects.requireNonNull(getWindow()).setLayout(WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.MATCH_PARENT);
        WindowManager.LayoutParams wmlp = getWindow().getAttributes();
        wmlp.flags = WindowManager.LayoutParams.FLAG_DIM_BEHIND;
        getWindow().setAttributes(wmlp);
        getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));

        TextView textAddressCapture = findViewById(R.id.textview_address_document_reviewdialog);
        imageView = findViewById(R.id.imageview_review_dialog_capture);

        textAddressCapture.setText(strAddressCapture);
        loadCurrentImage();
        btnCloseDialog = findViewById(R.id.button_close_dialog);
        btnCursor = findViewById(R.id.cursor_dialog_capture);
        btnRotationLeft = findViewById(R.id.rotation_left_dialog_capture);
        btnRotationRight = findViewById(R.id.rotation_right_dialog_capture);
        btnZoomIn = findViewById(R.id.zoom_in_dialog_capture);
        btnZoomOut = findViewById(R.id.zoom_out_dialog_capture);
        btnMoreChoiceSettings = findViewById(R.id.more_setting_dialog_capture);
        initItemClickListener();
        scaleGestureDetector = new ScaleGestureDetector(mContext, new ScaleListener());

        int[] points = new int[2];
        imageView.getLocationOnScreen(points);
        left = points[0];
        top = points[1];

        imageView.setOnTouchListener((v, event) -> {
            handleTouch(v, event);
            return true;
        });
        FireBaseManagement.logFireBaseEvent(mContext, ConstantFireBaseTracking.REVIEW_IMAGE_DIALOG);

    }

    @Override
    public boolean onTouchEvent(@NonNull MotionEvent event) {
        scaleGestureDetector.onTouchEvent(event);
        return true;
    }

    private void initItemClickListener() {
        btnCloseDialog.setOnClickListener(this);
        btnCursor.setOnClickListener(this);
        btnRotationLeft.setOnClickListener(this);
        btnRotationRight.setOnClickListener(this);
        btnZoomIn.setOnClickListener(this);
        btnZoomOut.setOnClickListener(this);
        btnMoreChoiceSettings.setOnClickListener(this);
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.button_close_dialog: {
                Logger.Debug("on close dialog button clicked");
                this.dismiss();
                break;
            }
            case R.id.cursor_dialog_capture: {
                Logger.Debug(" On Cursor button clicked");
                imageView.setX(left);
                imageView.setY(top);
                imageView.setScaleX(1.0f);
                imageView.setScaleY(1.0f);
                imageView.setRotation(0);
                break;
            }
            case R.id.rotation_left_dialog_capture: {
                Logger.Debug("On rotation left button clicked");
                imageView.setRotation((imageView.getRotation()) + (-90.0f));
                break;
            }
            case R.id.rotation_right_dialog_capture: {
                Logger.Debug("On rotation right button clicked");
                imageView.setRotation((imageView.getRotation()) + (90.0f));
                break;
            }
            case R.id.zoom_in_dialog_capture: {
                Logger.Debug("On zoom in button clicked");
                if (imageView.getScaleX() >= maxScale || imageView.getScaleY() >= maxScale) {
                } else {
                    imageView.setScaleX(imageView.getScaleX() + 0.5f);
                    imageView.setScaleY(imageView.getScaleY() + 0.5f);
                }
                break;
            }
            case R.id.zoom_out_dialog_capture: {
                Logger.Debug("On zoom out button clicked");
                if (imageView.getScaleX() <= minScale || imageView.getScaleY() <= minScale) {
                } else {
                    imageView.setScaleX(imageView.getScaleX() + (-0.5f));
                    imageView.setScaleY(imageView.getScaleY() + (-0.5f));
                }
                break;
            }
            case R.id.more_setting_dialog_capture: {
                Logger.Debug("On more setting button clicked");
                break;
            }

        }
    }

    private class ScaleListener extends ScaleGestureDetector.SimpleOnScaleGestureListener {
        @Override
        public boolean onScale(ScaleGestureDetector scaleGestureDetector) {
            float mScaleFactor = imageView.getScaleX();
            mScaleFactor *= scaleGestureDetector.getScaleFactor();
            mScaleFactor = Math.max(minScale, Math.min(mScaleFactor, maxScale));
            imageView.setScaleX(mScaleFactor);
            imageView.setScaleY(mScaleFactor);
            return true;
        }
    }

    private void loadCurrentImage() {
        if (imageUrlList != null && imageUrlList.size() > 0) {
            Glide.with(XoonitApplication.getInstance().getApplicationContext())
                    .load(imageUrlList.get(currentImageIndex))
                    .into(imageView);
        }
    }

    private void handleTouch(View view, MotionEvent event) {
        if (imageView.getScaleX() > 1.0f && imageView.getScaleY() > 1.0f) {
            switch (event.getAction() & MotionEvent.ACTION_MASK) {
                case MotionEvent.ACTION_DOWN:
                    xCoordinate = view.getX() - event.getRawX();
                    yCoordinate = view.getY() - event.getRawY();
                    break;
                case MotionEvent.ACTION_UP:
                    float x = event.getX();
                    float y = event.getY();
                    break;
                case MotionEvent.ACTION_MOVE:
                    view.animate().x(event.getRawX() + xCoordinate).y(event.getRawY() + yCoordinate).setDuration(0).start();
                    break;
            }
        } else {
            switch (event.getAction() & MotionEvent.ACTION_MASK) {
                case MotionEvent.ACTION_DOWN:
                    xCoordinate = event.getX();
                    break;
                case MotionEvent.ACTION_UP:
                    float distanceX = event.getX() - xCoordinate;
                    if (Math.abs(distanceX) > 250f) {
                        if (distanceX > 0 && (currentImageIndex - 1) >= 0) {
                            Logger.Spam();
                            currentImageIndex = currentImageIndex - 1;
                            loadCurrentImage();
                        } else if (distanceX < 0 && (currentImageIndex + 1) < imageUrlList.size()) {
                            Logger.Spam();
                            currentImageIndex = currentImageIndex + 1;
                            loadCurrentImage();
                        }
                    }
                    break;
                case MotionEvent.ACTION_MOVE:
                    break;
            }
        }

    }

}
