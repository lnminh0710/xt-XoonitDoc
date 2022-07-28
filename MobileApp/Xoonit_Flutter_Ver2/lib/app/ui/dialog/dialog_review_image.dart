import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:photo_view/photo_view.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/ui/component/bottom_toolbar_review_document.dart';
import 'package:xoonit/app/ui/component/gallery_photo_view.dart';

class ReviewImageDialog extends StatefulWidget {
  final bool isLocalImage;
  final List<String> listDocumentURL;
  final List<String> listDocumentName;
  final bool isEditableDocument;
  final Function(int) saveEditImage;
  ReviewImageDialog({
    Key key,
    this.isLocalImage,
    @required this.listDocumentURL,
    @required this.listDocumentName,
    @required this.isEditableDocument,
    this.saveEditImage,
  }) : super(key: key);

  @override
  State<StatefulWidget> createState() {
    return RenderReviewImageDialog();
  }
}

class RenderReviewImageDialog extends State<ReviewImageDialog> {
  bool isLocalImage;
  List<String> listDocumentURL;
  List<String> listDocumentName;
  bool isEditableDocument;
  Function(int) saveEditImage;

  int index = 0;
  double scaleCopy = 1;

  double _rotate = 0;
  int currentIndex = 0;
  Matrix4 _matrix = Matrix4.identity();
  Matrix4 preMatrix = Matrix4.identity();
  List<PhotoViewScaleStateController> scaleStateControllers;
  List<PhotoViewController> photoControllers;
  List<GalleryExampleItem> galleryItems;

  @override
  void initState() {
    super.initState();
    isLocalImage = widget.isLocalImage;
    listDocumentName = widget.listDocumentName;
    listDocumentURL = widget.listDocumentURL;
    isEditableDocument = widget.isEditableDocument;
    saveEditImage = widget.saveEditImage;
    photoControllers = listDocumentURL
        .map((e) => PhotoViewController()..outputStateStream.listen(listener))
        .toList();
    scaleStateControllers =
        listDocumentURL.map((e) => PhotoViewScaleStateController()).toList();
    galleryItems = listDocumentURL.map((e) {
      return GalleryExampleItem(resource: e);
    }).toList();
  }

  @override
  void dispose() {
    photoControllers.forEach((element) {
      element?.dispose();
    });
    scaleStateControllers.forEach((element) {
      element?.dispose();
    });
    super.dispose();
  }

  void listener(PhotoViewControllerValue value) {
    printLog('listener');
    setState(() {
      scaleCopy = value.scale;
      double rotate = value.rotation;
      if (rotate > 2 * pi) {
        rotate = rotate % (2.0 * pi);
      }
      if (rotate % (pi / 4.0) != 0) {
        photoControllers[currentIndex].rotation = _rotate;
      }
      printLog('listener scaleCopy: ' +
          scaleCopy.toString() +
          '   rotate: ' +
          rotate.toString());
    });
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setEnabledSystemUIOverlays([SystemUiOverlay.bottom]);
    return Material(
      color: Colors.black54,
      child: Stack(children: <Widget>[
        Center(
          child: Column(
            children: <Widget>[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: <Widget>[
                  Container(
                      child: IconButton(
                          icon: Icon(
                            Icons.close,
                            color: MyColors.whiteColor,
                          ),
                          iconSize: 24,
                          onPressed: () {
                            Navigator.of(context).pop();
                          })),
                  isEditableDocument
                      ? Container(
                          child: IconButton(
                              icon: Icon(
                                Icons.save,
                                color: MyColors.whiteColor,
                              ),
                              iconSize: 24,
                              onPressed: () {
                                saveEditImage(convertRadians2Degrees(
                                    photoControllers[index].rotation));
                                Navigator.of(context).pop();
                              }))
                      : SizedBox.shrink(),
                ],
              ),
              Container(
                margin: EdgeInsets.only(top: 8, bottom: 8),
                child: Text(
                  listDocumentName[index],
                  style: MyStyleText.white14Medium,
                  softWrap: true,
                  textAlign: TextAlign.center,
                ),
              ),
              Expanded(
                child: Container(
                  child: Transform(
                    transform: _matrix,
                    child: GalleryPhotoViewWrapper(
                      photoControllers: photoControllers,
                      scaleStateControllers: scaleStateControllers,
                      galleryItems: galleryItems,
                      isNetworkImage: !isLocalImage,
                      backgroundDecoration: const BoxDecoration(
                        color: Colors.black,
                      ),
                      initialIndex: 0,
                      onPageChange: (index) {
                        _rotate = 0.0;
                        photoControllers[index].reset();
                        scaleStateControllers[index].reset();
                        photoControllers[index].rotation = _rotate;
                        scaleStateControllers[index].scaleState =
                            PhotoViewScaleState.initial;
                        currentIndex = index;
                      },
                      scrollDirection: Axis.horizontal,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        Container(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Align(
                alignment: Alignment.bottomCenter,
                child: BottomToolbar(
                  onRotationLeft: () {
                    _rotate = _rotate - pi / 2;
                    photoControllers[currentIndex].rotation = _rotate;
                  },
                  onRotationRight: () {
                    _rotate = _rotate + pi / 2;
                    photoControllers[currentIndex].rotation = _rotate;
                  },
                ),
              ),
            ],
          ),
        ),
      ]),
    );
  }

  int convertRadians2Degrees(double radians) {
    int degress = (radians * (180 / pi)).toInt();
    return degress;
  }
}
