package com.xoonit.camera.api.core;

import android.content.Context;
public class ApiConfig {
    private Context context;
    private String baseUrl;

    public Context getContext() {
        return context;
    }

    public void setContext(Context context) {
        this.context = context;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
}
