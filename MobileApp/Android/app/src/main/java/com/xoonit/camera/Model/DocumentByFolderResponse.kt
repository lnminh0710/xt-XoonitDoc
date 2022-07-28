package com.xoonit.camera.Model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class DocumentByFolderResponse (
        val statusCode: Long,
        val resultDescription: String? = null,
        val item: DocumentByFolderItem
)

@Serializable
data class DocumentByFolderItem (
        val pageIndex: Long,
        val pageSize: Long,
        val total: Long,
        val results: ArrayList<DocumentByFolderResult>,
        val payload: String? = null
)

@Serializable
data class DocumentByFolderResult (
        val id: Long,
        val createDate: String,
        val idApplicationOwner: String,
        val idDocumentContainerScans: String,
        val idMainDocument: String,
        val idDocumentTree: String,

        @SerialName("idRepDocumentGuiType")
        val idRepDocumentGUIType: String,

        val rootName: String,
        val localPath: String,
        val localFileName: String,
        val cloudMediaPath: String,
        val groupName: String,
        val mediaName: String,
        val contacts: String,
        val isActive: String,
        val isDeleted: String,
        val fullText: String
)