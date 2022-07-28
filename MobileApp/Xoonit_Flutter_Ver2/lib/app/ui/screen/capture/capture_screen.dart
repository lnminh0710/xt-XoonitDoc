import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/document_capture_group.dart';
import 'package:xoonit/app/ui/component/loading_checking_cloud_connection.dart';
import 'package:xoonit/app/ui/screen/capture/capture_bloc.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

import 'capture_widgets/custom_item_list_capture.dart';

class CaptureScreen extends StatefulWidget {
  @override
  _RenderScreenCaptureState createState() => _RenderScreenCaptureState();
}

class _RenderScreenCaptureState extends State<CaptureScreen> {
  CaptureBloc captureBloc;
  ScrollController scrollController;
  int _defaultPageSize = 20;
  int _defaultPageIndex = 1;
  DashBoardBloc _dashBoardBloc;

  @override
  void initState() {
    super.initState();
    scrollController = ScrollController();
    scrollController.addListener(() {
      if (scrollController.offset >=
              scrollController.position.maxScrollExtent &&
          !scrollController.position.outOfRange) {
        printLog("Scroll to bottom");
        captureBloc.loadMoredocument();
      }
      if (scrollController.offset <=
              scrollController.position.minScrollExtent &&
          !scrollController.position.outOfRange) {
        printLog("Scroll to top");
      }
    });
  }

  Future<void> pullToRefesh() async {
    captureBloc.getCapture(_defaultPageIndex, _defaultPageSize);
  }

  @override
  Widget build(BuildContext context) {
    captureBloc = BlocProvider.of(context);
    _dashBoardBloc = BlocProvider.of(context);
    return Stack(children: <Widget>[
      Column(
        children: <Widget>[
          StreamBuilder<int>(
              stream: captureBloc.totalFile,
              initialData: 0,
              builder: (_, totalFile) => _totalFileBuilder(totalFile.data)),
          Divider(
            height: 1,
            color: MyColors.greyColor,
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: pullToRefesh,
              child: Container(
                width: MediaQuery.of(context).size.width,
                height: MediaQuery.of(context).size.height,
                padding: EdgeInsets.only(top: 8, bottom: 8),
                color: MyColors.whiteBackground,
                child: StreamBuilder<List<DocumentCaptureGroup>>(
                    stream: captureBloc.captureList,
                    builder: (context, captureList) {
                      if (captureList.hasData && captureList.data.length > 0) {
                        return SingleChildScrollView(
                          physics: AlwaysScrollableScrollPhysics(),
                          controller: scrollController,
                          child: Wrap(
                            alignment: WrapAlignment.center,
                            spacing: 8,
                            runSpacing: 8,
                            children: _listDocumentItem(
                                context, captureBloc, captureList.data),
                          ),
                        );
                      } else {
                        return Container();
                      }
                    }),
              ),
            ),
          ),
        ],
      ),
      StreamBuilder<AppState>(
        stream: captureBloc.screenState,
        initialData: AppState.Loading,
        builder: (context, screenState) {
          if (screenState.hasData && screenState.data == AppState.Loading) {
            return Container(
              color: Colors.black26,
              width: Dimension.getWidth(1),
              height: Dimension.getHeight(1),
              child: Center(
                child: CustomLoading(),
              ),
            );
          } else {
            return Container();
          }
        },
      ),
    ]);
  }

  Widget _totalFileBuilder(int totalFile) => Container(
      color: MyColors.whiteBackground,
      padding: EdgeInsets.symmetric(vertical: 12, horizontal: 12),
      child: Row(
        children: <Widget>[
          Text(
            "Total file: ",
            style: MyStyleText.grey16Regular,
          ),
          Text(
            totalFile.toString(),
            style: MyStyleText.grey16Regular,
          ),
        ],
      ));

  List<Widget> _listDocumentItem(BuildContext context, CaptureBloc captureBloc,
      List<DocumentCaptureGroup> listItem) {
    List<Widget> result =
        List<Widget>.generate(listItem?.length ?? 0, (int index) {
      DocumentCaptureGroup captureItem = listItem[index];
      return CustomItemGridCapture(
        captureItem: captureItem.listDocument.first,
        isSelected: captureItem.isSelected,
        isShowDeleteIconOnThumnails: false,
        onItemClick: () {
          captureBloc.reviewCapture(context, index, _dashBoardBloc);
        },
        onDeletePressed: () {
          captureBloc.onDeleteCapture(context, captureItem.idDocumentContainer);
        },
        onItemSelectedChange: (value) {
          captureBloc.setDocumentSelectedChangesStatus(index, value);
        },
      );
    });
    result.add(StreamBuilder<bool>(
      stream: captureBloc.isLoadMore,
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
