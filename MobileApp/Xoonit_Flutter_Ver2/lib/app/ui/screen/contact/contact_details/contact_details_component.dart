import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/remote/global_search/search_contact_detail_response.dart';
import 'package:xoonit/core/ultils.dart';

class ContactDetailsCommon extends StatelessWidget {
  final ContactSearchResult contact;
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
            style: MyStyleText.black16Medium,
            decoration: InputDecoration(
              labelText: "Company",
              alignLabelWithHint: true,
              labelStyle: MyStyleText.grey16Regular,
              enabledBorder: UnderlineInputBorder(
                borderSide: BorderSide(
                  color: MyColors.blackColor,
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
            style: MyStyleText.black16Medium,
            decoration: InputDecoration(
              labelText: "First Name",
              labelStyle: MyStyleText.grey16Regular,
              enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                color: MyColors.blackColor,
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
            style: MyStyleText.black16Medium,
            controller: textLastNameController,
            decoration: InputDecoration(
              labelText: "Last Name",
              labelStyle: MyStyleText.grey16Regular,
              alignLabelWithHint: true,
              enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                color: MyColors.blackColor,
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
            style: MyStyleText.black16Medium,
            controller: textAddressController,
            decoration: InputDecoration(
              labelText: "Street",
              alignLabelWithHint: true,
              labelStyle: MyStyleText.grey16Regular,
              enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                color: MyColors.blackColor,
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
            style: MyStyleText.black16Medium,
            controller: textPoBoxController,
            decoration: InputDecoration(
              labelText: "Pobox Label",
              alignLabelWithHint: true,
              labelStyle: MyStyleText.grey16Regular,
              enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                color: MyColors.blackColor,
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
                  style: MyStyleText.black16Medium,
                  controller: textPlzController,
                  decoration: InputDecoration(
                    labelText: "PLZ",
                    alignLabelWithHint: true,
                    labelStyle: MyStyleText.grey16Regular,
                    enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(
                      color: MyColors.blackColor,
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
                  style: MyStyleText.black16Medium,
                  controller: textOrtController,
                  decoration: InputDecoration(
                    labelText: "Ort",
                    alignLabelWithHint: true,
                    labelStyle: MyStyleText.grey16Regular,
                    enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(
                      color: MyColors.blackColor,
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
            style: MyStyleText.black16Medium,
            controller: textPhoneNumberController,
            decoration: InputDecoration(
              labelText: "Tel Office",
              alignLabelWithHint: true,
              labelStyle: MyStyleText.grey16Regular,
              enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                color: MyColors.blackColor,
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
            style: MyStyleText.black16Medium,
            controller: textEmailController,
            decoration: InputDecoration(
              labelText: "Email",
              alignLabelWithHint: true,
              labelStyle: MyStyleText.grey16Regular,
              enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                color: MyColors.blackColor,
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
            style: MyStyleText.black16Medium,
            controller: textInternetController,
            decoration: InputDecoration(
              labelText: "Internet",
              alignLabelWithHint: true,
              labelStyle: MyStyleText.grey16Regular,
              enabledBorder: UnderlineInputBorder(
                borderSide: BorderSide(
                  color: MyColors.blackColor,
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
