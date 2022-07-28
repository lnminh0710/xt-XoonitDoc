import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_bloc.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_page.dart';
import 'package:xoonit/core/bloc_base.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key key}) : super(key: key);

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int currentTabIndex = 0;
  DashBoardBloc dashBoardBloc;
  @override
  Widget build(BuildContext context) {
    dashBoardBloc = BlocProvider.of(context);
    return Scaffold(
      resizeToAvoidBottomInset: false,
      // appBar: appBarWithSearch(title: 'title'),
      // Body Where the content will be shown of each page index
      body: BlocProvider<HomeBloc>(
        bloc: HomeBloc(),
        child: HomePage(),
      ),
    );
  }
}
