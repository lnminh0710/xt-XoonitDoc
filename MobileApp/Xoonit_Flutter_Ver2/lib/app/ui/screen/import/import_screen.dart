import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/local/import_file/importfile_table.dart';
import 'package:xoonit/app/ui/dialog/common_dialog_notification.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'dart:math' as math;

import 'import_bloc.dart';
import 'widget/item/import_item.dart';

class ImportScreen extends StatelessWidget {
  ImportBloc bloc;

  @override
  Widget build(BuildContext context) {
    bloc = BlocProvider.of(context);
    bloc.hasInvalidFile.listen((v) {
      if (v)
        showDialog(
            context: context,
            child: NotificationDialog(
              iconImages: Image.asset(Resources.icDialogWarning),
              title: "Notice!",
              message:
                  'You have just select unsupported files type. Support file types: png, pdf, tiff',
              possitiveButtonName: "OK",
              possitiveButtonOnClick: (BuildContext _context) {
                Navigator.pop(_context);
              },
            ));
    });

    return Container(
        margin: EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.max,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Expanded(
              flex: 2,
              child: CustomPaint(
                painter: DashRectPainter(),
                child: Wrap(
                  spacing: 8,
                  direction: Axis.vertical,
                  alignment: WrapAlignment.center,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  runAlignment: WrapAlignment.center,
                  children: <Widget>[
                    Image.asset(Resources.icImportFile),
                    ConstrainedBox(
                      constraints: const BoxConstraints(minHeight: 32),
                      child: RaisedButton(
                        color: Color(0xff0052CC),
                        child: Text('Choose File',
                            style: MyStyleText.white14Medium),
                        onPressed: () {
                          bloc.openFileExplorer();
                        },
                      ),
                    ),
                    Text('Support file types: png, pdf, tiff',
                        style: MyStyleText.grey12Regular),
                  ],
                ),
              ),
            ),
            StreamBuilder<List<TImportFile>>(
                stream: bloc.lsFile,
                initialData: [],
                builder: (context, snapshot) {
                  var ls = snapshot.data;
                  return ls.isNotEmpty == true
                      ? Row(
                          mainAxisSize: MainAxisSize.max,
                          children: [
                            Expanded(
                              child: StreamBuilder(
                                stream: bloc.activeSelectAll,
                                builder: (context, snapshot) {
                                  if (!snapshot.hasData)
                                    return SizedBox.shrink();

                                  return Wrap(
                                    crossAxisAlignment:
                                        WrapCrossAlignment.center,
                                    spacing: 8,
                                    children: [
                                      Checkbox(
                                        onChanged: (v) {
                                          bloc.changeStateSelectAll();
                                        },
                                        value: snapshot.data ?? false,
                                      ),
                                      Text('Select All')
                                    ],
                                  );
                                },
                              ),
                            ),
                            FlatButton(
                              child: Wrap(
                                spacing: 8,
                                children: [
                                  Text('Upload'),
                                  Image.asset(Resources.icImportUpload),
                                ],
                              ),
                              onPressed: () {
                                bloc.uploadAll().then((value) {
                                  showDialog(
                                      context: context,
                                      child: NotificationDialog(
                                        iconImages: Image.asset(
                                            Resources.icDialogWarning),
                                        title: "Notice!",
                                        message: "",
                                        body: _buildContentDialog(
                                            totalSuccess: value.first,
                                            totalFail: value.last),
                                        possitiveButtonName: "OK",
                                        possitiveButtonOnClick:
                                            (BuildContext _context) {
                                          Navigator.pop(_context);
                                        },
                                      ));
                                }).catchError((_) {});
                              },
                            ),
                          ],
                        )
                      : SizedBox.shrink();
                }),
            StreamBuilder<List<TImportFile>>(
              stream: bloc.lsFile,
              initialData: [],
              builder: (context, snapshot) {
                var ls = snapshot.data;
                return Expanded(
                    flex: ls.isNotEmpty == true ? 3 : 0,
                    child: ls.isNotEmpty
                        ? NotificationListener<OverscrollIndicatorNotification>(
                            onNotification: (notification) {
                              notification.disallowGlow();
                              return true;
                            },
                            child: ListView.builder(
                              shrinkWrap: true,
                              itemCount: ls.length,
                              itemBuilder: (context, index) {
                                return ImportItem(
                                    file: ls[index],
                                    uploadProgress:
                                        bloc.lsProgressSubject[ls[index].uuid]);
                              },
                            ),
                          )
                        : SizedBox.shrink());
              },
            ),
          ],
        ));
  }

  _buildContentDialog({int totalSuccess = 0, int totalFail = 0}) => Container(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: InputDecoration(
                  prefixText: '\u{2022}\t\t',
                  border: InputBorder.none,
                  prefixStyle: MyStyleText.blueColor14Regular),
              enabled: false,
              maxLines: 2,
              style: MyStyleText.blueColor14Regular,
              controller: TextEditingController(
                  text: '$totalSuccess document have been upload to server'),
            ),
            totalFail != 0
                ? TextField(
                    decoration: InputDecoration(
                        border: InputBorder.none,
                        prefixText: '\u{2022}\t\t',
                        prefixStyle: MyStyleText.redError14Regular),
                    enabled: false,
                    maxLines: 2,
                    controller: TextEditingController(
                        text: '$totalFail document failed'),
                    style: MyStyleText.redError14Regular,
                  )
                : SizedBox.shrink(),
          ],
        ),
      );
}

class DashRectPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    Paint dashedPaint = Paint()
      ..color = Color(0xff12548F)
      ..strokeWidth = 1
      ..style = PaintingStyle.stroke;

    double x = size.width;
    double y = size.height;

    Path _topPath = getDashedPath(
      a: math.Point(0, 0),
      b: math.Point(x, 0),
      gap: 3,
    );

    Path _rightPath = getDashedPath(
      a: math.Point(x, 0),
      b: math.Point(x, y),
      gap: 3,
    );

    Path _bottomPath = getDashedPath(
      a: math.Point(0, y),
      b: math.Point(x, y),
      gap: 3,
    );

    Path _leftPath = getDashedPath(
      a: math.Point(0, 0),
      b: math.Point(0.001, y),
      gap: 3,
    );

    canvas.drawPath(_topPath, dashedPaint);
    canvas.drawPath(_rightPath, dashedPaint);
    canvas.drawPath(_bottomPath, dashedPaint);
    canvas.drawPath(_leftPath, dashedPaint);
  }

  Path getDashedPath({
    @required math.Point<double> a,
    @required math.Point<double> b,
    @required gap,
  }) {
    Size size = Size(b.x - a.x, b.y - a.y);
    Path path = Path();
    path.moveTo(a.x, a.y);
    bool shouldDraw = true;
    math.Point currentPoint = math.Point(a.x, a.y);

    num radians = math.atan(size.height / size.width);

    num dx = math.cos(radians) * gap < 0
        ? math.cos(radians) * gap * 1
        : math.cos(radians) * gap;

    num dy = math.sin(radians) * gap < 0
        ? math.sin(radians) * gap * 1
        : math.sin(radians) * gap;

    while (currentPoint.x <= b.x && currentPoint.y <= b.y) {
      shouldDraw
          ? path.lineTo(currentPoint.x, currentPoint.y)
          : path.moveTo(currentPoint.x, currentPoint.y);
      shouldDraw = !shouldDraw;
      currentPoint = math.Point(
        currentPoint.x + dx,
        currentPoint.y + dy,
      );
    }
    return path;
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return true;
  }
}
