package com.xoonit.camera.Model;


import com.google.gson.annotations.SerializedName
import com.xoonit.camera.Database.ScansImages

data class CaptureSuccessResponse(
        @SerializedName("item") val captureArray: ArrayList<ScansImages>
)

