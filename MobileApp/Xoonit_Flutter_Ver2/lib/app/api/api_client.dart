import 'package:dio/dio.dart';
import 'package:retrofit/http.dart';
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

part 'api_client.g.dart';

/// https://pub.dev/packages/retrofit
/// flutter pub run build_runner build

@RestApi(baseUrl: "")
abstract class APIClient {
  factory APIClient(Dio dio, {String baseUrl}) = _APIClient;

  @POST('/authenticate')
  Future<LoginResponse> login(@Body() Map<String, dynamic> loginRequest);

  @GET('/history/AllHistoryDocument')
  Future<HistoryResponse> getAllHistory();

  @POST('/ConvertImage/UploadImageByBase64')
  Future<UploadImageResponse> uploadImage(
      @Body() Map<String, dynamic> uploadImageRequest);

  @GET('/common/GetAllSearchModules')
  Future<GetGlobalSearchModuleResponse> getGlobalSearchModule();

  @GET('/ElSearch/GetSearchSummary')
  Future<GlobalSearchSummaryResponse> getGlobalSearchSummary(
      @Queries() Map<String, dynamic> queries);

  @GET('/document/documentTreeByUser?shouldGetDocumentQuantity=false')
  Future<DocumentTreeResponse> getDocumentTree();

  @GET(
      '/ElSearch/SearchByField?field=idDocumentTree&searchIndex=maindocument&keyword={documentID}&pageIndex={pageIndex}&pageSize={pageSize}')
  Future<SearchDocumentResponse> searchDocumentInFolder(
      @Path("documentID") int documentID,
      @Path("pageIndex") int pageIndex,
      @Path("pageSize") int pageSize);

  @GET(
      '/DocumentContainer/GetThumbnails?pageIndex={pageIndex}&pageSize={pageSize}')
  Future<GetDocumentResponse> getAllCaptureThumbnails(
      @Path('pageIndex') int pageIndex, @Path('pageSize') int pageSize);

  @POST('/authenticate/signup')
  Future<SingupResponse> postSignup(@Body() Map<String, dynamic> signupRequest);

  @GET('/Common/GetMainLanguages?isMobile=true')
  Future<MainLanguageRespone> getAllLanguage();

  @GET(
      'ElSearch/SearchDetail?searchIndex=contact&keyword={keywordSearch}&moduleId=2&pageIndex={pageIndex}&pageSize={pageSize}&isWithStar=true&searchWithStarPattern=Both_*X*')
  Future<ContactSearchDetailResponse> getAllContacts(
      @Path("keywordSearch") String keywordSearch,
      @Path("pageIndex") int pageIndex,
      @Path("pageSize") int pageSize);
  @GET(
      'ElSearch/SearchDetail?isMobileSearch=true&searchIndex=contact&keyword={keywordSearch}&moduleId={moduleID}&pageIndex={pageIndex}&pageSize={pageSize}&isWithStar=true&searchWithStarPattern=Both_*X*')
  Future<ContactSearchDetailResponse> getContactsListByKeyword(
      @Path("searchIndex") String searchIndex,
      @Path("keywordSearch") String keywordSearch,
      @Path("pageIndex") int pageIndex,
      @Path("pageSize") int pageSize,
      @Path("moduleID") int moduleID);

  @GET(
      'ElSearch/SearchDetail?isMobileSearch=true&searchIndex={searchIndex}&keyword={keywordSearch}&moduleId={moduleID}&pageIndex={pageIndex}&pageSize={pageSize}&isWithStar=true&searchWithStarPattern=Both_*X*')
  Future<SearchCaptureDetailResponse> getCaptureListByKeyword(
      @Path("searchIndex") String searchIndex,
      @Path("keywordSearch") String keywordSearch,
      @Path("pageIndex") int pageIndex,
      @Path("pageSize") int pageSize,
      @Path("moduleID") int moduleID);

  @GET(
      'ElSearch/SearchDetail?isMobileSearch=true&searchIndex={searchIndex}&keyword={keywordSearch}&moduleId={moduleID}&pageIndex={pageIndex}&pageSize={pageSize}&isWithStar=true&searchWithStarPattern=Both_*X*')
  Future<SearchAllDocumentResponse> getAllDocumentByKeyword(
      @Path("searchIndex") String searchIndex,
      @Path("keywordSearch") String keywordSearch,
      @Path("pageIndex") int pageIndex,
      @Path("pageSize") int pageSize,
      @Path("moduleID") int moduleID);

  @GET(
      'ElSearch/SearchDetail?isMobileSearch=true&searchIndex={searchIndex}&keyword={keywordSearch}&moduleId={moduleID}&pageIndex={pageIndex}&pageSize={pageSize}&isWithStar=true&searchWithStarPattern=Both_*X*')
  Future<SearchInvoiceResponse> getInvoiceByKeyword(
      @Path("searchIndex") String searchIndex,
      @Path("keywordSearch") String keywordSearch,
      @Path("pageIndex") int pageIndex,
      @Path("pageSize") int pageSize,
      @Path("moduleID") int moduleID);

  @GET(
      'ElSearch/SearchDetail?isMobileSearch=true&searchIndex={searchIndex}&keyword={keywordSearch}&moduleId={moduleID}&pageIndex={pageIndex}&pageSize={pageSize}&isWithStar=true&searchWithStarPattern=Both_*X*')
  Future<ContractSearchDetailResponse> getContractByKeyword(
      @Path("searchIndex") String searchIndex,
      @Path("keywordSearch") String keywordSearch,
      @Path("pageIndex") int pageIndex,
      @Path("pageSize") int pageSize,
      @Path("moduleID") int moduleID);

  @GET(
      'ElSearch/SearchDetail?isMobileSearch=true&searchIndex={searchIndex}&keyword={keywordSearch}&moduleId={moduleID}&pageIndex={pageIndex}&pageSize={pageSize}&isWithStar=true&searchWithStarPattern=Both_*X*')
  Future<SearchOtherDocumentDetailResponse> getOtherDocumentByKeyword(
      @Path("searchIndex") String searchIndex,
      @Path("keywordSearch") String keywordSearch,
      @Path("pageIndex") int pageIndex,
      @Path("pageSize") int pageSize,
      @Path("moduleID") int moduleID);

  @GET(
      'ElSearch/SearchDetail?isMobileSearch=true&searchIndex={searchIndex}&keyword={keywordSearch}&moduleId={moduleID}&pageIndex={pageIndex}&pageSize={pageSize}&isWithStar=true&searchWithStarPattern=Both_*X*')
  Future<SearchTodoDocumentDetailResponse> getTodoDocumentByKeyword(
      @Path("searchIndex") String searchIndex,
      @Path("keywordSearch") String keywordSearch,
      @Path("pageIndex") int pageIndex,
      @Path("pageSize") int pageSize,
      @Path("moduleID") int moduleID);

  @GET(
      '/ElSearch/SearchDetail?isMobileSearch=true&fieldName=contacts.idPerson&fieldValue={idPerson}&searchIndex={searchIndex}&keyword=&moduleId={moduleId}&pageIndex={pageIndex}&pageSize={pageSize}&isWithStar=true&searchWithStarPattern=Both_*X*')
  Future<AttachmentContact> getAttachmentListByContact(
    @Path("idPerson") String idPerson,
    @Path("searchIndex") String searchIndex,
    @Path("moduleId") int moduleId,
    @Path("pageIndex") int pageIndex,
    @Path("pageSize") int pageSize,
  );

  @GET('/Contact/ContactDetail/{idPersonType}/{idPerson}')
  Future<ContactDetailResponse> getContactDetailsById(
      @Path("idPersonType") String idPersonType,
      @Path("idPerson") String idPerson);

  @POST('/contact/SaveContact')
  Future<CreateFolderResponse> saveContactDetails(
      @Body() Map<String, dynamic> saveContactRequest);

  @POST('/document/createFolder')
  Future<CreateFolderResponse> createFolder(
      @Body() Map<String, dynamic> createFolderRequest);

  @GET(
      'DocumentContainer/GetPagesByDocId?IdDocumentContainerScans={IdDocumentContainerScans}')
  Future<List<DocumentDetail>> getDocumentPagesByIdDoc(
      @Path("IdDocumentContainerScans") String idDocumentContainerScans);

  @POST('/DocumentContainer/DeleteScanDocument')
  Future<List<DeleteDocument>> deleteScanDocument(
      @Body() Map<String, dynamic> idDocumentContainerScans);

  @POST('/DocumentContainer/SendEmail')
  Future<bool> shareDocumentToMail(
      @Body() Map<String, dynamic> shareDocumentRequest);
  @POST('/OCRDocument/manually')
  Future<String> requestOCR(@Body() Map<String, dynamic> ocrDocumentRequest);

  // Cloud
  @GET('cloud/getcloudactives')
  Future<CloudActiviesResponse> getCloudActives();

  @GET('cloud/GetCloudConnection?idCloudProviders={idCloudProviders}')
  Future<CloudConnectionResponse> getCloudConnection(
      @Path("idCloudProviders") dynamic idCloudProviders);

  @POST('/cloud/SaveCloudConnection')
  Future<SaveCloudConnectionResponse> saveCloudConnection(
      @Body() List<Map<String, dynamic>> request);

  @POST('/cloud/testcloudconnection')
  Future<TestConnectionResponse> testCloudConnection(
      @Body() Map<String, dynamic> request);

  //group document
  @POST('/DocumentContainer/SaveDocumentContainerPage')
  Future<GroupDocumentResponse> groupDocumentPages(
      @Body() List<Map<String, dynamic>> request);
  //save invoice document
  @POST('/invoice/SaveInvoice')
  Future<SaveDocumentResponse> saveDocumentInvoices(
      @Body() Map<String, dynamic> saveRequest);
  //save contract document
  @POST('/contract/SaveContract')
  Future<SaveDocumentResponse> saveDocumentContracts(
      @Body() Map<String, dynamic> request);
  //save other Document
  @POST('/otherDocument/SaveOtherDocument')
  Future<SaveDocumentResponse> saveOtherDocument(
      @Body() Map<String, dynamic> request);
  @POST('authenticate/fogotPassword')
  Future<ForgotPasswordResponse> forgotPassword(
      @Body() Map<String, dynamic> fogotPasswordRequest);
  //Change Password
  @POST('/authenticate/changepassword')
  Future<LoginResponse> changePassword(
      @Body() Map<String, dynamic> changePasswordRq);

  @GET('common/GetMainLanguages')
  Future<GetMainLanguageResponse> getMainLanguage();

  @POST('User/UploadAvatar')
  @MultiPart()
  Future<UpdateAvatarResponse> updateAvatar(@Body() FormData formData);
}
