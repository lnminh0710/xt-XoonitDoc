import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:photo_view/photo_view.dart';
import 'package:photo_view/photo_view_gallery.dart';

class GalleryPhotoViewWrapper extends StatefulWidget {
  GalleryPhotoViewWrapper({
    this.loadingBuilder,
    this.backgroundDecoration,
    this.minScale,
    this.maxScale,
    this.initialIndex,
    this.photoControllers,
    this.scaleStateControllers,
    this.isNetworkImage = true,
    this.onPageChange,
    @required this.galleryItems,
    this.scrollDirection = Axis.horizontal,
  }) : pageController = PageController(initialPage: initialIndex);

  final LoadingBuilder loadingBuilder;
  final Decoration backgroundDecoration;
  final dynamic minScale;
  final dynamic maxScale;
  final int initialIndex;
  final PageController pageController;
  final List<GalleryExampleItem> galleryItems;
  final Axis scrollDirection;
  final List<PhotoViewScaleStateController> scaleStateControllers;
  final List<PhotoViewController> photoControllers;
  final Function(int) onPageChange;
  final bool isNetworkImage;

  @override
  State<StatefulWidget> createState() {
    return _GalleryPhotoViewWrapperState();
  }
}

class _GalleryPhotoViewWrapperState extends State<GalleryPhotoViewWrapper> {
  int currentIndex;

  @override
  void initState() {
    currentIndex = widget.initialIndex;
    super.initState();
  }

  void onPageChanged(int index) {
    widget.onPageChange(index);
    setState(() {
      currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: widget.backgroundDecoration,
        constraints: BoxConstraints.expand(
          height: MediaQuery.of(context).size.height,
        ),
        child: Stack(
          alignment: Alignment.bottomRight,
          children: <Widget>[
            PhotoViewGallery.builder(
              scrollPhysics: const BouncingScrollPhysics(),
              builder: _buildItem,
              itemCount: widget.galleryItems.length,
              loadingBuilder: widget.loadingBuilder,
              backgroundDecoration: widget.backgroundDecoration,
              pageController: widget.pageController,
              onPageChanged: onPageChanged,
              enableRotation: true,
              scrollDirection: widget.scrollDirection,
            ),
            // Container(
            //   padding: const EdgeInsets.all(20.0),
            //   child: Text(
            //     "Image ${currentIndex + 1}",
            //     style: const TextStyle(
            //       color: Colors.white,
            //       fontSize: 17.0,
            //       decoration: null,
            //     ),
            //   ),
            // )
          ],
        ),
      ),
    );
  }

  PhotoViewGalleryPageOptions _buildItem(BuildContext context, int index) {
    final GalleryExampleItem item = widget.galleryItems[index];
    return PhotoViewGalleryPageOptions(
      imageProvider: widget.isNetworkImage
          ? CachedNetworkImageProvider(item.resource)
          : FileImage(File(item.resource)),
      minScale: PhotoViewComputedScale.contained,
      maxScale: PhotoViewComputedScale.covered * 5,
      controller: widget.photoControllers[index],
      scaleStateController: widget.scaleStateControllers[index],
    );
    // return PhotoView(
    //   enableRotation: true,
    //   minScale: PhotoViewComputedScale.contained,
    //   maxScale: PhotoViewComputedScale.covered * 5,
    //   controller: widget.photoController,
    //   initialScale: PhotoViewComputedScale.contained,
    //   scaleStateController: widget.scaleStateController,
    //   imageProvider: CachedNetworkImageProvider(item.resource),
    // );
  }
}

class GalleryExampleItem {
  GalleryExampleItem({this.id, this.resource, this.isSvg = false});

  final String id;
  final String resource;
  final bool isSvg;
}
