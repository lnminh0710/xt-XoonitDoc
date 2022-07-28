import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/core/ultils.dart';

class ShowPopUpComposeMail extends StatefulWidget {
  final TextEditingController mailAddressController;
  final TextEditingController subjectMailController;
  final TextEditingController contentMailController;
  final Function sendMail;
  final Function onClose;

  ShowPopUpComposeMail(
      {Key key,
      this.mailAddressController,
      this.subjectMailController,
      this.contentMailController,
      this.sendMail, this.onClose})
      : super(key: key);

  @override
  _ShowPopUpComposeMailState createState() => _ShowPopUpComposeMailState();
}

class _ShowPopUpComposeMailState extends State<ShowPopUpComposeMail> {
  TextEditingController mailAddressController;
  TextEditingController subjectMailController;
  TextEditingController contentMailController;
  Function sendMail;
  Function onClose;

  GlobalKey<FormState> key = new GlobalKey();
  bool validate = false;

@override
  void initState() {
    super.initState();
    mailAddressController = widget.mailAddressController;
    subjectMailController = widget.subjectMailController;
    contentMailController = widget.contentMailController;
    sendMail = widget.sendMail;
    onClose = widget.onClose;
  }
  @override
  Widget build(BuildContext context) {
    sendToMail() {
      if (key.currentState.validate()) {
        sendMail();
      } else {
        setState(() {
          validate = true;
        });
      }
    }

    String validateEmail(String value) {
      Pattern pattern =
          r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$';
      RegExp regex = new RegExp(pattern);
      if (!regex.hasMatch(value))
        return 'Enter Valid Email';
      else
        return null;
    }

    return Scaffold(
      body: Container(
        padding: EdgeInsets.all(10),
        width: Dimension.getWidth(1),
        color: MyColors.bluedarkColor,
        child: Form(
          key: key,
          autovalidate: validate,
          child: Column(
            children: <Widget>[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: <Widget>[
                  IconButton(
                      icon: Icon(Icons.close),
                      color: MyColors.whiteColor,
                      iconSize: 20,
                      onPressed: () {
                       onClose();
                      }),
                  Text(
                    "Compose mail",
                    style: MyStyleText.white14Medium,
                  ),
                  IconButton(
                      icon: Icon(Icons.send),
                      color: MyColors.whiteColor,
                      iconSize: 20,
                      onPressed: sendToMail)
                ],
              ),
              TextFormField(
                textAlign: TextAlign.start,
                cursorColor: MyColors.blueColor,
                textAlignVertical: TextAlignVertical.bottom,
                maxLines: 1,
                keyboardType: TextInputType.emailAddress,
                style: MyStyleText.white14Medium,
                autofocus: true,
                controller: mailAddressController,
                validator: validateEmail,
                decoration: InputDecoration(
                  hintText: "Recipients",
                  hintStyle: MyStyleText.grey14Regular, //,
                  enabledBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: MyColors.greyHintTextColor),
                  ),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: MyColors.greyLowColor),
                  ),
                  border: UnderlineInputBorder(),
                ),
              ),
              TextField(
                textAlign: TextAlign.start,
                cursorColor: MyColors.blueColor,
                textAlignVertical: TextAlignVertical.bottom,
                maxLines: 1,
                style: MyStyleText.white14Medium,
                autofocus: true,
                controller: subjectMailController,
                decoration: InputDecoration(
                  hintText: "Subject",
                  hintStyle: MyStyleText.grey14Regular,
                  enabledBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: MyColors.greyHintTextColor),
                  ),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: MyColors.greyLowColor),
                  ),
                  border: UnderlineInputBorder(),
                ),
              ),
              TextField(
                textAlign: TextAlign.start,
                cursorColor: MyColors.blueColor,
                textAlignVertical: TextAlignVertical.bottom,
                maxLines: null,
                autofocus: true,
                style: MyStyleText.white14Regular,
                controller: contentMailController,
                decoration: InputDecoration(
                    hintText: "Content",
                    hintMaxLines: 1,
                    hintStyle: MyStyleText.grey14Regular, //,
                    border: InputBorder.none),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
