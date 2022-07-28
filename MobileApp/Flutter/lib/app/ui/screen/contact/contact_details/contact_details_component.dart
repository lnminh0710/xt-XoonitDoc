import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/contact_response.dart';
import 'package:xoonit/core/ultils.dart';

class ContactDetailsCommon extends StatelessWidget {
  final Contact contact;
  final TextEditingController textCompanyController;
  final TextEditingController textFirstNameController;
  final TextEditingController textLastNameController;
  final TextEditingController textAddressController;
  final TextEditingController textPoBoxController;
  final TextEditingController textPlzController;
  final TextEditingController textOrtController;

  final TextEditingController textPhoneNumberController;
  final TextEditingController textEmailController;

  final TextEditingController textInternetController;
  final Function onTap;
  final Function(String) onComplete;

  ContactDetailsCommon({
    Key key,
    this.contact,
    this.textCompanyController,
    this.textFirstNameController,
    this.textLastNameController,
    this.textAddressController,
    this.textPoBoxController,
    this.textPlzController,
    this.textOrtController,
    this.textPhoneNumberController,
    this.textEmailController,
    this.textInternetController,
    this.onTap,
    this.onComplete,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: <Widget>[
          TextFormField(
            style: MyStyleText.white16Medium,
            decoration: InputDecoration(
              labelText: "Company",
              alignLabelWithHint: true,
              hintStyle: MyStyleText.white16Medium,
              labelStyle: MyStyleText.white16Medium,
              enabledBorder: UnderlineInputBorder(
                borderSide: BorderSide(
                  color: MyColors.whiteColor,
                  style: BorderStyle.solid,
                ),
              ),
            ),
            controller: textCompanyController,
            onTap: () {
              onTap();
            },
            onFieldSubmitted: (value) {
              onComplete(value);
            },
          ),
          TextFormField(
            style: MyStyleText.white16Medium,
            decoration: InputDecoration(
              labelText: "First Name",
              hintStyle: MyStyleText.white16Medium,
              labelStyle: MyStyleText.white16Medium,
              enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                color: MyColors.whiteColor,
                style: BorderStyle.solid,
              )),
            ),
            controller: textFirstNameController,
            onTap: () {
              onTap();
            },
            onFieldSubmitted: (value) {
              onComplete(value);
            },
          ),
          TextFormField(
            style: MyStyleText.white16Medium,
            controller: textLastNameController,
            decoration: InputDecoration(
              labelText: "Last Name",
              hintStyle: MyStyleText.white16Medium,
              labelStyle: MyStyleText.white16Medium,
              alignLabelWithHint: true,
              enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                color: MyColors.whiteColor,
                style: BorderStyle.solid,
              )),
            ),
            onTap: () {
              onTap();
            },
            onFieldSubmitted: (value) {
              onComplete(value);
            },
          ),
          TextFormField(
            style: MyStyleText.white16Medium,
            controller: textAddressController,
            decoration: InputDecoration(
              labelText: "Street",
              alignLabelWithHint: true,
              hintStyle: MyStyleText.white16Medium,
              labelStyle: MyStyleText.white16Medium,
              enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                color: MyColors.whiteColor,
                style: BorderStyle.solid,
              )),
            ),
            onTap: () {
              onTap();
            },
            onFieldSubmitted: (value) {
              onComplete(value);
            },
          ),
          TextFormField(
            style: MyStyleText.white16Medium,
            controller: textPoBoxController,
            decoration: InputDecoration(
              labelText: "Pobox Label",
              alignLabelWithHint: true,
              hintStyle: MyStyleText.white16Medium,
              labelStyle: MyStyleText.white16Medium,
              enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                color: MyColors.whiteColor,
                style: BorderStyle.solid,
              )),
            ),
            onTap: () {
              onTap();
            },
            onFieldSubmitted: (value) {
              onComplete(value);
            },
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              Container(
                width: Dimension.getWidth(0.4),
                child: TextFormField(
                  style: MyStyleText.white16Medium,
                  controller: textPlzController,
                  decoration: InputDecoration(
                    labelText: "PLZ",
                    alignLabelWithHint: true,
                    hintStyle: MyStyleText.white16Medium,
                    labelStyle: MyStyleText.white16Medium,
                    enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(
                      color: MyColors.whiteColor,
                      style: BorderStyle.solid,
                    )),
                  ),
                  onTap: () {
                    onTap();
                  },
                  onFieldSubmitted: (value) {
                    onComplete(value);
                  },
                ),
              ),
              Container(
                width: Dimension.getWidth(0.5),
                child: TextFormField(
                  style: MyStyleText.white16Medium,
                  controller: textOrtController,
                  decoration: InputDecoration(
                    labelText: "Ort",
                    alignLabelWithHint: true,
                    hintStyle: MyStyleText.white16Medium,
                    labelStyle: MyStyleText.white16Medium,
                    enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(
                      color: MyColors.whiteColor,
                      style: BorderStyle.solid,
                    )),
                  ),
                  onTap: () {
                    onTap();
                  },
                  onFieldSubmitted: (value) {
                    onComplete(value);
                  },
                ),
              ),
            ],
          ),
          TextFormField(
            style: MyStyleText.white16Medium,
            controller: textPhoneNumberController,
            decoration: InputDecoration(
              labelText: "Tel Office",
              alignLabelWithHint: true,
              hintStyle: MyStyleText.white16Medium,
              labelStyle: MyStyleText.white16Medium,
              enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                color: MyColors.whiteColor,
                style: BorderStyle.solid,
              )),
            ),
            onTap: () {
              onTap();
            },
            onFieldSubmitted: (value) {
              onComplete(value);
            },
          ),
          TextFormField(
            style: MyStyleText.white16Medium,
            controller: textEmailController,
            decoration: InputDecoration(
              labelText: "Email",
              alignLabelWithHint: true,
              hintStyle: MyStyleText.white16Medium,
              labelStyle: MyStyleText.white16Medium,
              enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                color: MyColors.whiteColor,
                style: BorderStyle.solid,
              )),
            ),
            onTap: () {
              onTap();
            },
            onFieldSubmitted: (value) {
              onComplete(value);
            },
          ),
          TextFormField(
            style: MyStyleText.white16Medium,
            controller: textInternetController,
            decoration: InputDecoration(
              labelText: "Internet",
              alignLabelWithHint: true,
              hintStyle: MyStyleText.white16Medium,
              labelStyle: MyStyleText.white16Medium,
              enabledBorder: UnderlineInputBorder(
                borderSide: BorderSide(
                  color: MyColors.whiteColor,
                  style: BorderStyle.solid,
                ),
              ),
            ),
            onTap: () {
              onTap();
            },
            onFieldSubmitted: (value) {
              onComplete(value);
            },
          ),
        ],
      ),
    );
  }
}
