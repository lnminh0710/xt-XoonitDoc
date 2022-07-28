import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/ui/screen/global_search/widgets/global_search_result.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';

class GlobalSearchScreen extends StatelessWidget {
  final String keyWord;
  const GlobalSearchScreen({Key key, this.keyWord}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    XoonitApplication.instance.getGlobalSearchController().search(keyWord);
    return Container(
      child: SingleChildScrollView(
          child: GlobalSearchResult(
        keywordSearch: keyWord,
      )),
    );
  }
}
