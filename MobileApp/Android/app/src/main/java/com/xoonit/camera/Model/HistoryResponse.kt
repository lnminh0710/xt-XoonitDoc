package com.xoonit.camera.Model

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.android.parcel.Parcelize

@Parcelize
data class HistoryResponse(@SerializedName("item") val historyItem: ArrayList<History>) : Parcelable {}