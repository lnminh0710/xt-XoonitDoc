import 'dart:async';

import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/local/import_file/importfile_table.dart';

import '../../../../../../core/bloc_base.dart';
import '../../../../../constants/resources.dart';
import '../../import_bloc.dart';

class ImportItem extends StatelessWidget {
  final TImportFile file;
  final Stream<int> uploadProgress;
  ImportBloc _bloc;

  ImportItem({this.file, this.uploadProgress, Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    _bloc = BlocProvider.of(context);
    return StreamBuilder<int>(
      stream: uploadProgress,
      initialData: -1,
      builder: (context, snapshot) {
        switch (snapshot?.data ?? -1) {
          case -1:
            return _itemNormal();
            break;
          case 200:
            return _itemSuccess();
            break;
          case 500:
            return _itemFail();
            break;
          default:
            return _itemInProgress(snapshot?.data ?? 0);
        }
      },
    );
  }

  Widget _itemNormal() {
    return Dismissible(
      key: UniqueKey(),
      background: Container(
          margin: EdgeInsets.all(4),
          padding: EdgeInsets.fromLTRB(0, 0, 16, 0),
          alignment: Alignment.centerRight,
          color: Colors.red[900],
          child: Icon(Icons.delete, color: Colors.white)),
      onDismissed: (direction) {
        _bloc.deleteFile(file);
      },
      direction: DismissDirection.endToStart,
      child: ConstrainedBox(
        constraints: BoxConstraints(minHeight: 65),
        child: Card(
          elevation: 3,
          child: Row(
            children: <Widget>[
              StreamBuilder<List<String>>(
                initialData: [],
                stream: _bloc.lsItemSelect,
                builder: (context, snapshotSelect) {
                  return Expanded(
                      flex: 1,
                      child: Checkbox(
                        value: snapshotSelect.data.contains(file.uuid),
                        onChanged: (v) {
                          _bloc.selectItem(file);
                        },
                      ));
                },
              ),
              Expanded(flex: 1, child: icon(file.type)),
              Expanded(
                flex: 5,
                child: Column(
                  mainAxisSize: MainAxisSize.max,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      '${file.name}',
                      overflow: TextOverflow.ellipsis,
                      style: MyStyleText.black14Regular,
                      textAlign: TextAlign.left,
                    ),
                    SizedBox(height: 4),
                    Text('${file.size}', style: MyStyleText.grey12Regular),
                  ],
                ),
              ),
              Expanded(flex: 1, child: Container())
            ],
          ),
        ),
      ),
    );
  }

  Widget _itemSuccess() {
    return Dismissible(
      key: UniqueKey(),
      background: Container(
          margin: EdgeInsets.all(4),
          padding: EdgeInsets.fromLTRB(0, 0, 16, 0),
          alignment: Alignment.centerRight,
          color: Colors.red[900],
          child: Icon(Icons.delete, color: Colors.white)),
      onDismissed: (direction) {
        _bloc.deleteFile(file);
      },
      direction: DismissDirection.endToStart,
      child: ConstrainedBox(
        constraints: BoxConstraints(minHeight: 65),
        child: Card(
          elevation: 3,
          child: Row(
            children: <Widget>[
              Expanded(flex: 1, child: icon(file.type)),
              Expanded(
                flex: 5,
                child: Column(
                  mainAxisSize: MainAxisSize.max,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      '${file.name}',
                      overflow: TextOverflow.ellipsis,
                      style: MyStyleText.black14Regular,
                      textAlign: TextAlign.left,
                    ),
                    SizedBox(height: 4),
                    Text('${file.size}', style: MyStyleText.grey12Regular),
                  ],
                ),
              ),
              Expanded(
                  flex: 1, child: Image.asset(Resources.icImportUploadSuccess))
            ],
          ),
        ),
      ),
    );
  }

  Widget _itemInProgress(int progress) {
    return ConstrainedBox(
      constraints: BoxConstraints(minHeight: 65),
      child: Card(
        elevation: 3,
        child: Row(
          children: <Widget>[
            Expanded(
                flex: 1,
                child: Checkbox(
                  value: true,
                  onChanged: (v) {},
                )),
            Expanded(flex: 1, child: icon(file.type)),
            Expanded(
              flex: 5,
              child: Column(
                mainAxisSize: MainAxisSize.max,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    '${file.name}',
                    overflow: TextOverflow.ellipsis,
                    style: MyStyleText.black14Regular,
                    textAlign: TextAlign.left,
                  ),
                  SizedBox(height: 4),
                  Text('${file.size}', style: MyStyleText.grey12Regular),
                ],
              ),
            ),
            Expanded(
                flex: 1,
                child: Stack(
                  alignment: Alignment.center,
                  children: <Widget>[
                    CircularProgressIndicator(
                      backgroundColor: Colors.grey,
                      valueColor:
                          AlwaysStoppedAnimation<Color>(Colors.deepOrange[700]),
                    ),
                    Text('$progress%', style: MyStyleText.black12Medium),
                  ],
                ))
          ],
        ),
      ),
    );
  }

  Widget _itemFail() {
    return Dismissible(
      key: UniqueKey(),
      background: Container(
          margin: EdgeInsets.all(4),
          padding: EdgeInsets.fromLTRB(0, 0, 16, 0),
          alignment: Alignment.centerRight,
          color: Colors.red[900],
          child: Icon(Icons.delete, color: Colors.white)),
      onDismissed: (direction) {
        _bloc.deleteFile(file);
      },
      direction: DismissDirection.endToStart,
      child: ConstrainedBox(
        constraints: BoxConstraints(minHeight: 65),
        child: Card(
          elevation: 3,
          child: Row(
            children: <Widget>[
              Expanded(flex: 1, child: icon(file.type)),
              Expanded(
                flex: 5,
                child: Column(
                  mainAxisSize: MainAxisSize.max,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      '${file.name}',
                      overflow: TextOverflow.ellipsis,
                      style: MyStyleText.black14Regular,
                      textAlign: TextAlign.left,
                    ),
                    SizedBox(height: 4),
                    Text('${file.size}', style: MyStyleText.grey12Regular),
                  ],
                ),
              ),
              Expanded(
                  flex: 1, child: Image.asset(Resources.icImportUploadFail))
            ],
          ),
        ),
      ),
    );
  }

  Image icon(String type) {
    switch (type.toLowerCase()) {
      case 'png':
        return EImportFile.png.icon;
      case 'pdf':
      case 'tiff':
        return EImportFile.pdf.icon;
      default:
        return EImportFile.pdf.icon;
    }
  }
}

enum EImportFile { pdf, tiff, png }

extension EImportFileExtension on EImportFile {
  get name => '${this.runtimeType}';

  get icon {
    switch (this) {
      case EImportFile.pdf:
        return Image.asset(Resources.icImportPdfType);
      case EImportFile.tiff:
        return Image.asset(Resources.icImportPdfType);
      case EImportFile.png:
        return Image.asset(Resources.icImportImageType);
      default:
    }
  }
}
