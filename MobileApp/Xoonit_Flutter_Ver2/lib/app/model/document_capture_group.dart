import 'package:xoonit/app/model/capture_response.dart';

class DocumentCaptureGroup {
  String idDocumentContainer;
  String numberOfImages;
  String documentType;
  List<Capture> listDocument;
  bool isSelected;

  DocumentCaptureGroup(
      {this.idDocumentContainer,
      this.numberOfImages,
      this.documentType,
      this.listDocument,
      this.isSelected = false});
}
