import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/document_capture_group.dart';
import 'package:xoonit/app/ui/screen/capture/group_document_screen/group_document_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';
import 'item_list_group_document.dart';

class GroupDocumentScreen extends StatefulWidget {
  GroupDocumentScreen({
    Key key,
  }) : super(key: key);

  @override
  _GroupDocumentScreenState createState() => _GroupDocumentScreenState();
}

class _GroupDocumentScreenState extends State<GroupDocumentScreen> {
  GroupDocumentBloc groupDocumentBloc;
  ScrollController scrollController;
  int _defaultPageSize = 30;
  int _defaultPageIndex = 1;
  @override
  void initState() {
    super.initState();
    scrollController = ScrollController();
    scrollController.addListener(() {
      if (scrollController.offset >=
              scrollController.position.maxScrollExtent &&
          !scrollController.position.outOfRange) {
        printLog("Scroll to bottom");
        groupDocumentBloc.loadMoredocument();
      }
      if (scrollController.offset <=
              scrollController.position.minScrollExtent &&
          !scrollController.position.outOfRange) {
        printLog("Scroll to top");
      }
    });
  }

  Future<void> pullRefesh() async {
    groupDocumentBloc.pullRefeshListDocument(
        _defaultPageIndex, _defaultPageSize);
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setEnabledSystemUIOverlays([SystemUiOverlay.bottom]);
    groupDocumentBloc = BlocProvider.of(context);
    return Scaffold(
      resizeToAvoidBottomInset: false,
      appBar: _buildAppBar(context, groupDocumentBloc),
      body: RefreshIndicator(
          onRefresh: pullRefesh, child: _buildBody(context, groupDocumentBloc)),
    );
  }

  Widget _buildAppBar(
          BuildContext context, GroupDocumentBloc groupDocumentBloc) =>
      PreferredSize(
        preferredSize: Size(Dimension.getWidth(1), 60),
        child: AppBar(
          elevation: 1,
          leading: IconButton(
              icon: Icon(
                Icons.arrow_back_ios,
                color: MyColors.greyText2,
              ),
              onPressed: () {
                Navigator.of(context).pop(false);
              }),
          backgroundColor: MyColors.whiteColor,
          title: StreamBuilder<List<int>>(
              stream: groupDocumentBloc.listIdSelected,
              builder: (context, listIdSelected) {
                return listIdSelected.hasData &&
                        listIdSelected?.data != null &&
                        listIdSelected.data.length > 0
                    ? Text(
                        " ${(listIdSelected.data.length)} document selected",
                        textAlign: TextAlign.center,
                        style: MyStyleText.blueDarkColor16Medium,
                      )
                    : Text(
                        "Group Document",
                        textAlign: TextAlign.center,
                        style: MyStyleText.blueDarkColor16Medium,
                      );
              }),
          centerTitle: true,
          actions: <Widget>[
            IconButton(
              icon: Image.asset(
                Resources.iconSave,
                width: 18,
                height: 20,
              ),
              onPressed: () {
                groupDocumentBloc.groupDocument(context);
              },
            )
          ],
        ),
      );

  Widget _buildBody(
          BuildContext context, GroupDocumentBloc groupDocumentBloc) =>
      Stack(
        children: <Widget>[
          StreamBuilder<List<DocumentCaptureGroup>>(
            stream: groupDocumentBloc.listDocument,
            builder: (context, listDocument) {
              if (listDocument.hasData &&
                  listDocument.data != null &&
                  listDocument.data.length > 0) {
                return Container(
                  width: Dimension.getWidth(1),
                  height: Dimension.getHeight(1),
                  color: MyColors.whiteBackground,
                  padding: EdgeInsets.only(top: 8, bottom: 8),
                  child: SingleChildScrollView(
                    child: Wrap(
                      alignment: WrapAlignment.center,
                      spacing: 4,
                      runSpacing: 4,
                      children: _listItemDocument(
                          groupDocumentBloc, listDocument.data),
                    ),
                  ),
                );
              } else {
                return Container();
              }
            },
          ),
          StreamBuilder<AppState>(
            stream: groupDocumentBloc.screenState,
            builder: (context, screenState) {
              if (screenState.hasData &&
                  screenState.data != null &&
                  screenState.data == AppState.Loading) {
                return Container(
                  color: Colors.black26,
                  width: Dimension.getWidth(1),
                  height: Dimension.getHeight(1),
                  child: Center(
                    child: CircularProgressIndicator(),
                  ),
                );
              } else {
                return Container();
              }
            },
          ),
        ],
      );

  List<Widget> _listItemDocument(GroupDocumentBloc groupDocumentBloc,
      List<DocumentCaptureGroup> listDocument) {
    List<Widget> result = List<Widget>.generate(
      listDocument?.length ?? 0,
      (index) => Stack(
        children: <Widget>[
          ItemListDocument(
            captureItem: listDocument[index].listDocument.first,
            onItemSelectedChange: (bool value) {
              groupDocumentBloc.changeDocumentSelect(index, value);
            },
          ),
          StreamBuilder<List<int>>(
              stream: groupDocumentBloc.listIdSelected,
              builder: (context, listIdSelected) {
                return listIdSelected.hasData &&
                        listIdSelected?.data?.contains(index) == true
                    ? Positioned(
                        top: 6,
                        right: 6,
                        child: ClipOval(
                          child: Container(
                            height: 24,
                            width: 24,
                            color: Colors.deepOrange,
                            child: Center(
                              child: Text(
                                  "${(listIdSelected.data.indexOf(index) + 1)}",
                                  style: MyStyleText.white14Medium),
                            ),
                          ),
                        ))
                    : Positioned(
                        top: 6,
                        right: 6,
                        child: Container(),
                      );
              }),
        ],
      ),
    );
    result.add(StreamBuilder<bool>(
      stream: groupDocumentBloc.isLoadMore,
      builder: (context, isLoadMore) =>
          isLoadMore.hasData && isLoadMore.data == true
              ? Align(
                  alignment: Alignment.bottomCenter,
                  child: Container(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: CircularProgressIndicator(),
                  ),
                )
              : SizedBox.shrink(),
    ));
    return result;
  }
}
