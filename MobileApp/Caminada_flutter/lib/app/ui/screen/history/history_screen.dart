import 'dart:async';
import 'dart:ui';

import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/constants/resources.dart';
import 'package:caminada/app/constants/styles.dart';
import 'package:caminada/app/difinition.dart';
import 'package:caminada/app/ui/screen/history/history_bottomsheet.dart';
import 'package:caminada/app/utils/caminada_application.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:caminada/app/model/history_response.dart';
import 'package:caminada/app/ui/screen/history/history_bloc.dart';
import 'package:caminada/app/ui/screen/history/history_widget/custom_history_total.dart';
import 'package:caminada/core/bloc_base.dart';
import 'package:caminada/core/ultils.dart';
import 'package:flutter/services.dart';

import 'history_widget/custom_item_list_history.dart';

class HistoryScreen extends StatefulWidget {
  HistoryScreen({Key key}) : super(key: key);

  @override
  _HistoryScreenState createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  String datetimeForm;
  String datetimeTo;
  String defaultValue;

  HistoryBloc historyBloc;
  List<String> docName = ["Select Categories", "a", "B", "c", "d", "e"];
  ScrollController _controller;

  @override
  void initState() {
    super.initState();
    _controller = ScrollController();
    _controller.addListener(() {
      if (_controller.offset >= _controller.position.maxScrollExtent &&
          !_controller.position.outOfRange) {
        printLog("Scroll to bottom");
        historyBloc.loadMoreHistory();
      }
      if (_controller.offset <= _controller.position.minScrollExtent &&
          !_controller.position.outOfRange) {
        printLog("Scroll to top");
      }
    });
    CaminadaApplication.instance.documentTreeItemList.forEach((element) {
      docName.add(element.data.groupName);
    });
  }

  @override
  Widget build(BuildContext context) {
    historyBloc = BlocProvider.of(context);
    SystemChrome.setEnabledSystemUIOverlays([]);
    return Scaffold(
      backgroundColor: MyColors.primaryColor,
      appBar: AppBar(
        elevation: 0.0,
        backgroundColor: MyColors.primaryColor,
        title: Text(
          "History",
          style: MyStyleText.white20Medium,
        ),
        centerTitle: true,
        leading: IconButton(
            icon: Icon(
              Icons.arrow_back_ios,
              color: Colors.white,
            ),
            onPressed: () {
              Navigator.of(context).pop();
            }),
        actions: <Widget>[
          IconButton(
            icon: Image.asset(Resources.fillter),
            onPressed: () {
              openBottomSheet(historyBloc, context);
            },
          ),
        ],
      ),
      body: StreamBuilder<TotalSummary>(
          stream: historyBloc.totalSumary,
          builder: (context, totalSummary) {
            if (totalSummary.hasData && totalSummary != null) {
              return Stack(children: <Widget>[
                Container(
                  width: Dimension.getWidth(1),
                  height: Dimension.getHeight(1),
                  decoration: BoxDecoration(
                    color: MyColors.backgroundGallery,
                    borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(20),
                        topRight: Radius.circular(20)),
                  ),
                  child: Column(
                    children: <Widget>[
                      Container(
                          width: Dimension.getWidth(1),
                          child: CustomCardTotalHistory(
                            item: totalSummary.data,
                          )),
                      StreamBuilder<List<HistoryData>>(
                          stream: historyBloc.dataList,
                          builder: (context, snapshot) {
                            if (snapshot.hasData && snapshot != null) {
                              return Expanded(
                                child: SingleChildScrollView(
                                  controller: _controller,
                                  child: Padding(
                                    padding:
                                        const EdgeInsets.symmetric(vertical: 8),
                                    child: Column(
                                      children:
                                          _listCardViewHistory(snapshot.data),
                                    ),
                                  ),
                                ),
                              );
                            } else {
                              return Container();
                            }
                          }),
                    ],
                  ),
                ),
              ]);
            } else {
              return Container(
                width: Dimension.getWidth(1),
                height: Dimension.getHeight(1),
                decoration: BoxDecoration(
                  color: MyColors.backgroundGallery,
                  borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(20),
                      topRight: Radius.circular(20)),
                ),
                child: Center(child: CircularProgressIndicator()),
              );
            }
          }),
    );
  }

  List<Widget> _listCardViewHistory(List<HistoryData> listHistory) {
    List<Widget> result = List<Widget>.generate(
        listHistory.length,
        (index) => CustomCardViewHistory(
              item: listHistory[index],
            ));
    result.add(StreamBuilder<bool>(
        stream: historyBloc.isLoadingMore,
        builder: (context, snapshot) {
          if (snapshot.hasData && snapshot.data) {
            return Container(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: CircularProgressIndicator(),
            );
          } else {
            return Container();
          }
        }));
    return result;
  }

  void openBottomSheet(HistoryBloc historyBloc, BuildContext context) {
    showModalBottomSheet(
        isScrollControlled: true,
        context: context,
        backgroundColor: Colors.transparent,
        builder: (_) => GestureDetector(
              onTap: () {
                FocusScope.of(context).requestFocus(new FocusNode());
              },
              child: HistoryFillter(
                historyBloc: historyBloc,
              ),
            ));
  }
}
