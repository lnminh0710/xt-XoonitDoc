import 'dart:ui';

import 'package:caminada/app/routes/routes.dart';
import 'package:caminada/app/ui/component/custom_toolbars.dart';
import 'package:caminada/app/ui/screen/gallery/custom_appbar_gallery.dart';
import 'package:caminada/app/utils/general_method.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_icons/flutter_icons.dart';

import '../../../../core/bloc_base.dart';
import '../../../../core/ultils.dart';
import '../../../constants/colors.dart';
import '../../../constants/resources.dart';
import '../../../constants/styles.dart';
import '../../../difinition.dart';
import 'gallery_bloc.dart';
import 'gallery_list_document_batchmode.dart';
import 'gallery_list_document_singlemode.dart';

class GalleryScreen extends StatelessWidget {
  GalleryScreen({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    GalleryBloc galleryBloc = BlocProvider.of(context);
    return StreamBuilder<AppState>(
        stream: galleryBloc.screenState,
        initialData: AppState.Idle,
        builder: (context, screenState) {
          return Stack(
            children: <Widget>[
              StreamBuilder<bool>(
                  stream: galleryBloc.selectionMode,
                  initialData: true,
                  builder: (context, isOnSelectionMode) {
                    return Scaffold(
                      resizeToAvoidBottomInset: false,
                      extendBody: true,
                      backgroundColor: MyColors.whiteColor,
                      drawer: Theme(
                        data: Theme.of(context).copyWith(
                          // Set the transparency here
                          canvasColor: Colors
                              .transparent, //or any other color you want. e.g Colors.blue.withOpacity(0.5)
                        ),
                        child: Drawer(
                          child: _buildDrawer(context, galleryBloc),
                        ),
                      ),
                      // appBar: _buildAppBar(context, galleryBloc),
                      appBar: PreferredSize(
                        preferredSize: Size(Dimension.getWidth(1), 50),
                        child: isOnSelectionMode.data
                            ? AppBarSelectionMode(galleryBloc: galleryBloc)
                            : AppBarReViewDocument(galleryBloc: galleryBloc),
                      ),
                      floatingActionButtonAnimator:
                          FloatingActionButtonAnimator.scaling,
                      floatingActionButtonLocation:
                          FloatingActionButtonLocation.centerFloat,
                      floatingActionButton: screenState.hasData &&
                                  screenState.data == AppState.Loading ||
                              isOnSelectionMode.data
                          ? Container()
                          : Padding(
                              padding: EdgeInsets.only(bottom: 20.0),
                              child: FloatingActionButton(
                                child: Icon(Icons.camera_alt),
                                onPressed: () {
                                  galleryBloc.clearWarning();
                                  GeneralMethod.openCamera().then((value) {
                                    galleryBloc.refreshScreenAndSelectAll();
                                  });
                                },
                              ),
                            ),
                      body: Stack(
                        children: <Widget>[
                          Container(
                            width: Dimension.getWidth(1),
                            height: Dimension.getHeight(1),
                            color: MyColors.primaryColor,
                          ),
                          Container(
                            width: Dimension.getWidth(1),
                            height: Dimension.getHeight(1),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.only(
                                  topLeft: Radius.circular(20),
                                  topRight: Radius.circular(20)),
                              color: MyColors.backgroundGallery,),
                            child: Padding(
                              padding: EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 12),
                              child: Column(
                                children: <Widget>[
                                  isOnSelectionMode.data
                                      ? StreamBuilder<bool>(
                                          stream:
                                              galleryBloc.isSelectAllDocument,
                                          builder:
                                              (context, isSelectAllDocument) {
                                            return isSelectAllDocument.hasData
                                                ? BottomToolBarGallery(galleryBloc: galleryBloc)
                                                : Container();
                                          })
                                      : Container(),
                                  StreamBuilder<ModeViewDocument>(
                                    stream: galleryBloc.modeViewDocument,
                                    initialData: ModeViewDocument.SingleMode,
                                    builder: (context, modeViewDocument) {
                                      if (modeViewDocument.data ==
                                          ModeViewDocument.SingleMode) {
                                        return SingleDocument(
                                          context: context,
                                          galleryBloc: galleryBloc,
                                        );
                                      } else {
                                        return BatchDocument(
                                          context: context,
                                          galleryBloc: galleryBloc,
                                        );
                                      }
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
              !(screenState.hasData && screenState.data == AppState.Idle)
                  ? Container(
                      color: MyColors.blackTrans,
                      width: Dimension.getWidth(1),
                      height: Dimension.getHeight(1),
                      child: Center(
                        child: CircularProgressIndicator(),
                      ),
                    )
                  : Container()
            ],
          );
        });
  }

  Widget _buildDrawer(BuildContext context, GalleryBloc galleryBloc) =>
      Container(
        decoration: BoxDecoration(
          color: MyColors.backgroundDrawer,
          borderRadius: BorderRadius.only(
              topRight: Radius.circular(24),
              bottomRight: Radius.circular(24)),
          shape: BoxShape.rectangle,
        ),
        padding: EdgeInsets.only(top: 50),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.max,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(left: 24, right: 100),
              child: Image.asset(
                Resources.logoSplashCaminada,
              ),
            ),
            Container(
              margin: EdgeInsets.only(top: 15, bottom: 60),
              height: 1,
              color: MyColors.backgroundSearchBarColor,
            ),
            drawerItem(
                icon: Icons.photo_camera,
                text: 'Capture',
                onItemTap: () {
                  galleryBloc.clearWarning();
                  GeneralMethod.openCamera().then((value) {
                    Navigator.of(context).pop();
                    galleryBloc.refreshScreenAndSelectAll();
                  });
                }),
            Container(
              margin: EdgeInsets.only(left: 24),
              height: 1,
              color: MyColors.backgroundSearchBarColor,
            ),
            drawerItem(
                icon: Icons.image,
                text: 'Gallery',
                onItemTap: () {
                  Navigator.of(context).pop();
                  galleryBloc.refreshScreen();
                }),
            Container(
              margin: EdgeInsets.only(left: 24),
              height: 1,
              color: MyColors.backgroundSearchBarColor,
            ),
            drawerItem(
                icon: Icons.access_time,
                text: 'History',
                onItemTap: () {
                  Navigator.of(context)
                      .pushNamed(RoutesName.HISTORY)
                      .then((value) {
                    Navigator.of(context).pop();
                    galleryBloc.clearWarning();
                  });
                }),
            Container(
              margin: EdgeInsets.only(left: 24),
              height: 1,
              color: MyColors.backgroundSearchBarColor,
            ),
            drawerItem(
                icon: FontAwesome.sign_out,
                text: 'Sign out',
                color: MyColors.redDark,
                onItemTap: () {
                  GeneralMethod.clearUserData();
                  Navigator.of(context)
                      .pushReplacementNamed(RoutesName.LOGIN_SCREEN);
                }),
            Expanded(child: Container()),
            Padding(
              padding: const EdgeInsets.only(left: 20, right: 20, bottom: 40),
              child: Image.asset(Resources.splashLogoDocument),
            )
          ],
        ),
      );

  Widget drawerItem(
          {IconData icon, String text, Function onItemTap, Color color}) =>
      GestureDetector(
        onTap: onItemTap,
        child: Container(
          padding: const EdgeInsets.only(left: 24, top: 15, bottom: 15),
          color: Colors.transparent,
          child: Row(
            children: <Widget>[
              Padding(
                padding: const EdgeInsets.only(right: 22),
                child: Icon(
                  icon,
                  size: 28,
                  color: color ?? MyColors.blueDark,
                ),
              ),
              Text(
                text,
                style: MyStyleText.blueDark16Medium
                    .merge(TextStyle(color: color ?? MyColors.blueDark)),
              )
            ],
          ),
        ),
      );
}
