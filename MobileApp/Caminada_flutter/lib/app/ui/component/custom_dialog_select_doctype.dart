import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/constants/styles.dart';
import 'package:caminada/app/model/remote/document_tree_response.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class DialogDocumentType extends StatelessWidget {
  final List<DocumentTreeItem> listDocumentTree;
  final Function(DocumentTreeItem) onChangeDocType;
  final int idDocumentValue;

  DialogDocumentType({
    Key key,
    @required this.listDocumentTree,
    this.onChangeDocType,
    this.idDocumentValue,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(10)),
      ),
      title: Column(
        children: <Widget>[
          Text(
            "Choose Document Type",
            style: MyStyleText.blue16Medium,
            textAlign: TextAlign.center,
          ),
          Container(
            margin: EdgeInsets.only(top: 15),
            height: 2,
            color: MyColors.colorHintTextSearch,
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
            children: List<Widget>.generate(
                listDocumentTree.length,
                (index) => LabelRadioButton(
                      docType: listDocumentTree[index],
                      onChangeDocType: onChangeDocType,
                    ))),
      ),
    );
  }
}

class LabelRadioButton extends StatefulWidget {
  final DocumentTreeItem docType;
  final Function(DocumentTreeItem) onChangeDocType;

  LabelRadioButton({
    Key key,
    this.docType,
    this.onChangeDocType,
  }) : super(key: key);

  @override
  State<StatefulWidget> createState() {
    return _LabelRadioButton();
  }
}

class _LabelRadioButton extends State<LabelRadioButton> {
  DocumentTreeItem docType;
  Function(DocumentTreeItem) onChangeDocType;
  bool isSelected = false;
  @override
  void initState() {
    super.initState();
    docType = widget.docType;
    onChangeDocType = widget.onChangeDocType;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: <Widget>[
          GestureDetector(
            onTap: () {
              setState(() {
                isSelected = true;
                onChangeDocType(docType);
                Navigator.of(context).pop();
              });
            },
            child: ListTile(
              title: Text(
                docType.data.groupName,
                style: MyStyleText.blue16Regular,
              ),
              // leading: Radio<int>(
              //   value: idDocumentValue,
              //   groupValue: idDocumentGroup,
              //   onChanged: (int value) {
              //     setState(() {
              //       idDocumentGroup = value;
              //       onChangeDocType(value);
              //     });
              //   },
              // ),
              leading: Icon(
                isSelected
                    ? Icons.radio_button_checked
                    : Icons.radio_button_unchecked,
                color: isSelected ? MyColors.blueLight : MyColors.greyColor,
              ),
            ),
          ),
          Container(
            margin: EdgeInsets.symmetric(horizontal: 8),
            height: 1,
            color: MyColors.colorHintTextSearch,
          ),
        ],
      ),
    );
  }
}
