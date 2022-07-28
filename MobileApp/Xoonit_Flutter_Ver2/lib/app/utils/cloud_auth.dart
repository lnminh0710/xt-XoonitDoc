import 'package:flutter_appauth/flutter_appauth.dart';
import 'package:http/http.dart' as http;

class CloudAuth {
  static FlutterAppAuth _appAuth = FlutterAppAuth();

  static AuthorizationServiceConfiguration _googleServiceConfig =
      AuthorizationServiceConfiguration(
          'https://accounts.google.com/o/oauth2/v2/auth',
          'https://www.googleapis.com/oauth2/v4/token');

  static AuthorizationServiceConfiguration _onedriveServiceConfig =
      AuthorizationServiceConfiguration(
          'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize',
          'https://login.microsoftonline.com/consumers/oauth2/v2.0/token');

  static Future<AuthorizationTokenResponse> googleAuth() async {
    return _appAuth.authorizeAndExchangeCode(
      AuthorizationTokenRequest(
          '281028228126-21m3uiv3s4fdmr2io50a53os021rjuuo.apps.googleusercontent.com',
          'com.googleusercontent.apps.281028228126-21m3uiv3s4fdmr2io50a53os021rjuuo:/oauth2callback',
          serviceConfiguration: _googleServiceConfig,
          scopes: ['email', 'https://www.googleapis.com/auth/drive.file']),
    );
  }

  static Future<AuthorizationTokenResponse> onedriveAuth() async {
    return _appAuth.authorizeAndExchangeCode(
      AuthorizationTokenRequest('d5945bc9-4a43-47f6-9144-0d923050b38d',
          'msald5945bc9-4a43-47f6-9144-0d923050b38d://auth',
          promptValues: ['login'],
          serviceConfiguration: _onedriveServiceConfig,
          scopes: ['User.ReadWrite.All', 'Files.ReadWrite.All', 'openid']),
    );
  }
}

class CloudClient extends http.BaseClient {
  final Map<String, String> defaultHeaders;

  http.Client _httpClient = http.Client();

  CloudClient({this.defaultHeaders = const {}});

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) {
    request.headers.addAll(defaultHeaders);
    return _httpClient.send(request);
  }
}
