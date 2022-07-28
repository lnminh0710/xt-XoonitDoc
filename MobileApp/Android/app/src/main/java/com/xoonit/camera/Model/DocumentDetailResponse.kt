package com.xoonit.camera.Model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class DocumentDetailResponse(
        val statusCode: Int,
        val resultDescription: String? = null,
        val item: DocumentDetailItem
)

@Serializable
data class DocumentDetailItem(
        val data: ArrayList<DocumentDetailData>
)

@Serializable
data class DocumentDetailData(
        val IdDocumentContainerOcr: Int,

        val OCRText: String,

        val OCRJson: String,

        val PageNr: Long,

        val IdDocumentContainerScans: Long,

        val IdDocumentTree: Long,

        val FileName: String,

        val ScannedPath: String,

        val IdRepDocumentType: Long,

        val DocumentType: String,

        val OriginalFileName: String,

        val RowNum: Long
)
