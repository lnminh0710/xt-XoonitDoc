package com.caminada.camera.utils;

import android.app.Activity;
import android.app.Dialog;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.text.TextUtils;
import android.view.View;
import android.view.Window;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.caminada.camera.R;

import java.io.IOException;

public class GeneralMethods {
    public interface MessageDialogButtonListener {
        void onOKButtonPressed() throws IOException;

        void onCancelButtonPressed();
    }
    public static void showCommonPopup(String message, String redMessage, boolean isShowHeader, boolean isShowCancelButton, Activity context, MessageDialogButtonListener messageDialogButtonListener) {
        context.runOnUiThread(new Runnable() {
            public void run() {
                Dialog dialog = new Dialog(context);
                dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
                dialog.setCancelable(false);
                dialog.setContentView(R.layout.popup_common);
                dialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
                //this is custom dialog
                //custom_popup_dialog contains textview only
//        View customView = layoutInflater.inflate(R.layout.popup_common, null);
                // reference the textview of custom_popup_dialog
                TextView tvRed = dialog.findViewById(R.id.tvRedText);
                TextView tvBlack = dialog.findViewById(R.id.tvBlackText);
                TextView btnOK = dialog.findViewById(R.id.tvOK);
                TextView btnCancel = dialog.findViewById(R.id.tvCancel);
                TextView tvHeader = dialog.findViewById(R.id.tvHeader);
                LinearLayout lnHeader = dialog.findViewById(R.id.lnHeader);

                if (!TextUtils.isEmpty(message)) {
                    tvBlack.setText(message);
                }
                if (!TextUtils.isEmpty(redMessage)) {
                    tvRed.setText(redMessage);
                } else {
                    tvBlack.setTextAlignment(View.TEXT_ALIGNMENT_CENTER);
                }

                if (isShowHeader) {
                    lnHeader.setVisibility(View.VISIBLE);
                } else {
                    lnHeader.setVisibility(View.GONE);
                }
                if (isShowCancelButton) {
                    btnCancel.setVisibility(View.VISIBLE);
                } else {
                    btnCancel.setVisibility(View.GONE);
                    btnOK.setBackgroundResource(R.drawable.bg_blue_dark_round_bottom_corner);
                }
                btnOK.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        dialog.dismiss();
                        try {
                            messageDialogButtonListener.onOKButtonPressed();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                });
                btnCancel.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        messageDialogButtonListener.onCancelButtonPressed();
                        dialog.dismiss();
                    }
                });
                dialog.show();
            }
        });

    }
}
