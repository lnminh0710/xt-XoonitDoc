import 'dart:async';
import 'dart:io';
import 'dart:math';

import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/constants/styles.dart';
import 'package:flutter/material.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';

class PhotosDetailScreen extends StatelessWidget {
  List<String> lsImagePath;

  PhotosDetailScreen({this.lsImagePath});

  PageController pageController = PageController();
  StreamController<int> _onPageChanged = StreamController();
  List<PhotoViewController> lsPhotoViewController = [];

  final maxScale = 2.0;
  final minScale = 0.8;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      backgroundColor: MyColors.primaryColor,
      appBar: AppBar(
        centerTitle: true,
        title: Text(
          'Photo Detail',
          style: MyStyleText.white20Medium,
        ),
        elevation: 0,
        backgroundColor: MyColors.primaryColor,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: Colors.white),
          highlightColor: Colors.transparent,
          onPressed: () {
            Navigator.pop(context);
          },
        ),
      ),
      body: Container(
          clipBehavior: Clip.hardEdge,
          decoration: BoxDecoration(
              color: MyColors.backgroundGallery,
              borderRadius: new BorderRadius.only(
                topLeft: const Radius.circular(40.0),
                topRight: const Radius.circular(40.0),
              )),
          child: Stack(
            alignment: Alignment.topCenter,
            children: <Widget>[
              PhotoViewGallery.builder(
                  backgroundDecoration:
                      BoxDecoration(color: MyColors.backgroundGallery),
                  enableRotation: true,
                  scrollPhysics: const BouncingScrollPhysics(),
                  builder: (_, int index) {
                    PhotoViewController photoCtrl;
                    if (!lsPhotoViewController.asMap().containsKey(index)) {
                      photoCtrl = PhotoViewController();
                      lsPhotoViewController.add(photoCtrl);
                    } else {
                      photoCtrl = lsPhotoViewController[index];
                    }

                    return PhotoViewGalleryPageOptions.customChild(
                        controller: photoCtrl,
                        initialScale: minScale,
                        minScale: minScale,
                        maxScale: maxScale,
                        child: Image.file(File(lsImagePath[index])));

                    // return PhotoViewGalleryPageOptions(
                    //     controller: photoCtrl,
                    //     imageProvider: FileImage(File(lsImagePath[index])),
                    //     initialScale: minScale,
                    //     minScale: minScale,
                    //     maxScale: maxScale);
                  },
                  pageController: pageController,
                  itemCount: lsImagePath.length,
                  onPageChanged: (i) {
                    _onPageChanged.sink.add(i + 1);
                  }),
              StreamBuilder<int>(
                  stream: _onPageChanged.stream,
                  builder: (_, snapShot) {
                    return lsImagePath.length > 1
                        ? Container(
                            margin: EdgeInsets.all(16),
                            padding: EdgeInsets.fromLTRB(8, 4, 8, 4),
                            decoration: ShapeDecoration(
                                color: Color(0xff1378C5),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                )),
                            child: Wrap(
                              children: <Widget>[
                                Text('${snapShot?.data ?? 1}',
                                    style: MyStyleText.white14Bold),
                                Text('/${lsImagePath.length}',
                                    style: MyStyleText.white14Regular)
                              ],
                            ),
                          )
                        : SizedBox.shrink();
                  }),
              Container(
                margin: EdgeInsets.all(16),
                alignment: Alignment.bottomCenter,
                child: Card(
                  elevation: 5,
                  child: Wrap(
                    children: <Widget>[
                      IconButton(
                        icon: Icon(Icons.zoom_in),
                        onPressed: () {
                          var photoCtrl = lsPhotoViewController[
                              pageController.page.toInt()];
                          var scale = photoCtrl.scale * 1.5;
                          if (scale >= maxScale) scale = maxScale;
                          photoCtrl.scale = scale;
                        },
                      ),
                      IconButton(
                        icon: Icon(Icons.zoom_out),
                        onPressed: () {
                          var photoCtrl = lsPhotoViewController[
                              pageController.page.toInt()];
                          var scale = photoCtrl.scale / 1.5;
                          if (scale <= minScale) scale = minScale;
                          photoCtrl.scale = scale;
                        },
                      ),
                      IconButton(
                        icon: Icon(Icons.rotate_left),
                        onPressed: () {
                          var photoCtrl = lsPhotoViewController[
                              pageController.page.toInt()];
                          var rotate = photoCtrl.rotation -= pi / 2;
                          if (rotate == -2 * pi) rotate = 0;
                          photoCtrl.rotation = rotate;
                        },
                      ),
                      IconButton(
                        icon: Icon(Icons.rotate_right),
                        onPressed: () {
                          var photoCtrl = lsPhotoViewController[
                              pageController.page.toInt()];
                          var rotate = photoCtrl.rotation += pi / 2;
                          if (rotate == 2 * pi) rotate = 0;
                          photoCtrl.rotation = rotate;
                        },
                      ),
                    ],
                  ),
                ),
              )
            ],
          )),
    );
  }
}
