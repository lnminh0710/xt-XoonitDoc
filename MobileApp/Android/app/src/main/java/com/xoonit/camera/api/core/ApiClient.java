package com.xoonit.camera.api.core;

import android.text.TextUtils;

import androidx.annotation.NonNull;

import com.xoonit.camera.BuildConfig;
import com.xoonit.camera.XoonitApplication;
import com.xoonit.camera.api.ApiService;
import com.xoonit.camera.utils.GeneralMethod;
import com.xoonit.camera.utils.SharePref_;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {
    private static final String HEADER_UA = "User-Agent";
    private static final String HEADER_AUTH = "Authorization";
    private static final int TIMEOUT_CONNECTION = 30000;
    private static ApiClient sApiClient;

    /**
     * ApiService service
     */
    private ApiService mApiService;

    public static synchronized ApiClient getInstance() {
        if (sApiClient == null) {
            sApiClient = new ApiClient();
        }
        return sApiClient;
    }

    /**
     * method this is request api
     */
    public static ApiService getService() {
        return getInstance().mApiService;
    }


    public void init(final ApiConfig apiConfig) {
        // initialize OkHttpClient
        HttpLoggingInterceptor interceptor = new HttpLoggingInterceptor();
        if (BuildConfig.DEBUG) {
            interceptor.setLevel(HttpLoggingInterceptor.Level.BODY);
        } else {
            interceptor.setLevel(HttpLoggingInterceptor.Level.NONE);
        }
        TokenAuthenticator tokenAuthenticator = new TokenAuthenticator();
        OkHttpClient.Builder builder = new OkHttpClient.Builder();
        builder.addInterceptor(new Interceptor() {
            @NonNull
            @Override
            public Response intercept(@NonNull Chain chain) throws IOException {
                SharePref_ sharePref = XoonitApplication.getInstance().getSharePref();
                String refreshToken = sharePref.refreshToken().getOr("");
                Request.Builder builder = chain.request().newBuilder();
                if (GeneralMethod.shouldRefreshAccessToken() && !TextUtils.isEmpty(refreshToken)) {
                    GeneralMethod.refreshToken();
                }
                String accessToken = sharePref.accessToken().getOr("");
                if (!TextUtils.isEmpty(accessToken)) {
                    builder.addHeader(ApiClient.HEADER_AUTH, "Bearer " + accessToken);
                }
                builder.addHeader("Accept", "application/json");
                builder.addHeader("Content-Type", "application/json");
                return chain.proceed(builder.build());
            }
        })
                .addInterceptor(interceptor)
                .readTimeout(TIMEOUT_CONNECTION, TimeUnit.MILLISECONDS)
                .writeTimeout(TIMEOUT_CONNECTION, TimeUnit.MILLISECONDS)
                .authenticator(tokenAuthenticator);
        OkHttpClient okHttpClient = builder.build();

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl(apiConfig.getBaseUrl())
                .addConverterFactory(GsonConverterFactory.create())
                .client(okHttpClient)
                .build();
        mApiService = retrofit.create(ApiService.class);
    }
}
