import 'dart:io';
import 'package:flutter/services.dart';

class SpecificMethod {
  static Future<List<String>> showScanScreen() async {
    return Platform.isAndroid
        ? AndroidMethod.detectEdge
        : IOSMethod.showScanner.invoke();
  }
}

class AndroidMethod {
  static const MethodChannel _channel = const MethodChannel('edge_detection');
  static Future<List<String>> get detectEdge async {
    final List<dynamic> imgList = await _channel.invokeMethod('edge_detect');
    List<String> imgListString = new List<String>();
    if (imgList != null) {
      imgListString = imgList.map((s) => s as String).toList();
    }
    return imgListString;
  }
}

enum IOSMethod {
  showScanner,
  showLaunch,
}

extension IOSMethodExtension on IOSMethod {
  static const MethodChannel channel = const MethodChannel("IOS_Channel");

  get name {
    switch (this) {
      case IOSMethod.showScanner:
        return "Scanner";
        break;
      case IOSMethod.showLaunch:
        return "Launch";
        break;
    }
  }

  Future<List<String>> invoke() async {
      List<dynamic> ls = await IOSMethodExtension.channel.invokeMethod(this.name);
     return ls.map((f) => f.toString()).toList();
  }
}
