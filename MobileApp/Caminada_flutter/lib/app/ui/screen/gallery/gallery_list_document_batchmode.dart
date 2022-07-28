import 'package:caminada/app/constants/styles.dart';
import 'package:caminada/app/model/local/container/container_table.dart';
import 'package:caminada/app/ui/component/document_thumbnail.dart';
import 'package:caminada/app/utils/caminada_application.dart';
import 'package:flutter/cupertino.dart';

import '../../../difinition.dart';
import 'gallery_bloc.dart';

class BatchDocument extends StatelessWidget {
  final BuildContext context;
  final GalleryBloc galleryBloc;

  BatchDocument({
    Key key,
    @required this.context,
    @required this.galleryBloc,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<TContainer>>(
        stream: galleryBloc.documentBatchList,
        builder: (context, listScanDocument) {
          if (listScanDocument.hasData && listScanDocument.data.length > 0) {
            return StreamBuilder<bool>(
                stream: galleryBloc.selectionMode,
                builder: (context, isSelectionMode) {
                  if (isSelectionMode.hasData) {
                    return Expanded(
                      child: SingleChildScrollView(
                        padding: EdgeInsets.only(top: 20, bottom: 70),
                        child: Wrap(
                          spacing: 4.0,
                          runSpacing: 4.0,
                          children: List<Widget>.generate(
                            listScanDocument.data.length,
                            (index) => CustomItemGridCapture(
                              imgPath: listScanDocument
                                  .data[index].documents[0].imagePath,
                              isSelected:
                                  listScanDocument.data[index].isSelected,
                              isShowSelectedMode: isSelectionMode.data,
                              modeViewDocument: ModeViewDocument.BatchMode,
                              numberOfPages:
                                  listScanDocument.data[index].documents.length,
                              documentTypeColor: CaminadaApplication.instance
                                  .getDocumentTreeById(
                                      listScanDocument.data[index].docTreeId)
                                  .data
                                  .treeColor,
                              isUploadFailed:
                                  listScanDocument.data[index].isUploadFailed,
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
                  } else {
                    return Container();
                  }
                });
          } else {
            return Expanded(
              child: Center(
                // child: Text(
                //   "No Results",
                //   style: MyStyleText.grey12Regular,
                // ),
                child: Container(),
              ),
            );
          }
        });
  }
}
