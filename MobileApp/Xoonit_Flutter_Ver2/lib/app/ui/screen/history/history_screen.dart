import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/history_response.dart';
import 'package:xoonit/app/ui/screen/history/history_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';
import '../../../constants/colors.dart';
import '../../../model/history_response.dart';
import 'history_widget/custom_item_list_history.dart';

class HistoryScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return RenderHistoryScreen();
  }
}

class RenderHistoryScreen extends StatefulWidget {
  RenderHistoryScreen({Key key}) : super(key: key);

  @override
  _RenderHistoryScreenState createState() => _RenderHistoryScreenState();
}

class _RenderHistoryScreenState extends State<RenderHistoryScreen> {
  HistoryBloc historyBloc;
  ScrollController _controller;

  @override
  void initState() {
    super.initState();
    _controller = ScrollController();
    _controller.addListener(() {
      if (_controller.offset >= _controller.position.maxScrollExtent &&
          !_controller.position.outOfRange) {
        printLog("Scroll to bottom");
      }
      if (_controller.offset <= _controller.position.minScrollExtent &&
          !_controller.position.outOfRange) {
        printLog("Scroll to top");
      }
    });
  }

  Future<void> pullToRefesh() async {
    historyBloc.getHistoryItem();
  }

  @override
  Widget build(BuildContext context) {
    historyBloc = BlocProvider.of(context);
    SystemChrome.setEnabledSystemUIOverlays([]);
    return Scaffold(
      resizeToAvoidBottomInset: false,
      resizeToAvoidBottomPadding: false,
      backgroundColor: MyColors.whiteBackground,
      body: Stack(
        alignment: Alignment.center,
        children: <Widget>[
          StreamBuilder<List<HistoryItem>>(
              stream: historyBloc.dataList,
              builder: (context, snapshot) {
                return RefreshIndicator(
                  onRefresh: pullToRefesh,
                  child: Container(
                    width: MediaQuery.of(context).size.width,
                    height: MediaQuery.of(context).size.height,
                    child: Column(children: <Widget>[
                      StreamBuilder<SyncStatus>(
                          stream: historyBloc.syncStatus,
                          builder: (context, syncStatus) {
                            return Container(
                              margin:
                                  EdgeInsets.only(top: 12, left: 16, right: 16),
                              decoration: BoxDecoration(
                                color: MyColors.whiteColor,
                                borderRadius:
                                    BorderRadius.all(Radius.circular(10)),
                              ),
                              height: 44,
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceAround,
                                children: <Widget>[
                                  FlatButton(
                                      onPressed: () {
                                        historyBloc.getHistoryBySyncStatus(
                                            SyncStatus.DONE);
                                      },
                                      child: Text('Done'),
                                      textColor:
                                          syncStatus.data == SyncStatus.DONE
                                              ? MyColors.whiteColor
                                              : MyColors.blackColor,
                                      color: syncStatus.data == SyncStatus.DONE
                                          ? MyColors.doneButton
                                          : MyColors.whiteColor),
                                  Container(
                                      width: 1,
                                      height: 10,
                                      color: MyColors.darkColor),
                                  FlatButton(
                                    onPressed: () {
                                      historyBloc.getHistoryBySyncStatus(
                                          SyncStatus.UPLOADING);
                                    },
                                    child: Text('Uploading'),
                                    textColor:
                                        syncStatus.data == SyncStatus.UPLOADING
                                            ? MyColors.whiteColor
                                            : MyColors.blackColor,
                                    color:
                                        syncStatus.data == SyncStatus.UPLOADING
                                            ? MyColors.textLink
                                            : MyColors.whiteColor,
                                  ),
                                  Container(
                                      width: 1,
                                      height: 10,
                                      color: MyColors.darkColor),
                                  FlatButton(
                                    onPressed: () {
                                      historyBloc.getHistoryBySyncStatus(
                                          SyncStatus.ERROR);
                                    },
                                    child: Text('Error'),
                                    textColor:
                                        syncStatus.data == SyncStatus.ERROR
                                            ? MyColors.whiteColor
                                            : MyColors.blackColor,
                                    color: syncStatus.data == SyncStatus.ERROR
                                        ? MyColors.tabColorError
                                        : MyColors.whiteColor,
                                  )
                                ],
                              ),
                            );
                          }),
                      Expanded(
                        child: ListView.builder(
                          controller: _controller,
                          scrollDirection: Axis.vertical,
                          physics: AlwaysScrollableScrollPhysics(),
                          shrinkWrap: true,
                          itemCount: snapshot?.data?.length ?? 0,
                          itemBuilder: (context, index) =>
                              CustomCardViewHistory(item: snapshot.data[index]),
                        ),
                      )
                    ]),
                  ),
                );
              }),
          StreamBuilder<AppState>(
              stream: historyBloc.appState,
              initialData: AppState.Idle,
              builder: (context, snapShot) {
                if (snapShot.hasData && snapShot.data == AppState.Loading) {
                  return Center(
                    child: CircularProgressIndicator(),
                  );
                } else {
                  return SizedBox.shrink();
                }
              }),
        ],
      ),
    );
  }
}
