import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/constants/styles.dart';
import 'package:caminada/app/difinition.dart';
import 'package:caminada/app/ui/screen/gallery/gallery_bloc.dart';
import 'package:caminada/core/ultils.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class AppBarReViewDocument extends StatelessWidget {
  final GalleryBloc galleryBloc;
  AppBarReViewDocument({
    Key key,
    @required this.galleryBloc,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    double width = Dimension.getWidth(0.1);
    return AppBar(
      elevation: 0.0,
      iconTheme: new IconThemeData(color: MyColors.whiteColor),
      backgroundColor: MyColors.primaryColor,
      centerTitle: true,
      title: StreamBuilder<ModeViewDocument>(
          stream: galleryBloc.modeViewDocument,
          builder: (context, modeViewDocument) {
            return Container(
              width: 180,
              height: 25,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  RaisedButton(
                    child: new Text(
                      "Single",
                      style: MyStyleText.white16Medium,
                    ),
                    onPressed: () {
                      galleryBloc.onSwitchModeView(ModeViewDocument.SingleMode);
                    },
                    padding: EdgeInsets.symmetric(horizontal: width / 2),
                    shape: new RoundedRectangleBorder(
                      borderRadius: new BorderRadius.only(
                        topLeft: Radius.circular(30),
                        bottomLeft: Radius.circular(30),
                      ),
                    ),
                    color: modeViewDocument.data == ModeViewDocument.SingleMode
                        ? MyColors.blueColor
                        : MyColors.greyColor,
                  ),
                  RaisedButton(
                      child: new Text(
                        "Batch",
                        style: MyStyleText.white16Medium,
                      ),
                      onPressed: () {
                        galleryBloc
                            .onSwitchModeView(ModeViewDocument.BatchMode);
                      },
                      padding: EdgeInsets.symmetric(horizontal: width / 2),
                      shape: new RoundedRectangleBorder(
                        borderRadius: new BorderRadius.only(
                          topRight: Radius.circular(30),
                          bottomRight: Radius.circular(30),
                        ),
                      ),
                      color:
                          modeViewDocument.data == ModeViewDocument.BatchMode
                              ? MyColors.blueColor
                              : MyColors.greyColor),
                ],
              ),
            );
          }),
      // actions: <Widget>[
      //   IconButton(
      //     icon: Icon(Icons.view_list),
      //     onPressed: () {
      //       galleryBloc.changeSelectionMode(true);
      //     },
      //   ),
      // ],
    );
  }
}

class AppBarSelectionMode extends StatelessWidget {
  final GalleryBloc galleryBloc;
  AppBarSelectionMode({
    Key key,
    @required this.galleryBloc,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<bool>(
        stream: galleryBloc.isSelectAllDocument,
        builder: (context, isSelectAllDocument) {
          return AppBar(
            elevation: 0.0,
            iconTheme: new IconThemeData(color: MyColors.whiteColor),
            backgroundColor: MyColors.primaryColor,
            title: Text(
              "Select Document",
              style: MyStyleText.white17Bold,
            ),
            centerTitle: true,
            leading: IconButton(
                icon: Icon(Icons.close),
                onPressed: () {
                  galleryBloc.changeSelectionMode(false);
                }),
            actions: <Widget>[
              isSelectAllDocument.hasData
                  ? isSelectAllDocument.data
                      ? IconButton(
                          icon: Icon(
                            Icons.check_box,
                            color: MyColors.whiteColor,
                          ),
                          onPressed: () {
                            galleryBloc.selectAllDocument(false);
                          },
                        )
                      : IconButton(
                          icon: Icon(
                            Icons.check_box_outline_blank,
                            color: MyColors.whiteColor,
                          ),
                          onPressed: () {
                            galleryBloc.selectAllDocument(true);
                          },
                        )
                  : Container(),
            ],
          );
        });
  }
}
