package com.xoonit.camera.utils;

import org.androidannotations.annotations.sharedpreferences.DefaultLong;
import org.androidannotations.annotations.sharedpreferences.DefaultString;
import org.androidannotations.annotations.sharedpreferences.SharedPref;

@SharedPref(SharedPref.Scope.UNIQUE)
public interface SharePref {
    @DefaultString("")
    String accessToken();

    @DefaultString("")
    String refreshToken();

    @DefaultLong(0L)
    long timeRefreshToken();

    @DefaultString("")
    String userName();

    @DefaultString("")
    String nickName();

    @DefaultString("")
    String userID();

    @DefaultString("")
    String tokenFireBase();

}
