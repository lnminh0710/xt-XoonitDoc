package com.xoonit.camera.api;

import com.xoonit.camera.Database.DocumentTreeArray;
import com.xoonit.camera.Database.UploadImages;
import com.xoonit.camera.Model.LoginRequest;
import com.xoonit.camera.Model.LoginSuccessResponse;
import com.xoonit.camera.Model.UploadImageResponse;
import com.xoonit.camera.BuildConfig;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;

public interface ApiService {
    @POST(BuildConfig.SERVER_DOMAIN_NAME + "authenticate")
    Call<LoginSuccessResponse> login(@Body LoginRequest loginRequest);

    @GET(BuildConfig.SERVER_DOMAIN_NAME + "document/documentTreeByUser?shouldGetDocumentQuantity=false")
    Call<DocumentTreeArray> getDocumentTree();

    @POST(BuildConfig.SERVER_DOMAIN_NAME + "ConvertImage/UploadImageByBase64")
    Call<UploadImageResponse> uploadImage(@Body UploadImages uploadImages);
}
