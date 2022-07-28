package com.xoonit.camera.utils.FireBase;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;

import androidx.annotation.NonNull;

import com.google.firebase.analytics.FirebaseAnalytics;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.iid.FirebaseInstanceId;
import com.xoonit.camera.Model.UserFirebase;
import com.xoonit.camera.XoonitApplication;
import com.xoonit.camera.utils.SharePref_;

/**
 * Created by VuPhan on 6/14/16.
 */
public class FireBaseManagement {
    public static void installFireBase(final FirebaseAuth mAuth, final DatabaseReference mDatabase, final SharePref_ sharePref) {

        FirebaseUser user = mAuth.getCurrentUser();
        if (user == null) {
            mAuth.signInAnonymously();
        }

        FirebaseAuth.AuthStateListener mAuthListener = new FirebaseAuth.AuthStateListener() {
            @Override
            public void onAuthStateChanged(@NonNull FirebaseAuth firebaseAuth) {
                FirebaseUser user = firebaseAuth.getCurrentUser();
                if (user != null) {
                    // User is signed in
                    Log.d("FireBaseManagement", "onAuthStateChanged:signed_in:" + user.getUid());
                    writeNewUser(user.getUid(), mDatabase, sharePref);
                } else {
                    // User is signed out
                    Log.d("FireBaseManagement", "onAuthStateChanged:signed_out");
                }
            }
        };

        mAuth.addAuthStateListener(mAuthListener);
    }

    private static void writeNewUser(String userId, DatabaseReference mDatabase, SharePref_ sharePref) {
        String tokenFirebase = sharePref.tokenFireBase().getOr("");
        String userName = XoonitApplication.getInstance().getSharePref().userName().getOr("anonymous");
        String userID = XoonitApplication.getInstance().getSharePref().userID().getOr("anonymous");
        UserFirebase user = new UserFirebase(userName, userID, tokenFirebase, "android");
        mDatabase.child("users").push().setValue(user);
    }

    /**
     * Before tracking all events to firebase, need to set user id and user properties
     *
     * @param context
     */
    private static void setUserIDAndProperties(Context context) {
        FirebaseAnalytics firebaseAnalytics = FirebaseAnalytics.getInstance(context);
        firebaseAnalytics.setUserId(XoonitApplication.getInstance().getSharePref().userID().getOr("anonymous"));
        firebaseAnalytics.setUserProperty(FirebaseInstanceId.getInstance().getId(), ConstantFireBaseTracking.KEY_FINGER_PRINT);
    }

    public static void updateRefreshedToken(String refreshedToken) {
        FirebaseUser user = FirebaseAuth.getInstance().getCurrentUser();
        if (user != null) {
            DatabaseReference databaseReference = FirebaseDatabase.getInstance().getReference();
            databaseReference.child("users").child(user.getUid()).child("registerId").setValue(refreshedToken);
        }
    }


    /**
     * Tracking screen for fireBase
     *
     * @param screenKey screen key tracking
     */
    public static void logFireBaseEvent(Context context, String screenKey) {
        FirebaseAnalytics.getInstance(context).setCurrentScreen((Activity) context, screenKey, null);
    }

    /**
     * Tracking login/signUp screen for fireBase
     *
     * @param context   context
     * @param eventName eventName
     * @param userName  userName
     */
    public static void logEventLoginAndSignUp(Context context, String eventName, String userName) {
        Bundle bundle = new Bundle();
        bundle.putString(ConstantFireBaseTracking.TRACKING_PARAM_USER_NAME, userName);
        FirebaseAnalytics.getInstance(context).logEvent(eventName, bundle);
    }

    /**
     * @param context
     * @param nextScreen
     * @param currentScreen
     * @param action
     */
    public static void logEventScreenTransition(Context context, String nextScreen, String currentScreen, String action) {
        FireBaseManagement.setUserIDAndProperties(context);
        Bundle bundle = new Bundle();
        bundle.putString(ConstantFireBaseTracking.KEY_SCREEN_NAME, nextScreen);
        bundle.putString(ConstantFireBaseTracking.KEY_CURRENT_SCREEN, currentScreen);
        bundle.putString(ConstantFireBaseTracking.KEY_ACTION, action);
        bundle.putString(ConstantFireBaseTracking.KEY_USER_ID, XoonitApplication.getInstance().getSharePref().userID().getOr(""));
        bundle.putString(ConstantFireBaseTracking.KEY_FINGER_PRINT, FirebaseInstanceId.getInstance().getId());
        FirebaseAnalytics.getInstance(context).logEvent(ConstantFireBaseTracking.EVENT_NAME_TRANSITION, bundle);
    }

}
