import 'dart:convert';
import 'dart:io';
import 'package:flutter/services.dart';
import 'package:caminada/app/utils/caminada_application.dart';

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
    String treeListJson =
        jsonEncode(CaminadaApplication.instance.documentTreeItemList);
    print(treeListJson);
    final List<dynamic> scanResultJsonList = await _channel
        .invokeMethod('edge_detect', {"documentTreeList": treeListJson});
    List<String> imgListString = new List<String>();
    if (scanResultJsonList != null) {
      imgListString = scanResultJsonList.map((s) => s as String).toList();
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

  Future<T> invoke<T>() async {
    switch (this) {
      case IOSMethod.showScanner:
        String json =
            jsonEncode(CaminadaApplication.instance.documentTreeItemList);
        List<dynamic> ls =
            await IOSMethodExtension.channel.invokeMethod(this.name, json);
        return ls.map((f) => f.toString()).toList() as T;
      default:
        return "" as T;
    }
  }
}
