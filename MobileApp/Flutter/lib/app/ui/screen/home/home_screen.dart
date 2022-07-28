import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/ui/component/appbar_top_component.dart';
import 'package:xoonit/app/ui/dialog/dialog_message.dart';
import 'package:xoonit/app/ui/screen/home/home_bloc.dart';
import 'package:xoonit/app/ui/screen/menu/menu_screen.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

import 'home_route.dart';

class HomeScreen extends StatelessWidget {
  HomeScreen({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    HomeBloc homeBloc = BlocProvider.of(context);
    SystemChrome.setEnabledSystemUIOverlays([]);
    return WillPopScope(
        onWillPop: () async {
          showDialog(
              context: context,
              builder: (BuildContext context) {
                return DialogMessage(
                  title: 'Message',
                  message: 'Are you sure want to quit?',
                  onCancelButtonPressed: () {
                    Navigator.of(context).pop();
                  },
                  onOKButtonPressed: () {
                    exit(0);
                  },
                );
              });
          return false;
        },
        child: Scaffold(
            resizeToAvoidBottomInset: false,
            appBar: _appBar(context, homeBloc),
            body: _contentBody(homeBloc)));
  }

  _appBar(BuildContext context, HomeBloc _bloc) => PreferredSize(
        preferredSize: Size(Dimension.getWidth(1), 100),
        child: StreamBuilder<String>(
            stream: _bloc.screenName,
            builder: (context, snapshot) {
              return CustomAppBarTop(
                searchDelegate: _bloc.searchDelegate.value,
                screenName: snapshot.data,
                openDocumentTree: () {
                  _bloc.openDocumentTree(context);
                },
                onMenuButtonPressed: () {
                  printLog('on Menu button pressed');
                  showDialog(
                      context: context,
                      child: MenuScreen(didSelect: _bloc.jumpToScreen));
                },
              );
            }),
      );

  _contentBody(HomeBloc _bloc) {
    return Container(
        color: MyColors.primaryColor,
        child: N_bloc.homeNavigatorKey,
          onGenerateRoute: HomeRoutes.onGenerateRoute,
        )avigator(
          key: 
        // PageView.builder(
        //     physics: new NeverScrollableScrollPhysics(),
        //     controller: _pageController,
        //     itemCount: EHomeScreenChild.values.length,
        //     itemBuilder: (context, index) => _itemBuilder(index)),
        );
  }

// _itemBuilder(int index) {
//   switch (EHomeScreenChild.values[index]) {
//     case EHomeScreenChild.globalSearch:
//       return BlocProvider(
//           child: GlobalSearchScreen(), bloc: GlobalSearchBloc());
//     case EHomeScreenChild.myDM:
//       bloc.myDMPageController =
//           bloc.myDMPageController ?? MyDMPageController();
//       return MyDMScreen(myDMPageController: bloc.myDMPageController);
//     case EHomeScreenChild.capture:
//       return BlocProvider(child: CaptureScreen(), bloc: CaptureBloc());
//     case EHomeScreenChild.contact:
//       return BlocProvider(child: ContactScreen(), bloc: ContactBloc());
//     case EHomeScreenChild.scan:
//       return BlocProvider(child: ScanScreen(), bloc: ScanBloc());
//     case EHomeScreenChild.import:
//       return BlocProvider(child: ImportScreen(), bloc: ImportBloc());
//     case EHomeScreenChild.export:
//       return BlocProvider(
//           child: GlobalSearchScreen(), bloc: GlobalSearchBloc());
//     case EHomeScreenChild.cloud:
//       return BlocProvider(
//           child: GlobalSearchScreen(), bloc: GlobalSearchBloc());
//     case EHomeScreenChild.userguide:
//       return BlocProvider(
//           child: GlobalSearchScreen(), bloc: GlobalSearchBloc());
//     case EHomeScreenChild.history:
//       return BlocProvider(child: HistoryScreen(), bloc: HistoryBloc());
//     case EHomeScreenChild.photos:
//       return BlocProvider(child: PhotoScreen(), bloc: PhotoBloc());
//     case EHomeScreenChild.contactDetails:
//       return BlocProvider(
//           child: ContactDetailsScreen(), bloc: ContactDetailsBloc());
//   }
// }

// _jumpToPage(EHomeScreenChild child) {
//   _pageController.jumpToPage(EHomeScreenChild.values.indexOf(child));
// }
}
