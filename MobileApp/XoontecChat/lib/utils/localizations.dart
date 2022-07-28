import 'package:flutter/cupertino.dart';
import 'package:intl/intl.dart';

import '../difinition.dart';

class TranslateText extends Text {
  TranslateText(
      {this.style,
      this.strutStyle,
      this.textAlign,
      this.locale,
      this.softWrap,
      this.textOverflow,
      this.maxLines,
      String key})
      : assert(key != null),
        super(key.translate);
  final TextStyle style;
  final StrutStyle strutStyle;
  final TextAlign textAlign;
  final Locale locale;
  final bool softWrap;
  final TextOverflow textOverflow;
  final int maxLines; 
}

extension Stringext on String {
  String get translate => languageJsonData[this] ?? this;
  String get time => convertDateTime(this);
}

String convertDateTime(String time) {
  DateTime dateTime = DateTime.parse(time);
  final DateFormat dateFormat =
      DateFormat('E , MM/dd/y', applicationLanguage.languageCode);
  print(dateFormat.format(dateTime));
  return dateFormat.format(dateTime);
}
