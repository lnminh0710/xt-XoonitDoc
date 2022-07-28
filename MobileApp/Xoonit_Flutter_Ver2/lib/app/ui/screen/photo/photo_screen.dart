import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/local/document/document_table.dart';
import 'package:xoonit/app/ui/component/common_component.dart';
import 'package:xoonit/app/ui/component/document_thumbnail.dart';
import 'package:xoonit/app/ui/screen/photo/component/tools_bar.dart';
import 'package:xoonit/app/ui/screen/photo/photo_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

class PhotoScreen extends StatefulWidget {
  PhotoScreen({Key key}) : super(key: key);

  @override
  _PhotoScreenState createState() => _PhotoScreenState();
}

class _PhotoScreenState extends State<PhotoScreen> {
  @override
  Widget build(BuildContext context) {
    PhotoBloc photoBloc = BlocProvider.of(context);
    return Stack(
      children: <Widget>[
        Container(
          color: MyColors.whiteBackground,
          child: StreamBuilder<List<TDocument>>(
              stream: photoBloc.documentList,
              builder: (context, snapshot) {
                if (snapshot.hasData) {
                  return StreamBuilder<bool>(
                      stream: photoBloc.selectedMode,
                      initialData: false,
                      builder: (context, isSelectedModel) {
                        return Column(
                          children: <Widget>[
                            isSelectedModel.hasData && isSelectedModel.data
                                ? Container(
                                    alignment: Alignment.centerRight,
                                    child: PhotoToolsBar(
                                      photoBloc: photoBloc,
                                    ))
                                : Container(
                                    margin: EdgeInsets.symmetric(
                                        horizontal: 16, vertical: 16),
                                    alignment: Alignment.centerLeft,
                                    child: Text(
                                      'Total file: ' +
                                          snapshot.data.length.toString(),
                                      style: MyStyleText.grey16Regular,
                                    ),
                                  ),
                            Expanded(
                              child: SingleChildScrollView(
                                  child: Column(
                                children: <Widget>[
                                  Wrap(
                                      crossAxisAlignment:
                                          WrapCrossAlignment.center,
                                      spacing: 8,
                                      children: List<Widget>.generate(
                                          snapshot?.data?.length, (int index) {
                                        TDocument document =
                                            snapshot?.data[index];
                                        return DocumentThumbnail(
                                          isSelected: document.isSelected,
                                          imgPath: document?.imagePath,
                                          onItemClick: () {
                                            isSelectedModel.data
                                                ? photoBloc
                                                    .changeDocumentStatus(index)
                                                : photoBloc.reviewImage(
                                                    index, context);
                                          },
                                          isLocalFile: true,
                                          documentType: document?.name,
                                          onItemLongClick: () {
                                            photoBloc.setSelectedMode(true);
                                          },
                                          onDeleteButtonPressed: () {
                                            photoBloc.deleteImageInLocal(
                                                index, context);
                                          },
                                          isSelectedMode: isSelectedModel.data,
                                          onItemSelectedChange: (value) {
                                            photoBloc.setDocumentStatus(
                                                index, value);
                                          },
                                        );
                                      })),
                                ],
                              )),
                            ),
                            isSelectedModel.hasData && isSelectedModel.data
                                ? CommonButton(
                                    bgColor: MyColors.blueLight,
                                    title: 'UPLOAD',
                                    titleStyle: MyStyleText.white17Bold,
                                    onTap: () {
                                      photoBloc
                                          .onUploadPhotoButtonPressed(context);
                                    },
                                    borderColor: MyColors.yellowColor2,
                                  )
                                : Container()
                          ],
                        );
                      });
                } else {
                  return Container();
                }
              }),
        ),
        StreamBuilder<AppState>(
            stream: photoBloc.screenState,
            initialData: AppState.Idle,
            builder: (context, snapshot) {
              if (snapshot.hasData && snapshot.data == AppState.Loading) {
                return Container(
                  color: Colors.black54,
                  width: Dimension.getWidth(1),
                  height: Dimension.getHeight(1),
                  child: Center(
                    child: CircularProgressIndicator(),
                  ),
                );
              } else {
                return Container();
              }
            })
      ],
    );
  }
}
