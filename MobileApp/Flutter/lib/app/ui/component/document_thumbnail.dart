import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/ui/component/common_component.dart';
import 'package:xoonit/core/ultils.dart';

class DocumentThumbnail extends StatelessWidget {
  final String imgPath;
  final String documentType;
  final int numOfImg;
  final Function onItemLongClick;
  final Function(bool) onItemSelectedChange;
  final bool isLocalFile;
  final bool isSelectedMode;
  final Function onDeleteButtonPressed;
  final Function onItemClick;
  final bool isSelected;
  DocumentThumbnail(
      {Key key,
      @required this.imgPath,
      this.numOfImg = 1,
      this.documentType = '',
      this.isSelectedMode = false,
      this.isLocalFile = false,
      this.onItemSelectedChange,
      this.onDeleteButtonPressed,
      this.isSelected = false,
      this.onItemClick,
      this.onItemLongClick})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPress: () {
        onItemLongClick();
      },
      onTap: (){
        onItemClick();
      },
      child: Card(
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(10))),
          child: Container(
            width: Dimension.getWidth(0.45),
            height: 280,
            decoration: BoxDecoration(
              color: MyColors.bluedarkColor,
              borderRadius: BorderRadius.all(Radius.circular(10)),
            ),
            child: Column(
              children: <Widget>[
                Stack(children: <Widget>[
                  Container(
                    height: 180,
                    width: Dimension.getWidth(0.45),
                    decoration: BoxDecoration(
                        borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(10),
                            topRight: Radius.circular(10)),
                        image: isLocalFile
                            ? DecorationImage(
                                image: FileImage(File(imgPath)),
                                fit: BoxFit.cover)
                            : DecorationImage(
                                image: CachedNetworkImageProvider(imgPath),
                                fit: BoxFit.cover)),
                    foregroundDecoration: isSelectedMode
                        ? BoxDecoration(color: Colors.black54)
                        : BoxDecoration(color: Colors.transparent),
                  ),
                  isSelectedMode
                      ? Positioned(
                          top: 12,
                          right: 20,
                          child: Container(
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: <Widget>[
                                CommonCheckbox(
                                  isChecked: isSelected,
                                  description: "",
                                  onChanged: (bool value) {
                                    printLog(value.toString());
                                    onItemSelectedChange(value);
                                  },
                                ),
                              ],
                            ),
                          ),
                        )
                      : Container(),
                ]),
                Expanded(
                  child: Container(
                    padding: EdgeInsets.only(left: 6),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: <Widget>[
                        Flexible(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: <Widget>[
                              Text(
                                documentType,
                                style: MyStyleText.textDoctype_12White,
                              ),
                              Text(
                                'Document Pages: ' + numOfImg.toString(),
                                style: MyStyleText.textDocumentPages_10White,
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          onPressed: () {
                            onDeleteButtonPressed();
                          },
                          icon: Image(
                            height: 18,
                            width: 18,
                            image: AssetImage(Resources.iconDelete),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              ],
            ),
          )),
    );
  }
}
