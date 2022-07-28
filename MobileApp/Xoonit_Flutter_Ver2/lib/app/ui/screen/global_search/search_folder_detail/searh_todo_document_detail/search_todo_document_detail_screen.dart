import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/remote/global_search/column_search_settings.dart';
import 'package:xoonit/app/model/remote/global_search/todo_document_detail_response.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/searh_todo_document_detail/search_todo_document_detail_bloc.dart';
import 'package:xoonit/app/ui/screen/global_search/widgets/search_detail_item.dart';
import 'package:xoonit/app/ui/screen/global_search/widgets/search_detail_item_list_view.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/core/bloc_base.dart';

class SearchTodoDocumentDetailScreen extends StatefulWidget {
  const SearchTodoDocumentDetailScreen({
    Key key,
    this.isGridView = true,
  }) : super(key: key);
  final bool isGridView;

  @override
  _SearchTodoDocumentDetailScreenState createState() =>
      _SearchTodoDocumentDetailScreenState();
}

class _SearchTodoDocumentDetailScreenState
    extends State<SearchTodoDocumentDetailScreen> {
  ScrollController _controller;
  SearchTodoDocumentDetailBloc _searchTodoDocumentDetailBloc;
  List<String> _todoDocumentDetailKey = List<String>();
  List<String> _todoDocumentDetailValue = List<String>();
  bool _isGridView;
  DashBoardBloc _dashBoardBloc;
  @override
  void initState() {
    _controller = ScrollController();
    _controller.addListener(_scrollListener);
    _isGridView = widget.isGridView;
    super.initState();
  }

  _scrollListener() {
    if (_controller.offset >= _controller.position.maxScrollExtent &&
        !_controller.position.outOfRange) {
      // message = "reach the bottom";
      _searchTodoDocumentDetailBloc.loadMoreTodoDocumentDetail();
    }
    if (_controller.offset <= _controller.position.minScrollExtent &&
        !_controller.position.outOfRange) {
      // message = "reach the top";
    }
  }

  @override
  Widget build(BuildContext context) {
    _searchTodoDocumentDetailBloc = BlocProvider.of(context);
    _dashBoardBloc = BlocProvider.of(context);
    return StreamBuilder<SearchTodoDocumentDetailResponse>(
      stream: _searchTodoDocumentDetailBloc.searcTodoDocumentResponseStream,
      builder: (context, snapshot) {
        if (snapshot.hasData && snapshot?.data?.item?.results != null) {
          return Container(
            color: MyColors.whiteBackground,
            child: Column(
              children: <Widget>[
                Container(
                  margin: EdgeInsets.only(left: 12, right: 8),
                  child: Row(
                    children: <Widget>[
                      Text(
                        'Total file: ' +
                            _searchTodoDocumentDetailBloc
                                .getTotalResult()
                                .toString(),
                        style: MyStyleText.grey16Regular,
                      ),
                      Expanded(
                        child: Container(),
                      ),
                      Container(
                        alignment: Alignment.centerRight,
                        child: IconButton(
                          onPressed: () {
                            setState(() {
                              _isGridView = !_isGridView;
                            });
                          },
                          icon: Image.asset(
                            _isGridView
                                ? Resources.iconListView
                                : Resources.iconGroup,
                            width: 28,
                            height: 28,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  height: 1,
                  color: MyColors.greyColor1,
                ),
                Expanded(
                  child: SingleChildScrollView(
                    controller: _controller,
                    child: Column(
                      children: <Widget>[
                        SizedBox(
                          height: 8,
                        ),
                        _isGridView
                            ? GridView.builder(
                                shrinkWrap: true,
                                physics: NeverScrollableScrollPhysics(),
                                padding: EdgeInsets.all(16),
                                itemCount: snapshot.data.item.results.length,
                                gridDelegate:
                                    SliverGridDelegateWithFixedCrossAxisCount(
                                        childAspectRatio: 1 / 1,
                                        crossAxisCount: 2,
                                        mainAxisSpacing: 12,
                                        crossAxisSpacing: 12),
                                itemBuilder: (_, index) {
                                  SearchTodoDocumentResult todorDocumentResult =
                                      snapshot.data.item.results[index];
                                  setupColumnSetting(snapshot.data, index);
                                  return SearchDetailItem(
                                    onItemClicked: () {
                                      _searchTodoDocumentDetailBloc
                                          .reviewDocument(
                                              context,
                                              snapshot.data.item.results[index],
                                              _dashBoardBloc);
                                    },
                                    thumbnailURL: GeneralMethod.getThumbnailURL(
                                        todorDocumentResult.scannedPath,
                                        todorDocumentResult.scannedFilename),
                                    detailKey1: _todoDocumentDetailKey[0],
                                    detailKey2: _todoDocumentDetailKey[1],
                                    detailKey3: _todoDocumentDetailKey[2],
                                    detailValue1: _todoDocumentDetailValue[0],
                                    detailValue2: _todoDocumentDetailValue[1],
                                    detailValue3: _todoDocumentDetailValue[2],
                                  );
                                })
                            : Column(
                                children: List<Widget>.generate(
                                    snapshot.data.item.results.length, (index) {
                                  SearchTodoDocumentResult todoDocumentResult =
                                      snapshot.data.item.results[index];
                                  setupColumnSetting(snapshot.data, index);
                                  return SearchDetailItemListView(
                                    onItemClicked: () {
                                      _searchTodoDocumentDetailBloc
                                          .reviewDocument(
                                              context,
                                              snapshot.data.item.results[index],
                                              _dashBoardBloc);
                                    },
                                    thumbnailURL: GeneralMethod.getThumbnailURL(
                                        todoDocumentResult.scannedPath,
                                        todoDocumentResult.scannedFilename),
                                    detailKey1: _todoDocumentDetailKey[0],
                                    detailKey2: _todoDocumentDetailKey[1],
                                    detailKey3: _todoDocumentDetailKey[2],
                                    detailValue1: _todoDocumentDetailValue[0],
                                    detailValue2: _todoDocumentDetailValue[1],
                                    detailValue3: _todoDocumentDetailValue[2],
                                  );
                                }),
                              ),
                        StreamBuilder<bool>(
                            stream: _searchTodoDocumentDetailBloc.loadingStream,
                            builder: (context, loadingSnapshot) {
                              if (loadingSnapshot.hasData &&
                                  loadingSnapshot.data) {
                                return Center(
                                    child: CircularProgressIndicator());
                              } else {
                                return Container();
                              }
                            }),
                        SizedBox(
                          height: 32,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        } else {
          return Center(
            child: CircularProgressIndicator(),
          );
        }
      },
    );
  }

  void setupColumnSetting(
      SearchTodoDocumentDetailResponse searchTodoDocumentDetailResponse,
      int index) {
    _todoDocumentDetailKey.clear();
    _todoDocumentDetailValue.clear();
    SearchTodoDocumentResult todoDocumentResult =
        searchTodoDocumentDetailResponse.item.results[index];
    List<ColumnSearchSettings> columnSearchSettings =
        columnSearchSettingsFromJson(searchTodoDocumentDetailResponse
            .item.setting[0][0].settingColumnName);
    List<ColumnsName> settings = columnSearchSettings[1]?.columnsName ?? null;
    if (settings != null) {
      settings.forEach((element) {
        if (element.setting != null &&
            !GeneralMethod.checkHidenColumn(element.setting)) {
          _todoDocumentDetailKey.add(element?.columnName ?? '');
          String columnKey = element?.columnHeader ?? '';
          columnKey = columnKey.replaceRange(0, 1, columnKey[0].toLowerCase());
          _todoDocumentDetailValue
              .add(todoDocumentResult.toJson()[columnKey].toString() ?? '');
        }
      });
    }
    while (_todoDocumentDetailKey.length < 3) {
      _todoDocumentDetailKey.add('');
    }
    while (_todoDocumentDetailValue.length < 3) {
      _todoDocumentDetailValue.add('');
    }
  }
}
