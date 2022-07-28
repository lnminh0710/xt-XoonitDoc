class UserInfo {
  String accessToken;
  String refreshToken;
  int expiresIn;
  String userID;
  String nickName;
  String userName;
  String email;
  String idRepLanguage;
  String idApplicationOwner;
  String idCloudConnection;
  String idLogin;
  String avatarUrl;
  String firstName;
  String lastName;

  UserInfo(
      {this.accessToken,
      this.refreshToken,
      this.expiresIn,
      this.nickName,
      this.userName,
      this.userID,
      this.email,
      this.idApplicationOwner,
      this.idCloudConnection,
      this.idLogin,
      this.idRepLanguage,
      this.avatarUrl,
      this.firstName,
      this.lastName});
}
