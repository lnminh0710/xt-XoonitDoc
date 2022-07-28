import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:rxdart/rxdart.dart';
import 'package:uuid/uuid.dart';
import 'package:xoonit/app/model/local/import_file/importfile_dao.dart';
import 'package:xoonit/app/model/local/import_file/importfile_table.dart';
import 'package:xoonit/app/model/order_scanning.dart';
import 'package:xoonit/app/model/upload_image_response.dart';
import 'package:xoonit/core/bloc_base.dart';

import '../../../difinition.dart';

class ImportBloc extends BlocBase {
  final BehaviorSubject<List<TImportFile>> _lsFile =
      BehaviorSubject<List<TImportFile>>.seeded([]);
  Stream<List<TImportFile>> get lsFile => _lsFile.stream;

  final BehaviorSubject<List<String>> _lsItemSelect =
      BehaviorSubject<List<String>>.seeded([]);
  Stream<List<String>> get lsItemSelect => _lsItemSelect.stream;

  final BehaviorSubject<bool> _hasInvalidFile =
      BehaviorSubject<bool>.seeded(false);
  Stream<bool> get hasInvalidFile => _hasInvalidFile.stream;

  final BehaviorSubject<dynamic> _activeSelectAll =
      BehaviorSubject<dynamic>.seeded(true);
  Stream<dynamic> get activeSelectAll => _activeSelectAll.stream;

  final _lsFileType = ['pdf', 'tiff', 'png', 'PDF', 'TIFF', 'PNG'];
  final Map<String, ReplaySubject<int>> lsProgressSubject = {};

  @override
  Future<void> dispose() async {
    await _lsFile.drain();
    _lsFile.close();
    lsProgressSubject.values.forEach((element) {
      element.close();
    });
    _lsItemSelect.close();
    _hasInvalidFile.close();
    _activeSelectAll.close();
  }

  ImportBloc() {
    getData();
  }

  getData() {
    var list = ImportFileDAO.getAllFileImport();
    _lsFile.sink.add(list);
    list.forEach((element) {
      _lsItemSelect.value.add(element.uuid);
      lsProgressSubject
          .addAll({element.uuid: ReplaySubject<int>()..sink.add(-1)});
    });
  }

  openFileExplorer() async {
    try {
      List<File> files = await FilePicker.getMultiFile(
          type: FileType.custom, allowedExtensions: _lsFileType);

      if (files?.isNotEmpty != true) {
        return;
      }

      _lsFile.value.removeWhere((element) => element.uploadProgress == 200);
      var lsPathFileImport = _lsFile.value.map((e) => e.path);
      var lsFileNotDulicate = files.where(
          (element) => !lsPathFileImport.contains(element.absolute.path));

      if (lsFileNotDulicate.isEmpty) {
        return;
      }

      var hasInvalidFile = false;
      for (var file in lsFileNotDulicate) {
        var name = file.path.split('/').last;
        var type = name.split('.').last;

        if (!_lsFileType.contains(type.toLowerCase())) {
          hasInvalidFile = true;
          continue;
        }

        var localFile = TImportFile()
          ..uuid = Uuid().v4()
          ..path = file.absolute.path
          ..name = name
          ..type = type
          ..uploadProgress = -1
          ..size = _formatBytes(file.lengthSync(), 0);

        _lsFile.value.add(localFile);
        ImportFileDAO.insert(localFile);
        lsProgressSubject.addAll({
          localFile.uuid: ReplaySubject<int>()
            ..sink.add(localFile.uploadProgress)
        });

        _lsItemSelect.value.add(localFile.uuid);
      }

      _lsFile.sink.add(_lsFile.value);
      _hasInvalidFile.sink.add(hasInvalidFile);
      _handelSelectAllButton();
    } catch (e) {
      debugPrint('OpenFileExplorer: ${e.toString()}');
    }
  }

  changeStateSelectAll() {
    _activeSelectAll.sink.add(!_activeSelectAll.value);

    if (_activeSelectAll.value) {
      var lsItem = List<String>();
      _lsFile.value.where((v) => v.uploadProgress != 200).forEach((element) {
        lsItem.add(element.uuid);
      });

      _lsItemSelect.sink.add(lsItem);
      return;
    }

    _lsItemSelect.sink.add([]);
  }

  selectItem(TImportFile file) {
    _lsItemSelect.value.contains(file.uuid)
        ? _lsItemSelect.value.remove(file.uuid)
        : _lsItemSelect.value.add(file.uuid);

    _lsItemSelect.sink.add(_lsItemSelect.value);
    _handelSelectAllButton();
  }

  deleteFile(TImportFile file) {
    ImportFileDAO.delete(uuid: file.uuid);
    lsProgressSubject.removeWhere((key, value) => key == file.uuid);
    _lsFile.value.removeWhere((element) => element.uuid == file.uuid);
    _lsFile.sink.add(_lsFile.value);
    if (_lsItemSelect.value.contains(file.uuid))
      _lsItemSelect.value.remove(file.uuid);
    _handelSelectAllButton();
  }

  _handelSelectAllButton({bool isUploadAll = false}) {
    var totalFileNotUpload =
        _lsFile.value.where((event) => event.uploadProgress != 200);

    if (isUploadAll && totalFileNotUpload.isEmpty) {
      _activeSelectAll.sink.add(null);
      return;
    }

    if (totalFileNotUpload.isEmpty) {
      _activeSelectAll.sink.add(null);
      return;
    }

    if (_lsItemSelect.value.isNotEmpty &&
        totalFileNotUpload.length == _lsItemSelect.value.length) {
      _activeSelectAll.sink.add(true);
      return;
    }

    _activeSelectAll.sink.add(false);
  }

  String _formatBytes(int bytes, int decimals) {
    if (bytes <= 0) return '0 B';
    const suffixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = (log(bytes) / log(1024)).floor();
    return ((bytes / pow(1024, i)).toStringAsFixed(decimals)) +
        ' ' +
        suffixes[i];
  }

  Future<List<int>> uploadAll() async {
    var lsFile = _lsFile.value
        .where((element) => _lsItemSelect.value.contains(element.uuid));

    if (lsFile.isEmpty) {
      return Future.error('');
    }

    var lsFuture = List<Future<int>>();
    lsFile.forEach((element) {
      lsFuture.add(uploadFile(element));
    });

    var result = await Future.wait(lsFuture);
    var totalSuccess = result.where((element) => element == 200).length;
    var totalFail = result.where((element) => element != 200).length;
    _handelSelectAllButton(isUploadAll: true);
    return Future.value([totalSuccess, totalFail]);
  }

  Future<int> uploadFile(TImportFile file) async {
    ReplaySubject<int> stream = lsProgressSubject[file.uuid];

    if (stream == null) {
      stream = ReplaySubject<int>();
      lsProgressSubject.addAll({file.uuid: stream});
    }
    try {
      stream.sink.add(1);
      var formData = FormData.fromMap({
        'OrderScanning': jsonEncode(_createUploadObject().toJson()),
        'File': await MultipartFile.fromFile(file.path, filename: file.name),
      });

      final result = await appApiService.dio.post(
        '${appBaseUrl}ConvertImage/UploadImages',
        data: formData,
        onReceiveProgress: (count, total) {
          file.uploadProgress = 95;
          stream.sink.add(95);
        },
        onSendProgress: (count, total) {
          var progress = (count / total * 90).floor();
          file.uploadProgress = progress;
          stream.sink.add(progress);
        },
      );

      final response = UploadImageResponse.fromJson(result?.data);
      if (response?.item?.result?.isSuccess == true) {
        file.uploadProgress = 200;
        stream.sink.add(200);
        _lsItemSelect.value.remove(file.uuid);
        ImportFileDAO.delete(uuid: file.uuid);
        return Future.value(200);
      }

      file.uploadProgress = 500;
      stream.sink.add(500);
      return Future.value(500);
    } on DioError catch (_) {
      file.uploadProgress = 500;
      stream.sink.add(500);
      return Future.value(500);
    }
  }

  final dateFormat = DateFormat('yyyy-MM-dd HH:mm:ss.sss');

  OrderScanning _createUploadObject() {
    return OrderScanning(
        coordinatePageNr: 0,
        idRepScansContainerType: 1,
        idRepScanDeviceType: 2,
        customerNr: '1',
        mediaCode: '1',
        numberOfImages: 1,
        isSynced: true,
        sourceScanGuid: Uuid().v4(),
        isActive: '1',
        idDocumentTree: '',
        scannedDateUtc: dateFormat.format(DateTime.now()),
        isUserClicked: true,
        isSendToCapture: '1',
        idRepScansDocumentType: 1);
  }
}
