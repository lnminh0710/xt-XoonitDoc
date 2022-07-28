package com.xoonit.camera.Model;


import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.android.parcel.Parcelize

@Parcelize
data class LoginSuccessResponse(
        @SerializedName("statusCode") val statusCode: Int,
        @SerializedName("resultDescription") val resultDescription: String,
        @SerializedName("item") val loginItem: LoginItem
) : Parcelable {

}

