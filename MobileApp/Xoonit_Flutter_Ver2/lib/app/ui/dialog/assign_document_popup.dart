import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/remote/document_tree_response.dart';
import 'package:xoonit/app/ui/screen/dash_board/drawer/structure_tree_item.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/ultils.dart';

class SelectDocumentTreeDialog extends StatefulWidget {
  final DocumentTreeItem folderSelected;
  final bool isCreateFolder;
  final String titleDialog;
  SelectDocumentTreeDialog({
    Key key,
    this.folderSelected,
    this.isCreateFolder = false,
    @required this.titleDialog,
  }) : super(key: key);

  @override
  _SelectDocumentTreeDialogState createState() =>
      _SelectDocumentTreeDialogState();
}

class _SelectDocumentTreeDialogState extends State<SelectDocumentTreeDialog> {
  List<DocumentTreeItem> listFolderTree = List();
  DocumentTreeItem selectedFolder;
  bool isSelectDocument;
  String folderPath;
  @override
  void initState() {
    super.initState();
    selectedFolder = widget.folderSelected;
    if (!widget.isCreateFolder) {
      listFolderTree = XoonitApplication.instance.documentTreeItemList;
    } else {
      DocumentTreeItem _rootTree = DocumentTreeItem(
          children: XoonitApplication.instance.documentTreeItemList,
          isMainFolder: true,
          data: Data(
            groupName: 'Root',
            sortingIndex: 1,
          ));
      listFolderTree.add(_rootTree);
    }
    isSelectDocument = widget.folderSelected != null ? true : false;
  }

  @override
  Widget build(BuildContext _context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(
          Radius.circular(10),
        ),
      ),
      content: Container(
        width: Dimension.getWidth(0.8),
        child: Column(
          children: <Widget>[
            Container(
              padding: EdgeInsets.all(4),
              child: Text(
                widget.titleDialog,
                style: MyStyleText.blueDarkColor16Medium,
                textAlign: TextAlign.center,
              ),
            ),
            Divider(
              color: MyColors.greyColor,
            ),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children:
                        List<Widget>.generate(listFolderTree.length, (index) {
                      return Container(
                        child: StructureTreeItem(
                          folderPath: listFolderTree[index].data.groupName,
                          folderSelectedToAssign: selectedFolder,
                          folder: listFolderTree[index],
                          isShowAll: true,
                          isShowFileCount: false,
                          onItemClick: (DocumentTreeItem docItem) {
                            setState(() {
                              isSelectDocument = true;
                              selectedFolder = docItem;
                            });
                          },
                        ),
                      );
                    })),
              ),
            ),
          ],
        ),
      ),
      actions: <Widget>[
        FlatButton(
            child: Text('Cancel'),
            onPressed: () {
              Navigator.of(_context).pop();
            }),
        FlatButton(
            child: Text(
              'OK',
              style: isSelectDocument
                  ? MyStyleText.blueLightColor14Medium
                  : MyStyleText.grey14Medium,
            ),
            onPressed: () {
              if (isSelectDocument) {
                Navigator.of(_context).pop(selectedFolder);
              }
            })
      ],
    );
  }
}
