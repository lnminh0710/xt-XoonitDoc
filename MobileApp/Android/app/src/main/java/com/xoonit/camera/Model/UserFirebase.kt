package com.xoonit.camera.Model

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.android.parcel.Parcelize

@Parcelize
data class UserFirebase(@SerializedName("name") val name: String,
                        @SerializedName("userID") val userID: String,
                        @SerializedName("tokenFirebase") val tokenFirebase: String,
                        @SerializedName("os") val os: String
) : Parcelable {
}