import 'package:intl/intl.dart';
import 'package:xoonit/app/constants/constants_value.dart';
import 'package:xoonit/app/model/local/document/document_dao.dart';
import 'package:xoonit/app/model/local/document/document_table.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

import '../../../difinition.dart';

class ScanBloc extends BlocBase {

  @override
  void dispose() {}

  handleScanImages(List<String> value) {
    printLog('IMAGE PATH: ' + value.toString() ?? '');
    value.forEach((imagePath) {
      _saveDocumentToLocal(imagePath);
    });
  }

  void _saveDocumentToLocal(String imagePath) {
    if (imagePath != null && imagePath != '') {
      List<String> imagePathSplit = imagePath.split('/');
      String imageName = imagePathSplit.last;
      String path = imagePath.substring(0, imagePath.lastIndexOf('/'));
      final dateFormat = new DateFormat('yyyy-MM-dd HH:mm:ss.sss');
      final dateFormatInImage = new DateFormat('MM-dd-yyyy HH:mm:ss');
      String createDate = dateFormat.format(new DateTime.now());
      String timeUTC = dateFormat.format(DateTime.now().toUtc());

      TDocument document = TDocument(
          imagePath: imagePath,
          lotName: '-LOT-${DateTime.now().toString()}' +
              '-Mobile-${ConstantValues.defaultUserCompany}' +
              '-${XoonitApplication.instance.getUserInfor().userName ?? ''}',
          name: imageName,
          createDate: createDate,
          dateInImage: createDate,
          clientOpenDateUTC: timeUTC);
      DocumentDAO.insert(document);
    }
  }
}
