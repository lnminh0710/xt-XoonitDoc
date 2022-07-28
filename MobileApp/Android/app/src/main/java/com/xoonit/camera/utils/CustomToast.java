package com.xoonit.camera.utils;

import android.content.Context;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.PopupWindow;
import android.widget.TextView;

import com.bumptech.glide.Glide;
import com.xoonit.camera.R;
import com.xoonit.camera.XoonitApplication;

public class CustomToast {
    private static float toastDY = 0, toastPreY = 0;
    public static PopupWindow toastError;

    public static void showToastError(Context context,
                                      boolean showCloseButton,
                                      String errorText,
                                      String buttonText, int currentView) {
        // inflate the layout of the popup window
        LayoutInflater inflater = (LayoutInflater)
                context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View popupView = inflater.inflate(R.layout.layout_error_toast, null);
        ImageView imgErrorToast = popupView.findViewById(R.id.imgErrorToast);
        Glide.with(XoonitApplication.getInstance().getApplicationContext()).load(R.drawable.icon_warning).into(imgErrorToast);
        initToast(inflater, popupView, showCloseButton, errorText, buttonText, currentView);
    }

    public static void showToastInfo(Context context,
                                     boolean showCloseButton,
                                     String infoText,
                                     String buttonText, int currentView) {
        // inflate the layout of the popup window
        LayoutInflater inflater = (LayoutInflater)
                context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View popupView = inflater.inflate(R.layout.layout_error_toast, null);
        ImageView imgErrorToast = popupView.findViewById(R.id.imgErrorToast);

        Glide.with(XoonitApplication.getInstance().getApplicationContext()).load(R.drawable.icon_round_check_green).into(imgErrorToast);
        initToast(inflater, popupView, showCloseButton, infoText, buttonText, currentView);
    }

    public static void showToastError(Context context,
                                      boolean showCloseButton,
                                      String errorText, int currentView) {
        // inflate the layout of the popup window
        LayoutInflater inflater = (LayoutInflater)
                context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View popupView = inflater.inflate(R.layout.layout_error_toast, null);
        ImageView imgErrorToast = popupView.findViewById(R.id.imgErrorToast);
        Glide.with(XoonitApplication.getInstance().getApplicationContext()).load(R.drawable.icon_warning).into(imgErrorToast);
        initToast(inflater, popupView, showCloseButton, errorText, "", currentView);
    }

    public static void showToastInfo(Context context,
                                     boolean showCloseButton,
                                     String infoText,  int currentView) {
        // inflate the layout of the popup window
        LayoutInflater inflater = (LayoutInflater)
                context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View popupView = inflater.inflate(R.layout.layout_error_toast, null);
        ImageView imgErrorToast = popupView.findViewById(R.id.imgErrorToast);

        Glide.with(XoonitApplication.getInstance().getApplicationContext()).load(R.drawable.icon_round_check_green).into(imgErrorToast);
        initToast(inflater, popupView, showCloseButton, infoText, "", currentView);
    }

    private static void initToast(LayoutInflater inflater, View popupView, boolean showCloseButton, String errorText, String buttonText, int currentView) {
        if (CustomToast.toastError != null) {
            CustomToast.toastError.dismiss();
        }
        TextView tvToastClose = popupView.findViewById(R.id.tvToastClose);
        TextView tvErrorToast = popupView.findViewById(R.id.tvErrorToast);
        if (showCloseButton) {
            tvToastClose.setVisibility(View.VISIBLE);
            if (!TextUtils.isEmpty(buttonText)) {
                tvToastClose.setText(buttonText);
            }
        } else {
            tvToastClose.setVisibility(View.GONE);
        }
        tvErrorToast.setText(errorText);
        View view = inflater.inflate(currentView, null);
        // create the popup window
        int width = LinearLayout.LayoutParams.MATCH_PARENT;
        int height = LinearLayout.LayoutParams.WRAP_CONTENT;
        boolean focusable = false; // lets taps outside the popup also dismiss it
        CustomToast.toastError = new PopupWindow(popupView, width, height, focusable);

        // show the popup window
        // which view you pass in doesn't matter, it is only used for the window token
        CustomToast.toastError.showAtLocation(view, Gravity.TOP, 0, MathUtils.dp2px(XoonitApplication.getInstance().getApplicationContext(), 70));

        // dismiss the popup window when touched
        popupView.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View view, MotionEvent motionEvent) {
                switch (motionEvent.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        CustomToast.toastDY = view.getY() - motionEvent.getRawY();
                        CustomToast.toastPreY = view.getY();
                        Logger.Debug(CustomToast.toastDY + "");
                        Logger.Debug(CustomToast.toastPreY + "");
                        break;

                    case MotionEvent.ACTION_MOVE:
                        Logger.Debug("view.getY(): " + view.getY() + "motionEvent.getRawY() " + motionEvent.getRawY());
                        Logger.Debug(CustomToast.toastDY + "");
                        Logger.Debug(CustomToast.toastPreY + "");
                        if (view.getY() - motionEvent.getRawY() > CustomToast.toastDY) {
                            view.animate()
                                    .y(motionEvent.getRawY() + CustomToast.toastDY)
                                    .setDuration(0)
                                    .start();
                        }
                        break;

                    case MotionEvent.ACTION_UP:
                        if (view.getY() + view.getHeight() <= view.getHeight() / 4.0f) {
                            Logger.Spam();
                            CustomToast.toastError.dismiss();
                        } else {
                            Logger.Spam();
                            view.animate()
                                    .y(CustomToast.toastPreY)
                                    .setDuration(0)
                                    .start();
                        }
                        break;
                }
                return true;
            }
        });

        tvToastClose.setOnClickListener(
                new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        CustomToast.toastError.dismiss();
                    }

                }
        );
    }
}
