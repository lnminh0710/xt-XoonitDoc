import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/document_capture_group.dart';
import 'package:xoonit/app/ui/screen/capture/capture_bloc.dart';
import 'package:xoonit/app/ui/screen/capture/capture_widgets/custom_item_list_capture.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

import '../../../difinition.dart';

class CaptureScreen extends StatefulWidget {
  @override
  _RenderScreenCaptureState createState() => _RenderScreenCaptureState();
}

class _RenderScreenCaptureState extends State<CaptureScreen> {
  @override
  Widget build(BuildContext context) {
    CaptureBloc captureBloc = BlocProvider.of(context);
    return Stack(
      children: <Widget>[
        StreamBuilder<List<DocumentCaptureGroup>>(
            stream: captureBloc.captureList,
            initialData: null,
            builder: (context, snapShot) {
              if (snapShot.hasData) {
                return StreamBuilder<bool>(
                  stream: captureBloc.selectedMode,
                  initialData: false,
                  builder: (context, isSelectedMode) {
                    return Column(
                      children: <Widget>[
                        isSelectedMode.data
                            ? Container(
                                padding: EdgeInsets.only(
                                    top: 8, bottom: 8, right: 8),
                                alignment: Alignment.centerRight,
                                child: GestureDetector(
                                  onTap: () {
                                    captureBloc.setSelectedMode(false);
                                  },
                                  child: Text(
                                    'Cancel',
                                    style: MyStyleText.white14Regular,
                                  ),
                                ),
                              )
                            : Container(),
                        Expanded(
                          child: SingleChildScrollView(
                            padding: EdgeInsets.only(
                                left: 8, right: 8, top: 8, bottom: 8),
                            child: Wrap(
                              alignment: WrapAlignment.start,
                              spacing: 8,
                              runSpacing: 8,
                              children: List<Widget>.generate(
                                  snapShot?.data?.length, (int index) {
                                DocumentCaptureGroup captureItem =
                                    snapShot?.data[index];
                                return CustomItemGridCapture(
                                  captureItem: captureItem.listDocumentCapture[0],
                                  isSelected: captureItem.isSelected,
                                  isShowSelectedMode: isSelectedMode.data,
                                  onItemClick: () {
                                    isSelectedMode.data
                                        ? captureBloc
                                            .changeDocumentStatus(index)
                                        : captureBloc.reviewCapture(
                                            context, index);
                                  },
                                  onItemLongClick: () {
                                    captureBloc.setSelectedMode(true);
                                  },
                                  onDeletePressed: () {
                                    captureBloc.onDeleteCapture(
                                        context,
                                        captureItem.idDocumentContainer);
                                  },
                                  onItemSelectedChange: (value) {
                                    captureBloc
                                        .setDocumentSelectedChangesStatus(
                                            index, value);
                                  },
                                );
                              }),
                            ),
                          ),
                        )
                      ],
                    );
                  },
                );
              } else {
                return Container();
              }
            }),
        StreamBuilder<AppState>(
            stream: captureBloc.screenState,
            initialData: AppState.Idle,
            builder: (context, snapShot) {
              if (snapShot.hasData && snapShot.data == AppState.Loading) {
                return Container(
                  color: Colors.black54,
                  width: Dimension.getWidth(1),
                  height: Dimension.getHeight(1),
                  child: Center(
                    child: CircularProgressIndicator(),
                  ),
                );
              } else {
                return Container();
              }
            })
      ],
    );
  }
}
