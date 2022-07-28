import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/core/ultils.dart';

class ShowPopUpComposeMail extends StatefulWidget {
  ShowPopUpComposeMail({Key key}) : super(key: key);

  @override
  _ShowPopUpComposeMailState createState() => _ShowPopUpComposeMailState();
}

class _ShowPopUpComposeMailState extends State<ShowPopUpComposeMail> {
  TextEditingController mailAddressController = TextEditingController();
  TextEditingController subjectMailController = TextEditingController();
  TextEditingController contentMailController = TextEditingController();

  GlobalKey<FormState> key = new GlobalKey();
  bool validate = false;

  @override
  Widget build(BuildContext context) {
    sendToMail() {
      if (key.currentState.validate()) {
        var mail = ContentMail(
            mail: mailAddressController.text,
            content: contentMailController.text,
            subjects: subjectMailController.text);
        Navigator.of(context).pop(mail);
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
      if (!regex.hasMatch(value)) {
        return 'Enter valid email, please !';
      } else {
        return null;
      }
    }

    return Scaffold(
      body: Container(
        padding: EdgeInsets.all(10),
        width: Dimension.getWidth(1),
        color: MyColors.whiteBackground,
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
                      color: MyColors.greyText2,
                      iconSize: 20,
                      onPressed: () {
                        Navigator.of(context).pop();
                      }),
                  Text(
                    "Compose mail",
                    style: MyStyleText.blueDarkColor16Medium,
                  ),
                  IconButton(
                    icon: Icon(Icons.send),
                    color: Colors.lightBlue,
                    iconSize: 20,
                    onPressed: sendToMail,
                  )
                ],
              ),
              TextFormField(
                textAlign: TextAlign.start,
                cursorColor: MyColors.blueColor,
                textAlignVertical: TextAlignVertical.bottom,
                maxLines: 1,
                keyboardType: TextInputType.emailAddress,
                style: MyStyleText.black14Regular,
                autofocus: true,
                controller: mailAddressController,
                validator: validateEmail,
                decoration: InputDecoration(
                  hintText: "Recipients",
                  hintStyle: MyStyleText.grey14Regular, //,
                  enabledBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: MyColors.blueDark),
                  ),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: MyColors.blueDark),
                  ),
                  border: UnderlineInputBorder(),
                ),
              ),
              TextField(
                textAlign: TextAlign.start,
                cursorColor: MyColors.blueColor,
                textAlignVertical: TextAlignVertical.bottom,
                maxLines: 1,
                style: MyStyleText.black14Regular,
                autofocus: true,
                controller: subjectMailController,
                decoration: InputDecoration(
                  hintText: "Subject",
                  hintStyle: MyStyleText.grey14Regular,
                  enabledBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: MyColors.blueDark),
                  ),
                  focusedBorder: UnderlineInputBorder(
                    borderSide: BorderSide(color: MyColors.blueDark),
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
                style: MyStyleText.bluedarkColor16Regular,
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

class ContentMail {
  String mail;
  String subjects;
  String content;
  ContentMail({this.content, this.mail, this.subjects});
}
