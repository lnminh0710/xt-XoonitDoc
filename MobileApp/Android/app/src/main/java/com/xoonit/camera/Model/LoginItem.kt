package com.xoonit.camera.Model;

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.android.parcel.Parcelize

@Parcelize
data class LoginItem(@SerializedName("access_token") val accessToken: String,
                     @SerializedName("refresh_token") val refreshToken: String,
                     @SerializedName("token_type") val tokenType: String,
                     @SerializedName("expires_in") val expiresIn: Int,
                     @SerializedName("result") val result: String,
                     @SerializedName("message") val message: String,
                     @SerializedName("message_type") val messageType: String
): Parcelable {
}
