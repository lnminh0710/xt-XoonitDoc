import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/core/ultils.dart';

class ChangeAppearanceScreen extends StatefulWidget {
  ChangeAppearanceScreen({Key key}) : super(key: key);

  @override
  _ChangeAppearanceScreenState createState() => _ChangeAppearanceScreenState();
}

enum ApplicationColorMode { DarkMode, LightMode }

class _ChangeAppearanceScreenState extends State<ChangeAppearanceScreen> {
  ApplicationColorMode applicationColorMode = ApplicationColorMode.LightMode;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          elevation: 1.0,
          leading: IconButton(
              icon: Icon(Icons.arrow_back_ios, size: 18),
              onPressed: () {
                Navigator.of(context).pop();
              }),
          title: Text(
            "Appearance",
            style: MyStyleText.blueDarkColor16Medium,
          ),
          centerTitle: true,
        ),
        body: Container(
          width: Dimension.getWidth(1),
          height: Dimension.getHeight(1),
          child: Column(
            children: <Widget>[
              RadioListTile(
                  activeColor: MyColors.blueColor,
                  title: const Text("Dark Mode"),
                  value: ApplicationColorMode.DarkMode,
                  groupValue: applicationColorMode,
                  onChanged: (value) {
                    setState(() {
                      applicationColorMode = value;
                    });
                  }),
              RadioListTile(
                  activeColor: MyColors.blueColor,
                  title: const Text("Light Mode"),
                  value: ApplicationColorMode.LightMode,
                  groupValue: applicationColorMode,
                  onChanged: (value) {
                    setState(() {
                      applicationColorMode = value;
                    });
                  }),
            ],
          ),
        ));
  }
}
