package com.xoonit.camera.Dialog;

import android.app.Dialog;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.fragment.app.DialogFragment;
import androidx.annotation.NonNull;

import com.xoonit.camera.R;

public class GeneralDialogFragment extends DialogFragment {
    private String mTitle;
    private String mMessage;
    private String mLeftButton;
    private String mRightButton;
    private String mCenterButton;
    private int mColorTitleAlert;
    private View.OnClickListener mLeftListener;
    private View.OnClickListener mRightListener;
    private View.OnClickListener mCenterListener;
    private int mContentGravity = Gravity.CENTER;

    public GeneralDialogFragment() {
    }

    public GeneralDialogFragment title(String title) {
        mTitle = title;
        return this;
    }

    public GeneralDialogFragment message(String message) {
        mMessage = message;
        return this;
    }

    public GeneralDialogFragment colorTitle(int color) {
        mColorTitleAlert = color;
        return this;
    }

    public GeneralDialogFragment leftButton(String text, View.OnClickListener listener) {
        mLeftButton = text;
        mLeftListener = listener;
        return this;
    }

    public GeneralDialogFragment rightButton(String text, View.OnClickListener listener) {
        mRightButton = text;
        mRightListener = listener;
        return this;
    }

    public GeneralDialogFragment centerButton(String text, View.OnClickListener listener) {
        mCenterButton = text;
        mCenterListener = listener;
        return this;
    }

    public GeneralDialogFragment setContentViewGravity(int gravity) {
        mContentGravity = gravity;
        return this;
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_general_dialog, container, false);
    }

    @Override
    public void onViewCreated( @NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        TextView tvTitle = view.findViewById(R.id.tvDialogTitle);
        TextView tvMessage = view.findViewById(R.id.tvDialogMessage);
        Button btnLeft = view.findViewById(R.id.btnDialogLeft);
        Button btnRight = view.findViewById(R.id.btnDialogRight);
        Button btnCenter = view.findViewById(R.id.btnDialogCenter);

        tvMessage.setGravity(mContentGravity);
        tvTitle.setVisibility(mTitle == null ? View.GONE : View.VISIBLE);
        tvTitle.setText(TextUtils.isEmpty(mTitle) ? "" : mTitle);
        if (!TextUtils.isEmpty(mMessage)) {
            tvMessage.setText(mMessage);
            tvMessage.setVisibility(View.VISIBLE);
        } else {
            tvMessage.setVisibility(View.GONE);
        }

        if (mColorTitleAlert != 0) {
            tvTitle.setTextColor(mColorTitleAlert);
        }

        if (mCenterButton != null) {
            btnCenter.setVisibility(View.VISIBLE);
            btnCenter.setText(mCenterButton);
            btnCenter.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    dismiss();
                    mCenterListener.onClick(v);
                }
            });
        } else {
            btnCenter.setVisibility(View.GONE);
        }

        if (mLeftButton != null) {
            btnLeft.setText(mLeftButton);
            btnLeft.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    dismiss();
                    mLeftListener.onClick(v);
                }
            });
        } else {
            btnLeft.setVisibility(View.GONE);
        }

        if (mRightButton != null) {
            btnRight.setText(mRightButton);
            btnRight.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    dismiss();
                    mRightListener.onClick(v);
                }
            });
        } else {
            btnRight.setVisibility(View.GONE);
        }
        btnRight.setText(TextUtils.isEmpty(mRightButton) ? "" : mRightButton);
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        Dialog dialog = super.onCreateDialog(savedInstanceState);
        if (dialog.getWindow() != null) {
            dialog.getWindow().requestFeature(Window.FEATURE_NO_TITLE);
        }

        return dialog;
    }
}
