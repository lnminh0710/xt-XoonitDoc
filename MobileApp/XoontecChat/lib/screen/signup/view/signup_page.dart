import 'package:flutter/material.dart';
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';

class SignupPage extends StatefulWidget {
  static Route route() {
    return MaterialPageRoute<void>(builder: (_) => SignupPage());
  }

  @override
  _SignupPageState createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  @override
  Widget build(BuildContext context) {
    return WebviewScaffold(
      url: 'https://chat-dev.xoontec.vn/#/public/register',
      withLocalStorage: true,
      withJavascript: true,
      appCacheEnabled: true,
    );
  }
}
