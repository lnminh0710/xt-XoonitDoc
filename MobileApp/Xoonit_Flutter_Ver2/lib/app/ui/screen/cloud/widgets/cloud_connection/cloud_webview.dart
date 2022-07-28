import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:xoonit/app/ui/component/loading_checking_cloud_connection.dart';

import 'cloud_connection.dart';

class CloudWebView extends StatefulWidget {
  ECloud cloud;
  StreamController<bool> _loading = StreamController();
  CloudWebView({this.cloud});

  @override
  _CloudWebViewState createState() => _CloudWebViewState();
}

class _CloudWebViewState extends State<CloudWebView> {
  @override
  void dispose() {
    widget._loading.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setEnabledSystemUIOverlays([SystemUiOverlay.top]);
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.close),
          onPressed: () {
            Navigator.of(context).pop();
          },
        ),
      ),
      body: Stack(
        alignment: Alignment.center,
        children: [
          WebView(
            initialUrl: widget.cloud.url,
            javascriptMode: JavascriptMode.unrestricted,
            onPageStarted: (url) {
              widget._loading.sink.add(true);
            },
            onPageFinished: (url) {
              widget._loading.sink.add(false);
            },
          ),
          StreamBuilder<bool>(
            stream: widget._loading.stream,
            initialData: false,
            builder: (context, snapshot) {
              return snapshot.data ? CustomLoading() : SizedBox.shrink();
            },
          )
        ],
      ),
    );
  }
}

extension ECloudExtension on ECloud {
  String get url {
    switch (this) {
      case ECloud.one_drive:
        return 'https://onedrive.live.com/';
      case ECloud.google_drive:
        return 'https://drive.google.com/drive/my-drive';
      case ECloud.my_cloud:
        return 'https://mycloud.swisscom.ch/';
      // case ECloud.drop_box:
      //   return '';
    }
  }
}
