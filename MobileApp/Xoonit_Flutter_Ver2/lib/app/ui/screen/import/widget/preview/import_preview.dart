import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:xoonit/app/model/local/import_file/importfile_table.dart';

class ImportPreview extends StatelessWidget {
  TImportFile file;
  ImportPreview({this.file});

  @override
  Widget build(BuildContext context) {
    SystemChrome.setEnabledSystemUIOverlays([SystemUiOverlay.top]);
    return ListView(children: [
      SizedBox.fromSize(
        size: Size(100, 1000),
        child: WebView(
          initialUrl:
              'https://docs.google.com/gview?embedded=true&url=https://www.wmata.com/schedules/maps/upload/2019-System-Map.pdf',
          javascriptMode: JavascriptMode.unrestricted,
        ),
      ),
    ]);
  }
}

class DisplayMetrics {}
