package com.xoonit.camera.Model;


import android.os.Parcelable
import com.google.gson.annotations.SerializedName;
import kotlinx.android.parcel.Parcelize

@Parcelize
data class RefreshTokenRequest(
        @SerializedName("refresh_token") val refreshToken: String
) : Parcelable {
}
