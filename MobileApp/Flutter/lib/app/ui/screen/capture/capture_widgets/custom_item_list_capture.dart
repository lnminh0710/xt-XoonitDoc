import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/capture_response.dart';
import 'package:xoonit/app/ui/component/common_component.dart';
import 'package:xoonit/core/ultils.dart';

import '../../../../difinition.dart';

class CustomItemGridCapture extends StatelessWidget {
  final CaptureResponse captureItem;
  final Function onItemLongClick;
  final Function onItemClick;
  final Function onDeletePressed;
  final Function(bool) onItemSelectedChange;
  final bool isSelected;
  final bool isShowSelectedMode;

  CustomItemGridCapture(
      {this.captureItem,
      this.onItemClick,
      this.onDeletePressed,
      this.isShowSelectedMode = false,
      this.onItemSelectedChange,
      this.onItemLongClick,
      this.isSelected});

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
            height: 250,
            decoration: BoxDecoration(
              color: MyColors.bluedarkColor,
              borderRadius: BorderRadius.all(Radius.circular(10)),
            ),
            child: Column(
              children: <Widget>[
                Stack(children: <Widget>[
                  Container(
                    height: 200,
                    width: Dimension.getWidth(0.4),
                    decoration: BoxDecoration(
                        borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(10),
                            topRight: Radius.circular(10)),
                        image: DecorationImage(
                            image: CachedNetworkImageProvider(appBaseUrl +
                                "FileManager/GetFile?mode=6&w=300&name=" +
                                captureItem.scannedPath +
                                "\\" +
                                captureItem.documentName),
                            fit: BoxFit.cover)),
                    foregroundDecoration: isShowSelectedMode
                        ? BoxDecoration(color: Colors.black54)
                        : BoxDecoration(color: Colors.transparent),
                  ),
                  isShowSelectedMode
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
                                  onChanged: (isChecked) {
                                    onItemSelectedChange(isChecked);
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
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: <Widget>[
                            Text(
                              '1.' + captureItem.documentType,
                              style: MyStyleText.textDoctype_12White,
                            ),
                            Text(
                              'Document Pages: ' + captureItem.numberOfImages
                                  .toString(),
                              style: MyStyleText.textDocumentPages_10White,
                            ),
                          ],
                        ),
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.all(6.0),
                            child: IconButton(
                              onPressed: () {
                                isShowSelectedMode
                                    ? onItemClick()
                                    : onDeletePressed();
                              },
                              icon: Image(
                                image: AssetImage(Resources.iconDelete),
                              ),
                            ),
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
