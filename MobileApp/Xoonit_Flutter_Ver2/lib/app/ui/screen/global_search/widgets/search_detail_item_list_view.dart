import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/component/high_light_text.dart';

class SearchDetailItemListView extends StatelessWidget {
  const SearchDetailItemListView(
      {Key key,
      this.thumbnailURL,
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
  final String thumbnailURL;
  final Function onItemClicked;

  Widget _textKeyStyle(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 1),
      child: Text(
        text,
        overflow: TextOverflow.ellipsis,
        style: MyStyleText.black12Regular,
      ),
    );
  }

  Widget _textValueStyle(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(
        text,
        overflow: TextOverflow.ellipsis,
        style: MyStyleText.black12Bold,
      ),
    );
  }

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
                Container(
                  width: MediaQuery.of(context).size.width / 4,
                  height: MediaQuery.of(context).size.width / 4,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8.0),
                    child: Image(
                      image: CachedNetworkImageProvider(
                        thumbnailURL + '.1.png',
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
                        _textKeyStyle(detailKey1),
                        _textValueStyle(detailValue1),
                        _textKeyStyle(detailKey2),
                        _textValueStyle(detailValue2),
                        _textKeyStyle(detailKey3),
                        _textValueStyle(detailValue3),
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
