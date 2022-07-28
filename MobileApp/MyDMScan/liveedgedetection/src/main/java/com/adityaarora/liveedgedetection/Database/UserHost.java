package com.adityaarora.liveedgedetection.Database;

import com.adityaarora.liveedgedetection.util.StringUtils;

public class UserHost {

    //region Variables
    private String LoginName;
    private String Password;
    //endregion

    //region Constructors
    public UserHost(){}

    public UserHost(String loginName, String password){
        this.LoginName = loginName;
        this.Password = password;
    }
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
    //endregion
}
