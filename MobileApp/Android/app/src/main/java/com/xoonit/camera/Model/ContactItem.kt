package com.xoonit.camera.Model;

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.android.parcel.Parcelize

@Parcelize
data class ContactItem(@SerializedName("firstName") val firstName: String,
                       @SerializedName("lastName") val lastName: String,
                       @SerializedName("id") val id: Int,
                       @SerializedName("dateModified") val dateModified: String,
                       @SerializedName("companyName") val companyName: String,
                       @SerializedName("companyWebSite") val companyWebSite: String,
                       @SerializedName("phone") val phone: String,
                       @SerializedName("email") val email: String,
                       @SerializedName("address") val address: String,
                       @SerializedName("path") val path: String
) : Parcelable {
}
