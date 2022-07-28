import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/remote/global_search/column_search_settings.dart';
import 'package:xoonit/app/model/remote/global_search/search_all_document_response.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/search_all_document_detail.dart/search_all_document_detail_bloc.dart';
import 'package:xoonit/app/ui/screen/global_search/widgets/search_detail_item.dart';
import 'package:xoonit/app/ui/screen/global_search/widgets/search_detail_item_list_view.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/core/bloc_base.dart';

class SearchAllDocumentDetail extends StatefulWidget {
  const SearchAllDocumentDetail({
    Key key,
    this.isGridView = true,
  }) : super(key: key);
  final bool isGridView;

  @override
  _SearchAllDocumentDetailState createState() =>
      _SearchAllDocumentDetailState();
}

class _SearchAllDocumentDetailState extends State<SearchAllDocumentDetail> {
  ScrollController _controller;
  SearchAllDocumentDetailBloc _searchAllDocumentDetailBloc;
  List<String> _allDocumentDetailKey = List<String>();
  List<String> _allDocumentDetailValue = List<String>();
  DashBoardBloc _dashboardBloc;
  bool _isGridView;
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
      _searchAllDocumentDetailBloc.loadMoreSearchAllDocumentDetail();
    }
    if (_controller.offset <= _controller.position.minScrollExtent &&
        !_controller.position.outOfRange) {
      // message = "reach the top";
    }
  }

  @override
  Widget build(BuildContext context) {
    _searchAllDocumentDetailBloc = BlocProvider.of(context);
    _dashboardBloc = BlocProvider.of<DashBoardBloc>(context);
    return StreamBuilder<SearchAllDocumentResponse>(
      stream: _searchAllDocumentDetailBloc.searcAllDocumentResponseStream,
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
                            _searchAllDocumentDetailBloc
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
                                  SearchAllDocumentResult allDocumentResult =
                                      snapshot.data.item.results[index];
                                  setupColumnSetting(snapshot.data, index);
                                  return SearchDetailItem(
                                    onItemClicked: () {
                                      _searchAllDocumentDetailBloc
                                          .reviewDocument(
                                              context,
                                              snapshot
                                                  .data.item.results[index], _dashboardBloc);
                                    },
                                    thumbnailURL: GeneralMethod.getThumbnailURL(
                                        allDocumentResult.localPath,
                                        allDocumentResult.localFileName),
                                    detailKey1: _allDocumentDetailKey[0],
                                    detailKey2: _allDocumentDetailKey[1],
                                    detailKey3: _allDocumentDetailKey[2],
                                    detailValue1: _allDocumentDetailValue[0],
                                    detailValue2: _allDocumentDetailValue[1],
                                    detailValue3: _allDocumentDetailValue[2],
                                  );
                                })
                            : Column(
                                children: List<Widget>.generate(
                                    snapshot.data.item.results.length, (index) {
                                  SearchAllDocumentResult allDocumentResult =
                                      snapshot.data.item.results[index];
                                  setupColumnSetting(snapshot.data, index);
                                  return SearchDetailItemListView(
                                    onItemClicked: () {
                                      _searchAllDocumentDetailBloc
                                          .reviewDocument(
                                              context,
                                              snapshot
                                                  .data.item.results[index], _dashboardBloc);
                                    },
                                    thumbnailURL: GeneralMethod.getThumbnailURL(
                                        allDocumentResult.localPath,
                                        allDocumentResult.localFileName),
                                    detailKey1: _allDocumentDetailKey[0],
                                    detailKey2: _allDocumentDetailKey[1],
                                    detailKey3: _allDocumentDetailKey[2],
                                    detailValue1: _allDocumentDetailValue[0],
                                    detailValue2: _allDocumentDetailValue[1],
                                    detailValue3: _allDocumentDetailValue[2],
                                  );
                                }),
                              ),
                        StreamBuilder<bool>(
                            stream: _searchAllDocumentDetailBloc.loadingStream,
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
      SearchAllDocumentResponse searchAllDocumentDetailResponse, int index) {
    _allDocumentDetailKey.clear();
    _allDocumentDetailValue.clear();
    SearchAllDocumentResult allDocumentResult =
        searchAllDocumentDetailResponse.item.results[index];
    List<ColumnSearchSettings> columnSearchSettings =
        columnSearchSettingsFromJson(searchAllDocumentDetailResponse
            .item.setting[0][0].settingColumnName);
    List<ColumnsName> settings = columnSearchSettings[1]?.columnsName ?? null;
    if (settings != null) {
      settings.forEach((element) {
        if (element.setting != null &&
            !GeneralMethod.checkHidenColumn(element.setting)) {
          _allDocumentDetailKey.add(element?.columnName ?? '');
          String columnKey = element?.columnHeader ?? '';
          columnKey = columnKey.replaceRange(0, 1, columnKey[0].toLowerCase());
          _allDocumentDetailValue
              .add(allDocumentResult.toJson()[columnKey].toString() ?? '');
        }
      });
    }
    while (_allDocumentDetailKey.length < 3) {
      _allDocumentDetailKey.add('');
    }
    while (_allDocumentDetailValue.length < 3) {
      _allDocumentDetailValue.add('');
    }
  }
}
