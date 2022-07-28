import 'dart:async';
import 'package:flutter/material.dart';
import 'package:xoontec_chat/signalr/chat/receive_event.dart';
import 'package:xoontec_chat/signalr/chat/send_event_enum.dart';
import '../../../signalr/chat/chat_services.dart';

class ChatScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container();
  }
}

// class ChatScreen extends StatefulWidget {
//   var lsMess = List<Message>();
//   var streamController = StreamController<List<Message>>();
//   final textController = TextEditingController();

//   ChatService chatService = ChatService(token: '', hubName: 'chathub');

//   StreamSubscription messageSub;

//   @override
//   _ChatScreenState createState() => _ChatScreenState();
// }

// class _ChatScreenState extends State<ChatScreen> {
//   @override
//   void initState() {
//     super.initState();
//     widget.messageSub = widget.chatService
//         .recevice(EReceiveEvent.ReceiveMessage)
//         .listen((event) {
//       print(event);
//       var s = event as Map<dynamic, dynamic>;
//       _receiveMess(Message.fromJson(s));
//     });
//   }

//   @override
//   void dispose() {
//     widget.streamController.close();
//     widget.textController.dispose();
//     widget.messageSub.cancel();
//     super.dispose();
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: GestureDetector(
//         onTap: () {
//           FocusScope.of(context).requestFocus(new FocusNode());
//         },
//         child: SafeArea(
//           child: Column(
//             children: [
//               Expanded(
//                   child: StreamBuilder(
//                 stream: widget.streamController.stream,
//                 initialData: [],
//                 builder: (context, snapshot) {
//                   return ListView.builder(
//                     padding: EdgeInsets.all(16),
//                     shrinkWrap: true,
//                     itemCount: widget.lsMess.length,
//                     reverse: true,
//                     itemBuilder: (context, index) {
//                       var mess = widget.lsMess[index];
//                       var alignment = mess.id != widget.chatService.connectionId
//                           ? Alignment.centerLeft
//                           : Alignment.centerRight;
//                       return FractionallySizedBox(
//                         alignment: alignment,
//                         widthFactor: 0.5,
//                         child: Row(
//                           mainAxisAlignment:
//                               mess.id != widget.chatService.connectionId
//                                   ? MainAxisAlignment.start
//                                   : MainAxisAlignment.end,
//                           children: [
//                             mess.id != widget.chatService.connectionId
//                                 ? CircleAvatar(
//                                     child: Text('${mess.id.toString()[0]}'))
//                                 : SizedBox.shrink(),
//                             Card(
//                               color: mess.id != widget.chatService.connectionId
//                                   ? Theme.of(context).colorScheme.secondary
//                                   : Theme.of(context).colorScheme.primary,
//                               child: Container(
//                                   alignment: alignment,
//                                   padding: EdgeInsets.all(8),
//                                   child: Text('${mess.message}')),
//                             ),
//                             mess.id == widget.chatService.connectionId
//                                 ? CircleAvatar(
//                                     child: Text(
//                                         '${widget.chatService.connectionId[0]}'))
//                                 : SizedBox.shrink(),
//                           ],
//                         ),
//                       );
//                     },
//                   );
//                 },
//               )),
//               Container(
//                 padding: EdgeInsets.all(8),
//                 child: Row(
//                   mainAxisSize: MainAxisSize.max,
//                   children: [
//                     Flexible(
//                       child: TextField(
//                         controller: widget.textController,
//                       ),
//                     ),
//                     IconButton(
//                       icon: Icon(Icons.send),
//                       onPressed: () {
//                         if (widget.textController.text.isEmpty) return;
//                         _sendMess(widget.chatService.connectionId,
//                             widget.textController.text);
//                         widget.textController.clear();
//                       },
//                     )
//                   ],
//                 ),
//               )
//             ],
//           ),
//         ),
//       ),
//     );
//   }

//   _sendMess(String id, String mess) {
//     var message = Message(id: id, message: mess);
//     widget.chatService.sendEvent(ESendEvent.SendMessage.name, message.toJson());
//   }

//   _receiveMess(Message message) {
//     widget.lsMess.insert(0, message);
//     widget.streamController.sink.add(widget.lsMess);
//   }
// }

// class Message {
//   Message({
//     this.id,
//     this.message,
//   });

//   String id;
//   String message;

//   factory Message.fromJson(Map<String, dynamic> json) => Message(
//         id: json["id"],
//         message: json["message"],
//       );

//   Map<String, dynamic> toJson() => {
//         "id": id,
//         "message": message,
//       };
// }
