import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/model/remote/document_tree_response.dart';
import 'package:caminada/app/ui/dialog/dialog_structure_tree/widgets/folder_item.dart';
import 'package:caminada/app/ui/dialog/dialog_structure_tree/widgets/root_folder_header.dart';
import 'package:caminada/app/ui/dialog/dialog_structure_tree/widgets/sub_folder_header.dart';
import 'package:caminada/app/utils/caminada_application.dart';
import 'package:caminada/core/ultils.dart';

class StructureTreeDialog extends StatefulWidget {
  StructureTreeDialog({
    Key key,
  }) : super(key: key);
  @override
  _StructureTreeDialogState createState() => _StructureTreeDialogState();
}

class _StructureTreeDialogState extends State<StructureTreeDialog> {
  bool isStructureTree = true;

  List<DocumentTreeItem> documentTreeStack = new List<DocumentTreeItem>();

  @override
  void initState() {
    DocumentTreeItem currentFolder = DocumentTreeItem(
        children: CaminadaApplication.instance.documentTreeItemList, root: 1);
    documentTreeStack.add(currentFolder);
    super.initState();
  }

  String getCurrenPath() {
    String path = '';
    documentTreeStack.forEach((document) {
      if (document.data != null && document.data.groupName != null) {
        path += document.data.groupName;
        if (document != documentTreeStack.last) {
          path += '/';
        }
      }
    });
    path = path.toUpperCase();
    return path;
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black54,
      child: Container(
        height: Dimension.getHeight(0.8),
        child: Column(
          children: <Widget>[
            Container(
                alignment: Alignment.centerRight,
                child: IconButton(
                    icon: Icon(
                      Icons.close,
                      color: MyColors.whiteColor,
                    ),
                    iconSize: 24,
                    onPressed: () {
                      Navigator.of(context).pop();
                    })),
            documentTreeStack.last.root == 1
                ? RootFolderHeader(
                    isStructureTree: isStructureTree,
                    onStructureSwitchChange: (value) {
                      setState(() {
                        isStructureTree = value;
                      });
                    },
                  )
                : SubFolderHeader(
                    title: getCurrenPath(),
                    onClosePressed: () {
                      Navigator.of(context).pop();
                    },
                    onBackPressed: () {
                      setState(() {
                        documentTreeStack.removeLast();
                      });
                    },
                  ),
            Expanded(
                child: SingleChildScrollView(
                    child: Column(
                        children: List<Widget>.generate(
                            documentTreeStack.last.children.length, (index) {
              return Container(
                  color: MyColors.blueDark2,
                  margin: EdgeInsets.only(left: 12, right: 12),
                  child: FolderItem(
                    openSubFolder: () {
                      setState(() {
                        documentTreeStack
                            .add(documentTreeStack.last.children[index]);
                      });
                    },
                    viewFileInfolder: (documentTreeItem) {
                      Navigator.of(context).pop(documentTreeItem);
                    },
                    documentTreeItem: documentTreeStack.last.children[index],
                  ));
            }))))
          ],
        ),
      ),
    );
  }
}
