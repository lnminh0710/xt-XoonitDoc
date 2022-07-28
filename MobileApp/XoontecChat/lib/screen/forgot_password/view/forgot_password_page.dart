import 'package:flutter/material.dart';
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';

class ForgotPasswordPage extends StatefulWidget {
  static Route route() {
    return MaterialPageRoute<void>(builder: (_) => ForgotPasswordPage());
  }

  @override
  _ForgotPasswordState createState() => _ForgotPasswordState();
}

class _ForgotPasswordState extends State<ForgotPasswordPage> {
  @override
  Widget build(BuildContext context) {
    return WebviewScaffold(
      url: Uri.dataFromString(
              '<html><button onclick="Print.postMessage(\'test\');">Click me</button></html>',
              mimeType: 'text/html')
          .toString(),
      withLocalStorage: true,
      withJavascript: true,
      appCacheEnabled: true,
      javascriptChannels: jsChannels,
    );
  }

  final Set<JavascriptChannel> jsChannels = [
    JavascriptChannel(
        name: 'Print',
        onMessageReceived: (JavascriptMessage message) {
          print('message.message: ${message.message}');
        }),
  ].toSet();
}
