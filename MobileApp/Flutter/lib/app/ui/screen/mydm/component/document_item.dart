import 'package:flutter/cupertino.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/remote/search_document_response.dart';

class DocumentItem extends StatelessWidget {
  final SearchDocumentResult searchDocumentResult;
  final Function reviewDocument;
  const DocumentItem(
      {Key key,
      @required this.searchDocumentResult,
      @required this.reviewDocument})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    List<String> nameSpit = searchDocumentResult.mediaName.split('.');
    DocumentType documentType =
        DocumentType.DEFAULT.createByName(nameSpit.last);
    return GestureDetector(
      onTap: () {
        reviewDocument();
      },
      child: Container(
        width: 98,
        height: 120,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            createImageByDocumentType(documentType),
            Flexible(
                child: Container(
              margin: EdgeInsets.only(top: 8),
              child: Text(
                searchDocumentResult?.mediaName,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: MyStyleText.white12Regular,
              ),
            ))
          ],
        ),
      ),
    );
  }

  Widget createImageByDocumentType(DocumentType documentType) {
    switch (documentType) {
      case DocumentType.TIFF:
        return Image(
          height: 72,
          width: 60,
          image: AssetImage(Resources.iconTiff),
        );
        break;
      case DocumentType.PDF:
      case DocumentType.DEFAULT:
        return Image(
          height: 72,
          width: 60,
          image: AssetImage(Resources.iconPdf),
        );
        break;
      case DocumentType.PNG:
        return Image(
          height: 72,
          width: 60,
          image: AssetImage(Resources.iconPdf),
        );
        break;
    }
    return Image(
      height: 72,
      width: 60,
      image: AssetImage(Resources.iconPdf),
    );
  }
}

enum DocumentType { TIFF, PDF, PNG, DEFAULT }

extension DocumentTypeExtension on DocumentType {
  get name {
    switch (this) {
      case DocumentType.TIFF:
        return 'tiff';
        break;
      case DocumentType.PDF:
      case DocumentType.DEFAULT:
        return 'pdf';
        break;
      case DocumentType.PNG:
        return 'png';
        break;
    }
  }

  DocumentType createByName(String name) {
    switch (name.toLowerCase()) {
      case 'tiff':
        return DocumentType.TIFF;
        break;
      case 'pdf':
        return DocumentType.PDF;
        break;
      case 'png':
        return DocumentType.PNG;
        break;
    }
    return DocumentType.PDF;
  }
}
