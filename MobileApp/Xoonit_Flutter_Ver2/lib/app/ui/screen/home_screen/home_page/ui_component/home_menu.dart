import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_enum.dart';
import 'package:xoonit/core/bloc_base.dart';

class HomeMenu extends StatelessWidget {
  const HomeMenu({Key key}) : super(key: key);

  static const lsModule = [
    EHomeScreenChild.camera,
    EHomeScreenChild.capture,
    // EHomeScreenChild.scan,
    EHomeScreenChild.import,
    // EHomeScreenChild.export,
    EHomeScreenChild.cloud,
    // EHomeScreenChild.userguide,
    EHomeScreenChild.history
  ];

  Widget _menuItem({String title, Widget icon, Function onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.zero,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: <Widget>[
            AspectRatio(
                aspectRatio: 1,
                child: Container(
                  decoration:
                      BoxDecoration(shape: BoxShape.circle, color: Colors.blue),
                  child: icon,
                )),
            Text("$title", style: MyStyleText.black14Regular),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    DashBoardBloc dashBoardBloc = BlocProvider.of(context);
    return Container(
      color: Colors.white,
      child: GridView.builder(
          physics: NeverScrollableScrollPhysics(),
          shrinkWrap: true,
          padding: EdgeInsets.all(16),
          itemCount: lsModule.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              childAspectRatio: 2 / 3,
              crossAxisCount: 4,
              mainAxisSpacing: 12,
              crossAxisSpacing: 24),
          itemBuilder: (_, index) {
            var module = lsModule[index];
            return _menuItem(
                icon: module.icon,
                title: module.title,
                onTap: () {
                  dashBoardBloc.jumpToScreen(lsModule[index]);
                });
          }),
    );
  }
}
