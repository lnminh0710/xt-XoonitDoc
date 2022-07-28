package com.xoonit.camera.utils;

import android.app.Dialog;
import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.view.Window;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.xoonit.camera.R;

import java.util.Objects;

public class LoadingDialog {
    private static LoadingDialog sInstance;
    private Dialog progressDialog = null;
    private ProgressBar progressBar;
    private TextView tvCount;
    private Context mContext;
    private Thread thread;
    private int maxValue;

    public static LoadingDialog getInstance() {
        if (sInstance == null) {
            sInstance = new LoadingDialog();
        }
        return sInstance;
    }

    public void showLoadingDialog(Context context, int max, String title) {
        mContext = context;
        maxValue = max;
        progressDialog = new Dialog(context);
        progressDialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        progressDialog.setContentView(R.layout.loading_dialog);
        progressDialog.setCancelable(false);
        Objects.requireNonNull(progressDialog.getWindow()).setBackgroundDrawable(
                new ColorDrawable(Color.TRANSPARENT));

        progressBar = progressDialog
                .findViewById(R.id.pbProgressBar);
        TextView tvTitle = progressDialog
                .findViewById(R.id.tvTitle);
        tvCount = progressDialog
                .findViewById(R.id.tvCount);

        tvTitle.setText(title);
        tvCount.setText(context.getString(R.string.upload_count, 0, maxValue));
        progressBar.setMax(maxValue);
        progressDialog.show();
        Logger.Spam();
        thread = new Thread(() -> {
            try {
                while (progressBar.getProgress() <= progressBar
                        .getMax()) {
                    Logger.Spam();
                    Thread.sleep(200);
                    if (progressBar.getProgress() == progressBar
                            .getMax()) {
                        Logger.Spam();
                        dismissLoadingDialog();
                    }
                }
                dismissLoadingDialog();
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        thread.start();
    }

    public void dismissLoadingDialog() {
        if (progressDialog != null) {
            progressDialog.dismiss();
        }
    }

    public void incrementLoadingProgress() {
        if (progressBar != null && mContext != null) {
            Logger.Spam();
            progressBar.incrementProgressBy(1);
            tvCount.setText(mContext.getString(R.string.upload_count, progressBar.getProgress(), maxValue));
        }
    }
}
