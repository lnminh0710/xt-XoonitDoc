import 'package:xoonit/app/model/capture_response.dart';

class DocumentCaptureGroup {
   String idDocumentContainer;
   String numberOfImages;
   String documentType;
   List<CaptureResponse> listDocumentCapture;
   bool isSelected = false;

  DocumentCaptureGroup(
      {this.idDocumentContainer,
      this.numberOfImages,
      this.documentType,
      this.listDocumentCapture});
}
