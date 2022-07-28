import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/screen/capture/review_document_screen/review_document_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

class PopupAssignDocument extends StatelessWidget {
  PopupAssignDocument({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    ReviewDocumentBloc reviewBloc = BlocProvider.of(context);
    return StreamBuilder<bool>(
        stream: reviewBloc.isShowPopUpAssignDocument,
        initialData: true,
        builder: (context, isShowPopUpAssignDocument) {
          return isShowPopUpAssignDocument.data &&
                  isShowPopUpAssignDocument.hasData
              ? GestureDetector(
                  onTap: () {
                    reviewBloc.selectedFolder(context);
                  },
                  child: Container(
                      width: Dimension.getWidth(1),
                      child: Container(
                        decoration: BoxDecoration(
                          color: MyColors.yellowColor2,
                        ),
                        margin: EdgeInsets.symmetric(horizontal: 16),
                        padding: EdgeInsets.symmetric(vertical: 18),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: <Widget>[
                            Text(
                              "Tap to assign the document \ninto appropriate folder",
                              style: MyStyleText.white14Medium,
                              maxLines: 2,
                              softWrap: true,
                              textAlign: TextAlign.center,
                              overflow: TextOverflow.clip,
                            ),
                          ],
                        ),
                      )),
                )
              : Container();
        });
  }
}
