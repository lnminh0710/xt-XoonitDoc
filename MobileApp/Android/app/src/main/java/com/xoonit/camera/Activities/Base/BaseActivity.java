package com.xoonit.camera.Activities.Base;

import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import com.xoonit.camera.Dialog.GeneralDialogFragment;
import com.xoonit.camera.R;
import com.xoonit.camera.XoonitApplication;
import com.xoonit.camera.utils.CustomToast;
import com.xoonit.camera.utils.NetworkStateReceiver;
import com.xoonit.camera.utils.SharePref_;

import org.androidannotations.annotations.AfterViews;
import org.androidannotations.annotations.EActivity;

import java.util.Date;

@EActivity
public abstract class BaseActivity extends AppCompatActivity implements NetworkStateReceiver.NetworkStateReceiverListener {
    private NetworkStateReceiver networkStateReceiver;
    private boolean shouldShowNerworkError = false;

    protected SharePref_ mSharePref;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mSharePref = XoonitApplication.getInstance().getSharePref();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        networkStateReceiver.removeListener(this);
        this.unregisterReceiver(networkStateReceiver);
    }

    @Override
    protected void onResume() {
        super.onResume();
        Date today = new Date();
        if (shouldShowNerworkError) {
            CustomToast.showToastError(this, false, getString(R.string.msg_empty_internet), R.layout.activity_home);
        }
    }

    @AfterViews
    protected abstract void afterViews();

    public void replaceFragment(@NonNull Fragment fragment, int containerViewId, boolean addToBackStack) {
        FragmentTransaction transaction = getSupportFragmentManager()
                .beginTransaction();
        if (addToBackStack) {
            transaction.addToBackStack(fragment.getClass().getName());
        }
        transaction.replace(containerViewId, fragment, fragment.getClass().getName());
        transaction.commit();
        getSupportFragmentManager().executePendingTransactions();
    }

    public void addFragment(@NonNull Fragment fragment, int containerViewId, boolean addToBackStack) {
        FragmentTransaction transaction = getSupportFragmentManager()
                .beginTransaction();
        if (addToBackStack) {
            transaction.addToBackStack(fragment.getClass().getName());
        }
        transaction.add(containerViewId, fragment, fragment.getClass().getName());
        transaction.commit();
        getSupportFragmentManager().executePendingTransactions();
    }

    public void replaceFragmentWithPushAnimation(@NonNull Fragment fragment, int containerViewId, boolean addToBackStack) {
        FragmentTransaction transaction = getSupportFragmentManager()
                .beginTransaction();
        if (addToBackStack) {
            transaction.addToBackStack(fragment.getClass().getName());
        }
        transaction.setCustomAnimations(R.anim.slide_in_from_right, R.anim.slide_out_to_left, R.anim.slide_in_from_left, R.anim.slide_out_to_right);
        transaction.replace(containerViewId, fragment, fragment.getClass().getName());
        transaction.commit();
        getSupportFragmentManager().executePendingTransactions();
    }

    public void startActivityWithPushAnimation(Intent intent) {
        startActivity(intent);
        overridePendingTransition(R.anim.slide_in_from_right, R.anim.slide_out_to_left);
    }

    /**
     * @param message is message.
     */
    public void showErrorToast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    public void showAlert(String title, String message, String centerButton, View.OnClickListener listener) {
        this.showAlert(title, 0, message, null, centerButton, null, Gravity.CENTER, null, listener, null);
    }

    public void showDialog(String title, String message, int gravity, String leftButton, View.OnClickListener leftListener, String rightButton, View.OnClickListener rightListener) {
        this.showAlert(title, 0, message, leftButton, null, rightButton, gravity, leftListener, null, rightListener);
    }

    @SuppressLint("CommitTransaction")
    public void showAlert(String title, int colorTitle, String message, String leftButton,
                          String centerButton, String rightButton, int gravity,
                          View.OnClickListener leftListener, View.OnClickListener centerListener, View.OnClickListener rightListener) {
        try {
            GeneralDialogFragment newFragment = new GeneralDialogFragment();
            newFragment.title(title)
                    .colorTitle(colorTitle)
                    .message(message)
                    .leftButton(leftButton, leftListener)
                    .centerButton(centerButton, centerListener)
                    .rightButton(rightButton, rightListener)
                    .setContentViewGravity(gravity).setCancelable(false);
            newFragment.show(getSupportFragmentManager().beginTransaction(), GeneralDialogFragment.class.getSimpleName());
        } catch (IllegalStateException e) {
            //no-op
        }
    }

    @Override
    public void onBackPressed() {
        finish();
        overridePendingTransition(R.anim.slide_in_from_left, R.anim.slide_out_to_right);
    }

    protected void showMessageToast(Context context, String message) {
        Toast.makeText(context, message, Toast.LENGTH_LONG).show();
    }

    @Override
    public void networkAvailable() {
        shouldShowNerworkError = false;
        if (CustomToast.toastError != null) {
            CustomToast.toastError.dismiss();
        }
    }

    @Override
    public void networkUnavailable() {
        shouldShowNerworkError = true;
        CustomToast.showToastError(this, false, getString(R.string.msg_empty_internet), R.layout.activity_home);
    }

    @Override
    public void onAttachedToWindow() {
        super.onAttachedToWindow();
        networkStateReceiver = new NetworkStateReceiver();
        networkStateReceiver.addListener(this);
        this.registerReceiver(networkStateReceiver, new IntentFilter(android.net.ConnectivityManager.CONNECTIVITY_ACTION));
    }
}
