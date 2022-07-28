import 'package:provider/provider.dart';
import 'package:xoontec_chat/app.dart';
import 'package:flutter/widgets.dart';
import 'package:xoontec_chat/difinition.dart';
import 'package:xoontec_chat/repository/app_repository.dart';
import 'package:xoontec_chat/signalr/chat/chat_services.dart';
import 'package:xoontec_chat/theme/theme_state.dart';

void main() {
  buildFlavor = BuildFlavor.development;

  switch (buildFlavor) {
    case BuildFlavor.mockDataOffline:
      printLog('===> MOCK data offline <===');
      break;
    case BuildFlavor.staging:
    case BuildFlavor.production:
      appBaseUrl = 'http://mydms.xoontec.vn/api/';
      break;
    case BuildFlavor.development:
    case BuildFlavor.devTeam:
      appBaseUrl = 'https://xoonit.xoontec.vn:445/api/';
      break;
    default:
      break;
  }
  appApiService.create();
  AppRepository appRepository = AppRepository();

  //temp
  appRepository.chatService = ChatService(
      hubName: 'chat',
      rootUrl: 'https://chatapi.xoontec.vn/',
      token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwdFozTDVPUW9NV0NZSFM1cGJmQXdQdXpPY25qTURocDFVQkNBRlZNUk85ZWNoN2FHNCt6YURRMmd3UDY5QjBBbWNKL2lZWFRRUVk2cVZKTGk0UWVvS0ZkZ0sxMlVtVXVSS0w4clZqUW5wME81dFBlNmJodC85ZTd3M2VtVTh2ajRWVno4aVZQVmdQaDRZdFRYL0kwQnkyODQyMmNMVUhmWStBRzl0RWZJQURJb2JBci9TSUFBOVVlQksvUWN4WjNwV2pSRFBjT0ZwYUxjaTlVQjI4YjRPR3g5UTF3L2hoNnNWT2EzejY3Umk0QVk2Vlc1Ulg1dENmSDNPVm5ZOFdHdkEvSGhhdDYiLCJqdGkiOiI3NjA2MDQ3Mi1lZWZhLTRmY2ItYTQwNS1hMTM3YzJmYTQ2MDciLCJpYXQiOjE1OTg5NTIwODcsImFwcGluZm8iOiJ7XCJOaWNrTmFtZVwiOm51bGwsXCJFbWFpbFwiOlwibmd1eWVuLmR1Yy5uZ3V5ZW5AeG9vbnRlYy5jb21cIixcIkZ1bGxOYW1lXCI6XCJOXCIsXCJMb2dpblBpY3R1cmVcIjpcInVzZXItZGVmYXVsdC5qcGdcIixcIkxhbmd1YWdlXCI6XCI5XCIsXCJMYW5ndWFnZUNvZGVcIjpcInZpXCIsXCJMb2dpbkxhbmd1YWdlXCI6bnVsbCxcIkN1bHR1cmVcIjpcImVuXCIsXCJJZEFwcGxpY2F0aW9uT3duZXJcIjpcIjFcIixcIlZhbGlkVG9cIjpudWxsLFwiTWVzc2FnZVwiOm51bGwsXCJNZXNzYWdlVHlwZVwiOm51bGwsXCJVc2VyR3VpZFwiOlwiNmM0NmRmMjAtN2UzOS00ZjRhLTk5ZjMtMGY0YzBmMjk0ZWYyXCIsXCJJZFJlcE9ubGluZVN0YXR1c1wiOlwiMVwiLFwiTG9naW5OYW1lXCI6XCJuZ3V5ZW4uZHVjLm5ndXllbkB4b29udGVjLmNvbVwiLFwiUGFzc3dvcmRcIjpudWxsLFwiTmV3UGFzc3dvcmRcIjpudWxsLFwiSWRMb2dpblwiOlwiMjhcIixcIklzRW5jcnlwdFwiOmZhbHNlLFwiSXNFeHRlcmFsTG9naW5cIjpmYWxzZX0iLCJJZExvZ2luIjoiMjgiLCJuYmYiOjE1OTg5NTIwODcsImV4cCI6MTYwMTU0NDA4NywiaXNzIjoiWG9vbml0Q2hhdFRva2VuU2VydmVyIiwiYXVkIjoiYXBpIn0.iSAQg1HvQx6rMJKtVwTmx-Yfna3vEUv_2xdnoecDIOk');
  //
  runApp(ChangeNotifierProvider<ThemeState>(
    create: (context) => ThemeState(),
    child: App(
      appRepository: appRepository,
    ),
  ));
}
