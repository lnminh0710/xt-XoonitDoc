import 'dart:io';

import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/cupertino.dart';
import 'package:http_parser/http_parser.dart';
import 'package:mime/mime.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/core/bloc_base.dart';

class EditProfileBloc extends BlocBase {
  @override
  void dispose() {}
  var allowedExtensions = ['png', 'jpeg', 'jpg'];

  Future<String> openGallery(BuildContext context) async {
    try {
      File file = await FilePicker.getFile(
        type: FileType.custom,
        allowedExtensions: allowedExtensions,
        allowCompression: false,
      );
      if (file == null) return '';

      var response = await updateAvatar(file);
      return response;
    } catch (e) {
      print(e);
      return '';
    }
  }

  Future<String> updateAvatar(File file) async {
    try {
      String url = '';

      FormData formData = FormData.fromMap({
        'file': MultipartFile.fromFileSync(file.path,
            contentType: MediaType.parse(lookupMimeType(file.path)),
            filename: file.path.split('/').last)
      });

      // upload file required header have Accept
      appApiService.dio.options.headers["Accept"] = "application/json ";

      var result = await appApiService.client.updateAvatar(formData);
      if (result.statusCode == 200 && result.item != null) {
        url = result.item.avatarUrl;
      }
      return url;
    } catch (e) {
      print(e);
      return '';
    }
  }
}
