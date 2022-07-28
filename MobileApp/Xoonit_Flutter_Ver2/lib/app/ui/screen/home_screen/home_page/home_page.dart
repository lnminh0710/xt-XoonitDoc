import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/ui/screen/global_search/widgets/global_search_result.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/ui_component/home_menu.dart';


class HomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: MyColors.colorHintTextSearch,
      child: SingleChildScrollView(
        child: Column(
          children: <Widget>[
            HomeMenu(),
            Container(
                padding: EdgeInsets.only(bottom: 80),
                child: GlobalSearchResult()),
          ],
        ),
      ),
    );
  }
}
