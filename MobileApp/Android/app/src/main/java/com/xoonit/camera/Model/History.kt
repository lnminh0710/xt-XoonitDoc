package com.xoonit.camera.Model

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.android.parcel.Parcelize

@Parcelize
data class History(
        @SerializedName("Id") val id: Int,
        @SerializedName("FileName") val fileName: String,
        @SerializedName("TotalImage") val totalImage: Int,
        @SerializedName("DocType") val documentType: String,
        @SerializedName("Devices") val devices: String,
        @SerializedName("ScanTime") val scanTime: String,
        @SerializedName("ScannedDate") val scannedDate: String,
        @SerializedName("Cloud") val cloudAddress: String,
        @SerializedName("SyncStatus") val syncStatus: String
) : Parcelable {

}