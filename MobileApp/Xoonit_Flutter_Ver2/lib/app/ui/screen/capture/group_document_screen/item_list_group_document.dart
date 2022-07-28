import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/capture_response.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/core/ultils.dart';

class ItemListDocument extends StatefulWidget {
  ItemListDocument({
    Key key,
    @required this.captureItem,
    @required this.onItemSelectedChange,
  }) : super(key: key);

  final Capture captureItem;
  final Function(bool) onItemSelectedChange;

  @override
  _ItemListDocumentState createState() => _ItemListDocumentState();
}

class _ItemListDocumentState extends State<ItemListDocument> {
  bool isSelected;
  @override
  void initState() {
    super.initState();
    isSelected = false;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        setState(() {
          isSelected = !isSelected;
        });
        widget.onItemSelectedChange(isSelected);
      },
      child: Container(
        width: Dimension.getWidth(0.3),
        height: 140,
        foregroundDecoration: BoxDecoration(
          borderRadius: BorderRadius.all(Radius.circular(10)),
          color: !isSelected ? null : Colors.black26,
        ),
        child: Column(
          children: <Widget>[
            Container(
              height: 100,
              width: Dimension.getWidth(0.3),
              child: ClipRRect(
                borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(10),
                    topRight: Radius.circular(10)),
                child: CachedNetworkImage(
                  imageUrl: GeneralMethod.getImageURL(
                      widget.captureItem.scannedPath,
                      widget.captureItem.documentName,
                      200),
                  placeholderFadeInDuration: Duration(seconds: 1),
                  fit: BoxFit.fill,
                  placeholder: (context, url) {
                    return Center(
                      child: CircularProgressIndicator(),
                    );
                  },
                ),
              ),
            ),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.lightBlue,
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(10),
                    bottomRight: Radius.circular(10),
                  ),
                ),
                padding: EdgeInsets.only(left: 6),
                child: Stack(
                  children: <Widget>[
                    Container(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: <Widget>[
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: <Widget>[
                              Text(
                                '1.' + widget.captureItem.documentType,
                                style: MyStyleText.textDoctype_12White,
                              ),
                              Text(
                                'Pages: ' +
                                    widget.captureItem.numberOfImages
                                        .toString(),
                                style: MyStyleText.white12Regular,
                              ),
                            ],
                          ),
                        ],
                      ),
                    )
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
