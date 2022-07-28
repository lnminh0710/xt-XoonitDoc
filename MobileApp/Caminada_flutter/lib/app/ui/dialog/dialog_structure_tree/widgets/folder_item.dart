import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/constants/styles.dart';
import 'package:caminada/app/difinition.dart';
import 'package:caminada/app/model/remote/document_tree_response.dart';
import 'package:caminada/app/ui/dialog/dialog_structure_tree/widgets/file_and_folder_count.dart';

class FolderItem extends StatelessWidget {
  final DocumentTreeItem documentTreeItem;
  final Function openSubFolder;
  final Function(DocumentTreeItem) viewFileInfolder;
  const FolderItem(
      {Key key,
      @required this.documentTreeItem,
      @required this.openSubFolder,
      @required this.viewFileInfolder})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        printLog('View file in folder pressed');
        viewFileInfolder(documentTreeItem);
      },
      child: Container(
        height: 60,
        margin: EdgeInsets.only(top: 4, bottom: 4),
        padding: EdgeInsets.only(top: 16, bottom: 16),
        color: MyColors.blueTreeItem,
        child: Row(
          mainAxisSize: MainAxisSize.max,
          children: <Widget>[
            documentTreeItem?.data?.idDocumentTreeParent == null
                ? Container(
                    margin: EdgeInsets.only(left: 12),
                    width: 28,
                    height: 28,
                    color: MyColors.greenColor,
                  )
                : Container(),
            Container(
              margin: EdgeInsets.only(left: 16),
              child: Text(
                documentTreeItem.data.groupName,
                style: MyStyleText.white14Bold,
              ),
            ),
            Expanded(child: Container()),
            Container(
              child: Row(
                children: <Widget>[
                  Container(
                    margin: EdgeInsets.only(
                        right: documentTreeItem.children != null &&
                                documentTreeItem.children.length > 0
                            ? 0
                            : 16),
                    child: FileAndFolderCount(
                        hasSubFolder: documentTreeItem.children != null &&
                            documentTreeItem.children.length > 0,
                        allFileCount: documentTreeItem.data.quantity,
                        fileParentCount: documentTreeItem.data.quantityParent),
                  ),
                  Container(
                      child: documentTreeItem.children != null &&
                              documentTreeItem.children.length > 0
                          ? GestureDetector(
                              onTap: () {
                                printLog('Open sub folder');
                                openSubFolder();
                              },
                              child: Container(
                                margin: EdgeInsets.only(left: 5, right: 10),
                                width: 30,
                                height: 40,
                                child: Icon(
                                  Icons.chevron_right,
                                  color: MyColors.greyButton,
                                  size: 30,
                                ),
                              ),
                            )
                          : Container()),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
