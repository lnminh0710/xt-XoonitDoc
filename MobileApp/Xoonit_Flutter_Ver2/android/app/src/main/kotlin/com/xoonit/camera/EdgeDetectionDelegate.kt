//package com.xoonit.camera
//
//import android.app.Activity
//import android.content.Intent
//import com.xoonit.camera.activity.CameraContainer
//import com.xoonit.camera.utils.ConstantUtils
//import com.xoonit.camera.utils.Logger
//import com.xoonit.camera.utils.SCANNED_RESULT
//import io.flutter.plugin.common.MethodCall
//import io.flutter.plugin.common.MethodChannel
//import io.flutter.plugin.common.PluginRegistry
//
//class EdgeDetectionDelegate(activity: Activity) : PluginRegistry.ActivityResultListener {
//
//    private var activity: Activity = activity
//    private var result: MethodChannel.Result? = null
//    private var methodCall: MethodCall? = null
//
//    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?): Boolean {
//        Logger.Spam()
//        if (requestCode == ConstantUtils.REQUEST_OPEN_CAMERA) {
//            if (resultCode == Activity.RESULT_OK) {
//                if (null != data && null != data.extras) {
//                    val filePath = data.extras!!.getString(SCANNED_RESULT)
//                    Logger.Debug(filePath)
//                    finishWithSuccess(filePath)
//                }
//            } else if (resultCode == Activity.RESULT_CANCELED) {
//                finishWithSuccess(null)
//            }
//            return true;
//        }
//
//        return false;
//    }
//
//    fun OpenCameraActivity(call: MethodCall, result: MethodChannel.Result) {
//        Logger.Spam()
//        if (!setPendingMethodCallAndResult(call, result)) {
//            Logger.Spam()
//            finishWithAlreadyActiveError()
//            return
//        }
//        Logger.Spam()
//        var intent = Intent(Intent(activity.applicationContext, CameraContainer::class.java))
//        activity.startActivityForResult(intent, ConstantUtils.REQUEST_OPEN_CAMERA)
//    }
//
//    private fun setPendingMethodCallAndResult(methodCall: MethodCall, result: MethodChannel.Result): Boolean {
//        if (this.result != null) {
//            Logger.Spam()
//            return false
//        }
//        Logger.Spam()
//        this.methodCall = methodCall
//        this.result = result
//        return true
//    }
//
//    private fun finishWithAlreadyActiveError() {
//        Logger.Spam()
//        finishWithError("already_active", "Edge detection is already active")
//    }
//
//    private fun finishWithError(errorCode: String, errorMessage: String) {
//        Logger.Spam()
//        result?.error(errorCode, errorMessage, null)
//        clearMethodCallAndResult()
//    }
//
//    private fun finishWithSuccess(imagePath: String?) {
//        Logger.Spam()
//        result?.success(imagePath)
//        clearMethodCallAndResult()
//    }
//
//    private fun clearMethodCallAndResult() {
//        methodCall = null
//        result = null
//    }
//
//}