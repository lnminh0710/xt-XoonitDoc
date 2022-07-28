import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/capture_response.dart';
import 'package:xoonit/app/ui/component/common_component.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/core/ultils.dart';

class CustomItemGridCapture extends StatelessWidget {
  final Capture captureItem;
  final Function onItemLongClick;
  final Function onItemClick;
  final Function onDeletePressed;
  final Function(bool) onItemSelectedChange;
  final bool isSelected;
  final bool isShowSelectedMode;
  final bool isShowDeleteIconOnThumnails;

  CustomItemGridCapture(
      {this.captureItem,
      this.onItemClick,
      this.onDeletePressed,
      this.isShowSelectedMode = false,
      this.onItemSelectedChange,
      this.onItemLongClick,
      this.isSelected,
      this.isShowDeleteIconOnThumnails = true});

  @override
  Widget build(BuildContext context) {
    return Card(
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(10))),
        child: Container(
          width: Dimension.getWidth(0.4),
          height: 220,
          decoration: BoxDecoration(
            color: MyColors.greyColor,
            borderRadius: BorderRadius.all(Radius.circular(10)),
          ),
          child: Column(
            children: <Widget>[
              Stack(children: <Widget>[
                GestureDetector(
                  onTap: () {
                    onItemClick();
                  },
                  child: Container(
                    height: 170,
                    width: Dimension.getWidth(0.4),
                    child: ClipRRect(
                      borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(10),
                          topRight: Radius.circular(10)),
                      child: Image(
                        image: NetworkImage(
                          GeneralMethod.getImageURL(captureItem.scannedPath,
                              captureItem.documentName, 200),
                        ),
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
                          return Center(
                            child: CircularProgressIndicator(),
                          );
                        },
                        errorBuilder: (context, error, stackTrace) {
                          return Center(
                              child: Icon(
                            Icons.error,
                            color: MyColors.whiteColor,
                          ));
                        },
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                ),
                isShowSelectedMode
                    ? Positioned(
                        top: 12,
                        right: 6,
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
                  decoration: BoxDecoration(
                      color: Colors.lightBlue,
                      borderRadius: BorderRadius.only(
                          bottomLeft: Radius.circular(10),
                          bottomRight: Radius.circular(10))),
                  padding: EdgeInsets.only(left: 6),
                  child: Stack(
                    children: <Widget>[
                      Container(
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
                                  'Document pages: ' +
                                      captureItem.numberOfImages.toString(),
                                  style: MyStyleText.textDocumentPages_10White,
                                ),
                              ],
                            ),
                            isShowDeleteIconOnThumnails
                                ? Expanded(
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: <Widget>[
                                        Padding(
                                          padding: const EdgeInsets.all(6.0),
                                          child: IconButton(
                                            onPressed: () {
                                              isShowSelectedMode
                                                  ? onItemClick()
                                                  : onDeletePressed();
                                            },
                                            icon: Image(
                                              image: AssetImage(
                                                  Resources.iconDelete),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  )
                                : Container(),
                          ],
                        ),
                      ),
                      isShowSelectedMode
                          ? Positioned(
                              right: 6,
                              bottom: 18,
                              child: Container(
                                child: CommonCheckbox(
                                  isChecked: isSelected,
                                  description: "",
                                  onChanged: (isChecked) {
                                    onItemSelectedChange(isChecked);
                                  },
                                ),
                              ),
                            )
                          : Container(),
                    ],
                  ),
                ),
              )
            ],
          ),
        ));
  }
}
