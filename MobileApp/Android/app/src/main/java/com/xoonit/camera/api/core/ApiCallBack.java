package com.xoonit.camera.api.core;

import android.content.Context;

import com.xoonit.camera.R;
import com.xoonit.camera.utils.Logger;

import java.io.IOException;
import java.net.SocketTimeoutException;
import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public abstract class ApiCallBack<T> implements Callback<T> {

    public abstract void success(T t);

    public abstract void failure(List<String> listError);

    private Context mContext;

    public ApiCallBack(Context context) {
        mContext = context;
    }

    private List<String> setListErrorHand(String message) {
        List<String> errors = new ArrayList<>();
        errors.add(message);
        return errors;
    }

    @Override
    public void onResponse(Call<T> call, Response<T> response) {
        if (response == null) {
            Logger.Spam();
            failure(setListErrorHand(mContext.getString(R.string.msg_empty_internet)));
            return;
        }

        if (response.isSuccessful()) {
            // handle error with status code 200
            success(response.body());
            Logger.Debug(response.body().toString());
        } else {
            failure(setListErrorHand(mContext.getString(R.string.msg_login_failed)));
        }


    }

    @Override
    public void onFailure(Call<T> call, Throwable t) {
        if (t instanceof SocketTimeoutException) { // Handle timeout
            // show dialog time out
            handelTimeoutOrNoInternetAlert();
            return;
        }

        if (t instanceof IOException) { // Handle no internet
            // show dialog no internet
            handelTimeoutOrNoInternetAlert();
            return;
        }
        failure(setListErrorHand(t.getMessage()));
    }

    private void handelTimeoutOrNoInternetAlert() {
        failure(setListErrorHand(mContext.getString(R.string.msg_empty_internet)));
    }
}