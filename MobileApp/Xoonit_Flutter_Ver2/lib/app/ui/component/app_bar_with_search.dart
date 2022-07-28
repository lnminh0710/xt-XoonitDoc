import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/component/common_component.dart';
import 'package:xoonit/core/ultils.dart';

class GlobalSearchBar extends StatefulWidget {
  GlobalSearchBar(
      {Key key, @required this.onSearch, @required this.textSearchController})
      : super(key: key);
  final Function(String) onSearch;
  final TextEditingController textSearchController;
  @override
  _GlobalSearchBarState createState() => _GlobalSearchBarState();
}

class _GlobalSearchBarState extends State<GlobalSearchBar> {
  final StreamController<String> _streamController = StreamController();

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _streamController?.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Padding(
        padding: EdgeInsets.only(
          left: 15,
          right: 15,
          bottom: 15,
        ),
        child: CustomTextField(
            controller: widget.textSearchController,
            width: Dimension.getWidth(1),
            onChanedvalue: (str) {
              _streamController.sink.add(str);
            },
            onCompleted: (text) {
              widget.onSearch(text);
            },
            height: 40,
            backgroundColor: MyColors.colorHintTextSearch,
            hintText: "Global Search",
            styleHintText: MyStyleText.grey14Medium,
            borderRadius: 10.0,
            styleText: MyStyleText.black14Regular,
            prefixIcon: Icon(
              Icons.search,
              color: MyColors.greyText,
            ),
            suffixIcon: StreamBuilder<String>(
              stream: _streamController.stream,
              builder: (_, snapshot) {
                return snapshot.data?.isNotEmpty == true
                    ? GestureDetector(
                        onTap: () {
                          widget.textSearchController.clear();
                          _streamController.sink.add("");
                        },
                        child: Icon(
                          Icons.cancel,
                          color: MyColors.greyColor,
                        ),
                      )
                    : SizedBox.shrink();
              },
            )),
      ),
    );
  }
}
