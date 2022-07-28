import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/AttachmentContact.dart';
import 'package:xoonit/app/model/contact_response.dart';
import 'package:xoonit/core/ultils.dart';

class ItemListSearchContact extends StatelessWidget {
  final double width;
  final double height;
  final Contact contactDetails;
  final Function onItemClick;
  final String searchKey;

  ItemListSearchContact({Key key,
    this.width,
    this.height,
    this.contactDetails,
    this.onItemClick,
    this.searchKey})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        onItemClick();
      },
      child: Card(
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(10))),
        color: MyColors.bluedarkColor,
        child: Container(
          padding: EdgeInsets.only(bottom: 8, top: 8),
          width: width,
          height: height,
          child: Column(
            children: <Widget>[
              Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    Container(
                      padding: EdgeInsets.only(left: 16),
                      child: Text(
                        "First Name",
                        style: MyStyleText.textLabelGrey14Medium,
                      ),
                    ),
                    Container(
                      width: Dimension.getWidth(0.6),
                      child: contactDetails.firstName == null
                          ? Text("")
                          : Text(
                              contactDetails.firstName,
                        style: contactDetails.firstName
                            .toUpperCase()
                            .contains(searchKey?.toUpperCase())
                            ? MyStyleText.orange14Regular
                            : MyStyleText.white14Regular,
                              overflow: TextOverflow.ellipsis,
                            ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    Container(
                      padding: EdgeInsets.only(left: 16),
                      child: Text(
                        "Last Name",
                        style: MyStyleText.textLabelGrey14Medium,
                      ),
                    ),
                    Container(
                      width: Dimension.getWidth(0.6),
                      child: contactDetails.lastName == null
                          ? Text("")
                          : Text(
                              contactDetails.lastName,
                        style: contactDetails.lastName
                            .toUpperCase()
                            .contains(searchKey?.toUpperCase())
                            ? MyStyleText.orange14Regular
                            : MyStyleText.white14Regular,
                              overflow: TextOverflow.ellipsis,
                            ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    Container(
                      padding: EdgeInsets.only(left: 16),
                      child: Text(
                        "Date Modifiled",
                        style: MyStyleText.textLabelGrey14Medium,
                      ),
                    ),
                    Container(
                      width: Dimension.getWidth(0.6),
                      child: contactDetails.createDate == null
                          ? Text("")
                          : Text(
                              contactDetails.createDate,
                        style: contactDetails.createDate
                            .toUpperCase()
                            .contains(searchKey?.toUpperCase())
                            ? MyStyleText.orange14Regular
                            : MyStyleText.white14Regular,
                              overflow: TextOverflow.ellipsis,
                            ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: <Widget>[
                    Container(
                      padding: EdgeInsets.only(left: 16),
                      child: Text(
                        "Address",
                        style: MyStyleText.textLabelGrey14Medium,
                      ),
                    ),
                    Container(
                      width: Dimension.getWidth(0.6),
                      child: contactDetails.street == null
                          ? Text("")
                          : Text(
                              contactDetails.street,
                        style: contactDetails.street
                            .toUpperCase()
                            .contains(searchKey?.toUpperCase())
                            ? MyStyleText.orange14Regular
                            : MyStyleText.white14Regular,
                              overflow: TextOverflow.ellipsis,
                            ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class CustomItemAttachmentContacts extends StatelessWidget {
  final double width;
  final double height;
  final AttachmentContactItem itemAttachment;
  final Function onItemClick;

  CustomItemAttachmentContacts({
    Key key,
    this.itemAttachment,
    this.onItemClick,
    this.width,
    this.height,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        onItemClick();
      },
      child: Card(
        color: MyColors.bluedarkColor,
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(10))),
        child: Container(
          padding: EdgeInsets.only(top: 8, bottom: 8),
          width: width,
          height: height,
          child: Column(
            children: <Widget>[
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(left: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: <Widget>[
                      Container(
                        child: Text(
                          "Name",
                          style: MyStyleText.textLabelGrey14Medium,
                        ),
                      ),
                      Container(
                          width: Dimension.getWidth(0.6),
                          child: itemAttachment.localFileName == null
                              ? Text("")
                              : Text(
                            itemAttachment.localFileName,
                            style: MyStyleText.textLabelGrey14Medium,
                          )),
                    ],
                  ),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(left: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: <Widget>[
                      Container(
                        child: Text(
                          "Type",
                          style: MyStyleText.textLabelGrey14Medium,
                        ),
                      ),
                      Container(
                          width: Dimension.getWidth(0.6),
                          child: itemAttachment.cloudMediaPath == null
                              ? Text("")
                              : Text(
                            itemAttachment.cloudMediaPath,
                            style: MyStyleText.textLabelGrey14Medium,
                          )),
                    ],
                  ),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(left: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: <Widget>[
                      Container(
                        child: Text(
                          "Modified Date",
                          style: MyStyleText.textLabelGrey14Medium,
                        ),
                      ),
                      Container(
                          width: Dimension.getWidth(0.6),
                          child: itemAttachment.createDate == null
                              ? Text("")
                              : Text(
                            itemAttachment.createDate,
                            style: MyStyleText.textLabelGrey14Medium,
                          )),
                    ],
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
