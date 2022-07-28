import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:xoonit/app/api/api_client.dart';
import 'package:xoonit/app/api/api_client_mock.dart';
import 'package:xoonit/app/app_state_bloc.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';

class AppApiService {

  final dio = Dio();
  APIClient client;
  ApiServiceHandler apiServiceHandler;

  void create() {
    if (buildFlavor == BuildFlavor.mockDataOffline) {
      client = APIClientMock();
    } else {
      client = APIClient(dio, baseUrl: appBaseUrl);
    }
// config your dio headers globally
    dio.options.headers["Content-Type"] = "application/json";
    dio.interceptors.add(InterceptorsWrapper(onRequest: (RequestOptions options) async {
      apiServiceHandler.onState(AppState.Loading);
      if (XoonitApplication.instance.isUserLogin()) {
        if (GeneralMethod.shouldRefreshToken()) {
          dio.lock();
          await GeneralMethod.refreshToken(
              XoonitApplication.instance.userInfo.refreshToken);
          dio.unlock();
        }
        String accessToken =
            XoonitApplication.instance.getUserInfor().accessToken;
        if (accessToken != null && accessToken != '') {
          options.headers["Authorization"] = "Bearer " + accessToken;
        }
      }
      printLog(
          "[AppApiService][${DateTime.now().toString().split(' ').last}]-> DioSTART\tonRequest \t${options.method} [${options.path}] ${options.contentType}  \t${options.baseUrl}");

      return options; //continue
    }, onResponse: (Response response) {
      apiServiceHandler.onState(AppState.Idle);
      printLog(
          "[AppApiService][${DateTime.now().toString().split(' ').last}]-> DioEND\tonResponse \t${response.statusCode} [${response.request.path}] ${response.request.method}  ${response.data.toString()} ");

      return response; // continue
    }, onError: (DioError error) async {
      apiServiceHandler.onState(AppState.Idle);
      // apiServiceHandler.onError(onError);

      printLog(
          "[AppApiService][${DateTime.now().toString().split(' ').last}]-> DioEND\tonError \turl:[${error.request.baseUrl}] type:${error.type} message: ${error.message}");

      if (error.response.statusCode == 401) {
        if (XoonitApplication.instance.getUserInfor().refreshToken != null &&
            XoonitApplication.instance.getUserInfor().refreshToken != '') {
          dio.interceptors.requestLock.lock();
          dio.interceptors.responseLock.lock();
          dio.lock();
          await GeneralMethod.refreshToken(
              XoonitApplication.instance.userInfo.refreshToken);
          dio.unlock();
          dio.interceptors.requestLock.unlock();
          dio.interceptors.responseLock.unlock();
          //Reissue a request to get data
          var request = error.response.request;
          return dio.request(request.path,
              data: request.data,
              queryParameters: request.queryParameters,
              cancelToken: request.cancelToken,
              options: request,
              onReceiveProgress: request.onReceiveProgress);
        }
      }
      return error;
      // handlError(error);
    }));
  }

  dynamic handlError(DioError error) async {
    // if (handlerEror == null) {
    //   return null;
    // }

    var result = ApiServerErrorData(
        type: ApiServerErrorType.UNKNOWN, message: error.message);

    switch (error.type) {
      case DioErrorType.RECEIVE_TIMEOUT:
      case DioErrorType.SEND_TIMEOUT:
      case DioErrorType.CONNECT_TIMEOUT:
        result.type = ApiServerErrorType.TIMED_OUT;
        break;
      case DioErrorType.RESPONSE:
        {
          printLog(
              "[AppApiService] _handleError DioErrorType.RESPONSE status code: ${error.response.statusCode}");
          result.statusCode = error.response.statusCode;

          if (result.statusCode == 401) {
            result.type = ApiServerErrorType.UNAUTHORIZED;
            if (XoonitApplication.instance.getUserInfor().refreshToken !=
                    null &&
                XoonitApplication.instance.getUserInfor().refreshToken != '') {
              dio.interceptors.requestLock.lock();
              dio.interceptors.responseLock.lock();
              dio.lock();
              await GeneralMethod.refreshToken(
                  XoonitApplication.instance.userInfo.refreshToken);
              dio.unlock();
              dio.interceptors.requestLock.unlock();
              dio.interceptors.responseLock.unlock();
              //Reissue a request to get data
              var request = error.response.request;
              return dio.request(request.path,
                  data: request.data,
                  queryParameters: request.queryParameters,
                  cancelToken: request.cancelToken,
                  options: request,
                  onReceiveProgress: request.onReceiveProgress);
            }
          }
          if (result.statusCode == 403) {
            //TODO: refresh token
          } else if (result.statusCode >= 500 && result.statusCode < 600) {
            result.type = ApiServerErrorType.HTTP_EXCEPTION;
          } else {
            result.type = ApiServerErrorType.HTTP_EXCEPTION;
            // result.message = getErrorMessage(error.response.data);
          }
          break;
        }
      case DioErrorType.CANCEL:
        break;
      case DioErrorType.DEFAULT:
        // TODO: Url not Server die or No Internet connection
        printLog(
            "[AppApiService] _handleError DioErrorType.DEFAULT status code: error.response is null -> Server die or No Internet connection");
        result.type = ApiServerErrorType.NO_INTERNET;

        if (error.message.contains('Unexpected character')) {
          result.type = ApiServerErrorType.SERVER_Unexpected_character;
        }
        break;
    }

    // return handlerEror.onError(result); //continue
  }

  String getErrorMessage(Map<String, dynamic> dataRes) {
    if (dataRes.containsKey("message") && dataRes["message"] != null) {
      return dataRes["message"]?.toString();
    }
    if (dataRes.containsKey("error") && dataRes["error"] != null) {
      return dataRes["error"]?.toString();
    }
    return dataRes.toString();
  }
}

enum ApiServerErrorType {
  NO_INTERNET,
  HTTP_EXCEPTION,
  TIMED_OUT,
  UNAUTHORIZED,
  UNKNOWN,
  SERVER_Unexpected_character
}

class ApiServerErrorData {
  ApiServerErrorType type;
  String message;
  int statusCode;

  ApiServerErrorData({this.type, this.statusCode, this.message});
}

abstract class ApiServiceHandler {
  onState(AppState state);
  onError(ApiServerErrorData onError);
}
