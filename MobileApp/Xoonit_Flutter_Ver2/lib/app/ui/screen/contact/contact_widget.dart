import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/AttachmentContact.dart';
import 'package:xoonit/app/model/remote/global_search/column_search_settings.dart';
import 'package:xoonit/app/model/remote/global_search/search_contact_detail_response.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/core/ultils.dart';

import '../../../difinition.dart';

class ItemListSearchContact extends StatelessWidget {
  final double width;
  final double height;
  final ContactSearchResult contactDetails;
  final Function onItemClick;
  final String searchKey;

  ItemListSearchContact(
      {Key key,
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
        color: MyColors.whiteColor,
        child: Container(
          padding: EdgeInsets.only(bottom: 8, top: 8, left: 12, right: 12),
          width: width,
          height: height,
          child: Column(
            children: <Widget>[
              Expanded(
                child: Row(
                  children: <Widget>[
                    Container(
                      width: 80,
                      height: height,
                      margin: EdgeInsets.only(right: 10),
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.all(Radius.circular(10)),
                          image: DecorationImage(
                              image: NetworkImage(appBaseUrl +
                                  "/FileManager/GetFile?mode=6&w=300&name=" +
                                  contactDetails.localPath +
                                  "\\" +
                                  contactDetails.localFileName +
                                  ".1.png"),
                              fit: BoxFit.cover)),
                    ),
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Row(
                            children: <Widget>[
                              Container(
                                width: Dimension.getWidth(0.3),
                                child: Text(
                                  "Name",
                                  style: MyStyleText.dark14Medium,
                                ),
                              ),
                              Expanded(
                                child: Container(
                                  child: contactDetails.firstName == null
                                      ? Text("")
                                      : Text(
                                          contactDetails.firstName,
                                          style: contactDetails.firstName
                                                  .toUpperCase()
                                                  .contains(
                                                      searchKey?.toUpperCase())
                                              ? MyStyleText.dark14Regular
                                              : MyStyleText.dark14Regular,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: <Widget>[
                              Container(
                                width: Dimension.getWidth(0.3),
                                child: Text(
                                  "Type",
                                  style: MyStyleText.dark14Medium,
                                ),
                              ),
                              Container(
                                child: contactDetails.documentType == null
                                    ? Text("")
                                    : Text(
                                        contactDetails.documentType,
                                        style: contactDetails.documentType
                                                .toUpperCase()
                                                .contains(
                                                    searchKey?.toUpperCase())
                                            ? MyStyleText.dark14Regular
                                            : MyStyleText.dark14Regular,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                              ),
                            ],
                          ),
                          Row(
                            children: <Widget>[
                              Container(
                                width: Dimension.getWidth(0.3),
                                child: Text(
                                  "Modified Date",
                                  style: MyStyleText.dark14Medium,
                                  textAlign: TextAlign.left,
                                ),
                              ),
                              Container(
                                child: contactDetails.createDate == null
                                    ? Text("")
                                    : Text(
                                        contactDetails.createDate,
                                        style: contactDetails.createDate
                                                .toUpperCase()
                                                .contains(
                                                    searchKey?.toUpperCase())
                                            ? MyStyleText.dark14Regular
                                            : MyStyleText.dark14Regular,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                              ),
                            ],
                          ),
                        ],
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

class CustomItemAttachmentContacts extends StatefulWidget {
  const CustomItemAttachmentContacts(
      {Key key,
      this.onItemClicked,
      this.attachmentContactItemResult,
      this.columnSearchSettings})
      : super(key: key);
  final Function onItemClicked;
  final AttachmentContactItemResult attachmentContactItemResult;
  final List<ColumnSearchSettings> columnSearchSettings;

  @override
  _CustomItemAttachmentContactsState createState() =>
      _CustomItemAttachmentContactsState();
}

class _CustomItemAttachmentContactsState
    extends State<CustomItemAttachmentContacts> {
  List<String> _allAttachmentDetailKey;
  List<String> _allAttachmentDetailValue;

  @override
  void initState() {
    super.initState();
    _allAttachmentDetailKey = [];
    _allAttachmentDetailValue = [];
    setupColumnSetting();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: GestureDetector(
        onTap: () {
          widget.onItemClicked();
        },
        child: Card(
          elevation: 6,
          shadowColor: Colors.grey.withOpacity(0.3),
          color: MyColors.whiteColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.0),
          ),
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: <Widget>[
                Container(
                  width: MediaQuery.of(context).size.width / 4,
                  height: MediaQuery.of(context).size.width / 4,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8.0),
                    child: Image(
                      image: CachedNetworkImageProvider(
                        GeneralMethod.getThumbnailURL(
                                widget.attachmentContactItemResult.scannedPath,
                                widget.attachmentContactItemResult
                                    .scannedFilename) +
                            '.1.png',
                      ),
                      fit: BoxFit.fitWidth,
                      loadingBuilder: (BuildContext context, Widget child,
                          ImageChunkEvent loadingProgress) {
                        if (loadingProgress == null) return child;
                        return Center(
                          child: CircularProgressIndicator(
                            value: loadingProgress.expectedTotalBytes != null
                                ? loadingProgress.cumulativeBytesLoaded /
                                    loadingProgress.expectedTotalBytes
                                : null,
                          ),
                        );
                      },
                    ),
                  ),
                ),
                Expanded(
                  child: Container(
                    margin: EdgeInsets.only(left: 16),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Text(
                            _allAttachmentDetailValue[0],
                            overflow: TextOverflow.ellipsis,
                            style: MyStyleText.black14Medium,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Text(
                            _allAttachmentDetailValue[1],
                            overflow: TextOverflow.ellipsis,
                            style: MyStyleText.black14Medium,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Text(
                            _allAttachmentDetailValue[2],
                            overflow: TextOverflow.ellipsis,
                            style: MyStyleText.black14Medium,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Text(
                            _allAttachmentDetailValue[3],
                            overflow: TextOverflow.ellipsis,
                            style: MyStyleText.black14Medium,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Text(
                            _allAttachmentDetailValue[4],
                            overflow: TextOverflow.ellipsis,
                            style: MyStyleText.black14Medium,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void setupColumnSetting() {
    _allAttachmentDetailKey.clear();
    _allAttachmentDetailValue.clear();
    List<ColumnsName> settings =
        widget.columnSearchSettings[1]?.columnsName ?? null;
    if (settings != null) {
      settings.forEach((element) {
        if (element.setting != null &&
            !GeneralMethod.checkHidenColumn(element.setting)) {
          _allAttachmentDetailKey.add(element?.columnName ?? '');
          String columnKey = element?.columnHeader ?? '';
          columnKey = columnKey.replaceRange(0, 1, columnKey[0].toLowerCase());
          _allAttachmentDetailValue.add(
              widget.attachmentContactItemResult.toJson()[columnKey] != null
                  ? widget.attachmentContactItemResult
                      .toJson()[columnKey]
                      .toString()
                  : '');
        }
      });
    }
    while (_allAttachmentDetailKey.length < 5) {
      _allAttachmentDetailKey.add('');
    }
    while (_allAttachmentDetailValue.length < 5) {
      _allAttachmentDetailValue.add('');
    }
  }
}
