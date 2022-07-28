import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/remote/cloud/cloud_activies_response.dart';
import 'package:xoonit/app/model/remote/cloud/test_connection.dart';
import 'package:xoonit/app/ui/component/button_gradient.dart';
import 'package:xoonit/app/ui/component/loading_checking_cloud_connection.dart';
import 'package:xoonit/app/ui/dialog/common_dialog_notification.dart';
import 'package:xoonit/app/ui/screen/cloud/widgets/cloud_connection/cloud_connection_bloc.dart';
import 'package:xoonit/app/ui/screen/cloud/widgets/cloud_connection/cloud_webview.dart';

import '../../../../../difinition.dart';
import 'cloud_connection.dart';

class CloudShareFolder extends StatefulWidget {
  String title = 'Share Folder';
  BuildContext context;
  final ECloud cloudType;
  final CollectionData data;
  final CloudConnectionBloc bloc;
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _xoonitEmailCtrl =
      TextEditingController(text: '');
  final TextEditingController _userEmailCtrl = TextEditingController(text: '');
  final TextEditingController _folderShareCtrl =
      TextEditingController(text: '');
  final TextEditingController _linkShareCtrl = TextEditingController(text: '');

  CloudShareFolder({this.cloudType, this.data, this.bloc});

  @override
  _CloudShareFolderState createState() => _CloudShareFolderState();
}

class _CloudShareFolderState extends State<CloudShareFolder> {
  @override
  void dispose() {
    widget._xoonitEmailCtrl.dispose();
    widget._userEmailCtrl.dispose();
    widget._folderShareCtrl.dispose();
    widget._linkShareCtrl.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    widget.title =
        widget.cloudType == ECloud.my_cloud ? 'Login My Cloud' : 'Share Folder';
    widget.bloc.getConnection(widget.data.idCloudProviders.value).then((value) {
      widget._xoonitEmailCtrl.text = value?.item?.myDmEmail ?? '';
      widget._userEmailCtrl.text = value?.item?.userEmail ?? '';
      widget._folderShareCtrl.text =
          value?.item?.connection?.sharedFolder ?? '';
      widget._linkShareCtrl.text = value?.item?.connection?.sharedLink ?? '';
    });
    widget.bloc.resetTestConnection();
  }

  @override
  Widget build(BuildContext context) {
    widget.context = context;
    return Scaffold(
        appBar: AppBar(
          centerTitle: true,
          title: Text(widget.title, style: MyStyleText.blueDarkColor16Medium),
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.close),
            onPressed: () {
              Navigator.of(context).pop();
            },
          ),
        ),
        body: SafeArea(
          child: Stack(
            alignment: Alignment.center,
            children: [
              Form(
                key: widget._formKey,
                child: Container(
                  color: Colors.white,
                  padding: EdgeInsets.fromLTRB(24, 72, 24, 24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: <Widget>[
                      widget.cloudType == ECloud.my_cloud
                          ? _buildMyCloudWidget()
                          : _buildAnotherCloudWidget(),
                      StreamBuilder<TestConnectionResponse>(
                        stream: widget.bloc.testConnectionResult,
                        builder: (context, snapshot) {
                          var isSuccess = snapshot?.data?.item?.isSuccess;
                          return ButtonGradient(
                            title:
                                isSuccess == true ? 'DONE' : 'TEST CONNECTION',
                            onPressed: () {
                              FocusScope.of(context).unfocus();
                              if (isSuccess == true) {
                                widget.bloc.saveConnection(
                                    shareFolder: widget._folderShareCtrl.text,
                                    sharedLink: widget._linkShareCtrl.text,
                                    idCloudProviders:
                                        widget.data.idCloudProviders.value,
                                    userEmail: widget._userEmailCtrl.text);
                                Navigator.of(context).pop();
                                return;
                              }

                              if (!widget._formKey.currentState.validate()) {
                                return;
                              }

                              _showTestConnectionDialog(context);
                            },
                          );
                        },
                      )
                    ],
                  ),
                ),
              ),
              StreamBuilder<AppState>(
                  stream: widget.bloc.loadingState,
                  builder: (_, snapshot) {
                    return snapshot.data == AppState.Loading
                        ? CustomLoading()
                        : SizedBox.shrink();
                  })
            ],
          ),
        ));
  }

  _buildMyCloudWidget() {
    return Wrap(
      runSpacing: 16,
      children: [
        Text(
            'MyCloud do not support other applications to auto create folder in MyCloud.',
            style: MyStyleText.bluedarkColor16Regular),
        Text(
            'Please login your MyCloud account to create a folder for sharing with Xoonit.',
            style: MyStyleText.bluedarkColor16Regular),
        Wrap(children: <Widget>[
          Text(
            'Link shared with Xoonit',
            style: MyStyleText.grey12Regular,
          ),
          TextFormField(
              style: MyStyleText.bluedarkColor16Regular,
              validator: (value) {
                return value.isEmpty ? '' : null;
              },
              onChanged: (value) {
                widget.bloc.resetTestConnection();
              },
              controller: widget._linkShareCtrl,
              decoration: InputDecoration(
                  errorStyle: TextStyle(height: 0),
                  contentPadding:
                      const EdgeInsets.symmetric(vertical: 8, horizontal: 8)))
        ]),
        _buildOpenWebviewWidget()
      ],
    );
  }

  _buildAnotherCloudWidget() {
    return Wrap(
      runSpacing: 16,
      children: <Widget>[
        Wrap(runSpacing: 24, children: <Widget>[
          Wrap(
            runSpacing: 8,
            children: [
              Text(
                'Email of Xoonit',
                style: MyStyleText.grey12Regular,
              ),
              TextField(
                  style: MyStyleText.bluedarkColor16Regular,
                  readOnly: true,
                  controller: widget._xoonitEmailCtrl,
                  decoration: InputDecoration(
                      filled: true,
                      fillColor: MyColors.greyLowColor,
                      border: OutlineInputBorder(borderSide: BorderSide.none),
                      contentPadding: const EdgeInsets.symmetric(
                          vertical: 8, horizontal: 8))),
            ],
          ),
          Wrap(
            children: [
              Text('Your email on ${widget.cloudType.shortName}',
                  style: MyStyleText.grey12Regular),
              TextFormField(
                  style: MyStyleText.bluedarkColor16Regular,
                  validator: (value) {
                    return value.isEmpty ? '' : null;
                  },
                  onChanged: (value) {
                    widget.bloc.resetTestConnection();
                  },
                  controller: widget._userEmailCtrl,
                  decoration: InputDecoration(
                    errorStyle: TextStyle(height: 0),
                    contentPadding:
                        const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                  )),
            ],
          ),
          Wrap(children: <Widget>[
            Text(
              'Folder shared with Xoonit',
              style: MyStyleText.grey12Regular,
            ),
            TextFormField(
                style: MyStyleText.bluedarkColor16Regular,
                validator: (value) {
                  return value.isEmpty ? '' : null;
                },
                onChanged: (value) {
                  widget.bloc.resetTestConnection();
                },
                controller: widget._folderShareCtrl,
                decoration: InputDecoration(
                    errorStyle: TextStyle(height: 0),
                    contentPadding: const EdgeInsets.symmetric(
                        vertical: 8, horizontal: 8))),
          ]),
          _buildOpenWebviewWidget()
        ]),
      ],
    );
  }

  _buildOpenWebviewWidget() {
    return Align(
      alignment: Alignment.centerRight,
      child: FlatButton(
          highlightColor: Colors.transparent,
          child: Text('\u2192 Go to ${widget.cloudType.name}',
              style: MyStyleText.blueColor14Regular),
          onPressed: () {
            showDialog(
              // barrierColor: Colors.white,
              barrierDismissible: false,
              context: context,
              builder: (_) {
                return CloudWebView(cloud: widget.cloudType);
              },
            );
          }),
    );
  }

  _showTestConnectionDialog(BuildContext parentContext) {
    showDialog(
      context: parentContext,
      barrierDismissible: false,
      builder: (context) {
        widget.bloc.testConnection(TestConnectionRequest(
            userEmail: widget._userEmailCtrl.text.isEmpty
                ? null
                : widget._userEmailCtrl.text,
            sharedFolder: widget._folderShareCtrl.text.isEmpty
                ? null
                : widget._folderShareCtrl.text,
            cloudType: widget.data.providerName.value,
            sharedLink: widget._linkShareCtrl.text));

        return StreamBuilder<TestConnectionResponse>(
          stream: widget.bloc.testConnectionResult,
          builder: (context, snapshot) {
            var item = snapshot?.data?.item;
            return NotificationDialog(
              iconImages: SizedBox.shrink(),
              message: '',
              title: 'TEST CONNECTION',
              possitiveButtonName: 'OK',
              possitiveButtonOnClick: (childContext) {
                if (item?.isSuccess != null) Navigator.of(childContext).pop();
              },
              body: Column(mainAxisSize: MainAxisSize.min, children: <Widget>[
                Stack(
                  alignment: Alignment.center,
                  children: <Widget>[
                    if (item?.isSuccess == null)
                      AspectRatio(aspectRatio: 2 / 1, child: CustomLoading()),
                    if (item?.isSuccess == true)
                      Image.asset(
                        Resources.icTestConnectionSuccess,
                      ),
                    if (item?.isSuccess == false)
                      Image.asset(
                        Resources.icTestConnectionError,
                        color: Colors.red,
                      ),
                  ],
                ),
                if (item != null)
                  Wrap(
                    direction: Axis.vertical,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    spacing: 8,
                    children: <Widget>[
                      SizedBox(height: 16),
                      if (item?.isSuccess == true)
                        Text('Folder shared successfully'),
                      if (item?.isSuccess == false)
                        Text(
                          item.errorMessage,
                          maxLines: 3,
                          // overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
              ]),
            );
          },
        );
      },
    );
  }
}

extension ECloudExtension on ECloud {
  String get shortName {
    switch (this) {
      case ECloud.one_drive:
        return 'OneDrive';
      case ECloud.google_drive:
        return 'GoogleDrive';
      case ECloud.my_cloud:
        return 'MyCloud';
      // case ECloud.drop_box:
      //   return 'DropBox';
    }
  }
}
