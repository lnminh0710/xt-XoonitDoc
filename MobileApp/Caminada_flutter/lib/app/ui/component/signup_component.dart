import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/constants/styles.dart';
class CommonTextFormField extends StatefulWidget {
  final Key fieldKey;
  final String hintText;
  final String labelText;
  final String helperText;
  final TextInputAction textInputAction;
  final FormFieldSetter<String> onSaved;
  final FormFieldValidator<String> validator;
  final ValueChanged<String> onFieldSubmitted;
  final ValueChanged<String> onChange;
  final FocusNode focusNode ;
  final TextInputType keyboardType;
  final Widget suffixIcon;
  final Widget prefixIcon;
  final bool autovalidate ;
  final  GestureTapCallback onTap;
  final bool obscureText;
  const CommonTextFormField({
    this.fieldKey,
    this.hintText,
    this.labelText,
    this.helperText,
    this.onChange,
    this.onSaved,
    this.onTap,
    this.prefixIcon,
    this.focusNode,
    this.validator,
    this.keyboardType,
    this.suffixIcon,
    this.onFieldSubmitted,
    this.textInputAction,
    this.obscureText = false,
    this.autovalidate = false,
  });
  @override
  _TextFormFieldCommonState createState() => new _TextFormFieldCommonState();
}
class _TextFormFieldCommonState extends State<CommonTextFormField> {
  @override
  Widget build(BuildContext context) {
    return new TextFormField(
        textInputAction: widget.textInputAction,
        key: widget.fieldKey,
        onSaved: widget.onSaved,
        onTap: widget.onTap,
        validator: widget.validator,
        autovalidate: widget.autovalidate,
        obscureText: widget.obscureText,
        autocorrect: false,
        enableSuggestions: false,
        focusNode: widget.focusNode,
        keyboardType: widget.keyboardType,
        onChanged: (value) {
          widget.onChange(value);
        },
        onFieldSubmitted: widget.onFieldSubmitted,
        decoration: new InputDecoration(
     border: OutlineInputBorder(borderSide: BorderSide(width: 2,color: MyColors.blueBorder) ),
     focusedBorder: OutlineInputBorder(borderSide:BorderSide(width:2,color: MyColors.blueBorder)),
          hintText: widget.hintText,
          hintStyle: MyStyleText.hintColor16Medium,
          labelText: widget.labelText,
          labelStyle: MyStyleText.labelColor16Medium,
          helperText: widget.helperText,
          prefixIcon: widget.prefixIcon,
          suffixIcon: widget.suffixIcon,
        ));
  }
}