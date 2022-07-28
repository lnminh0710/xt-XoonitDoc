import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:photo_view/photo_view.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/document_attachment.dart';
import 'package:xoonit/app/ui/component/gallery_photo_view.dart';
import 'package:xoonit/app/ui/component/loading_checking_cloud_connection.dart';
import 'package:xoonit/app/ui/component/toolbar_review_document.dart';
import 'package:xoonit/app/ui/screen/capture/review_document_screen/popup_assign_document.dart';
import 'package:xoonit/app/ui/screen/capture/review_document_screen/review_document_bloc.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

import '../../../../../core/ultils.dart';
import '../../../../constants/colors.dart';
import '../../../../constants/styles.dart';
import '../../../../difinition.dart';
import 'bottomsheet_reviewdocument.dart';

class ReviewDocumentScreen extends StatefulWidget {
  final bool isEditableDocument;
  final bool isHasTodoNotesField;
  ReviewDocumentScreen({
    Key key,
    @required this.isEditableDocument,
    this.isHasTodoNotesField = false,
  }) : super(key: key);

  @override
  State<StatefulWidget> createState() {
    return RenderScreen();
  }
}

class RenderScreen extends State<ReviewDocumentScreen> {
  Matrix4 _matrix = Matrix4.identity();
  List<PhotoViewScaleStateController> scaleStateControllers = new List();
  List<PhotoViewController> photoControllers = new List();
  List<GalleryExampleItem> galleryItems = new List();
  DashBoardBloc _dashBoardBloc;
  String _folderName;
  double _rotate = 0;
  int _currentIndex = 0;
  bool isEditableDocument;
  bool isDocumentChanged = false;
  bool isShowFieldNotes = false;
  bool isShowKeyWordField = false;
  bool _isToDoChecked = false;
  @override
  void initState() {
    super.initState();
    isEditableDocument = widget.isEditableDocument;
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

  TextEditingController _textNoteController =
      new TextEditingController(text: "");
  TextEditingController _keywordController =
      new TextEditingController(text: "");

  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    SystemChrome.setEnabledSystemUIOverlays([SystemUiOverlay.bottom]);
    ReviewDocumentBloc reviewBloc =
        BlocProvider.of<ReviewDocumentBloc>(context);
    _dashBoardBloc = BlocProvider.of<DashBoardBloc>(context);
    return Material(
      child: StreamBuilder<List<DocumentDetail>>(
          stream: reviewBloc.documents,
          builder: (context, documents) {
            if (documents.hasData &&
                documents.data != null &&
                documents.data.length > 0) {
              List<String> listDocumentURL = new List();
              List<String> listDocumentName = new List();

              documents.data.forEach((item) {
                listDocumentURL.add(GeneralMethod.getImageURL(
                    item.scannedPath, item.fileName, 600));
                listDocumentName.add(item.fileName);
              });
              _folderName =
                  documents.data.first.documentType ?? "Review Document";
              photoControllers =
                  listDocumentURL.map((e) => PhotoViewController()).toList();
              scaleStateControllers = listDocumentURL
                  .map((e) => PhotoViewScaleStateController())
                  .toList();
              galleryItems = listDocumentURL.map((e) {
                return GalleryExampleItem(resource: e);
              }).toList();

              return Stack(
                children: <Widget>[
                  Scaffold(
                    resizeToAvoidBottomInset: false,
                    key: scaffoldKey,
                    // appBar: _buildAppbar(
                    //     reviewBloc, _folderName, isEditableDocument),
                    body: Container(
                      color: MyColors.whiteBackground,
                      width: Dimension.getWidth(1),
                      height: Dimension.getHeight(1),
                      child: Column(children: <Widget>[
                        Stack(
                          children: <Widget>[
                            Container(
                              width: Dimension.getWidth(1),
                              color: MyColors.blueDark3,
                              child: isEditableDocument
                                  ? ToolbarReviewDocument(
                                      onShowPopupSelectFolder: () {
                                        reviewBloc.selectedFolder(context);
                                      },
                                      onShowGroupPages: () {
                                        reviewBloc
                                            .openGroupDocumentScreen(context)
                                            .then((value) {
                                          if (value == true) {
                                            isDocumentChanged = true;
                                          }
                                        });
                                      },
                                      onRotateDocument: () {
                                        reviewBloc.showDialogRotateDocument(
                                            context,
                                            listDocumentName[_currentIndex],
                                            listDocumentURL[_currentIndex]);
                                      },
                                      onShowKeyWord: () {
                                        setState(() {
                                          isShowKeyWordField =
                                              !isShowKeyWordField;
                                        });
                                      },
                                      onShowToDoList: (value) {
                                        setState(() {
                                          isShowFieldNotes = value;
                                          _isToDoChecked = value;
                                          reviewBloc.isSaveTodo = value;
                                        });
                                      },
                                      onSaveDocument: () {
                                        reviewBloc.saveDocument(
                                            context, _dashBoardBloc);
                                      },
                                      isToDoChecked: _isToDoChecked,
                                      onOpenBottomSheet: () {
                                        showModalBottomSheet(
                                            context: context,
                                            backgroundColor: Colors.transparent,
                                            barrierColor: Colors.black54,
                                            enableDrag: true,
                                            isDismissible: true,
                                            builder: (mContext) {
                                              return BottomSheetReviewDocument(
                                                reviewDocumentBloc: reviewBloc,
                                                idDocumentContainerScans:
                                                    documents.data.first
                                                        .idDocumentContainerScans,
                                                documentName:
                                                    listDocumentName.first,
                                              );
                                            }).then((value) {
                                          if (value != null &&
                                              value is BottomSheetActions) {
                                            switch (value) {
                                              case BottomSheetActions.SHARE:
                                                reviewBloc
                                                    .onShowDialogComposeMail(
                                                  context,
                                                );
                                                break;
                                              case BottomSheetActions.DOWNLOAD:
                                                reviewBloc
                                                    .downloadFile(context);
                                                break;
                                              case BottomSheetActions.SENDMAIL:
                                                reviewBloc.onShareDocumentToMail(
                                                    context,
                                                    XoonitApplication.instance
                                                        .getUserInfor()
                                                        .email,
                                                    "",
                                                    "",
                                                    documents.data.first
                                                        .idDocumentContainerScans);
                                                break;
                                              case BottomSheetActions.PRINT:
                                                reviewBloc
                                                    .printDocument(context);
                                                break;
                                              case BottomSheetActions.DELETE:
                                                isDocumentChanged = true;
                                                reviewBloc
                                                    .deleteDocument(context);
                                                break;
                                              default:
                                            }
                                          }
                                        });
                                      },
                                    )
                                  : Container(),
                            ),
                            isEditableDocument
                                ? PopupAssignDocument()
                                : Container(),
                          ],
                        ),
                        isEditableDocument
                            ? Divider(
                                color: MyColors.greyColor,
                                height: 1,
                              )
                            : Container(),
                        isShowKeyWordField == true
                            ? Container(
                                padding: EdgeInsets.only(left: 12, right: 12),
                                width: Dimension.getWidth(1),
                                child: TextField(
                                  autofocus: true,
                                  controller: _keywordController,
                                  style: MyStyleText.black14Regular,
                                  decoration: InputDecoration(
                                      enabledBorder: UnderlineInputBorder(
                                        borderSide: BorderSide(
                                            color: MyColors.greyText),
                                      ),
                                      suffixIcon: IconButton(
                                          icon: Icon(
                                            Icons.check,
                                            color: Colors.blueGrey,
                                          ),
                                          onPressed: () {
                                            setState(() {
                                              isShowKeyWordField = false;
                                            });
                                            reviewBloc.saveTextNotesKeywords(
                                                false, _keywordController.text);
                                          }),
                                      hintText: "Keyword",
                                      hintStyle: MyStyleText.grey14Regular),
                                ),
                              )
                            : Container(),
                        isShowFieldNotes == true
                            ? Container(
                                padding: EdgeInsets.only(left: 12, right: 12),
                                width: Dimension.getWidth(1),
                                child: TextField(
                                  autofocus: true,
                                  controller: _textNoteController,
                                  style: MyStyleText.black14Regular,
                                  decoration: InputDecoration(
                                      enabledBorder: UnderlineInputBorder(
                                        borderSide: BorderSide(
                                            color: MyColors.greyText),
                                      ),
                                      suffixIcon: IconButton(
                                          icon: Icon(
                                            Icons.check,
                                            color: Colors.blueGrey,
                                          ),
                                          onPressed: () {
                                            setState(() {
                                              isShowFieldNotes = false;
                                            });
                                            reviewBloc.saveTextNotesKeywords(
                                                true, _textNoteController.text);
                                          }),
                                      hintText:
                                          "Leave what you should do later",
                                      hintStyle: MyStyleText.grey14Regular),
                                ),
                              )
                            : Container(),
                        Container(
                          padding: EdgeInsets.only(
                            top: 6,
                          ),
                          child: Text(
                            listDocumentName.first,
                            style: MyStyleText.blueDarkColor16Medium,
                            softWrap: true,
                            textAlign: TextAlign.center,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        widget.isHasTodoNotesField &&
                                documents.data.first.toDoNotes != ""
                            ? _toDoNotesField(documents.data.first.toDoNotes)
                            : SizedBox.shrink(),
                        StreamBuilder<String>(
                            stream: reviewBloc.documentFolderPath,
                            initialData: "",
                            builder: (context, documentFolderPath) {
                              return Container(
                                padding: EdgeInsets.only(
                                  top: 6,
                                ),
                                child: Text(
                                  documentFolderPath.data,
                                  style: MyStyleText.grey16Regular,
                                  softWrap: true,
                                  textAlign: TextAlign.center,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              );
                            }),
                        Expanded(
                          child: Padding(
                            padding: EdgeInsets.all(8.0),
                            child: Stack(
                              children: <Widget>[
                                Transform(
                                  transform: _matrix,
                                  child: GalleryPhotoViewWrapper(
                                    photoControllers: photoControllers,
                                    scaleStateControllers:
                                        scaleStateControllers,
                                    galleryItems: galleryItems,
                                    isNetworkImage: true,
                                    isEnableRotation: !isEditableDocument,
                                    backgroundDecoration: const BoxDecoration(
                                      color: MyColors.whiteBackground,
                                    ),
                                    initialIndex: 0,
                                    onPageChange: (index) {
                                      _rotate = 0.0;
                                      photoControllers[index].reset();
                                      scaleStateControllers[index].reset();
                                      photoControllers[index].rotation =
                                          _rotate;
                                      scaleStateControllers[index].scaleState =
                                          PhotoViewScaleState.initial;
                                      _currentIndex = index;
                                      reviewBloc
                                          .changeCurrentIndexViewCapture(index);
                                    },
                                    scrollDirection: Axis.horizontal,
                                    loadingBuilder: (context, event) {
                                      return Center(child: CustomLoading());
                                    },
                                  ),
                                ),
                                Positioned(
                                  top: 16,
                                  right: 24,
                                  child: StreamBuilder<int>(
                                      stream: reviewBloc.currentIndex,
                                      initialData: 0,
                                      builder: (context, currentIndex) {
                                        return currentIndex.hasData
                                            ? Container(
                                                padding: EdgeInsets.symmetric(
                                                    horizontal: 8, vertical: 2),
                                                decoration: BoxDecoration(
                                                  borderRadius:
                                                      BorderRadius.all(
                                                    Radius.circular(20),
                                                  ),
                                                  color: MyColors.yellowColor2,
                                                ),
                                                child: Text(
                                                  "${(currentIndex.data + 1)} / ${listDocumentURL.length}",
                                                  style: MyStyleText
                                                      .white14Regular,
                                                ),
                                              )
                                            : Container();
                                      }),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ]),
                    ),
                  ),
                  StreamBuilder<AppState>(
                      stream: reviewBloc.screenState,
                      initialData: AppState.Idle,
                      builder: (context, snapshot) {
                        if (snapshot.hasData &&
                            snapshot.data == AppState.Loading) {
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
              );
            } else {
              return Center(
                child: CircularProgressIndicator(),
              );
            }
          }),
    );
  }

  Widget _toDoNotesField(String toDoNotes) => Container(
      color: MyColors.whiteBackground,
      padding: EdgeInsets.symmetric(vertical: 4, horizontal: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        children: <Widget>[
          Text(
            "ToDo: ",
            style: MyStyleText.grey16Regular,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            softWrap: true,
          ),
          Text(
            toDoNotes,
            style: MyStyleText.grey16Regular,
          ),
        ],
      ));
}
