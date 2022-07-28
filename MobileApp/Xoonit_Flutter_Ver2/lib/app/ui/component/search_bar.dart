import 'dart:async';

import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/component/common_component.dart';
import 'package:xoonit/core/ultils.dart';

class Searchbar extends StatefulWidget {
  Searchbar(
      {Key key,
      this.hintText,
      this.hintStyle,
      this.textController,
      this.onChangeValue,
      this.onCompleted,
      this.backgroundColor,
      this.searchIcon})
      : super(key: key);
  final hintText;
  final hintStyle;
  final Color backgroundColor;
  final Function(String) onChangeValue;
  final Function(String) onCompleted;
  final TextEditingController textController;
  final Widget searchIcon;
  @override
  _SearchbarState createState() => _SearchbarState();
}

class _SearchbarState extends State<Searchbar> {
  TextEditingController _searchContactTextController;
  final StreamController<String> _streamController = StreamController();

  @override
  void dispose() {
    _streamController?.close();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _searchContactTextController =
        widget.textController ?? TextEditingController();
    _streamController.sink.add(_searchContactTextController.text ?? '');
  }

  @override
  Widget build(BuildContext context) {
    return CustomTextField(
        controller: _searchContactTextController,
        width: Dimension.getWidth(1),
        onChanedvalue: (text) {
          _streamController.sink.add(text);
          widget?.onChangeValue(text);
        },
        onCompleted: (text) {
          widget?.onCompleted(text);
        },
        height: 40,
        backgroundColor: widget.backgroundColor ?? MyColors.colorHintTextSearch,
        hintText: widget.hintText,
        styleHintText: widget.hintStyle ?? MyStyleText.grey14Medium,
        borderRadius: 10.0,
        styleText: MyStyleText.black14Regular,
        prefixIcon: widget.searchIcon ??
            Icon(
              Icons.search,
              color: MyColors.greyText,
            ),
        suffixIcon: StreamBuilder<String>(
          stream: _streamController.stream,
          builder: (_, snapshot) {
            return snapshot.data?.isNotEmpty == true
                ? GestureDetector(
                    onTap: () {
                      _searchContactTextController.clear();
                      _streamController.sink.add("");
                    },
                    child: Icon(
                      Icons.cancel,
                      color: MyColors.greyColor,
                    ),
                  )
                : SizedBox.shrink();
          },
        ));
  }
}
