import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/screen/signup/component/signup_component.dart';

class CloudShareFolderDialog extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Material(
        type: MaterialType.transparency, child: _dialogBody(context));
  }

  _dialogBody(BuildContext context) {
    var screenWidth = MediaQuery.of(context).size.width;
    return FractionallySizedBox(
        widthFactor: screenWidth < 600 ? 0.9 : 0.6,
        child: Align(
          alignment: Alignment(0, -0.7),
          child: Container(
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: MyColors.bluedarkColor),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Container(
                    padding: EdgeInsets.fromLTRB(16, 0, 8, 0),
                    color: MyColors.blueColor,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: <Widget>[
                        Text('SHARE FOLDER', style: MyStyleText.white16Medium),
                        IconButton(
                            icon: Icon(Icons.close, color: Colors.white),
                            onPressed: () {
                              Navigator.of(context).pop();
                            })
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 16, 24, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: <Widget>[
                        Row(
                          children: <Widget>[
                            Text('Email of myDM:',
                                style: MyStyleText.white14Regular),
                            SizedBox(width: 8),
                            Text('edm.test.local@gmail.com',
                                style: MyStyleText.white14Regular),
                          ],
                        ),
                        SizedBox(height: 8),
                        TextField(
                          decoration: const InputDecoration(
                              hintText: 'Your email on GoogleDrive:',
                              hintStyle: TextStyle(color: Colors.blueGrey)),
                          style: MyStyleText.white14Regular,
                        ),
                        SizedBox(height: 8),
                        TextField(
                          decoration: const InputDecoration(
                            hintText: 'Folder shared with myDM:',
                            hintStyle: TextStyle(color: Colors.blueGrey),
                          ),
                          style: MyStyleText.white14Regular,
                        ),
                        SizedBox(height: 8),
                        RaisedButton(
                          color: MyColors.blueColor,
                          child: Text('Open your GoogleDrive',
                              style: MyStyleText.white14Regular),
                          onPressed: () {},
                        ),
                        SizedBox(height: 8),
                        RaisedButton(
                            color: MyColors.blueColor,
                            onPressed: () {},
                            child: Text('Test connection',
                                style: MyStyleText.white14Medium)),
                        SizedBox(height: 8),
                        RaisedButton(
                            color: MyColors.blueColor,
                            onPressed: () {},
                            child: Text('Done',
                                style: MyStyleText.white14Medium)),
                      ],
                    ),
                  ),
                ],
              )),
        ));
  }
}
