import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/ui/screen/home/home_enum.dart';

class MenuScreen extends StatelessWidget {

  final Function(EHomeScreenChild) didSelect;
  MenuScreen({this.didSelect});

  static const lsModule = [
    EHomeScreenChild.myDM,
    EHomeScreenChild.capture,
    EHomeScreenChild.contact,
    EHomeScreenChild.scan,
    EHomeScreenChild.import,
    EHomeScreenChild.export,
    EHomeScreenChild.cloud,
    EHomeScreenChild.userguide,
    EHomeScreenChild.history
  ];

  @override
  Widget build(BuildContext context) {
    return Material(
      type: MaterialType.transparency,
      child: GestureDetector(
        child: Container(
          color: Colors.transparent,
          child: _dialogBody(context),
        ),
        onTap: () {
          printLog('close menu');
          Navigator.of(context).pop();
        },
      ),
    );
  }

  _dialogBody(BuildContext context) {
    var screenWidth = MediaQuery.of(context).size.width;
    return FractionallySizedBox(
      widthFactor: screenWidth < 600 ? 0.9 : 0.6,
      child: Align(
        alignment: Alignment(0, -0.7),
        child: Container(
          decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              image: DecorationImage(
                  image: AssetImage(Resources.bgMenu), fit: BoxFit.cover)),
          child: GridView.builder(
              shrinkWrap: true,
              padding: EdgeInsets.all(16),
              itemCount: lsModule.length,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  childAspectRatio: 2 / 3,
                  crossAxisCount: 3,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 24),
              itemBuilder: (_, index) {
                var module = lsModule[index];
                return GestureDetector(
                  onTap: () {
                    didSelect(module);
                    Navigator.of(context).pop();
                  },
                  child: Container(
                    padding: EdgeInsets.zero,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: <Widget>[
                        AspectRatio(
                            aspectRatio: 1,
                            child: Container(
                              decoration: BoxDecoration(
                                  shape: BoxShape.circle, color: Colors.blue),
                              child: module.icon,
                            )),
                        Text("${module.title}",
                            style: MyStyleText.white14Regular),
                      ],
                    ),
                  ),
                );
              }),
        ),
      ),
    );
  }
}
