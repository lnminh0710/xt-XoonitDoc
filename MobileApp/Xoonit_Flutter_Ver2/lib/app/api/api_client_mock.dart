import 'package:dio/src/form_data.dart';
import 'package:retrofit/dio.dart';
import 'package:retrofit/http.dart';
import 'package:xoonit/app/api/api_client.dart';
import 'package:xoonit/app/model/AttachmentContact.dart';
import 'package:xoonit/app/model/capture_response.dart';
import 'package:xoonit/app/model/document_attachment.dart';
import 'package:xoonit/app/model/forgot_password_response.dart';
import 'package:xoonit/app/model/history_response.dart';
import 'package:xoonit/app/model/language_response.dart';
import 'package:xoonit/app/model/login_response.dart';
import 'package:xoonit/app/model/remote/capture/save_document/save_document_response.dart';
import 'package:xoonit/app/model/remote/cloud/cloud_activies_response.dart';
import 'package:xoonit/app/model/remote/cloud/cloud_connection_response.dart';
import 'package:xoonit/app/model/remote/cloud/save_cloud_connection.dart';
import 'package:xoonit/app/model/remote/cloud/test_connection.dart';
import 'package:xoonit/app/model/remote/contact/contact_detail_response.dart';
import 'package:xoonit/app/model/remote/create_folder_response.dart';
import 'package:xoonit/app/model/remote/delete_document_response.dart';
import 'package:xoonit/app/model/remote/document_tree_response.dart';
import 'package:xoonit/app/model/remote/get_main_language_response.dart';
import 'package:xoonit/app/model/remote/global_search/get_module_response.dart';
import 'package:xoonit/app/model/remote/global_search/get_summary_response.dart';
import 'package:xoonit/app/model/remote/global_search/search_all_document_response.dart';
import 'package:xoonit/app/model/remote/global_search/search_capture_detail_response.dart';
import 'package:xoonit/app/model/remote/global_search/todo_document_detail_response.dart';
import 'package:xoonit/app/model/remote/group_document/group_document_response.dart';
import 'package:xoonit/app/model/remote/global_search/search_contact_detail_response.dart';
import 'package:xoonit/app/model/remote/global_search/search_contract_detail_response.dart';
import 'package:xoonit/app/model/remote/global_search/search_invoice_response.dart';
import 'package:xoonit/app/model/remote/global_search/search_other_document_detail_response.dart';
import 'package:xoonit/app/model/remote/profile/update_avatar_response.dart';
import 'package:xoonit/app/model/remote/search_document_response.dart';
import 'package:xoonit/app/model/signup_response.dart';
import 'package:xoonit/app/model/upload_image_response.dart';

class APIClientMock implements APIClient {
  @override
  Future<LoginResponse> login(@Body() Map<String, dynamic> loginRequest) {
    return null;
  }

  Future<ForgotPasswordResponse> forgotPassword(
      @Body() Map<String, dynamic> fogotRequest) {
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
      @Path("documentID") int documentID,
      @Path("pageIndex") int pageIndex,
      @Path("pageSize") int pageSize) {
    return null;
  }

  @override
  Future<SingupResponse> postSignup(
      @Body() Map<String, dynamic> signupRequest) {
    return null;
  }

  @override
  Future<MainLanguageRespone> getAllLanguage() {
    return null;
  }

  Future<ContactSearchDetailResponse> getAllContacts(
      String keywordSearch, int pageIndex, int pageSize) {
    throw UnimplementedError();
  }

  Future<SearchCaptureDetailResponse> getCaptureListByKeyword(
      searchIndex, keywordSearch, pageIndex, pageSize, moduleID) {
    throw UnimplementedError();
  }

  @override
  Future<ContactSearchDetailResponse> getContactsListByKeyword(
      searchIndex, keywordSearch, pageIndex, pageSize, moduleId) async {
    throw UnimplementedError();
  }

  @override
  Future<SearchInvoiceResponse> getInvoiceByKeyword(
      searchIndex, keywordSearch, pageIndex, pageSize, moduleId) async {
    throw UnimplementedError();
  }

  @override
  Future<ContractSearchDetailResponse> getContractByKeyword(
      searchIndex, keywordSearch, pageIndex, pageSize, moduleId) async {
    throw UnimplementedError();
  }

  @override
  Future<SearchOtherDocumentDetailResponse> getOtherDocumentByKeyword(
      searchIndex, keywordSearch, pageIndex, pageSize, moduleId) async {
    throw UnimplementedError();
  }

  @override
  Future<SearchTodoDocumentDetailResponse> getTodoDocumentByKeyword(
      searchIndex, keywordSearch, pageIndex, pageSize, moduleId) async {
    throw UnimplementedError();
  }

  @override
  Future<SearchAllDocumentResponse> getAllDocumentByKeyword(
      searchIndex, keywordSearch, pageIndex, pageSize, moduleId) async {
    throw UnimplementedError();
  }

  @override
  Future<AttachmentContact> getAttachmentListByContact(
    @Path("idPerson") String idPerson,
    @Path("searchIndex") String searchIndex,
    @Path("moduleId") int moduleId,
    @Path("pageIndex") int pageIndex,
    @Path("pageSize") int pageSize,
  ) {
    throw UnimplementedError();
  }

  @override
  Future<ContactDetailResponse> getContactDetailsById(
      String idPersonType, String idPerson) {
    throw UnimplementedError();
  }

  @override
  Future<CreateFolderResponse> saveContactDetails(
      Map<String, dynamic> saveContactRequest) {
    throw UnimplementedError();
  }

  @override
  Future<CreateFolderResponse> createFolder(
      Map<String, dynamic> createFolderRequest) {
    throw UnimplementedError();
  }

  @override
  Future<List<DocumentDetail>> getDocumentPagesByIdDoc(
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
    throw UnimplementedError();
  }

  @override
  Future<String> requestOCR(Map<String, dynamic> ocrDocumentRequest) {
    throw UnimplementedError();
  }

  @override
  Future<CloudActiviesResponse> getCloudActives() {
    // TODO: implement getCloudActives
    throw UnimplementedError();
  }

  @override
  Future<SaveCloudConnectionResponse> saveCloudConnection(dynamic request) {
    // TODO: implement saveCloudConnection
    throw UnimplementedError();
  }

  @override
  Future<GroupDocumentResponse> groupDocumentPages(
      List<Map<String, dynamic>> request) {
    // TODO: implement groupDocumentPages
    throw UnimplementedError();
  }

  @override
  Future<CloudConnectionResponse> getCloudConnection(dynamic idCloudProviders) {
    // TODO: implement getCloudConnection
    throw UnimplementedError();
  }

  @override
  Future<TestConnectionResponse> testCloudConnection(
      Map<String, dynamic> request) {
    // TODO: implement testCloudConnection
    throw UnimplementedError();
  }

  @override
  Future<SaveDocumentResponse> saveDocumentContracts(
      Map<String, dynamic> request) {
    // TODO: implement saveDocumentContracts
    throw UnimplementedError();
  }

  @override
  Future<SaveDocumentResponse> saveDocumentInvoices(
      Map<String, dynamic> request) {
    // TODO: implement saveDocumentInvoices
    throw UnimplementedError();
  }

  @override
  Future<SaveDocumentResponse> saveOtherDocument(Map<String, dynamic> request) {
    // TODO: implement saveOtherDocument
    throw UnimplementedError();
  }

  @override
  Future<LoginResponse> changePassword(Map<String, dynamic> changePasswordRq) {
    // TODO: implement changePassword
    throw UnimplementedError();
  }

  @override
  Future<GetMainLanguageResponse> getMainLanguage() {
    // TODO: implement getMainLanguage
    throw UnimplementedError();
  }

  @override
  Future<UpdateAvatarResponse> updateAvatar(FormData formData) {
    // TODO: implement updateAvatar
    throw UnimplementedError();
  }

  @override
  Future<GetDocumentResponse> getAllCaptureThumbnails(
      int pageIndex, int pageSize) {
    // TODO: implement getAllCaptureThumbnails
    throw UnimplementedError();
  }
}
