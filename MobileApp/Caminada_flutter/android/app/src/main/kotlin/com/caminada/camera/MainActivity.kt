package com.caminada.camera

import android.app.Activity
import android.content.Intent
import android.util.Log
import androidx.annotation.NonNull
import com.google.gson.Gson
import com.caminada.camera.activity.CameraContainer
import com.caminada.camera.model.DocumentTreeItem
import com.caminada.camera.utils.ConstantUtils
import com.caminada.camera.utils.Logger
import com.caminada.camera.utils.SCANNED_RESULT
import com.caminada.camera.utils.ScanConstants
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugins.GeneratedPluginRegistrant
import org.json.JSONArray
import org.json.JSONObject

class MainActivity : FlutterActivity() {
    private var result: MethodChannel.Result? = null
    private var methodCall: MethodCall? = null
    private val CHANNEL = "edge_detection"
    override fun configureFlutterEngine(@NonNull flutterEngine: FlutterEngine) {
        GeneratedPluginRegistrant.registerWith(flutterEngine);
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            // Note: this method is invoked on the main thread.
            // TODO
            if (call.method == "edge_detect") {
                val temp: String? = call.argument<String>("documentTreeList");
                // Log.i("NHATQUANG", temp)
                var listDocumentTree: ArrayList<DocumentTreeItem> = ArrayList<DocumentTreeItem>();
                val jsonArray = JSONArray(temp)
                for (i in 0 until jsonArray.length()) {
                    val jsonObject: JSONObject = jsonArray.getJSONObject(i)

                    // this gson part is optional , you can read response directly from Json too
                    val gson = Gson()
                    val documentTreeItem: DocumentTreeItem = gson.fromJson(jsonArray.getJSONObject(i).toString(), DocumentTreeItem::class.java)
                    listDocumentTree.add(documentTreeItem)
                }
                ScanConstants.listDocumentTree = listDocumentTree
                if(listDocumentTree.size > 0) {
                    ScanConstants.currentDocumentTree = listDocumentTree[0]
                    // Log.i("NHATQUANG", ScanConstants.currentDocumentTree!!.data.groupName)
                }
                OpenCameraActivity(call, result)
            }
        }
    }


    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        Logger.Spam()
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == ConstantUtils.REQUEST_OPEN_CAMERA) {
            Logger.Spam()
            if (resultCode == Activity.RESULT_OK) {
                Logger.Spam()
                if (null != data && null != data.extras) {
                    val filePath = data.getStringArrayListExtra(SCANNED_RESULT)
                    val isOpenPhoto = data.getBooleanExtra(ConstantUtils.IS_OPEN_PHOTO, false)
                    Logger.Debug(isOpenPhoto.toString())
                    if ((filePath != null && filePath.size == 0 && isOpenPhoto)
                            || (filePath != null && filePath.size > 0)) {
                        Logger.Debug(filePath.toString())
                        finishWithSuccess(filePath)
                        return;
                    }
                }
                finishWithSuccess(null)
            } else if (resultCode == Activity.RESULT_CANCELED) {
                finishWithSuccess(null)
            }
        }
    }

    fun OpenCameraActivity(call: MethodCall, result: MethodChannel.Result) {
        Logger.Spam()
        if (!setPendingMethodCallAndResult(call, result)) {
            Logger.Spam()
            finishWithAlreadyActiveError()
            return
        }
        Logger.Spam()
        var intent = Intent(Intent(activity.applicationContext, CameraContainer::class.java))
        startActivityForResult(intent, ConstantUtils.REQUEST_OPEN_CAMERA)
    }

    private fun setPendingMethodCallAndResult(methodCall: MethodCall, result: MethodChannel.Result): Boolean {
        if (this.result != null) {
            Logger.Spam()
            return false
        }
        Logger.Spam()
        this.methodCall = methodCall
        this.result = result
        return true
    }

    private fun finishWithAlreadyActiveError() {
        Logger.Spam()
        finishWithError("already_active", "Edge detection is already active")
    }

    private fun finishWithError(errorCode: String, errorMessage: String) {
        Logger.Spam()
        result?.error(errorCode, errorMessage, null)
        clearMethodCallAndResult()
    }

    private fun finishWithSuccess(imagePath: ArrayList<String>?) {
        Logger.Spam()
        result?.success(imagePath)
        clearMethodCallAndResult()
    }

    private fun clearMethodCallAndResult() {
        methodCall = null
        result = null
    }
}
