package com.xoonit.camera.Database;

public class User {

    //region Variables
    private int IdLogin;
    private String LoginName;
    private String Password;
    private String UserCode;
    private String Company;
    private String Email;
    private String PathSetting;
    private String NickName;
    private String FirstName;
    private String LastName;
    //endregion

    //region Constructors
    public User(int idLogin, String loginName, String password, String company, String userCode) {
        IdLogin = idLogin;
        LoginName = loginName;
        Password = password;
        Company = company;
        UserCode = userCode;
    }

    public User() {}
    //endregion

    //region Properties
    public String getLoginName() {
        return LoginName;
    }

    public void setLoginName(String loginName) {
        LoginName = loginName;
    }

    public String getPassword() {
        return Password;
    }

    public void setPassword(String password) {
        Password = password;
    }

    public String getCompany() {
        return Company;
    }

    public void setCompany(String company) {
        Company = company;
    }

    public String getEmail() {
        return Email;
    }

    public void setEmail(String email) {
        Email = email;
    }

    public String getPathSetting() {
        return PathSetting;
    }

    public void setPathSetting(String pathSetting) {
        PathSetting = pathSetting;
    }

    public String getUserCode() {
        return UserCode;
    }

    public void setUserCode(String userCode) {
        UserCode = userCode;
    }

    public int getIdLogin() {
        return IdLogin;
    }

    public void setIdLogin(int idLogin) {
        IdLogin = idLogin;
    }

    public String getNickName() {
        return NickName;
    }

    public void setNickName(String nickName) {
        NickName = nickName;
    }

    public String getFirstName() {
        return FirstName;
    }

    public void setFirstName(String firstName) {
        FirstName = firstName;
    }

    public String getLastName() {
        return LastName;
    }

    public void setLastName(String lastName) {
        LastName = lastName;
    }

    //endregion
}
