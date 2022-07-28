
import 'package:dio/dio.dart';
import 'package:retrofit/http.dart';
import 'package:xoontec_chat/models/request/response/login_response.dart';

part 'api_client.g.dart';

/// https://pub.dev/packages/retrofit
/// flutter pub run build_runner build

@RestApi(baseUrl: "")
abstract class APIClient {
  factory APIClient(Dio dio, {String baseUrl}) = _APIClient;


  @POST('/authenticate')
  Future<LoginResponse> login(@Body() Map<String, dynamic> loginRequest);

  // @POST('/authenticate')
  // Future<LoginResponse> login(@Body() Map<String, dynamic> loginRequest);


  // @GET(
  //     '/ElSearch/SearchByField?field=idDocumentTree&searchIndex=maindocument&keyword={documentID}&pageIndex={pageIndex}&pageSize={pageSize}')
  // Future<SearchDocumentResponse> searchDocumentInFolder(
  //     @Path("documentID") int documentID,
  //     @Path("pageIndex") int pageIndex,
  //     @Path("pageSize") int pageSize);

  
}
