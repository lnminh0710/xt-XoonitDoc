import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/remote/document_tree_response.dart';
import 'package:xoonit/app/ui/dialog/dialog_structure_tree/widgets/file_and_folder_count.dart';

class StructureTreeItem extends StatefulWidget {
  StructureTreeItem(
      {Key key,
      this.isShowAll = true,
      @required this.folder,
      @required this.onItemClick,
      this.dotColorOpacity = 1,
      this.isShowFileCount = true,
      this.folderSelectedToAssign,
      @required this.folderPath})
      : super(key: key);

  final DocumentTreeItem folderSelectedToAssign;
  final bool isShowAll;
  final DocumentTreeItem folder;
  final Function(DocumentTreeItem) onItemClick;
  final double dotColorOpacity;
  final String folderPath;
  final bool isShowFileCount;
  @override
  _StructureTreeItemState createState() => _StructureTreeItemState();
}

class _StructureTreeItemState extends State<StructureTreeItem> {
  bool _isShowAll;
  String _folderPath;
  @override
  void initState() {
    super.initState();
    _isShowAll = widget.isShowAll;
    _folderPath = widget.folderPath;
  }

  @override
  void didUpdateWidget(StructureTreeItem oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget != widget) {
      if (widget.folderSelectedToAssign == null) {
        setState(() {
          _isShowAll = widget.isShowAll;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
        child: Column(
      children: <Widget>[
        GestureDetector(
          onTap: () {
            widget.folder.data.folderPath = widget.folderPath;
            widget.onItemClick(widget.folder);
          },
          child: Container(
            color: Colors.transparent,
            padding: const EdgeInsets.symmetric(vertical: 4),
            child: Row(
              children: <Widget>[
                widget.folder.isMainFolder
                    ? Container()
                    : Container(
                        margin: EdgeInsets.only(right: 6),
                        child: CircleAvatar(
                            maxRadius: 3,
                            minRadius: 2,
                            backgroundColor: MyColors.blueColor
                                .withOpacity(widget.dotColorOpacity),
                            child: Container(
                              width: 1,
                              height: 1,
                            )),
                      ),
                Expanded(
                  child: Container(
                    padding: widget.folderSelectedToAssign != null &&
                            widget.folderSelectedToAssign?.data
                                    ?.idDocumentTree ==
                                widget.folder.data.idDocumentTree
                        ? EdgeInsets.symmetric(horizontal: 6, vertical: 2)
                        : null,
                    decoration: widget.folderSelectedToAssign != null &&
                            widget.folderSelectedToAssign?.data
                                    ?.idDocumentTree ==
                                widget.folder.data.idDocumentTree
                        ? BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            color: Colors.lightBlue[300])
                        : null,
                    child: Text(
                      widget.folder.data.groupName,
                      style: widget.folder.isMainFolder
                          ? MyStyleText.black14Bold
                          : MyStyleText.black14Regular,
                      overflow: TextOverflow.ellipsis,
                      maxLines: 2,
                    ),
                  ),
                ),
                // Expanded(
                //   child: Container(),
                // ),
                widget.isShowFileCount
                    ? Container(
                        margin: EdgeInsets.only(
                            right: widget.folder.children != null &&
                                    widget.folder.children.length > 0
                                ? 0
                                : 16),
                        child: FileAndFolderCount(
                            hasSubFolder: widget.folder.children != null &&
                                widget.folder.children.length > 0,
                            allFileCount: widget.folder.data.quantity,
                            fileParentCount: widget.folder.data.quantityParent),
                      )
                    : Container(),
                widget.folder.children?.length != null &&
                        widget.folder.children.length > 0
                    ? GestureDetector(
                        child: Container(
                          padding: EdgeInsets.only(
                              right: 16, left: 8, top: 4, bottom: 4),
                          child: _isShowAll
                              ? Icon(Icons.keyboard_arrow_up)
                              : Icon(Icons.keyboard_arrow_down),
                        ),
                        onTap: () {
                          setState(() {
                            _isShowAll = !_isShowAll;
                          });
                        },
                      )
                    : Container(),
              ],
            ),
          ),
        ),
        Divider(
          color: MyColors.lightBlue,
        ),
        widget?.folder?.children?.length != null &&
                widget.folder.children.length > 0
            ? Visibility(
                visible: _isShowAll,
                child: Container(
                  padding: EdgeInsets.only(left: 24),
                  child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: List<Widget>.generate(
                          widget.folder.children.length, (index) {
                        return Container(
                          child: StructureTreeItem(
                            isShowFileCount: widget.isShowFileCount,
                            folderPath: _folderPath +
                                "/" +
                                widget.folder.children[index].data.groupName,
                            folder: widget.folder.children[index],
                            isShowAll: _isShowAll,
                            dotColorOpacity: widget.folder.isMainFolder
                                ? 1
                                : widget.dotColorOpacity * 0.5,
                            folderSelectedToAssign:
                                widget.folderSelectedToAssign,
                            onItemClick: (documentItem) {
                              widget.onItemClick(documentItem);
                            },
                          ),
                        );
                      })),
                ),
              )
            : Container(),
      ],
    ));
  }
}
