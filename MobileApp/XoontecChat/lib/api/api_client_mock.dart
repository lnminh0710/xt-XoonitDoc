import 'package:retrofit/http.dart';
import 'package:xoontec_chat/api/api_client.dart';
import 'package:xoontec_chat/models/request/response/login_response.dart';

class APIClientMock implements APIClient {
  @override
  Future<LoginResponse> login(@Body() Map<String, dynamic> loginRequest) {
    return null;
  }
}
