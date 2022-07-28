package com.xoonit.camera.Model

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.android.parcel.Parcelize

@Parcelize
data class UploadImageResponse(
        @SerializedName("statusCode") val statusCode: Int,
        @SerializedName("resultDescription") val resultDescription: String,
        @SerializedName("item") val item: UploadImageItem
) : Parcelable {}

@Parcelize
data class UploadImageItem(
        @SerializedName("uploadSpeed") val uploadSpeed: Int,
        @SerializedName("result") val result: UploadImageResult
) : Parcelable {}

@Parcelize
data class UploadImageResult(
        @SerializedName("returnID") val returnID: Int,
        @SerializedName("storedName") val storedName: String,
        @SerializedName("eventType") val eventType: String,
        @SerializedName("sqlStoredMessage") val sqlStoredMessage: String,
        @SerializedName("isSuccess") val isSuccess: Boolean,
        @SerializedName("payload") val payload: String,
        @SerializedName("jsonReturnIds") val jsonReturnIds: String
        ) : Parcelable {}