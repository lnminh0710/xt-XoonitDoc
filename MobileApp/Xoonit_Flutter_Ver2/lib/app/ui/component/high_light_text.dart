import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/styles.dart';

class HighLightText extends StatelessWidget {
  const HighLightText(
      {Key key,
      @required this.fullText,
      @required this.textToHighLight,
      this.generalStyle,
      this.hightLightStyle})
      : super(key: key);

  final String fullText;
  final String textToHighLight;
  final TextStyle generalStyle;
  final TextStyle hightLightStyle;

  @override
  Widget build(BuildContext context) {
    List<String> _fullText = fullText.split(textToHighLight);
    return RichText(
        text: TextSpan(
            style: generalStyle ?? MyStyleText.black14Medium,
            children: List<TextSpan>.generate(_fullText.length, (index) {
              return index != _fullText.length - 1
                  ? TextSpan(text: _fullText[index], children: [
                      TextSpan(
                          text: textToHighLight,
                          style: hightLightStyle ?? MyStyleText.orange14Regular)
                    ])
                  : TextSpan(text: _fullText[index]);
            })));
  }
}
