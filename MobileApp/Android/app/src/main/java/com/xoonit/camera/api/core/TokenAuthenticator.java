package com.xoonit.camera.api.core;

import androidx.annotation.Nullable;

import com.xoonit.camera.XoonitApplication;
import com.xoonit.camera.utils.GeneralMethod;

import java.io.IOException;

import okhttp3.Authenticator;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.Route;

public class TokenAuthenticator implements Authenticator {
    @Nullable
    @Override
    public Request authenticate(Route route, Response response) throws IOException {
        boolean refreshResult = GeneralMethod.refreshToken();
        if (refreshResult) {
            String accessToken = XoonitApplication.getInstance().getSharePref()
                    .accessToken().getOr("");
            return response.request().newBuilder()
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .addHeader("Accept", "application/json")
                    .addHeader("Content-Type", "application/json")
                    .build();
        } else {
            GeneralMethod.clearUserData();
            return null;
        }
    }
}
