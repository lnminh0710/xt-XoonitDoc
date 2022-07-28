import 'package:caminada/app/difinition.dart';
import 'package:caminada/app/model/local/document/document_table.dart';
import 'package:caminada/app/ui/component/document_thumbnail.dart';
import 'package:caminada/app/utils/caminada_application.dart';
import 'package:caminada/app/utils/general_method.dart';
import 'package:flutter/cupertino.dart';
import 'package:intl/intl.dart';

import 'gallery_bloc.dart';

class SingleDocument extends StatelessWidget {
  final BuildContext context;
  final GalleryBloc galleryBloc;

  SingleDocument({
    Key key,
    @required this.context,
    @required this.galleryBloc,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<TDocument>>(
        stream: galleryBloc.documentSingleList,
        builder: (context, listScanDocument) {
          if (listScanDocument != null &&
              listScanDocument.hasData &&
              listScanDocument.data.length > 0) {
            return StreamBuilder<bool>(
                stream: galleryBloc.selectionMode,
                initialData: false,
                builder: (context, isSelectionMode) {
                  return Expanded(
                    child: SingleChildScrollView(
                      padding: EdgeInsets.only(top: 20, bottom: 70),
                      child: Wrap(
                        spacing: 8.0,
                        runSpacing: 8.0,
                        children: List<Widget>.generate(
                          listScanDocument.data.length,
                          (index) => CustomItemGridCapture(
                            imgPath: listScanDocument.data[index].imagePath,
                            isSelected: listScanDocument.data[index].isSelected,
                            isShowSelectedMode: isSelectionMode.data,
                            modeViewDocument: ModeViewDocument.SingleMode,
                            documentTypeColor: CaminadaApplication.instance
                                .getDocumentTreeById(
                                    listScanDocument.data[index].docTreeId)
                                .data
                                .treeColor,
                            isUploadFailed:
                                listScanDocument.data[index].isUploadFailed,
                            createDate: onFormatDate(
                                GeneralMethod.onConvertStringtoDateTimr(
                                    listScanDocument.data[index].createDate)),
                            documentTreeName:
                                listScanDocument.data[index].docTreeName,
                            onItemClick: () {
                              isSelectionMode.data
                                  ? galleryBloc.onChangeStatusSelection(index)
                                  : galleryBloc.onReviewDocument(
                                      context, index);
                            },
                            onItemLongClick: () {
                              galleryBloc.changeSelectionMode(true);
                            },
                          ),
                        ),
                      ),
                    ),
                  );
                });
          } else {
            return Expanded(
              child: Center(
                child: Container(),
              ),
            );
          }
        });
  }

  String onFormatDate(DateTime dateTime) {
    String createTime = new DateFormat('dd.MM.yyyy').format(dateTime);
    return createTime;
  }
}
