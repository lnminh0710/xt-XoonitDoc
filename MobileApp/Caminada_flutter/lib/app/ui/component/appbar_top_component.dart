import 'dart:async';

import 'package:flutter/material.dart';
import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/constants/resources.dart';
import 'package:caminada/app/constants/styles.dart';
import 'package:caminada/core/ultils.dart';

import 'common_component.dart';

class CustomAppBarTop extends StatelessWidget {
  final String screenName;
  final Function onMenuButtonPressed;
  final Function openDocumentTree;
  final AppBarSearchDelegate searchDelegate;

  final TextEditingController _textSearchController = TextEditingController();
  final StreamController<String> _streamController = StreamController();

  CustomAppBarTop(
      {@required this.onMenuButtonPressed,
      @required this.screenName,
      this.searchDelegate,
      @required this.openDocumentTree});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      leading: IconButton(
        icon: Icon(
          Icons.sort,
          color: MyColors.whiteColor,
        ),
        onPressed: () {
          openDocumentTree();
        },
      ),
      title: Text(
        screenName != null ? screenName : '',
        style: MyStyleText.textTitleToolbar_17White,
      ),
      centerTitle: true,
      backgroundColor: MyColors.bluedarkColor,
      actions: <Widget>[
        IconButton(
          icon: Image(image: AssetImage(Resources.iconMenu)),
          onPressed: () {
            onMenuButtonPressed();
          },
        )
      ],
      bottom: PreferredSize(
        preferredSize: Size(Dimension.getWidth(1), 40),
        child: Padding(
          padding: EdgeInsets.only(left: 15, right: 15, bottom: 15),
          child: CustomTextField(
              controller: _textSearchController,
              width: Dimension.getWidth(1),
              onChanedvalue: (str) {
                _streamController.sink.add(str);
                searchDelegate.onChangedValue(str);
              },
              onCompleted: searchDelegate?.onCompleted,
              height: 36,
              backgroundColor: MyColors.backgroundSearchBarColor,
              hintText: "Search",
              styleHintText: MyStyleText.textHintSearchBar,
              borderRadius: 10.0,
              styleText: MyStyleText.white14Medium,
              prefixIcon: Icon(
                Icons.search,
                color: MyColors.colorHintTextSearch,
              ),
              suffixIcon: StreamBuilder<String>(
                stream: _streamController.stream,
                builder: (_, snapshot) {
                  return snapshot.data?.isNotEmpty == true
                      ? GestureDetector(
                          onTap: () {
                            _textSearchController.clear();
                            _streamController.sink.add("");
                          },
                          child: Icon(
                            Icons.cancel,
                            color: MyColors.colorHintTextSearch,
                          ),
                        )
                      : SizedBox.shrink();
                },
              )),
        ),
      ),
    );
  }
}

abstract class AppBarSearchDelegate {
  onChangedValue(String str);
  onCompleted(String str);
}
