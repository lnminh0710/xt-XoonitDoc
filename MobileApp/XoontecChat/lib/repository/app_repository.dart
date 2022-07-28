import 'package:xoontec_chat/repository/models/model_user_info.dart';
import 'package:xoontec_chat/signalr/chat/chat_services.dart';

class AppRepository {
  UserInfo userInfo;
  ChatService chatService;

  bool isUserLogin() {
    return false;
  }
}
