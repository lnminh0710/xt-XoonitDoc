import 'package:rxdart/rxdart.dart';
import 'package:xoonit/app/constants/constants_value.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/AttachmentContact.dart';
import 'package:xoonit/app/model/remote/global_search/get_module_response.dart';
import 'package:xoonit/app/model/remote/global_search/get_summary_request.dart';
import 'package:xoonit/app/model/remote/global_search/search_all_document_response.dart';
import 'package:xoonit/app/model/remote/global_search/search_capture_detail_response.dart';
import 'package:xoonit/app/model/remote/global_search/search_contact_detail_response.dart';
import 'package:xoonit/app/model/remote/global_search/search_contract_detail_response.dart';
import 'package:xoonit/app/model/remote/global_search/search_invoice_response.dart';
import 'package:xoonit/app/model/remote/global_search/search_other_document_detail_response.dart';
import 'package:xoonit/app/model/remote/global_search/todo_document_detail_response.dart';

class GlobalSearchController {
  final BehaviorSubject<List<GlobalSearchModule>> _listSearchModuleController =
      BehaviorSubject.seeded(null);

  Stream<List<GlobalSearchModule>> get listSearchModuleStream =>
      _listSearchModuleController.stream;

  List<GlobalSearchModule> _listFolder = List<GlobalSearchModule>();

  String currenKeywordSearch = '*';

  GlobalSearchController() {}

  Future<void> getModules() async {
    if (_listFolder.length == 0) {
      var response = await appApiService.client.getGlobalSearchModule();
      _listFolder = response.item;
    }
    await search('');
  }

  List<GlobalSearchModule> _emptyAllFolder() {
    _listFolder.forEach((element) {
      element.count = -1;
    });
    return _listFolder;
  }

  Future<List<GlobalSearchModule>> search(String str) async {
    _listSearchModuleController.sink.add(_emptyAllFolder());
    if (_listFolder.length == 0) {
      var response = await appApiService.client.getGlobalSearchModule();
      _listFolder = response.item;
    }
    var request = GlobalSearchSummaryRequest();
    request.keyword = str;
    request.isWithStar = true;
    request.searchWithStarPattern = "Both_*X*";
    request.indexes = '';
    _listFolder.forEach((element) {
      request.indexes = request.indexes + element.searchIndexKey + ',';
    });
    request.indexes = request.indexes.substring(0, request.indexes.length - 1);
    var response =
        await appApiService.client.getGlobalSearchSummary(request.toJson());

    _listFolder.forEach((m) {
      m.count =
          response.item.firstWhere((i) => m.searchIndexKey == i.key)?.count ??
              0;
    });
    currenKeywordSearch = str;
    _listSearchModuleController.sink.add(_listFolder);
    return _listFolder;
  }

  Future<SearchCaptureDetailResponse> searchCapture(
      String keywordSearch, int pageSize, int pageIndex) async {
    currenKeywordSearch = keywordSearch;
    return await appApiService.client.getCaptureListByKeyword(
        ConstantValues.captureKeySearchIndex,
        keywordSearch,
        pageIndex,
        pageSize,
        ConstantValues.captureIDSettingGUI);
  }

  Future<ContactSearchDetailResponse> searchContact(
      String keywordSearch, int pageSize, int pageIndex) async {
    currenKeywordSearch = keywordSearch;
    return await appApiService.client.getContactsListByKeyword(
        ConstantValues.contactKeySearchIndex,
        keywordSearch,
        pageIndex,
        pageSize,
        ConstantValues.contactIDSettingGUI);
  }

  Future<SearchAllDocumentResponse> searchAllDocument(
      String keywordSearch, int pageSize, int pageIndex) async {
    currenKeywordSearch = keywordSearch;
    return await appApiService.client.getAllDocumentByKeyword(
        ConstantValues.allDocumentKeySearchIndex,
        keywordSearch,
        pageIndex,
        pageSize,
        ConstantValues.allDocumentIDSettingGUI);
  }

  Future<SearchInvoiceResponse> searchInvoice(
      String keywordSearch, int pageSize, int pageIndex) async {
    currenKeywordSearch = keywordSearch;
    return await appApiService.client.getInvoiceByKeyword(
        ConstantValues.invoiceKeySearchIndex,
        keywordSearch,
        pageIndex,
        pageSize,
        ConstantValues.invoiceIDSettingGUI);
  }

  Future<ContractSearchDetailResponse> searchContract(
      String keywordSearch, int pageSize, int pageIndex) async {
    currenKeywordSearch = keywordSearch;
    return await appApiService.client.getContractByKeyword(
        ConstantValues.contractKeySearchIndex,
        keywordSearch,
        pageIndex,
        pageSize,
        ConstantValues.contractIDSettingGUI);
  }

  Future<SearchOtherDocumentDetailResponse> searchOtherDocument(
      String keywordSearch, int pageSize, int pageIndex) async {
    currenKeywordSearch = keywordSearch;
    return await appApiService.client.getOtherDocumentByKeyword(
        ConstantValues.otherDocumentsKeySearchIndex,
        keywordSearch,
        pageIndex,
        pageSize,
        ConstantValues.otherDocumentsIDSettingGUI);
  }

  Future<SearchTodoDocumentDetailResponse> searchTodoDocument(
      String keywordSearch, int pageSize, int pageIndex) async {
    currenKeywordSearch = keywordSearch;
    return await appApiService.client.getTodoDocumentByKeyword(
        ConstantValues.todoDocumentsKeySearchIndex,
        keywordSearch,
        pageIndex,
        pageSize,
        ConstantValues.todoDocumentsIDSettingGUI);
  }

  Future<AttachmentContact> searchAttachmentContact(
      String idPerson, int _pageIndex, int _pageSize) async {
    return appApiService.client.getAttachmentListByContact(
        idPerson,
        ConstantValues.contactAttachmentSearchIndex,
        ConstantValues.contactAttachmentIDSettingGUI,
        _pageIndex,
        _pageSize);
  }

  void dispose() {
    _listSearchModuleController?.close();
  }
}
