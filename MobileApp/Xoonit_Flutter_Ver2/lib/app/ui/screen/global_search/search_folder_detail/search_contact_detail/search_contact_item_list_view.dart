import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';

class SearchContactItemListView extends StatelessWidget {
  const SearchContactItemListView(
      {Key key,
      this.detailKey1,
      this.detailKey2,
      this.detailKey3,
      this.detailValue3,
      this.detailValue2,
      this.detailValue1,
      this.onItemClicked})
      : super(key: key);
  final String detailKey1;
  final String detailKey2;
  final String detailKey3;
  final String detailValue3;
  final String detailValue2;
  final String detailValue1;
  final Function onItemClicked;
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 12),
      child: GestureDetector(
        onTap: () {
          onItemClicked();
        },
        child: Card(
          elevation: 6,
          shadowColor: Colors.grey.withOpacity(0.3),
          color: MyColors.whiteColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10.0),
          ),
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: <Widget>[
                
                Expanded(
                  child: Container(
                    margin: EdgeInsets.only(left: 16),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 1),
                          child: Text(
                            detailKey1,
                            overflow: TextOverflow.ellipsis,
                            style: MyStyleText.black12Regular,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Text(
                            detailValue1,
                            overflow: TextOverflow.ellipsis,
                            style: MyStyleText.black12Bold,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 1),
                          child: Text(
                            detailKey2,
                            style: MyStyleText.black12Regular,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Text(
                            detailKey2,
                            overflow: TextOverflow.ellipsis,
                            style: MyStyleText.black12Bold,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 1),
                          child: Text(
                            detailKey3,
                            overflow: TextOverflow.ellipsis,
                            style: MyStyleText.black12Regular,
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Text(
                            detailValue3,
                            overflow: TextOverflow.ellipsis,
                            style: MyStyleText.black12Bold,
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
}
