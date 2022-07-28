import 'package:retrofit/dio.dart';
import 'package:retrofit/http.dart';
import 'package:xoonit/app/api/api_client.dart';
import 'package:xoonit/app/model/AttachmentContact.dart';
import 'package:xoonit/app/model/capture_response.dart';
import 'package:xoonit/app/model/contact_details_response.dart';
import 'package:xoonit/app/model/contact_response.dart';
import 'package:xoonit/app/model/document_attachment.dart';
import 'package:xoonit/app/model/history_response.dart';
import 'package:xoonit/app/model/language_response.dart';
import 'package:xoonit/app/model/login_response.dart';
import 'package:xoonit/app/model/remote/delete_document_response.dart';
import 'package:xoonit/app/model/remote/document_tree_response.dart';
import 'package:xoonit/app/model/remote/global_search/get_module_response.dart';
import 'package:xoonit/app/model/remote/global_search/get_summary_response.dart';
import 'package:xoonit/app/model/remote/save_contact_response.dart';
import 'package:xoonit/app/model/remote/search_document_response.dart';
import 'package:xoonit/app/model/signup_response.dart';
import 'package:xoonit/app/model/upload_image_response.dart';

class APIClientMock implements APIClient {
  @override
  Future<LoginResponse> login(@Body() Map<String, dynamic> loginRequest) {
    return null;
  }

  @override
  Future<HistoryResponse> getAllHistory() {
    return null;
  }

  @override
  Future<UploadImageResponse> uploadImage(
      @Body() Map<String, dynamic> uploadImageRequest) {
    return null;
  }

  @override
  Future<GetGlobalSearchModuleResponse> getGlobalSearchModule() {
    return null;
  }

  Future<GlobalSearchSummaryResponse> getGlobalSearchSummary(
      Map<String, dynamic> request) {
    return null;
  }

  Future<DocumentTreeResponse> getDocumentTree() {
    return null;
  }

  Future<SearchDocumentResponse> searchDocumentInFolder(
      @Path("documentID") int documentID, @Path("pageIndex") int pageIndex) {
    return null;
  }

  @override
  Future<List<CaptureResponse>> getAllCaptureThumbnails() {
    return null;
  }

  @override
  Future<SignupResponse> postSignup(
      @Body() Map<String, dynamic> signupRequest) {
    return null;
  }
   @override
  Future<MainLanguageRespone> getAllLanguage() {
    return null;
  }
  Future<ContactResponse> getAllContacts(String keywordSearch, int pageIndex,
      int pageSize) {
    throw UnimplementedError();
  }

  @override
  Future<AttachmentContact> getAttachmentListByContact(String idPerson) {
    throw UnimplementedError();
  }

  @override
  Future<ContactDetailsResponse> getContactDetailsById(int idPersonType,
      int idPerson) {
    throw UnimplementedError();
  }

  @override
  Future<SaveContactResponse> saveContactDetails(
      Map<String, dynamic> saveContactRequest) {
    throw UnimplementedError();
  }

  @override
  Future<List<DocumentAttachment>> getDocumentPagesById(
      String idDocumentContainerScans) {
    throw UnimplementedError();
  }

  @override
  Future<List<DeleteDocument>> deleteScanDocument(
      Map<String, dynamic> idDocumentContainerScans) {
    throw UnimplementedError();
  }

  @override
  Future<HttpResponse<UploadImageResponse>> uploadImageWithHttpResponse(
      Map<String, dynamic> uploadImageRequest) {
    throw UnimplementedError();
  }

  @override
  Future<bool> shareDocumentToMail(Map<String, dynamic> shareDocumentRequest) {
    // TODO: implement shareDocumentToMail
    throw UnimplementedError();
  }
}
