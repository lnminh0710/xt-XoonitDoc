import 'dart:async';

import 'package:flutter/material.dart';
import 'package:xoontec_chat/signalr/chat/receive_event.dart';
import 'package:xoontec_chat/signalr/signalr_service.dart';

class ChatService extends SignalRService {
  ChatService(
      {String rootUrl = 'https://chatapi.xoontec.vn/',
      String hubName = 'chat',
      @required String token})
      : super(rootUrl, hubName, token);

  Stream recevice(EReceiveEvent event) => recevicedEvents[event.name].stream;

  sendEvent(String str, Object obj) {
    super.send(methodName: str, args: [obj]);
  }

  Map<String, StreamController> recevicedEvents = Map.fromEntries(EReceiveEvent
      .values
      .map((e) => MapEntry(e.name, StreamController.broadcast())));
}
