import 'package:caminada/app/model/remote/company_list_response.dart';
import 'package:caminada/app/model/remote/filter_users_response.dart';
import 'package:caminada/app/model/remote/options_user_response.dart';
import 'package:dio/dio.dart';
import 'package:retrofit/dio.dart';
import 'package:retrofit/http.dart';
import 'package:caminada/app/model/AttachmentContact.dart';
import 'package:caminada/app/model/capture_response.dart';
import 'package:caminada/app/model/contact_details_response.dart';
import 'package:caminada/app/model/contact_response.dart';
import 'package:caminada/app/model/document_attachment.dart';
import 'package:caminada/app/model/history_response.dart';
import 'package:caminada/app/model/language_response.dart';

import 'package:caminada/app/model/login_response.dart';
import 'package:caminada/app/model/remote/delete_document_response.dart';
import 'package:caminada/app/model/remote/document_tree_response.dart';
import 'package:caminada/app/model/remote/global_search/get_module_response.dart';
import 'package:caminada/app/model/remote/global_search/get_summary_response.dart';
import 'package:caminada/app/model/remote/save_contact_response.dart';
import 'package:caminada/app/model/remote/search_document_response.dart';
import 'package:caminada/app/model/signup_response.dart';
import 'package:caminada/app/model/upload_image_response.dart';

part 'api_client.g.dart';

/// https://pub.dev/packages/retrofit

@RestApi(baseUrl: "")
abstract class APIClient {
  factory APIClient(Dio dio, {String baseUrl}) = _APIClient;

  @POST('/authenticate')
  Future<LoginResponse> login(@Body() Map<String, dynamic> loginRequest);

  @GET(
      '/history/ScanningHistory?fromDate={fromDate}&toDate={toDate}&userId={userId}&idDocument={idDocument}&company={company}&pageIndex={pageIndex}&pageSize={pageSize}')
  Future<HistoryResponse> getAllHistory(
      @Path("fromDate") String fromDate,
      @Path("toDate") String toDate,
      @Path("userId") String userId,
      @Path("company") String company,
      @Path("idDocument") String idDocument,
      @Path("pageIndex") int pageIndex,
      @Path("pageSize") int pageSize);

  @POST('/ConvertImage/UploadImageByBase64')
  Future<UploadImageResponse> uploadImage(
      @Body() Map<String, dynamic> uploadImageRequest);

  // @POST('/ConvertImage/UploadImageByBase64')
  // Future<HttpResponse<UploadImageResponse>> uploadImageWithHttpResponse(@Body() Map<String, dynamic> uploadImageRequest);

  @GET('/common/GetAllSearchModules')
  Future<GetGlobalSearchModuleResponse> getGlobalSearchModule();

  @GET('/ElSearch/GetSearchSummary')
  Future<GlobalSearchSummaryResponse> getGlobalSearchSummary(
      @Queries() Map<String, dynamic> queries);

  @GET('/document/documentTreeByUser?shouldGetDocumentQuantity=false')
  Future<DocumentTreeResponse> getDocumentTree();

  @GET(
      '/ElSearch/SearchByField?field=idDocumentTree&searchIndex=maindocument&keyword={documentID}&pageIndex={pageIndex}&pageSize=999')
  Future<SearchDocumentResponse> searchDocumentInFolder(
      @Path("documentID") int documentID, @Path("pageIndex") int pageIndex);

  @GET('/DocumentContainer/getThumbnails')
  Future<List<CaptureResponse>> getAllCaptureThumbnails();
  @POST('/authenticate/signup')
  Future<SignupResponse> postSignup(@Body() Map<String, dynamic> signupRequest);
  @GET('/Common/GetMainLanguages?isMobile=true')
  Future<MainLanguageRespone> getAllLanguage();

  @GET(
      'ElSearch/SearchDetail?searchIndex=contact&keyword={keywordSearch}&moduleId=2&pageIndex={pageIndex}&pageSize={pageSize}&isWithStar=true&searchWithStarPattern=Both_*X*')
  Future<ContactResponse> getAllContacts(
      @Path("keywordSearch") String keywordSearch,
      @Path("pageIndex") int pageIndex,
      @Path("pageSize") int pageSize);

  @GET('/document/attachmentListByContact?idPerson={idPerson}')
  Future<AttachmentContact> getAttachmentListByContact(
      @Path("idPerson") String idPerson);

  @GET('/Contact/ContactDetail/{idPersonType}/{idPerson}')
  Future<ContactDetailsResponse> getContactDetailsById(
      @Path("idPersonType") int idPersonType, @Path("idPerson") int idPerson);

  @POST('/contact/SaveContact')
  Future<SaveContactResponse> saveContactDetails(
      @Body() Map<String, dynamic> saveContactRequest);

  @GET(
      'DocumentContainer/GetPagesByDocId?IdDocumentContainerScans={IdDocumentContainerScans}')
  Future<List<DocumentAttachment>> getDocumentPagesById(
      @Path("IdDocumentContainerScans") String idDocumentContainerScans);

  @POST('/DocumentContainer/DeleteScanDocument')
  Future<List<DeleteDocument>> deleteScanDocument(
      @Body() Map<String, dynamic> idDocumentContainerScans);

  @GET('/User/GetFilterOptionsUser')
  Future<OptionUsersResponse> getOptionsUser();

  @GET('/history/HistoryUsers?filter={filter}')
  Future<FilterUsersResponse> getListUserFilter(
    @Path('filter') String keyword
  );
  @GET('/User/CompanyList')
  Future<CompanyListResponse> getListCompany();
}
