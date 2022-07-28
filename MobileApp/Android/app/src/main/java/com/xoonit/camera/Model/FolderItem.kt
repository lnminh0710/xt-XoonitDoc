package com.xoonit.camera.Model

import android.os.Parcelable
import kotlinx.android.parcel.Parcelize
import java.io.File
@Parcelize
data class FolderItem(
        val folderName: String,
        val folderPath: String,
        val fileName: String,
        val filePath: String,
        var isChecked: Boolean
): Parcelable {

}