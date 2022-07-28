import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/local/document/document_table.dart';
import 'package:xoonit/app/ui/screen/photo/photo_bloc.dart';

class PhotoToolsBar extends StatelessWidget {
  final PhotoBloc photoBloc;
  PhotoToolsBar({
    Key key,
    @required this.photoBloc,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<TDocument>>(
        stream: photoBloc.documentList,
        builder: (context, documentListSnapshot) {
          return Container(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                IconButton(
                    icon: Icon(Icons.close),
                    onPressed: () {
                      photoBloc.setSelectedMode(false);
                    }),
                Text(
                  "Select Document",
                  style: MyStyleText.black16Bold,
                ),
                documentListSnapshot.hasData
                    ? documentListSnapshot.data != null &&
                            documentListSnapshot.data.length ==
                                photoBloc.getSelectedDoc().length
                        ? IconButton(
                            icon: Icon(Icons.check_box,
                                color: MyColors.blueColor),
                            onPressed: () {
                              photoBloc.selectAllDocument(false);
                            },
                          )
                        : IconButton(
                            icon: Icon(
                              Icons.check_box_outline_blank,
                              color: MyColors.blackColor,
                            ),
                            onPressed: () {
                              photoBloc.selectAllDocument(true);
                            },
                          )
                    : Container(),
              ],
            ),
          );
        });
  }
}
