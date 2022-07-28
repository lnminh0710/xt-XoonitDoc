import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/ui/component/app_bar_with_search.dart';
import 'package:xoonit/app/ui/component/loading_checking_cloud_connection.dart';
import 'package:xoonit/app/ui/dialog/common_dialog_notification.dart';
import 'package:xoonit/app/ui/screen/dash_board/app_routes.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/dash_board/drawer/dash_board_drawer.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_enum.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

class DashBoardScreen extends StatefulWidget {
  DashBoardScreen({Key key}) : super(key: key);

  @override
  _DashBoardScreenState createState() => _DashBoardScreenState();
}

class _DashBoardScreenState extends State<DashBoardScreen> {
  DashBoardBloc dashBoardBloc;
  TextEditingController _searchController = TextEditingController();

  bool isCanGoBack() {
    if (dashBoardBloc.appNavigatorKey?.currentState == null) {
      return false;
    }
    if (dashBoardBloc.appNavigatorKey.currentState.canPop()) {
      return true;
    } else {
      _searchController.clear();
      return false;
    }
  }

  @override
  void initState() {
    super.initState();
    dashBoardBloc = BlocProvider.of(context);
    dashBoardBloc.getCloudConnectionState(context);
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setEnabledSystemUIOverlays([]);
    return WillPopScope(
        onWillPop: () async {
          if (!dashBoardBloc.isEnableBackButton) {
            showDialogExit(context);
            return false;
          }

          if (isCanGoBack()) {
            dashBoardBloc.goBack();
          } else {
            showDialogExit(context);
          }
          return false;
        },
        child: Stack(
          children: <Widget>[
            Scaffold(
              appBar: PreferredSize(
                preferredSize: Size(Dimension.getWidth(1), 116),
                child: StreamBuilder<List<String>>(
                    stream: dashBoardBloc.appbarTitles,
                    builder: (context, snapshot) {
                      return AppBar(
                        elevation: 1,
                        title: Text(
                          snapshot?.data?.last ?? 'Home',
                          style: MyStyleText.black18Bold,
                        ),
                        actions: <Widget>[
                          !isCanGoBack()
                              ? Container()
                              : GestureDetector(
                                  onTap: () {
                                    dashBoardBloc
                                        .jumpToScreen(EHomeScreenChild.home);
                                  },
                                  child: Container(
                                      padding:
                                          EdgeInsets.symmetric(horizontal: 16),
                                      child: Icon(
                                        Icons.home,
                                        color: MyColors.greyText2,
                                        size: 28,
                                      )),
                                ),
                          GestureDetector(
                            onTap: () {
                              dashBoardBloc
                                  .jumpToScreen(EHomeScreenChild.account);
                            },
                            child: Container(
                                padding: EdgeInsets.only(right: 16),
                                child: Icon(Icons.account_circle,
                                    color: MyColors.greyText2, size: 28)),
                          )
                        ],
                        centerTitle: true,
                        leading: isCanGoBack()
                            ? StreamBuilder<bool>(
                                initialData: true,
                                stream: dashBoardBloc.enableBackButtonStream,
                                builder: (context, snapshot) {
                                  return IconButton(
                                    icon: Icon(Icons.arrow_back_ios),
                                    onPressed: snapshot?.data != true
                                        ? null
                                        : () {
                                            dashBoardBloc.goBack();
                                          },
                                  );
                                },
                              )
                            : null,
                        bottom: PreferredSize(
                          preferredSize: Size(Dimension.getWidth(1), 60),
                          child: GlobalSearchBar(
                            onSearch: (text) {
                              if (text == null || text == '') {
                                FocusScope.of(context).unfocus();
                              } else {
                                dashBoardBloc
                                    .jumpToScreen(EHomeScreenChild.globalSearch,
                                        args: text)
                                    .then((value) {
                                  XoonitApplication.instance
                                      .getGlobalSearchController()
                                      .getModules();
                                });
                              }
                            },
                            textSearchController: _searchController,
                          ),
                        ),
                      );
                    }),
              ),
              resizeToAvoidBottomInset: false,
              // Body Where the content will be shown of each page index
              body: SafeArea(
                bottom: false,
                child: GestureDetector(
                  onTap: () {
                    FocusScope.of(context).unfocus();
                  },
                  child: Navigator(
                    key: dashBoardBloc.appNavigatorKey,
                    onGenerateRoute: AppRoutes.onGenerateRoute,
                  ),
                ),
              ),
              drawer: Theme(
                data: Theme.of(context).copyWith(
                  // Set the transparency here
                  canvasColor: Colors
                      .transparent, //or any other color you want. e.g Colors.blue.withOpacity(0.5)
                ),
                child: Drawer(child: DashBoardDrawer()),
              ),
            ),
            StreamBuilder<AppState>(
              stream: dashBoardBloc.screenState,
              builder: (context, screenState) {
                if (screenState.hasData && screenState.data != AppState.Idle) {
                  return Container(
                    width: Dimension.getWidth(1),
                    height: Dimension.getHeight(1),
                    color: Colors.black12,
                    child: AlertDialog(
                      contentPadding: EdgeInsets.all(32),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.all(
                          Radius.circular(15),
                        ),
                      ),
                      content: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          Text("Checking connection...",
                              style: MyStyleText.blueLightColor14Regular),
                          SizedBox(height: 16),
                          CustomLoading(),
                        ],
                      ),
                    ),
                  );
                } else {
                  return Container();
                }
              },
            ),
          ],
        ));
  }

  showDialogExit(BuildContext context) {
    showDialog(
        context: context,
        builder: (childContext) {
          return NotificationDialog(
            iconImages: Image.asset(Resources.icDialogWarning),
            title: "Warning !",
            message: "Are you sure want to quit ?",
            possitiveButtonName: "OK",
            possitiveButtonOnClick: (_) {
              exit(0);
            },
            negativeButtonName: "Cancel",
            nagativeButtonOnCLick: (_) {
              Navigator.of(context).pop();
            },
            body: SizedBox.shrink(),
          );
        });
  }
}
