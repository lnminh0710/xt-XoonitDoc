class UserInfo {
  String accessToken;
  String refreshToken;
  int expiresIn;
  String userID;
  String nickName;
  String userName;
  String email;

  UserInfo(
      {this.accessToken,
      this.refreshToken,
      this.expiresIn,
      this.nickName,
      this.userName,
      this.userID,
      this.email});
}
