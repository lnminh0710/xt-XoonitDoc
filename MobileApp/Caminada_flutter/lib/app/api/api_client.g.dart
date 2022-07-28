// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'api_client.dart';

// **************************************************************************
// RetrofitGenerator
// **************************************************************************

class _APIClient implements APIClient {
  _APIClient(this._dio, {this.baseUrl}) {
    ArgumentError.checkNotNull(_dio, '_dio');
  }

  final Dio _dio;

  String baseUrl;

  @override
  login(loginRequest) async {
    ArgumentError.checkNotNull(loginRequest, 'loginRequest');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    _data.addAll(loginRequest ?? <String, dynamic>{});
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/authenticate',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = LoginResponse.fromJson(_result.data);
    return value;
  }

  @override
  getAllHistory(fromDate, toDate, userId, company, idDocument, pageIndex,
      pageSize) async {
    ArgumentError.checkNotNull(fromDate, 'fromDate');
    ArgumentError.checkNotNull(toDate, 'toDate');
    ArgumentError.checkNotNull(userId, 'userId');
    ArgumentError.checkNotNull(company, 'company');
    ArgumentError.checkNotNull(idDocument, 'idDocument');
    ArgumentError.checkNotNull(pageIndex, 'pageIndex');
    ArgumentError.checkNotNull(pageSize, 'pageSize');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/history/ScanningHistory?fromDate=$fromDate&toDate=$toDate&userId=$userId&idDocument=$idDocument&company=$company&pageIndex=$pageIndex&pageSize=$pageSize',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = HistoryResponse.fromJson(_result.data);
    return value;
  }

  @override
  uploadImage(uploadImageRequest) async {
    ArgumentError.checkNotNull(uploadImageRequest, 'uploadImageRequest');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    _data.addAll(uploadImageRequest ?? <String, dynamic>{});
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/ConvertImage/UploadImageByBase64',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = UploadImageResponse.fromJson(_result.data);
    return value;
  }

  @override
  getGlobalSearchModule() async {
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/common/GetAllSearchModules',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = GetGlobalSearchModuleResponse.fromJson(_result.data);
    return value;
  }

  @override
  getGlobalSearchSummary(queries) async {
    ArgumentError.checkNotNull(queries, 'queries');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    queryParameters.addAll(queries ?? <String, dynamic>{});
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/ElSearch/GetSearchSummary',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = GlobalSearchSummaryResponse.fromJson(_result.data);
    return value;
  }

  @override
  getDocumentTree() async {
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/document/documentTreeByUser?shouldGetDocumentQuantity=false',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = DocumentTreeResponse.fromJson(_result.data);
    return value;
  }

  @override
  searchDocumentInFolder(documentID, pageIndex) async {
    ArgumentError.checkNotNull(documentID, 'documentID');
    ArgumentError.checkNotNull(pageIndex, 'pageIndex');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/ElSearch/SearchByField?field=idDocumentTree&searchIndex=maindocument&keyword=$documentID&pageIndex=$pageIndex&pageSize=999',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = SearchDocumentResponse.fromJson(_result.data);
    return value;
  }

  @override
  getAllCaptureThumbnails() async {
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<List<dynamic>> _result = await _dio.request(
        '/DocumentContainer/getThumbnails',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    var value = _result.data
        .map((dynamic i) => CaptureResponse.fromJson(i as Map<String, dynamic>))
        .toList();
    return value;
  }

  @override
  postSignup(signupRequest) async {
    ArgumentError.checkNotNull(signupRequest, 'signupRequest');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    _data.addAll(signupRequest ?? <String, dynamic>{});
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/authenticate/signup',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = SignupResponse.fromJson(_result.data);
    return value;
  }

  @override
  getAllLanguage() async {
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/Common/GetMainLanguages?isMobile=true',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = MainLanguageRespone.fromJson(_result.data);
    return value;
  }

  @override
  getAllContacts(keywordSearch, pageIndex, pageSize) async {
    ArgumentError.checkNotNull(keywordSearch, 'keywordSearch');
    ArgumentError.checkNotNull(pageIndex, 'pageIndex');
    ArgumentError.checkNotNull(pageSize, 'pageSize');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        'ElSearch/SearchDetail?searchIndex=contact&keyword=$keywordSearch&moduleId=2&pageIndex=$pageIndex&pageSize=$pageSize&isWithStar=true&searchWithStarPattern=Both_*X*',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = ContactResponse.fromJson(_result.data);
    return value;
  }

  @override
  getAttachmentListByContact(idPerson) async {
    ArgumentError.checkNotNull(idPerson, 'idPerson');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/document/attachmentListByContact?idPerson=$idPerson',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = AttachmentContact.fromJson(_result.data);
    return value;
  }

  @override
  getContactDetailsById(idPersonType, idPerson) async {
    ArgumentError.checkNotNull(idPersonType, 'idPersonType');
    ArgumentError.checkNotNull(idPerson, 'idPerson');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/Contact/ContactDetail/$idPersonType/$idPerson',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = ContactDetailsResponse.fromJson(_result.data);
    return value;
  }

  @override
  saveContactDetails(saveContactRequest) async {
    ArgumentError.checkNotNull(saveContactRequest, 'saveContactRequest');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    _data.addAll(saveContactRequest ?? <String, dynamic>{});
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/contact/SaveContact',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = SaveContactResponse.fromJson(_result.data);
    return value;
  }

  @override
  getDocumentPagesById(idDocumentContainerScans) async {
    ArgumentError.checkNotNull(
        idDocumentContainerScans, 'idDocumentContainerScans');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<List<dynamic>> _result = await _dio.request(
        'DocumentContainer/GetPagesByDocId?IdDocumentContainerScans=$idDocumentContainerScans',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    var value = _result.data
        .map((dynamic i) =>
            DocumentAttachment.fromJson(i as Map<String, dynamic>))
        .toList();
    return value;
  }

  @override
  deleteScanDocument(idDocumentContainerScans) async {
    ArgumentError.checkNotNull(
        idDocumentContainerScans, 'idDocumentContainerScans');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    _data.addAll(idDocumentContainerScans ?? <String, dynamic>{});
    final Response<List<dynamic>> _result = await _dio.request(
        '/DocumentContainer/DeleteScanDocument',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    var value = _result.data
        .map((dynamic i) => DeleteDocument.fromJson(i as Map<String, dynamic>))
        .toList();
    return value;
  }

  @override
  getOptionsUser() async {
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/User/GetFilterOptionsUser',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = OptionUsersResponse.fromJson(_result.data);
    return value;
  }

  @override
  getListUserFilter(keyword) async {
    ArgumentError.checkNotNull(keyword, 'keyword');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/history/HistoryUsers?filter=$keyword',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = FilterUsersResponse.fromJson(_result.data);
    return value;
  }

  @override
  getListCompany() async {
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/User/CompanyList',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = CompanyListResponse.fromJson(_result.data);
    return value;
  }
}
