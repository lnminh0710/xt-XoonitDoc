package com.xoonit.camera.Model;


import android.os.Parcelable
import com.google.gson.annotations.SerializedName;
import kotlinx.android.parcel.Parcelize

@Parcelize
data class LoginRequest(
        @SerializedName("LoginName") val loginName: String,
        @SerializedName("Password") val password: String
): Parcelable {
}
