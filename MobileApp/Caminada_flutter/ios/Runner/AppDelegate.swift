import UIKit
import Flutter

@UIApplicationMain
@objc class AppDelegate: FlutterAppDelegate {
    override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        GeneratedPluginRegistrant.register(with: self)
        
        let flutterViewController = window?.rootViewController as! FlutterViewController
        let chanel = FlutterMethodChannel(name: "IOS_Channel", binaryMessenger: flutterViewController as! FlutterBinaryMessenger)
        chanel.setMethodCallHandler(handleMethodCall)
        
        let nav = UINavigationController(rootViewController: flutterViewController)
        nav.isNavigationBarHidden = true
        window.rootViewController = nav
        
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }
    
    private func handleMethodCall(call: FlutterMethodCall, result: @escaping FlutterResult){
        let rootVCtrl = window?.rootViewController as? UINavigationController
        
        switch call.method {
        case EMethod.scanner.rawValue:
            let cameraVCtrl = CameraVCtrl(json: call.arguments as? String)
            cameraVCtrl.result = result
            cameraVCtrl.modalPresentationStyle = .fullScreen
            rootVCtrl?.pushViewController(cameraVCtrl, animated: true)
        default:
            break
        }
    }
}
