import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/constants/styles.dart';
import 'package:caminada/app/difinition.dart';
import 'package:caminada/app/model/remote/document_tree_response.dart';
import 'package:caminada/app/model/remote/filter_users_response.dart';
import 'package:caminada/app/ui/screen/history/history_bloc.dart';
import 'package:caminada/app/utils/caminada_application.dart';
import 'package:caminada/core/ultils.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import 'custom_search_user_company_byroles.dart';

class HistoryFillter extends StatefulWidget {
  HistoryBloc historyBloc;
  HistoryFillter({this.historyBloc});

  @override
  _HistoryFillterState createState() => _HistoryFillterState();
}

class _HistoryFillterState extends State<HistoryFillter> {
  DocumentTreeItem defaultValue;
  List<DocumentTreeItem> docName = []; //

    DateTime selectedDate = DateTime.now();
    DateTime _formDate;
    DateTime _toDate;
  @override
  void initState() {
    super.initState();
    CaminadaApplication.instance.documentTreeItemList.forEach((element) {
      docName.add(element);
    });
  }

  @override
  Widget build(BuildContext context) {
    // HistoryBloc historyBloc = BlocProvider.of(context);
    _selectDate(BuildContext context, bool fromDate) {
      showDatePicker(
              context: context,
              initialDate: fromDate == true
                  ? _formDate ?? selectedDate
                  : _toDate ?? selectedDate,
              firstDate: fromDate ? DateTime(1850) : widget.historyBloc.isformDate,
              lastDate: fromDate ? DateTime.now() : DateTime(2200))
          .then((value) {
        if (value != null) {
          fromDate == true ? _formDate = value : _toDate = value;
          widget.historyBloc.selectDateTime(fromDate, value);
          widget.historyBloc.setSelectFromDateClicked(true);
        }
      });
    }

    return DraggableScrollableActuator(
        child: DraggableScrollableSheet(
            initialChildSize: 1,
            maxChildSize: 1,
            minChildSize: 0.2,
            builder: (BuildContext context, ScrollController scrollController) {
              return Container(
                width: Dimension.getHeight(1),
                height: Dimension.getHeight(1),
                decoration: BoxDecoration(
                    color: MyColors.primaryColor,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(30.0),
                      topRight: Radius.circular(30.0),
                    )),
                child: Column(
                  children: <Widget>[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: <Widget>[
                        Container(
                          child: FlatButton(
                              onPressed: () {
                                Navigator.of(context).pop();
                              },
                              child: Text("Cancel",
                                  style: MyStyleText.white16Medium)),
                        ),
                        Container(
                            child: Text("Fillter",
                                style: MyStyleText.white16Medium)),
                        Container(
                          child: FlatButton(
                              onPressed: () {
                                FocusScope.of(context)
                                    .requestFocus(new FocusNode());
                                widget.historyBloc.resetFillter();
                              },
                              child: Text("Reset",
                                  style: MyStyleText.white16Medium)),
                        )
                      ],
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () {
                          FocusScope.of(context).requestFocus(new FocusNode());
                        },
                        child: Container(
                          alignment: Alignment.topLeft,
                          color: MyColors.whiteColor,
                          child: Stack(
                            children: <Widget>[
                              Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: <Widget>[
                                    Container(
                                      padding:
                                          EdgeInsets.only(top: 22, left: 24),
                                      child: Text(
                                        "From",
                                        style: MyStyleText.grey12Regular,
                                        textAlign: TextAlign.start,
                                      ),
                                    ),
                                    GestureDetector(
                                      onTap: () {
                                        _selectDate(context, true);
                                      },
                                      child: Container(
                                        margin: EdgeInsets.only(
                                          left: 24,
                                          right: 30,
                                        ),
                                        padding: EdgeInsets.only(
                                            top: 8,
                                            left: 24,
                                            right: 10,
                                            bottom: 8),
                                        color: MyColors.backgroundDatepicker,
                                        child: Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          mainAxisSize: MainAxisSize.max,
                                          children: <Widget>[
                                            StreamBuilder<DateTime>(
                                                stream: widget
                                                    .historyBloc.idfromDate,
                                                builder: (context, fromDate) {
                                                  return Container(
                                                    child: Text(fromDate.data !=
                                                            null
                                                        ? DateFormat(
                                                                "dd.MM.yyyy")
                                                            .format(
                                                                fromDate.data)
                                                        : ' '),
                                                  );
                                                }),
                                            Icon(Icons.calendar_today)
                                          ],
                                        ),
                                      ),
                                    ),
                                    Container(
                                      padding:
                                          EdgeInsets.only(top: 20, left: 24),
                                      child: Text(
                                        "To",
                                        style: MyStyleText.grey12Regular,
                                      ),
                                    ),
                                    StreamBuilder<bool>(
                                        stream: widget
                                            .historyBloc.isFromDateActived,
                                        initialData: false,
                                        builder: (context, isFromDateActived) {
                                          return GestureDetector(
                                            onTap: () {
                                              if (widget
                                                      .historyBloc.isformDate !=
                                                  null) {
                                                _selectDate(context, false);
                                              }
                                            },
                                            child: Container(
                                              margin: EdgeInsets.only(
                                                left: 24,
                                                right: 30,
                                              ),
                                              padding: EdgeInsets.only(
                                                  top: 8,
                                                  left: 24,
                                                  bottom: 8,
                                                  right: 10),
                                              color: isFromDateActived.data
                                                  ? MyColors
                                                      .backgroundDatepicker
                                                  : MyColors.backgroundDisable,
                                              child: Row(
                                                mainAxisAlignment:
                                                    MainAxisAlignment
                                                        .spaceBetween,
                                                mainAxisSize: MainAxisSize.max,
                                                children: <Widget>[
                                                  StreamBuilder<DateTime>(
                                                      stream: widget
                                                          .historyBloc.idtoDate,
                                                      builder:
                                                          (context, toDate) {
                                                        return Text(toDate
                                                                    .data !=
                                                                null
                                                            ? DateFormat(
                                                                    "dd.MM.yyyy")
                                                                .format(
                                                                    toDate.data)
                                                            : ' ');
                                                      }),
                                                  Icon(Icons.calendar_today)
                                                ],
                                              ),
                                            ),
                                          );
                                        }),
                                    // Filter user for Main Admin ̃and Custom Admin
                                    CustomFilterUserComponent(
                                        historyBloc: widget.historyBloc),
                                    Container(
                                      padding:
                                          EdgeInsets.only(top: 20, left: 24),
                                      child: Text(
                                        "Categories",
                                        style: MyStyleText.grey12Regular,
                                      ),
                                    ),
                                    Container(
                                      margin: EdgeInsets.only(
                                          left: 24, right: 30, top: 5),
                                      padding:
                                          EdgeInsets.only(left: 24, right: 10),
                                      color: MyColors.backgroundDatepicker,
                                      child: StreamBuilder<DocumentTreeItem>(
                                          stream:
                                              widget.historyBloc.idDocumentItem,
                                          builder: (context, documentItem) {
                                            return DropdownButtonHideUnderline(
                                                child: DropdownButton(
                                              hint: Text('Select Categories'),
                                              isExpanded: true,
                                              value: documentItem.data,
                                              dropdownColor:
                                                  MyColors.whiteColor,
                                              style: MyStyleText.white16Medium,
                                              iconDisabledColor:
                                                  MyColors.blackColor,
                                              iconEnabledColor:
                                                  MyColors.blackColor,
                                              onChanged: (DocumentTreeItem
                                                  documentTreeItem) {
                                                widget.historyBloc
                                                    .getIdDocument(
                                                        documentTreeItem);
                                              },
                                              items: docName.map(
                                                  (DocumentTreeItem value) {
                                                return DropdownMenuItem<
                                                    DocumentTreeItem>(
                                                  value: value,
                                                  child: Text(
                                                    value.data.groupName,
                                                    style: MyStyleText
                                                        .black14Regular,
                                                  ),
                                                );
                                              }).toList(),
                                            ));
                                          }),
                                    )
                                  ]),
                              Positioned(
                                bottom: 0,
                                child: Container(
                                  width: Dimension.getWidth(1),
                                  height: 50,
                                  child: RaisedButton(
                                    color: MyColors.backgroundColorButton,
                                    onPressed: () {
                                      widget.historyBloc.filter();
                                      Navigator.of(context).pop();
                                    },
                                    child: Text(
                                      'APPLY',
                                      style: MyStyleText.white16Medium,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    )
                  ],
                ),
              );
            }));
  }
}
