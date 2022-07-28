import 'dart:math';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:photo_view/photo_view.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/component/bottom_toolbar_review_document.dart';
import 'package:xoonit/app/ui/component/gallery_photo_view.dart';
import 'package:xoonit/app/ui/component/toolbar_ontop_review_document.dart';
import 'package:xoonit/app/ui/screen/capture/review_document_bloc.dart';
import 'package:xoonit/app/ui/screen/contact/contact_details/contact_details_component.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

import '../../../difinition.dart';

class ReviewDocumentScreen extends StatefulWidget {
  final bool isLocalImage;
  final bool isMydmPage;
  final List<String> listDocumentURL;
  final List<String> listDocumentName;
  final String idDocumentContainerScans;
  final String documentName;
  final String folderName;

  ReviewDocumentScreen({
    Key key,
    @required this.isLocalImage,
    @required this.listDocumentURL,
    @required this.listDocumentName,
    @required this.idDocumentContainerScans,
    this.documentName,
    @required this.isMydmPage,
    this.folderName,
  }) : super(key: key);

  @override
  State<StatefulWidget> createState() {
    return RenderScreen();
  }
}

class RenderScreen extends State<ReviewDocumentScreen> {
  bool isLocalImage;
  bool isMydmPage;
  List<String> listDocumentURL;
  List<String> listDocumentName;
  String idDocumentContainerScans;
  String documentName;
  String folderName;

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
    isMydmPage = widget.isMydmPage;
    listDocumentName = widget.listDocumentName;
    listDocumentURL = widget.listDocumentURL;
    idDocumentContainerScans = widget.idDocumentContainerScans;
    documentName = widget.documentName ?? "";
    folderName = widget.folderName ?? "Review Document";
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

  TextEditingController textCompanyController = new TextEditingController();
  TextEditingController textFirstNameController = new TextEditingController();
  TextEditingController textLastNameController = new TextEditingController();
  TextEditingController textAddressController = new TextEditingController();
  TextEditingController textPoBoxController = new TextEditingController();
  TextEditingController textPlzController = new TextEditingController();
  TextEditingController textOrtController = new TextEditingController();
  TextEditingController textPhoneNumberController = new TextEditingController();
  TextEditingController textEmailController = new TextEditingController();
  TextEditingController textInternetController = new TextEditingController();

  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  TextEditingController mailAddressController =
      new TextEditingController(text: "");
  TextEditingController subjectMailController =
      new TextEditingController(text: "");
  TextEditingController contentMailController =
      new TextEditingController(text: "");

  @override
  Widget build(BuildContext context) {
    SystemChrome.setEnabledSystemUIOverlays([SystemUiOverlay.bottom]);
    ReviewDocumentBloc reviewBloc = BlocProvider.of(context);

    return MaterialApp(
      home: Scaffold(
        key: scaffoldKey,
        appBar: PreferredSize(
          preferredSize: Size(Dimension.getWidth(1), 50),
          child: AppBar(
            leading: IconButton(
                icon: Icon(
                  Icons.arrow_back_ios,
                  color: MyColors.whiteColor,
                ),
                onPressed: () {
                  Navigator.pop(context);
                }),
            backgroundColor: MyColors.bluedarkColor,
            title: Text(
              folderName,
              textAlign: TextAlign.center,
              style: MyStyleText.white16Medium,
            ),
            centerTitle: true,
            actions: <Widget>[
              isMydmPage
                  ? Container()
                  : IconButton(
                      icon: Icon(Icons.subject),
                      onPressed: () {
                        scaffoldKey.currentState.showBottomSheet(
                          (context) => _buildContentBottomSheet(context),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.only(
                                topLeft: Radius.circular(10),
                                topRight: Radius.circular(10)),
                          ),
                          backgroundColor: MyColors.bluedarkColor,
                        );
                      },
                    )
            ],
          ),
        ),
        body: Stack(
          children: <Widget>[
            Container(
              color: MyColors.colorBackgroundScreen,
              width: Dimension.getWidth(1),
              height: Dimension.getHeight(1),
              child: Stack(
                children: <Widget>[
                  Column(children: <Widget>[
                    Container(
                      margin: EdgeInsets.only(top: 2),
                      width: Dimension.getWidth(1),
                      color: MyColors.blueDark3,
                      child: ToolbarTopReviewDoc(
                          onShareOtherMail: () {
                            reviewBloc.onShowDialogComposemail(
                                context,
                                mailAddressController,
                                subjectMailController,
                                contentMailController,
                                idDocumentContainerScans);
                          },
                          onDownloadDocument: () {
                            reviewBloc.downloadFile(context,
                                idDocumentContainerScans, documentName);
                          },
                          onSendToMail: () {
                            reviewBloc.onShareDocumentToMail(
                                context,
                                XoonitApplication.instance.getUserInfor().email,
                                "",
                                "",
                                idDocumentContainerScans);
                          },
                          onPrintDocument: () {
                            reviewBloc.printDocument(
                                idDocumentContainerScans, documentName);
                          },
                          onShowGroupPages: () {},
                          onEditDocument: () {},
                          onShowKeyWord: () {},
                          onShowToDoList: () {},
                          isMydmPage: isMydmPage),
                    ),
                    Container(
                      padding: EdgeInsets.only(top: 12, bottom: 12),
                      child: Text(
                        listDocumentName[currentIndex],
                        style: MyStyleText.white14Medium,
                        softWrap: true,
                        textAlign: TextAlign.center,
                      ),
                    ),
                    Expanded(
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
                  ]),
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
                            onZoomIn: () {
                              if (scaleCopy + 0.2 < 4.0) {
                                photoControllers[currentIndex].scale =
                                    scaleCopy + scaleCopy / 10;
                              }
                            },
                            onZoomOut: () {
                              if (scaleCopy - 0.1 > 0.1) {
                                photoControllers[currentIndex].scale =
                                    scaleCopy - scaleCopy / 10;
                              }
                            },
                            onResetStatus: () {
                              _rotate = 0.0;
                              photoControllers[currentIndex].rotation = _rotate;
                              scaleStateControllers[currentIndex].scaleState =
                                  PhotoViewScaleState.initial;
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            StreamBuilder<AppState>(
                stream: reviewBloc.screenState,
                initialData: AppState.Idle,
                builder: (context, snapshot) {
                  if (snapshot.hasData && snapshot.data == AppState.Loading) {
                    return Container(
                      color: Colors.black54,
                      width: Dimension.getWidth(1),
                      height: Dimension.getHeight(1),
                      child: Center(
                        child: CircularProgressIndicator(),
                      ),
                    );
                  } else {
                    return Container();
                  }
                })
          ],
        ),
      ),
    );
  }

  _buildContentBottomSheet(BuildContext context) => SingleChildScrollView(
        child: Container(
          child: Column(children: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Container(
                  margin: EdgeInsets.only(top: 8),
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: MyColors.whiteColor,
                    borderRadius: BorderRadius.all(Radius.circular(5)),
                  ),
                ),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                IconButton(
                    icon: Icon(
                      Icons.close,
                      color: MyColors.whiteColor,
                    ),
                    onPressed: () {
                      Navigator.of(context).pop();
                    }),
                IconButton(
                    icon: Image.asset(Resources.iconPersonal),
                    onPressed: () {}),
              ],
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: <Widget>[
                Text(
                  "COMPANY",
                  style: MyStyleText.white17Bold,
                ),
              ],
            ),
            ContactDetailsCommon(
              textCompanyController: textCompanyController,
              textFirstNameController: textFirstNameController,
              textLastNameController: textLastNameController,
              textAddressController: textAddressController,
              textPoBoxController: textPoBoxController,
              textPlzController: textPlzController,
              textOrtController: textOrtController,
              textPhoneNumberController: textPhoneNumberController,
              textEmailController: textEmailController,
              textInternetController: textInternetController,
            ),
          ]),
        ),
      );
}
