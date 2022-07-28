import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/painting.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/difinition.dart';

import '../../constants/colors.dart';

class CustomTextField extends StatelessWidget {
  final String hintText;
  final double width;
  final double height;
  final Color backgroundColor;
  final Color borderColor;
  final bool hasBorder;
  final Widget suffixIcon;
  final double paddingTopText;
  final bool isAlignText;
  final TextEditingController controller;
  final TextStyle styleText;
  final TextStyle styleHintText;
  final FocusNode focusNode;
  final int maxlength;
  final TextInputType keyboardType;
  final Function(String) onChanedvalue;
  final Function(String) onCompleted;
  final bool enable;
  final double borderRadius;
  final Widget prefixIcon;
  CustomTextField({
    Key key,
    this.hintText = 'Place holder',
    this.backgroundColor,
    this.isAlignText = false,
    this.width,
    this.focusNode,
    this.onCompleted,
    this.height = 50,
    this.borderColor = MyColors.redColor,
    this.suffixIcon,
    this.maxlength,
    this.paddingTopText = 2,
    this.controller,
    this.hasBorder = false,
    this.styleText,
    this.styleHintText,
    this.keyboardType = TextInputType.text,
    this.onChanedvalue,
    this.enable = true,
    this.borderRadius = 15,
    this.prefixIcon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: ThemeData(
        hintColor: borderColor,
        splashColor: Colors.transparent,
      ),
      child: Material(
        color: backgroundColor,
        shape: RoundedRectangleBorder(
          side: hasBorder == false
              ? BorderSide.none
              : BorderSide(color: borderColor, width: 1.5),
          borderRadius: BorderRadius.all(Radius.circular(borderRadius)),
        ),
        child: Container(
            width: width,
            height: height,
            padding:
                EdgeInsets.only(top: paddingTopText, bottom: paddingTopText),
            child: TextField(
              textAlign:
                  isAlignText == true ? TextAlign.center : TextAlign.start,
              controller: controller,
              focusNode: focusNode,
              cursorColor: MyColors.blueColor,
              style: styleText,
              //,
              textInputAction: TextInputAction.done,
              keyboardType: keyboardType,
              onChanged: onChanedvalue,
              onSubmitted: onCompleted,
              maxLength: maxlength,
              enabled: enable,

              decoration: InputDecoration(
                counterText: '',
                hintText: hintText,
                hintStyle: styleHintText == null
                    ? MyStyleText.white18Light
                    : styleHintText,
                //,
                border: InputBorder.none,
                suffixIcon: suffixIcon,
                prefixIcon: prefixIcon,
              ),
            )),
      ),
    );
  }
}

class CommonButton extends StatelessWidget {
  final String title;
  final Function onTap;
  final Color bgColor;
  final TextStyle titleStyle;
  final bool isBorder;
  final Color borderColor;

  CommonButton(
      {Key key,
      this.title,
      this.onTap,
      this.bgColor = MyColors.orangeColor,
      this.isBorder = false,
      this.borderColor = MyColors.orangeColor,
      this.titleStyle})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return RawMaterialButton(
      onPressed: onTap,
      fillColor: bgColor,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(8.0)),
          side: BorderSide(
              width: isBorder == true ? 1.0 : 0.0, color: borderColor)),
      child: Center(child: Text(title, style: titleStyle)),
    );
  }
}

class CommonCheckbox extends StatelessWidget {
  final String description;
  final bool isChecked;
  final TextStyle textStyle;
  final double size;
  final String textLink;
  final String url;
  final ValueChanged<bool> onChanged;

  CommonCheckbox({
    Key key,
    this.description,
    this.isChecked = false,
    this.textStyle,
    this.url,
    this.size = 16,
    this.textLink,
    @required this.onChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        onChanged(isChecked);
      },
      child: Container(
        child: Row(
          children: <Widget>[
            Container(
                width: size,
                height: size,
                margin: EdgeInsets.only(right: 8),
                decoration: BoxDecoration(
                    shape: BoxShape.rectangle,
                    border: isChecked
                        ? null
                        : Border.all(width: 2, color: MyColors.greyColor1),
                    borderRadius: BorderRadius.circular(3),
                    color: isChecked
                        ? MyColors.blueColor
                        : MyColors.greyLightColor),
                child: isChecked
                    ? Icon(
                        Icons.check,
                        size: size,
                        color: Colors.white,
                      )
                    : Container()),
            description == ""
                ? Container()
                : Expanded(
                    child: RichText(
                      text: new TextSpan(
                        children: [
                          new TextSpan(
                            text: description,
                            style: textStyle ?? MyStyleText.white14Medium,
                          ),
                          new TextSpan(
                            text: textLink == null ? '' : ' ' + textLink,
                            style: new TextStyle(color: Colors.blue),
                            recognizer: new TapGestureRecognizer()
                              ..onTap = () {
                                printLog('Tap on term and condition.');
                              },
                          ),
                        ],
                      ),
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}

class CustomTextFieldBorder extends StatelessWidget {
  final String hintText;
  final double width;
  final double height;
  final Color backgroundColor;
  final Color borderColor;
  final bool hasBorder;
  final Widget suffixIcon;
  final double paddingTopText;
  final bool isAlignText;
  final TextEditingController controller;
  final TextStyle styleText;
  final TextStyle styleHintText;
  final FocusNode focusNode;
  final int maxlength;
  final bool isIOSOneTimeCode;
  final TextInputType keyboardType;
  final Function(String) onChanedvalue;
  final Function(String) onCompleted;
  final Widget prefixIcon;

  final bool isPassword;
  final bool enable;

  CustomTextFieldBorder({
    Key key,
    this.hintText = 'Place holder',
    this.backgroundColor,
    this.isAlignText = false,
    this.prefixIcon,
    this.width,
    this.focusNode,
    this.onCompleted,
    this.height = 50,
    this.borderColor = MyColors.redColor,
    this.suffixIcon,
    this.maxlength,
    this.paddingTopText = 2,
    this.controller,
    this.hasBorder = false,
    this.isPassword = false,
    this.styleText,
    this.styleHintText,
    this.keyboardType = TextInputType.text,
    this.isIOSOneTimeCode = false,
    this.onChanedvalue,
    this.enable = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    TextField(
      textAlign: TextAlign.start,
      controller: controller,
      obscureText: isPassword,
      cursorColor: MyColors.blueColor,
      style: styleText, //,

      textInputAction: TextInputAction.done,
      keyboardType: keyboardType,
      onChanged: onChanedvalue,
      onSubmitted: onCompleted,
      maxLength: maxlength,
      enabled: enable,
      textAlignVertical: TextAlignVertical.bottom,
      maxLines: 1,
      decoration: InputDecoration(
        hintText: hintText,
        hintStyle: styleHintText == null
            ? MyStyleText.white14Medium
            : styleHintText, //,
        enabledBorder: UnderlineInputBorder(
          borderSide: BorderSide(color: MyColors.greyHintTextColor),
        ),
        focusedBorder: UnderlineInputBorder(
          borderSide: BorderSide(color: MyColors.greyLowColor),
        ),
        border: UnderlineInputBorder(),
        prefixIcon: prefixIcon,
      ),
    );
    return Theme(
      data: ThemeData(),
      child: Container(
        child: TextField(
          textAlign: TextAlign.start,
          controller: controller,
          focusNode: focusNode,
          obscureText: isPassword,
          cursorColor: MyColors.blueColor,
          style: styleText,
          //,
          textInputAction: TextInputAction.done,
          keyboardType: keyboardType,
          onChanged: onChanedvalue,
          onSubmitted: onCompleted,
          maxLength: maxlength,
          enabled: enable,
          textAlignVertical: TextAlignVertical.bottom,
          maxLines: 1,
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: styleHintText == null
                ? MyStyleText.white14Medium
                : styleHintText,
            //,
            enabledBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: MyColors.greyHintTextColor),
            ),
            focusedBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: MyColors.greyLowColor),
            ),
            border: UnderlineInputBorder(),
          ),
        ),
      ),
    );
  }
}

class CustomTextFieldInputPages extends StatelessWidget {
  final double width;
  final double height;
  final TextAlign textAlign;
  final TextStyle styleText;
  final Function(String) onChangeValue;
  final Function onTap;
  final Function(String) onCompleted;
  final TextInputType textInputType;
  final TextEditingController controller;
  final EdgeInsets padding;
  final int maxLength;
  final bool enabled;
  final bool readOnly;
  final bool autoFocus;
  final bool enableInteractiveSelection;
  final Widget icon;

  CustomTextFieldInputPages({
    Key key,
    this.width,
    this.height,
    this.styleText,
    this.onChangeValue,
    this.onTap,
    this.onCompleted,
    this.textInputType,
    this.controller,
    this.maxLength,
    this.enabled = true,
    this.autoFocus = false,
    this.readOnly = false,
    this.icon,
    this.enableInteractiveSelection = false,
    @required this.textAlign,
    this.padding,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(2))),
      color: MyColors.greyText2,
      child: Container(
          width: width,
          height: height,
          padding: padding,
          child: TextField(
            enableInteractiveSelection: enableInteractiveSelection,
            textAlign: textAlign,
            onChanged: onChangeValue,
            style: styleText,
            onTap: onTap,
            onSubmitted: onCompleted,
            keyboardType: textInputType,
            controller: controller,
            maxLength: maxLength,
            enabled: enabled,
            readOnly: readOnly,
            maxLines: 1,
            autofocus: autoFocus,
            decoration: InputDecoration(
              border: InputBorder.none,
              icon: icon,
            ),
          )),
    );
  }
}
