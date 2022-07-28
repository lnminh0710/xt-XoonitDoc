import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/remote/cloud/cloud_activies_response.dart';
import 'package:xoonit/app/model/remote/cloud/save_cloud_connection.dart';
import 'package:xoonit/app/ui/component/loading_checking_cloud_connection.dart';
import 'package:xoonit/app/ui/dialog/common_dialog_notification.dart';
import 'package:xoonit/app/ui/screen/cloud/widgets/cloud_connection/cloud_config_mode_dialog.dart';
import 'package:xoonit/app/ui/screen/cloud/widgets/cloud_connection/cloud_connection_bloc.dart';
import 'package:xoonit/app/ui/screen/cloud/widgets/cloud_connection/cloud_share_folder.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';

class CloudConnectionWidget extends StatelessWidget {
  CloudConnectionBloc _bloc;
  DashBoardBloc _boardBloc;
  BuildContext context;

  @override
  Widget build(BuildContext context) {
    SystemChrome.setEnabledSystemUIOverlays([]);
    this.context = context;
    _bloc = BlocProvider.of(context);
    _boardBloc = BlocProvider.of(context);
    _bloc.backStreamController.stream.listen((event) {
      _boardBloc.enableBackButton(event);
    });
    return Stack(alignment: Alignment.center, children: <Widget>[
      Container(
          color: Colors.white,
          width: double.infinity,
          height: double.infinity,
          padding: const EdgeInsets.all(16),
          child: NotificationListener<OverscrollIndicatorNotification>(
              onNotification: (notification) {
                notification.disallowGlow();
                return true;
              },
              child: StreamBuilder<List<CollectionData>>(
                  stream: _bloc.lsData,
                  builder: (_, snapshot) {
                    var lsData = snapshot?.data;
                    return lsData?.isNotEmpty == true
                        ? ListView.builder(
                            shrinkWrap: true,
                            itemCount: lsData.length,
                            itemBuilder: (_, index) {
                              return _item(
                                  ecloud: _getECloud(
                                      lsData[index].providerName.value),
                                  data: lsData[index]);
                            })
                        : SizedBox.shrink();
                  }))),
      StreamBuilder<AppState>(
          stream: _bloc.loadingState,
          builder: (_, snapshot) {
            return snapshot.data == AppState.Loading
                ? Container(
                    color: Colors.black.withAlpha(30), child: CustomLoading())
                : SizedBox.shrink();
          })
    ]);
  }

  _item({ECloud ecloud, CollectionData data}) {
    return Card(
        elevation: 0,
        color: Colors.blue[50],
        child: Container(
            padding: EdgeInsets.all(8),
            child: Row(children: <Widget>[
              Expanded(flex: 2, child: ecloud.image),
              Expanded(
                flex: 6,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      '${ecloud.name}',
                      style: MyStyleText.black16Bold,
                    ),
                    SizedBox(height: 8),
                    Text('${ecloud.description}',
                        style: MyStyleText.black12Regular)
                  ],
                ),
              ),
              Expanded(
                  flex: 2,
                  child: StreamBuilder<List<SaveCloudConnection>>(
                    stream: _bloc.lsCloudState,
                    initialData: [],
                    builder: (context, snapshot) {
                      if (snapshot?.data?.isEmpty == true)
                        return SizedBox.shrink();
                      var state = snapshot?.data?.firstWhere((element) =>
                          element.idCloudProviders ==
                          data?.idCloudProviders?.value);
                      return Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: <Widget>[
                            CupertinoSwitch(
                                onChanged: (value) {
                                  if (!value) {
                                    _bloc.saveState(state.idCloudProviders);
                                    return;
                                  }
                                  _handleActiveCloud(ecloud, data);
                                },
                                value: state?.isActive == true,
                                trackColor: Colors.grey,
                                activeColor: Colors.blue),
                            IconButton(
                                icon: Icon(Icons.more_horiz,
                                    color: state?.isActive == true
                                        ? Colors.black
                                        : Colors.transparent),
                                onPressed: state?.isActive == true
                                    ? () {
                                        _configModeDialog(ecloud, data);
                                      }
                                    : null)
                          ]);
                    },
                  ))
            ])));
  }

  ECloud _getECloud(String providerName) {
    return ECloud.values.firstWhere(
        (element) => element.value.toLowerCase() == providerName.toLowerCase(),
        orElse: () => ECloud.google_drive);
  }

  _handleActiveCloud(ECloud eCloud, CollectionData data) {
    _bloc.handleActiveCloud(data).then((value) {
      if (!value) _configModeDialog(eCloud, data);
    });
  }

  _handleAutomationMode(ECloud eCloud, CollectionData data) {
    switch (eCloud) {
      case ECloud.my_cloud:
        break;
      default:
        _bloc.getConnection(data.idCloudProviders.value).then((value) {
          eCloud == ECloud.google_drive
              ? _bloc
                  .handleGoogleDrive(data, value.item.myDmEmail)
                  .then((value) {
                  if (value?.isEmpty == false) _showDialogMess(value);
                })
              : _bloc.handleOneDrive(data, value.item.myDmEmail).then((value) {
                  if (value?.isEmpty == false) _showDialogMess(value);
                });
        });
    }
  }

  _handleManualMode(ECloud eCloud, CollectionData data) {
    showDialog(
      // barrierColor: Colors.white,
      context: context,
      barrierDismissible: false,
      builder: (_) {
        return CloudShareFolder(cloudType: eCloud, bloc: _bloc, data: data);
      },
    );
  }

  _showDialogMess(String mess) {
    showDialog(
      context: context,
      builder: (_) {
        return NotificationDialog(
          iconImages: Image.asset(Resources.icDialogWarning),
          message: mess,
          title: 'Notice!',
          possitiveButtonName: 'OK',
          possitiveButtonOnClick: (childContext) {
            Navigator.of(childContext).pop();
          },
        );
      },
    );
  }

  _configModeDialog(ECloud eCloud, CollectionData data) async {
    EConfigMode mode;
    showDialog(
      context: context,
      builder: (_context) {
        return CloudConfigModeDialog(eCloud: eCloud);
      },
    ).then((value) => mode = value).whenComplete(() {
      if (mode == null) return;
      if (mode == EConfigMode.auto) {
        _handleAutomationMode(eCloud, data);
        return;
      }

      _handleManualMode(eCloud, data);
    });
  }
}

enum ECloud { one_drive, google_drive, my_cloud }

extension ECloudExtension on ECloud {
  String get value {
    switch (this) {
      case ECloud.one_drive:
        return 'OneDrive';
      case ECloud.google_drive:
        return 'GoogleDrive';
      case ECloud.my_cloud:
        return 'MyCloud';
    }
  }

  String get name {
    switch (this) {
      case ECloud.one_drive:
        return 'One Drive';
      case ECloud.google_drive:
        return 'Google Drive';
      case ECloud.my_cloud:
        return 'My Cloud';
    }
  }

  String get description {
    switch (this) {
      case ECloud.one_drive:
        return 'Connect the application to manage OneDrive files and folders';
      case ECloud.google_drive:
        return 'Connect the project to sign in to the portal using a Google account and manage Google Drive files and folders';
      case ECloud.my_cloud:
        return 'Connect the application to manage MyCloud files and folders';
    }
  }

  Image get image {
    switch (this) {
      case ECloud.one_drive:
        return Image.asset(Resources.icOneDrive);
      case ECloud.google_drive:
        return Image.asset(Resources.icGoogleDrive);
      case ECloud.my_cloud:
        return Image.asset(Resources.icMyCloud);
    }
  }
}
