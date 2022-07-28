import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/dialog/common_dialog_notification.dart';
import 'package:xoonit/app/ui/screen/cloud/widgets/cloud_connection/cloud_connection.dart';

enum EConfigMode { auto, manual }

class CloudConfigModeDialog extends StatefulWidget {
  EConfigMode _configMode = EConfigMode.auto;
  final ECloud eCloud;
  CloudConfigModeDialog({this.eCloud});

  @override
  _CloudConfigModeDialogState createState() => _CloudConfigModeDialogState();
}

class _CloudConfigModeDialogState extends State<CloudConfigModeDialog> {
  @override
  void initState() {
    widget._configMode = widget.eCloud == ECloud.my_cloud
        ? EConfigMode.manual
        : EConfigMode.auto;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return NotificationDialog(
      iconImages: Image.asset(Resources.icDialogWarning),
      title: "Please choose setting mode.",
      message: '',
      body: Container(
          padding: EdgeInsets.fromLTRB(0, 24, 0, 16),
          child: Wrap(
            runSpacing: 16,
            children: [
              Row(children: <Widget>[
                Expanded(
                  flex: 1,
                  child: Radio(
                    value: EConfigMode.auto,
                    groupValue: widget._configMode,
                    onChanged: widget.eCloud == ECloud.my_cloud
                        ? null
                        : (value) {
                            setState(() {
                              widget._configMode = value;
                            });
                          },
                  ),
                ),
                Expanded(
                  flex: 4,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        'Automation',
                        style: widget.eCloud == ECloud.my_cloud
                            ? MyStyleText.grey16Regular
                            : MyStyleText.black16Medium,
                      ),
                      SizedBox(height: 4),
                      Text('Xoonit Applycation will auto create shared folder',
                          style: MyStyleText.grey12Regular)
                    ],
                  ),
                ),
              ]),
              Row(children: <Widget>[
                Expanded(
                  flex: 1,
                  child: Radio(
                    value: EConfigMode.manual,
                    groupValue: widget._configMode,
                    onChanged: (EConfigMode value) {
                      setState(() {
                        widget._configMode = value;
                      });
                    },
                  ),
                ),
                Expanded(
                  flex: 4,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        'Manual',
                        style: MyStyleText.black16Medium,
                      ),
                      SizedBox(height: 4),
                      Text('Manual Des', style: MyStyleText.grey12Regular)
                    ],
                  ),
                ),
              ]),
            ],
          )),
      possitiveButtonName: 'OK',
      possitiveButtonOnClick: (_) {
        Navigator.of(context).pop(widget._configMode);
      },
      negativeButtonName: 'Cancel',
      nagativeButtonOnCLick: (_) {
        Navigator.of(context).pop();
      },
    );
  }
}
