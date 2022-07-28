import 'dart:async';
import 'dart:developer';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:http/io_client.dart';
import 'package:signalr_core/signalr_core.dart';

abstract class SignalRService {
  final String _token;
  final String _hubName;
  final String _rootUrl;
  bool _hasBeenRegistered = false;
  bool _isRetry = false;

  HubConnection _hubConnection;
  HubConnectionState get stateConnection =>
      _hubConnection.state ?? HubConnectionState.disconnected;
  String get connectionId =>
      _hubConnection.connectionId ?? UniqueKey().toString();

  Map<String, StreamController<dynamic>> get recevicedEvents;
  List<Map<String, dynamic>> eventQueue = [];

  SignalRService(this._rootUrl, this._hubName, this._token) {
    _createConnection();
  }

  _createConnection() async {
    try {
      final url = "$_rootUrl$_hubName";
      _hubConnection = HubConnectionBuilder()
          .withUrl(
              url,
              HttpConnectionOptions(
                // logging: (level, message) => _log(message),
                accessTokenFactory: () => Future.value(_token),
                client: IOClient(
                    HttpClient()..badCertificateCallback = (cer, y, z) => true),
                transport: HttpTransportType.webSockets,
              ))
          .withAutomaticReconnect()
          .build();

      await _hubConnection.start();
      _onStartConnection();
      _hubConnection.onclose(_onClose);
      _hubConnection.onreconnected(_onReconnected);
      _hubConnection.onreconnecting(_onReconnecting);
      _hubConnection.keepAliveIntervalInMilliseconds = 500000;
    } catch (err) {
      log(err.toString(), name: 'SignalR', level: LogLevel.error.index);
      _tryReconnect();
    }
  }

  _onStartConnection() {
    _isRetry = false;
    _registerReceviceEvent();
    _log('onStartConnection: $stateConnection');
  }

  _onClose(dynamic err) async {
    _log('onClose: $err');
    await _tryReconnect();
  }

  _tryReconnect() async {
    if (_isRetry) return;
    try {
      _isRetry = true;
      await _hubConnection.start();
      _onStartConnection();
    } catch (err) {
      _log('onRetryConnect: $err');
      Future.delayed(Duration(seconds: 5)).then((value) => _tryReconnect());
    }
  }

  _onReconnected(String id) {
    _log('onReconnected: $id');
  }

  _onReconnecting(Exception exception) {
    _log('onReconnecting: $exception');
  }

  _log(String mess, {LogLevel level = LogLevel.information}) =>
      log(mess, name: 'SignalR', level: level.index);

  Future<dynamic> invoke({String methodName, List<dynamic> args}) {
    if (stateConnection == HubConnectionState.disconnected) {
      _tryReconnect();
      eventQueue.add({methodName: args});
      _log('onInvoke: $stateConnection \n $methodName -- $args');
      return Future.error('onInvokeMethod: $stateConnection');
    }

    return _hubConnection.invoke(methodName, args: args);
  }

  send({String methodName = "", dynamic args}) {
    if (stateConnection == HubConnectionState.disconnected) {
      _log('onSend: $stateConnection \n $methodName -- $args');
      _tryReconnect();
      eventQueue.add({methodName: args});
      return;
    }

    _log('onSend: $methodName -- $args');
    _hubConnection.send(methodName: methodName, args: args);
  }

  _registerReceviceEvent() {
    if (_hasBeenRegistered) return;

    _hasBeenRegistered = true;
    recevicedEvents?.forEach((key, value) {
      // _hubConnection.on(key, (arguments) => value.sink.add(arguments.first));
      _hubConnection.on(key, (arguments) => log('$arguments'));
    });
  }
}
