import 'package:caminada/app/difinition.dart';

class UserInfo {
  String accessToken;
  String refreshToken;
  int expiresIn;
  String userID;
  String nickName;
  String email;
  String userName;
  IdLoginRoles idLoginRoles;

  UserInfo(
      {this.accessToken,
      this.refreshToken,
      this.userName,
      this.expiresIn,
      this.nickName,
      this.email,
      this.userID,
      this.idLoginRoles});
}
