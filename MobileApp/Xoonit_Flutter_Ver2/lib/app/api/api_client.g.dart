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
    return Future.value(value);
  }

  @override
  getAllHistory() async {
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/history/AllHistoryDocument',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = HistoryResponse.fromJson(_result.data);
    return Future.value(value);
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
    return Future.value(value);
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
    return Future.value(value);
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
    return Future.value(value);
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
    return Future.value(value);
  }

  @override
  searchDocumentInFolder(documentID, pageIndex, pageSize) async {
    ArgumentError.checkNotNull(documentID, 'documentID');
    ArgumentError.checkNotNull(pageIndex, 'pageIndex');
    ArgumentError.checkNotNull(pageSize, 'pageSize');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/ElSearch/SearchByField?field=idDocumentTree&searchIndex=maindocument&keyword=$documentID&pageIndex=$pageIndex&pageSize=$pageSize',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = SearchDocumentResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  getAllCaptureThumbnails(pageIndex, pageSize) async {
    ArgumentError.checkNotNull(pageIndex, 'pageIndex');
    ArgumentError.checkNotNull(pageSize, 'pageSize');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/DocumentContainer/GetThumbnails?pageIndex=$pageIndex&pageSize=$pageSize',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = GetDocumentResponse.fromJson(_result.data);
    return Future.value(value);
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
    final value = SingupResponse.fromJson(_result.data);
    return Future.value(value);
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
    return Future.value(value);
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
    final value = ContactSearchDetailResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  getContactsListByKeyword(
      searchIndex, keywordSearch, pageIndex, pageSize, moduleID) async {
    ArgumentError.checkNotNull(searchIndex, 'searchIndex');
    ArgumentError.checkNotNull(keywordSearch, 'keywordSearch');
    ArgumentError.checkNotNull(pageIndex, 'pageIndex');
    ArgumentError.checkNotNull(pageSize, 'pageSize');
    ArgumentError.checkNotNull(moduleID, 'moduleID');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        'ElSearch/SearchDetail?isMobileSearch=true&searchIndex=contact&keyword=$keywordSearch&moduleId=$moduleID&pageIndex=$pageIndex&pageSize=$pageSize&isWithStar=true&searchWithStarPattern=Both_*X*',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = ContactSearchDetailResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  getCaptureListByKeyword(
      searchIndex, keywordSearch, pageIndex, pageSize, moduleID) async {
    ArgumentError.checkNotNull(searchIndex, 'searchIndex');
    ArgumentError.checkNotNull(keywordSearch, 'keywordSearch');
    ArgumentError.checkNotNull(pageIndex, 'pageIndex');
    ArgumentError.checkNotNull(pageSize, 'pageSize');
    ArgumentError.checkNotNull(moduleID, 'moduleID');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        'ElSearch/SearchDetail?isMobileSearch=true&searchIndex=$searchIndex&keyword=$keywordSearch&moduleId=$moduleID&pageIndex=$pageIndex&pageSize=$pageSize&isWithStar=true&searchWithStarPattern=Both_*X*',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = SearchCaptureDetailResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  getAllDocumentByKeyword(
      searchIndex, keywordSearch, pageIndex, pageSize, moduleID) async {
    ArgumentError.checkNotNull(searchIndex, 'searchIndex');
    ArgumentError.checkNotNull(keywordSearch, 'keywordSearch');
    ArgumentError.checkNotNull(pageIndex, 'pageIndex');
    ArgumentError.checkNotNull(pageSize, 'pageSize');
    ArgumentError.checkNotNull(moduleID, 'moduleID');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        'ElSearch/SearchDetail?isMobileSearch=true&searchIndex=$searchIndex&keyword=$keywordSearch&moduleId=$moduleID&pageIndex=$pageIndex&pageSize=$pageSize&isWithStar=true&searchWithStarPattern=Both_*X*',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = SearchAllDocumentResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  getInvoiceByKeyword(
      searchIndex, keywordSearch, pageIndex, pageSize, moduleID) async {
    ArgumentError.checkNotNull(searchIndex, 'searchIndex');
    ArgumentError.checkNotNull(keywordSearch, 'keywordSearch');
    ArgumentError.checkNotNull(pageIndex, 'pageIndex');
    ArgumentError.checkNotNull(pageSize, 'pageSize');
    ArgumentError.checkNotNull(moduleID, 'moduleID');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        'ElSearch/SearchDetail?isMobileSearch=true&searchIndex=$searchIndex&keyword=$keywordSearch&moduleId=$moduleID&pageIndex=$pageIndex&pageSize=$pageSize&isWithStar=true&searchWithStarPattern=Both_*X*',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = SearchInvoiceResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  getContractByKeyword(
      searchIndex, keywordSearch, pageIndex, pageSize, moduleID) async {
    ArgumentError.checkNotNull(searchIndex, 'searchIndex');
    ArgumentError.checkNotNull(keywordSearch, 'keywordSearch');
    ArgumentError.checkNotNull(pageIndex, 'pageIndex');
    ArgumentError.checkNotNull(pageSize, 'pageSize');
    ArgumentError.checkNotNull(moduleID, 'moduleID');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        'ElSearch/SearchDetail?isMobileSearch=true&searchIndex=$searchIndex&keyword=$keywordSearch&moduleId=$moduleID&pageIndex=$pageIndex&pageSize=$pageSize&isWithStar=true&searchWithStarPattern=Both_*X*',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = ContractSearchDetailResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  getOtherDocumentByKeyword(
      searchIndex, keywordSearch, pageIndex, pageSize, moduleID) async {
    ArgumentError.checkNotNull(searchIndex, 'searchIndex');
    ArgumentError.checkNotNull(keywordSearch, 'keywordSearch');
    ArgumentError.checkNotNull(pageIndex, 'pageIndex');
    ArgumentError.checkNotNull(pageSize, 'pageSize');
    ArgumentError.checkNotNull(moduleID, 'moduleID');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        'ElSearch/SearchDetail?isMobileSearch=true&searchIndex=$searchIndex&keyword=$keywordSearch&moduleId=$moduleID&pageIndex=$pageIndex&pageSize=$pageSize&isWithStar=true&searchWithStarPattern=Both_*X*',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = SearchOtherDocumentDetailResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  getTodoDocumentByKeyword(
      searchIndex, keywordSearch, pageIndex, pageSize, moduleID) async {
    ArgumentError.checkNotNull(searchIndex, 'searchIndex');
    ArgumentError.checkNotNull(keywordSearch, 'keywordSearch');
    ArgumentError.checkNotNull(pageIndex, 'pageIndex');
    ArgumentError.checkNotNull(pageSize, 'pageSize');
    ArgumentError.checkNotNull(moduleID, 'moduleID');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        'ElSearch/SearchDetail?isMobileSearch=true&searchIndex=$searchIndex&keyword=$keywordSearch&moduleId=$moduleID&pageIndex=$pageIndex&pageSize=$pageSize&isWithStar=true&searchWithStarPattern=Both_*X*',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = SearchTodoDocumentDetailResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  getAttachmentListByContact(
      idPerson, searchIndex, moduleId, pageIndex, pageSize) async {
    ArgumentError.checkNotNull(idPerson, 'idPerson');
    ArgumentError.checkNotNull(searchIndex, 'searchIndex');
    ArgumentError.checkNotNull(moduleId, 'moduleId');
    ArgumentError.checkNotNull(pageIndex, 'pageIndex');
    ArgumentError.checkNotNull(pageSize, 'pageSize');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/ElSearch/SearchDetail?isMobileSearch=true&fieldName=contacts.idPerson&fieldValue=$idPerson&searchIndex=$searchIndex&keyword=&moduleId=$moduleId&pageIndex=$pageIndex&pageSize=$pageSize&isWithStar=true&searchWithStarPattern=Both_*X*',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = AttachmentContact.fromJson(_result.data);
    return Future.value(value);
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
    final value = ContactDetailResponse.fromJson(_result.data);
    return Future.value(value);
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
    final value = CreateFolderResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  createFolder(createFolderRequest) async {
    ArgumentError.checkNotNull(createFolderRequest, 'createFolderRequest');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    _data.addAll(createFolderRequest ?? <String, dynamic>{});
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/document/createFolder',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = CreateFolderResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  getDocumentPagesByIdDoc(idDocumentContainerScans) async {
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
        .map((dynamic i) => DocumentDetail.fromJson(i as Map<String, dynamic>))
        .toList();
    return Future.value(value);
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
    return Future.value(value);
  }

  @override
  shareDocumentToMail(shareDocumentRequest) async {
    ArgumentError.checkNotNull(shareDocumentRequest, 'shareDocumentRequest');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    _data.addAll(shareDocumentRequest ?? <String, dynamic>{});
    final Response<bool> _result = await _dio.request(
        '/DocumentContainer/SendEmail',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = _result.data;
    return Future.value(value);
  }

  @override
  requestOCR(ocrDocumentRequest) async {
    ArgumentError.checkNotNull(ocrDocumentRequest, 'ocrDocumentRequest');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    _data.addAll(ocrDocumentRequest ?? <String, dynamic>{});
    final Response<String> _result = await _dio.request('/OCRDocument/manually',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = _result.data;
    return Future.value(value);
  }

  @override
  getCloudActives() async {
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        'cloud/getcloudactives',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = CloudActiviesResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  getCloudConnection(idCloudProviders) async {
    ArgumentError.checkNotNull(idCloudProviders, 'idCloudProviders');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        'cloud/GetCloudConnection?idCloudProviders=$idCloudProviders',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = CloudConnectionResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  saveCloudConnection(request) async {
    ArgumentError.checkNotNull(request, 'request');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = request;
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/cloud/SaveCloudConnection',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = SaveCloudConnectionResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  testCloudConnection(request) async {
    ArgumentError.checkNotNull(request, 'request');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    _data.addAll(request ?? <String, dynamic>{});
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/cloud/testcloudconnection',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = TestConnectionResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  groupDocumentPages(request) async {
    ArgumentError.checkNotNull(request, 'request');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = request;
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/DocumentContainer/SaveDocumentContainerPage',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = GroupDocumentResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  saveDocumentInvoices(saveRequest) async {
    ArgumentError.checkNotNull(saveRequest, 'saveRequest');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    _data.addAll(saveRequest ?? <String, dynamic>{});
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/invoice/SaveInvoice',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = SaveDocumentResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  saveDocumentContracts(request) async {
    ArgumentError.checkNotNull(request, 'request');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    _data.addAll(request ?? <String, dynamic>{});
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/contract/SaveContract',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = SaveDocumentResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  saveOtherDocument(request) async {
    ArgumentError.checkNotNull(request, 'request');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    _data.addAll(request ?? <String, dynamic>{});
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/otherDocument/SaveOtherDocument',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = SaveDocumentResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  forgotPassword(fogotPasswordRequest) async {
    ArgumentError.checkNotNull(fogotPasswordRequest, 'fogotPasswordRequest');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    _data.addAll(fogotPasswordRequest ?? <String, dynamic>{});
    final Response<Map<String, dynamic>> _result = await _dio.request(
        'authenticate/fogotPassword',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = ForgotPasswordResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  changePassword(changePasswordRq) async {
    ArgumentError.checkNotNull(changePasswordRq, 'changePasswordRq');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    _data.addAll(changePasswordRq ?? <String, dynamic>{});
    final Response<Map<String, dynamic>> _result = await _dio.request(
        '/authenticate/changepassword',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = LoginResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  getMainLanguage() async {
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = <String, dynamic>{};
    final Response<Map<String, dynamic>> _result = await _dio.request(
        'common/GetMainLanguages',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'GET',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = GetMainLanguageResponse.fromJson(_result.data);
    return Future.value(value);
  }

  @override
  updateAvatar(formData) async {
    ArgumentError.checkNotNull(formData, 'formData');
    const _extra = <String, dynamic>{};
    final queryParameters = <String, dynamic>{};
    final _data = formData;
    final Response<Map<String, dynamic>> _result = await _dio.request(
        'User/UploadAvatar',
        queryParameters: queryParameters,
        options: RequestOptions(
            method: 'POST',
            headers: <String, dynamic>{},
            extra: _extra,
            baseUrl: baseUrl),
        data: _data);
    final value = UpdateAvatarResponse.fromJson(_result.data);
    return Future.value(value);
  }
}
