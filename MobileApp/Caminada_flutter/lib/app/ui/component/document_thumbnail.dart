import 'dart:io';

import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/constants/resources.dart';
import 'package:caminada/app/constants/styles.dart';
import 'package:caminada/app/difinition.dart';
import 'package:caminada/core/ultils.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'common_component.dart';

class CustomItemGridCapture extends StatelessWidget {
  final String imgPath;
  final String documentTreeName;
  final String createDate;
  final Color documentTypeColor;
  final int numberOfPages;
  final Function onItemLongClick;
  final Function onItemClick;
  final Function(bool) onItemSelectedChange;
  final bool isSelected;
  final bool isShowSelectedMode;
  final ModeViewDocument modeViewDocument;
  final bool isUploadFailed;

  CustomItemGridCapture({
    this.onItemClick,
    this.isShowSelectedMode = false,
    this.onItemSelectedChange,
    this.onItemLongClick,
    this.isSelected = false,
    @required this.imgPath,
    @required this.documentTreeName,
    this.numberOfPages = 1,
    this.isUploadFailed = false,
    this.createDate = "",
    this.modeViewDocument = ModeViewDocument.SingleMode,
    this.documentTypeColor,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
        onLongPress: () {
          onItemLongClick();
        },
        onTap: () {
          onItemClick();
        },
        child: Card(
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.all(Radius.circular(10))),
            child: Container(
              width: Dimension.getWidth(0.4),
              decoration: BoxDecoration(
                color: MyColors.blueLight,
                borderRadius: BorderRadius.all(Radius.circular(10)),
              ),
              child: Column(
                children: <Widget>[
                  Stack(children: <Widget>[
                    Container(
                        width: Dimension.getWidth(0.4),
                        child: ClipRRect(
                          borderRadius: BorderRadius.only(
                              topRight: Radius.circular(10),
                              topLeft: Radius.circular(10)),
                          child: AspectRatio(
                            aspectRatio: 3 / 4,
                            child: Image.file(
                              File(imgPath),
                              fit: BoxFit.fill,
                            ),
                          ),
                        )),
                    isUploadFailed
                        ? Positioned(
                            top: 8,
                            right: 8,
                            child: Container(
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: <Widget>[
                                  Image.asset(
                                    Resources.iconWarning,
                                    width: 24,
                                    height: 24,
                                  )
                                ],
                              ),
                            ),
                          )
                        : Container(),
                  ]),
                  Container(
                    decoration: BoxDecoration(
                      color: documentTypeColor,
                      borderRadius: BorderRadius.only(
                          bottomLeft: Radius.circular(10),
                          bottomRight: Radius.circular(10)),
                    ),
                    padding: EdgeInsets.only(left: 12, bottom: 6, top: 6),
                    child: Stack(
                      children: <Widget>[
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: <Widget>[
                            Text(
                              'Type: ' + documentTreeName,
                              style: MyStyleText.docTypeBlue13Medium,
                            ),
                            SizedBox(
                              height: 4,
                            ),
                            modeViewDocument == ModeViewDocument.SingleMode
                                ? Text(
                                    'Date: ' + createDate,
                                    style: MyStyleText.docDetailBlue12Regular,
                                  )
                                : Text(
                                    'Pages: ' + numberOfPages?.toString(),
                                    style: MyStyleText.docDetailBlue12Regular,
                                  ),
                          ],
                        ),
                        isShowSelectedMode
                            ? Container(
                                padding: EdgeInsets.only(right: 12, top: 12),
                                alignment: Alignment.bottomRight,
                                child: CommonCheckbox(
                                  size: 15,
                                  isChecked: isSelected,
                                  onChanged: (bool value) {
                                    onItemClick();
                                  },
                                ))
                            : Container(),
                      ],
                    ),
                  )
                ],
              ),
            )));
  }
}
