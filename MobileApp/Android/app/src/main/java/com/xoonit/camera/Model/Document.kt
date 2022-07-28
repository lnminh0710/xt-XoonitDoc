package com.xoonit.camera.Model

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.android.parcel.Parcelize

@Parcelize
data class Document(@SerializedName("name") val name: String,
                    @SerializedName("date_modified") val dateModified: String,
                    @SerializedName("id") val id: String,
                    @SerializedName("time_modified") val timeModified: String,
                    @SerializedName("extension") val extension: String
) : Parcelable {
}