import 'dart:async';

import 'package:flutter/material.dart';

class RemoteConnection extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => _RemoteConnection();
}

class _RemoteConnection extends State<RemoteConnection> {
  final StreamController<ERemoteType> _chooseTypeCtrl = StreamController()
    ..sink.add(ERemoteType.sftp);
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(16),
      child: NotificationListener<OverscrollIndicatorNotification>(
        onNotification: (notification) {
          notification.disallowGlow();
          return true;
        },
        child: SingleChildScrollView(
          child: Wrap(
            runSpacing: 8,
            crossAxisAlignment: WrapCrossAlignment.start,
            children: <Widget>[
              Text('Type'),
              DropdownButtonFormField(
                decoration: InputDecoration(
                    contentPadding:
                        const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                    border: OutlineInputBorder()),
                onChanged: (value) {
                  _chooseTypeCtrl.sink.add(value);
                },
                items: ERemoteType.values
                    .map<DropdownMenuItem<ERemoteType>>((value) {
                  return DropdownMenuItem<ERemoteType>(
                    value: value,
                    child: Text(value.name),
                  );
                }).toList(),
              ),
              Text('Host'),
              TextField(
                  decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(
                          vertical: 8, horizontal: 8),
                      border: OutlineInputBorder())),
              Text('Port'),
              TextField(
                  decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(
                          vertical: 8, horizontal: 8),
                      border: OutlineInputBorder())),
              Text('Username'),
              TextField(
                  decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(
                          vertical: 8, horizontal: 8),
                      border: OutlineInputBorder())),
              Text('Password'),
              TextField(
                  decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(
                          vertical: 8, horizontal: 8),
                      border: OutlineInputBorder())),
              StreamBuilder<ERemoteType>(
                stream: _chooseTypeCtrl.stream,
                builder: (context, snapshot) {
                  return snapshot.data == ERemoteType.ftp
                      ? Wrap(
                          runSpacing: 8,
                          crossAxisAlignment: WrapCrossAlignment.start,
                          children: <Widget>[
                            Text('File Server'),
                            TextField(
                                decoration: InputDecoration(
                                    contentPadding: const EdgeInsets.symmetric(
                                        vertical: 8, horizontal: 8),
                                    border: OutlineInputBorder())),
                          ],
                        )
                      : SizedBox.shrink();
                },
              )
            ],
          ),
        ),
      ),
    );
  }
}

enum ERemoteType { sftp, ftp }

extension ERemoteTypeExtension on ERemoteType {
  get name {
    switch (this) {
      case ERemoteType.sftp:
        return 'SFTP';
      case ERemoteType.ftp:
        return 'FTP';
    }
  }
}
