import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/model/remote/global_search/column_search_settings.dart';
import 'package:xoonit/app/model/remote/global_search/search_contact_detail_response.dart';
import 'package:xoonit/app/ui/component/search_bar.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/search_contact_detail/search_contact_detail_bloc.dart';
import 'package:xoonit/app/ui/screen/global_search/search_folder_detail/search_contact_detail/search_contact_item.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class ContactSeachDetail extends StatefulWidget {
  const ContactSeachDetail({
    Key key,
  }) : super(key: key);

  @override
  _ContactSeachDetailState createState() => _ContactSeachDetailState();
}

class _ContactSeachDetailState extends State<ContactSeachDetail> {
  ScrollController _controller;
  SearchContactDetailBloc _searchContactDetailBloc;
  List<String> _contactDetailKey = List<String>();
  List<String> _contactDetailValue = List<String>();
  bool isPullRefeshEnable = true;
  DashBoardBloc _dashBoardBloc;
  TextEditingController _searchContactTextController;
  @override
  void initState() {
    _controller = ScrollController();
    _controller.addListener(_scrollListener);
    _searchContactTextController = TextEditingController(
        text: XoonitApplication.instance
            .getGlobalSearchController()
            .currenKeywordSearch);
    super.initState();
  }

  _scrollListener() {
    if (_controller.offset >= _controller.position.maxScrollExtent &&
        !_controller.position.outOfRange) {
      // message = "reach the bottom";
      _searchContactDetailBloc.loadMoreSearchContactDetail();
    }
    if (_controller.offset <= _controller.position.minScrollExtent &&
        !_controller.position.outOfRange) {
      // message = "reach the top";
    }
  }

  Future<void> pullToRefesh() async {
    _searchContactDetailBloc.pullContact();
  }

  @override
  Widget build(BuildContext context) {
    _searchContactDetailBloc = BlocProvider.of(context);
    _dashBoardBloc = BlocProvider.of<DashBoardBloc>(context);
    return StreamBuilder<ContactSearchDetailResponse>(
      stream: _searchContactDetailBloc.searchContactResponseStream,
      builder: (context, snapshot) {
        if (snapshot.hasData && snapshot?.data?.item?.listContacts != null) {
          return Container(
            padding: EdgeInsets.symmetric(horizontal: 12),
            color: MyColors.whiteBackground,
            child: Column(
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.only(top: 15.0, bottom: 15),
                  child: Searchbar(
                    backgroundColor: MyColors.whiteColor,
                    hintText: 'Search In Contact',
                    onChangeValue: (text) {},
                    onCompleted: (text) {
                      _searchContactDetailBloc
                          .searchContact(_searchContactTextController.text);
                    },
                    searchIcon: Icon(
                      Icons.search,
                      color: MyColors.blackColor,
                    ),
                    textController: _searchContactTextController,
                  ),
                ),
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: pullToRefesh,
                    child: SingleChildScrollView(
                      controller: _controller,
                      child: Column(
                        children: <Widget>[
                          SizedBox(
                            height: 8,
                          ),
                          Column(
                            children: List<Widget>.generate(
                                snapshot.data.item.listContacts.length,
                                (index) {
                              ContactSearchResult contactResult =
                                  snapshot.data.item.listContacts[index];
                              setupColumnSetting(snapshot.data, index);
                              return SearchContactItem(
                                searchKeyword:
                                    _searchContactTextController.text ?? null,
                                onItemClicked: () {
                                  _searchContactDetailBloc.openContactDetail(
                                      context,
                                      contactResult.idPerson,
                                      contactResult.idPersonType,
                                      _dashBoardBloc);
                                },
                                detailKey1: _contactDetailKey[0],
                                detailKey2: _contactDetailKey[1],
                                detailKey3: _contactDetailKey[2],
                                detailValue1: _contactDetailValue[0],
                                detailValue2: _contactDetailValue[1],
                                detailValue3: _contactDetailValue[2],
                                detailKey4: _contactDetailKey[3],
                                detailValue4: _contactDetailValue[3],
                                detailKey5: _contactDetailKey[4],
                                detailValue5: _contactDetailValue[4],
                              );
                            }),
                          ),
                          StreamBuilder<bool>(
                              stream: _searchContactDetailBloc.loadingStream,
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
      ContactSearchDetailResponse searchContactDetailResponse, int index) {
    _contactDetailKey.clear();
    _contactDetailValue.clear();
    ContactSearchResult contactSearchResult =
        searchContactDetailResponse.item.listContacts[index];
    List<ColumnSearchSettings> columnSearchSettings =
        columnSearchSettingsFromJson(
            searchContactDetailResponse.item.setting[0][0].settingColumnName);
    List<ColumnsName> settings = columnSearchSettings[1]?.columnsName ?? null;
    if (settings != null) {
      settings.forEach((element) {
        if (element.setting != null &&
            !GeneralMethod.checkHidenColumn(element.setting)) {
          _contactDetailKey.add(element?.columnName ?? '');
          String columnKey = element?.columnHeader ?? '';
          columnKey = columnKey.replaceRange(0, 1, columnKey[0].toLowerCase());
          String columnValue = contactSearchResult.toJson()[columnKey] == null
              ? ''
              : contactSearchResult.toJson()[columnKey].toString();
          _contactDetailValue.add(columnValue);
        }
      });
    }
    while (_contactDetailKey.length < 5) {
      _contactDetailKey.add('');
    }
    while (_contactDetailValue.length < 5) {
      _contactDetailValue.add('');
    }
  }
}
