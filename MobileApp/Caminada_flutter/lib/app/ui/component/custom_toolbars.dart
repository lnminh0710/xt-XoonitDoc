import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/constants/resources.dart';
import 'package:caminada/app/constants/styles.dart';
import 'package:caminada/app/ui/screen/gallery/gallery_bloc.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../../difinition.dart';

class BottomToolBarGallery extends StatelessWidget {
  final GalleryBloc galleryBloc;
  BottomToolBarGallery({
    Key key,
    @required this.galleryBloc,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 4.0),
      decoration: BoxDecoration(
        color: MyColors.whiteColor,
        borderRadius: BorderRadius.all(Radius.circular(30)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: <Widget>[
          GestureDetector(
            onTap: () {
              galleryBloc.onShowDialogSelectDocType(context: context);
            },
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Image.asset(
                  Resources.iconSelectDocType,
                  width: 16,
                  height: 18,
                  color: MyColors.blueDark,
                ),
                Text("Doc Type", style: MyStyleText.docDetailBlue12Regular)
              ],
            ),
          ),
          GestureDetector(
            onTap: () {
              galleryBloc.onUploadImage(context);
            },
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Image.asset(
                  Resources.iconUpload,
                  width: 16,
                  height: 18,
                  color: MyColors.blueDark,
                ),
                Text("Upload", style: MyStyleText.docDetailBlue12Regular)
              ],
            ),
          ),
          StreamBuilder<ModeViewDocument>(
              stream: galleryBloc.modeViewDocument,
              initialData: ModeViewDocument.SingleMode,
              builder: (context, modeViewDocument) {
                return modeViewDocument.data == ModeViewDocument.SingleMode
                    ? GestureDetector(
                        onTap: () {
                          galleryBloc.onChangeGroupDocument(context);
                        },
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: <Widget>[
                            Image.asset(
                              Resources.iconViewBatch,
                              width: 16,
                              height: 18,
                              color: MyColors.blueDark,
                            ),
                            Text("Group",
                                style: MyStyleText.docDetailBlue12Regular)
                          ],
                        ),
                      )
                    : GestureDetector(
                        onTap: () {
                          galleryBloc.onChangeGroupDocument(context);
                        },
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: <Widget>[
                            Image.asset(
                              Resources.iconViewSingle,
                              width: 16,
                              height: 18,
                              color: MyColors.blueDark,
                            ),
                            Text("UnGroup",
                                style: MyStyleText.docDetailBlue12Regular)
                          ],
                        ),
                      );
              }),
          GestureDetector(
            onTap: () {
              galleryBloc..onDeleteDocument(context);
            },
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Image.asset(Resources.iconDeleteDoc,
                    width: 16, height: 18, color: Colors.red),
                Text(
                  "Delete",
                  style: TextStyle(
                    color: Colors.red,
                    fontSize: 12,
                    fontWeight: FontWeight.normal,
                    fontFamily: FontFamily.robotoRegular,
                  ),
                )
              ],
            ),
          ),
        ],
      ),
    );
  }
}
