import 'package:caminada/app/routes/routes.dart';
import 'package:caminada/app/utils/general_method.dart';
import 'package:flutter/material.dart';
import 'package:caminada/app/utils/specific_method.dart';

class ScanScreen extends StatelessWidget {

  @override
  Widget build(BuildContext context) {

    SpecificMethod.showScanScreen().then((value) {
      GeneralMethod.handleScanImages(value);
      Navigator.of(context).pushReplacementNamed(RoutesName.PHOTO);
    }).catchError((onError){
      Navigator.of(context).pushReplacementNamed(RoutesName.PHOTO);
    });
    return SizedBox.expand(
      child: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}
