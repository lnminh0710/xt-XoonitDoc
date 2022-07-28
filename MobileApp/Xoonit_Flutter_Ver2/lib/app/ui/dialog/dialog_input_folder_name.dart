import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/core/ultils.dart';

class DialogInputFolderName extends StatefulWidget {
  DialogInputFolderName({Key key, this.parentName}) : super(key: key);
  final String parentName;
  @override
  _DialogInputFolderNameState createState() => _DialogInputFolderNameState();
}

class _DialogInputFolderNameState extends State<DialogInputFolderName> {
  TextEditingController _folderNameController;
  @override
  void initState() {
    super.initState();
    _folderNameController = TextEditingController();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(
          Radius.circular(10),
        ),
      ),
      content: Container(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
                margin: EdgeInsets.only(bottom: 12),
                width: 50,
                height: 50,
                child: Image.asset(
                  Resources.icAddFolder,
                )),
            Text(
              'New Folder',
              style: MyStyleText.black16Bold,
            ),
            Container(
              alignment: Alignment.centerLeft,
              margin: EdgeInsets.only(top: 24, bottom: 16),
              child: RichText(
                  text: TextSpan(style: MyStyleText.black14Medium, children: [
                TextSpan(text: 'Add-Subfoder for '),
                TextSpan(
                    text: widget.parentName,
                    style: MyStyleText.textLink14Regular),
              ])),
            ),
            TextFormField(
              style: MyStyleText.black16Medium,
              decoration: InputDecoration(
                hintText: "FolderName",
                hintStyle: MyStyleText.grey14Regular,
                enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                    color: MyColors.greyText,
                    style: BorderStyle.solid,
                  ),
                ),
              ),
              controller: _folderNameController,
            ),
            SizedBox(
              height: 24,
            ),
            FlatButton(
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.all(Radius.circular(10))),
                onPressed: () {
                  Navigator.of(context).pop(_folderNameController.text);
                },
                child: Container(
                    alignment: Alignment.center,
                    width: Dimension.getWidth(0.6),
                    child: Text('OK')),
                textColor: MyColors.whiteColor,
                color: MyColors.blueColor),
            FlatButton(
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.all(Radius.circular(10))),
                onPressed: () {
                  Navigator.of(context).pop(null);
                },
                child: Container(
                    alignment: Alignment.center,
                    width: Dimension.getWidth(0.6),
                    child: Text('Cancel')),
                textColor: MyColors.greyText,
                color: MyColors.whiteColor),
          ],
        ),
      ),
    );
  }
}
