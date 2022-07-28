import 'dart:convert';
import 'dart:io';

import 'package:retrofit/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:rxdart/rxdart.dart';
import 'package:uuid/uuid.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/local/import_file/import_file_dao.dart';
import 'package:xoonit/app/model/local/import_file/import_file_table.dart';
import 'package:xoonit/app/model/upload_image_request.dart';
import 'package:xoonit/app/model/upload_image_response.dart';
import 'package:xoonit/app/ui/component/appbar_top_component.dart';
import 'package:xoonit/core/bloc_base.dart';

enum Mode { normal, select }

class ImportBloc extends BlocBase implements AppBarSearchDelegate {
  final BehaviorSubject<Mode> _mode = BehaviorSubject<Mode>.seeded(Mode.normal);
  Stream<Mode> get mode => _mode.stream;

  final BehaviorSubject<List<TImportFile>> _lsFile =
      BehaviorSubject<List<TImportFile>>.seeded([]);
  Stream<List<TImportFile>> get lsFile => _lsFile.stream;

  final BehaviorSubject<List<int>> _lsSelectedIndex =
      BehaviorSubject<List<int>>.seeded([]);
  Stream<List<int>> get lsSelectedIndex => _lsSelectedIndex.stream;

  final BehaviorSubject<AppState> _screenState =
      BehaviorSubject<AppState>.seeded(AppState.Idle);

  Stream<AppState> get screenState => _screenState.stream;

  @override
  void dispose() {
    _mode.close();
    _lsFile.close();
    _lsSelectedIndex.close();
  }

  ImportBloc() {
    getData();
  }

  getData() {
    ImportFileDAO.getAll().then((value) {
      _lsFile.sink.add(value);
    });
  }

  openFileExplorer() async {
    try {

      List<File> files = await FilePicker.getMultiFile(
          type: FileType.custom, allowedExtensions: ["pdf", "tiff", "png"]);

      for (var file in files) {
        var name = file.path.split('/').last;
        var localFile = TImportFile();
        localFile.path = file.absolute.path;
        localFile.name = name;
        localFile.type = name.split('.').last;
        localFile.size = "";

        localFile.id = await ImportFileDAO.insert(localFile);
        _lsFile.value.add(localFile);
      }

      _lsFile.sink.add(_lsFile.value);
    } catch (e) {
      print(e);
    }
  }

  _changeMode() {
    _lsSelectedIndex.value.clear();
    if (_mode.value == Mode.normal) {
      _mode.sink.add(Mode.select);
      return;
    }

    _mode.sink.add(Mode.normal);
  }

  cancelSelectMode() {
    _lsSelectedIndex.value.clear();
    _mode.sink.add(Mode.normal);
  }

  select(int index) {
    _lsSelectedIndex.value.contains(index)
        ? _lsSelectedIndex.value.remove(index)
        : _lsSelectedIndex.value.add(index);
    _lsSelectedIndex.sink.add(_lsSelectedIndex.value);
  }

  _deleteFile(int id) {
    ImportFileDAO.deleteByID(id);
  }

  deleteMultiFile() {
    if (_mode.value == Mode.normal) {
      _changeMode();
      return;
    }

    _screenState.sink.add(AppState.Loading);
    _lsSelectedIndex.value.forEach((element) {
      var file = _lsFile.value[element];
      _deleteFile(file.id);
    });

    getData();
    cancelSelectMode();
    _screenState.sink.add(AppState.Idle);
  }

  uploadFile() async {
    if (_mode.value == Mode.normal) {
      _changeMode();
      return;
    }

    _screenState.sink.add(AppState.Loading);

    var lsFutureResponse = List<Future<HttpResponse<UploadImageResponse>>>();

    _lsSelectedIndex.value.forEach((element) {
      var file = _lsFile.value[element];
      var request = _createUploadObject(file);
      lsFutureResponse.add(
          appApiService.client.uploadImageWithHttpResponse(request.toJson()));
    });

    var lsReponse = await Future.wait(lsFutureResponse);

    lsReponse.forEach((element) {
      if (element.data?.item?.result?.isSuccess == true) {
        UploadImageRequest request = UploadImageRequest.fromJson(element.response.request.data as Map<String, dynamic>);
        request.images.forEach((image) {
          _deleteFile(image.idLocal);
        });
      }
    });

    getData();
    cancelSelectMode();
    _screenState.sink.add(AppState.Idle);
  }

  _createUploadObject(TImportFile flie) {

    File imgFile = File(flie.path);
    String base64 = base64Encode(imgFile.readAsBytesSync());
    List<ImageUpload> listImage = new List<ImageUpload>();

    listImage.add(ImageUpload(base64String: base64, fileName: flie.name, idLocal: flie.id));

    return UploadImageRequest(
        images: listImage,
        scanningLotItemData: ScanningLotItemData(
            coordinatePageNr: 0,
            idRepScansContainerType: 1,
            idRepScanDeviceType: 2,
            mediaCode: '1',
            numberOfImages: 1,
            sourceScanGuid: Uuid().v4(),
            isActive: '1',
            isUserClicked: true,
            idScansContainer: 0,
            idScansContainerItem: 0,
            lotId: 0));
  }

  @override
  onChangedValue(String str) {}

  @override
  onCompleted(String str) => null;
}

enum EImportFile { pdf, tiff, png }

extension EImportFileExtension on EImportFile {
  get name => "${this.toString()}";
  get icon {
    switch (this) {
      case EImportFile.pdf:
        return Image.asset(Resources.iconPdf);
      case EImportFile.tiff:
        return Image.asset(Resources.iconPdf);
      case EImportFile.png:
        return Image.asset(Resources.iconPicture);
      default:
    }
  }
}
