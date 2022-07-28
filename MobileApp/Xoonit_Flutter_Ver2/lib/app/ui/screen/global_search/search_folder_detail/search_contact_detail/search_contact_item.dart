import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/component/high_light_text.dart';
import 'package:xoonit/core/ultils.dart';

class SearchContactItem extends StatelessWidget {
  const SearchContactItem(
      {Key key,
      this.detailKey1,
      this.detailKey2,
      this.detailKey3,
      this.detailValue3,
      this.detailValue2,
      this.detailValue1,
      this.detailKey4,
      this.detailKey5,
      this.detailValue4,
      this.detailValue5,
      this.onItemClicked,
      this.searchKeyword})
      : super(key: key);
  final String detailKey1;
  final String detailKey2;
  final String detailKey3;
  final String detailValue3;
  final String detailValue2;
  final String detailValue1;
  final Function onItemClicked;
  final String detailKey4;
  final String detailValue4;
  final String detailKey5;
  final String detailValue5;
  final String searchKeyword;

  Widget _textKeyStyle(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: HighLightText(
        fullText: text,
        textToHighLight: '',
        generalStyle: MyStyleText.black14Bold,
      ),
    );
  }

  Widget _textValueStyle(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: HighLightText(
        fullText: text,
        textToHighLight: searchKeyword ?? '',
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        onItemClicked();
      },
      child: Card(
        elevation: 6,
        shadowColor: Colors.grey.withOpacity(0.3),
        color: MyColors.whiteColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10.0),
        ),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            children: <Widget>[
              Row(
                children: <Widget>[
                  Container(
                    width: Dimension.getWidth(0.3),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        _textKeyStyle(detailKey1),
                        _textKeyStyle(detailKey2),
                        _textKeyStyle(detailKey3),
                        _textKeyStyle(detailKey4),
                        _textKeyStyle(detailKey5),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        _textValueStyle(detailValue1),
                        _textValueStyle(detailValue2),
                        _textValueStyle(detailValue3),
                        _textValueStyle(detailValue4),
                        _textValueStyle(detailValue5),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
