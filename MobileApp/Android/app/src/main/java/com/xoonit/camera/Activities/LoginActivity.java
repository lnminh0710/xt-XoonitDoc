package com.xoonit.camera.Activities;

import android.app.ProgressDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.Toast;

import com.auth0.android.jwt.Claim;
import com.auth0.android.jwt.JWT;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.FirebaseDatabase;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.xoonit.camera.Activities.Base.BaseActivity;
import com.xoonit.camera.BuildConfig;
import com.xoonit.camera.Database.DatabaseHelper;
import com.xoonit.camera.Database.DocumentTreeArray;
import com.xoonit.camera.Database.DocumentTreeItem;
import com.xoonit.camera.Model.LoginRequest;
import com.xoonit.camera.Model.LoginSuccessResponse;
import com.xoonit.camera.R;
import com.xoonit.camera.XoonitApplication;
import com.xoonit.camera.api.core.ApiCallBack;
import com.xoonit.camera.api.core.ApiClient;
import com.xoonit.camera.utils.ConstantUtils;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;
import com.xoonit.camera.utils.GeneralMethod;

import org.androidannotations.annotations.Click;
import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.ViewById;

import java.util.ArrayList;
import java.util.List;

@EActivity(R.layout.activity_login)
public class LoginActivity extends BaseActivity {
    private static final String TAG = "LoginActivity";
    @ViewById(R.id.inputlayout_loginname)
    EditText edtUsername;
    @ViewById(R.id.inputlayout_password)
    EditText edtPassword;
    @ViewById(R.id.button_login)
    Button btnLogin;
    @ViewById(R.id.checkbox_remember)
    CheckBox chksaveaccount;


    String email, password;
    String prefname = "account";
    private long back_pressed = 0;

    DatabaseHelper databaseHelper;
    private ProgressDialog progressDialog;


    @Override
    protected void afterViews() {

        databaseHelper = new DatabaseHelper(this);

        progressDialog = new ProgressDialog(LoginActivity.this);
        progressDialog.setMessage("Authenticate...");
        progressDialog.setCancelable(false);
    }

    @Click(R.id.button_login)
    void onLoginButtonPressed() {
        progressDialog.show();
        if (BuildConfig.USE_MOCK_DATA) {
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    String loginSuccessResponseJson = GeneralMethod.readFile("LoginResponse.json", LoginActivity.this);
                    LoginSuccessResponse loginSuccessResponse = GeneralMethod.transformJsonStringToObject(loginSuccessResponseJson, LoginSuccessResponse.class);
                    if (loginSuccessResponse != null && loginSuccessResponse.getLoginItem() != null
                            && loginSuccessResponse.getLoginItem().getResult().equals(ConstantUtils.RESPONSE_SUCCESS_STRING)) {
                        mSharePref.userName().put(email);
                        GeneralMethod.saveUserData(loginSuccessResponse.getLoginItem());
                        getDocumentTree();
                    }
                }
            }, 1000);
        } else {
            if (onValidatetion()) {
                email = edtUsername.getText().toString();
                password = edtPassword.getText().toString();
                Log.d(TAG, "Email " + email + ", Password: " + password);
                LoginRequest loginRequest = new LoginRequest(email, password);
                ApiClient.getService().login(loginRequest)
                        .enqueue(new ApiCallBack<LoginSuccessResponse>(LoginActivity.this) {
                            @Override
                            public void success(LoginSuccessResponse loginSuccessResponse) {
                                if (loginSuccessResponse.getLoginItem() != null
                                        && loginSuccessResponse.getLoginItem().getResult().equals(ConstantUtils.RESPONSE_SUCCESS_STRING)) {
                                    mSharePref.userName().put(email);
                                    GeneralMethod.saveUserData(loginSuccessResponse.getLoginItem());
                                    getDocumentTree();
                                }
                            }

                            @Override
                            public void failure(List<String> listError) {
                                progressDialog.cancel();
                                Toast.makeText(getApplicationContext(), getString(R.string.msg_login_failed), Toast.LENGTH_SHORT).show();
                            }
                        });
            }
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

    }

    @Override
    protected void onPause() {
        // TODO Auto-generated method stub
        super.onPause();
        //gọi hàm lưu trạng thái ở đây
        savingPreferences();
    }

    @Override
    protected void onResume() {
        // TODO Auto-generated method stub
        super.onResume();
        //gọi hàm đọc trạng thái ở đây
        restoringPreferences();
    }


    private boolean onValidatetion() {
        email = edtUsername.getText().toString();
        password = edtPassword.getText().toString();

        if (email.equals("")) {
            edtUsername.requestFocus();
            return false;
        } else if (password.equals("")) {
            edtPassword.requestFocus();
            return false;
        }
        return true;
    }

    public void savingPreferences() {
        //tạo đối tượng getSharedPreferences
        SharedPreferences pre = getSharedPreferences
                (prefname, MODE_PRIVATE);
        //tạo đối tượng Editor để lưu thay đổi
        SharedPreferences.Editor editor = pre.edit();
        email = edtUsername.getText().toString();
        password = edtPassword.getText().toString();

        boolean bchk = chksaveaccount.isChecked();
        if (!bchk) {
            //xóa mọi lưu trữ trước đó
            editor.clear();
        } else {
            //lưu vào editor
            editor.putString("user", email);
            editor.putString("pwd", password);
            editor.putBoolean("checked", bchk);

        }
        //chấp nhận lưu xuống file
        editor.commit();
    }

    public void restoringPreferences() {
        SharedPreferences pre = getSharedPreferences
                (prefname, MODE_PRIVATE);
        //lấy giá trị checked ra, nếu không thấy thì giá trị mặc định là false
        boolean bchk = pre.getBoolean("checked", false);
        if (bchk) {
            //lấy user, pwd, nếu không thấy giá trị mặc định là rỗng
            String user = pre.getString("user", "");
            String pwd = pre.getString("pwd", "");
            edtUsername.setText(user);
            edtPassword.setText(pwd);
        }
        chksaveaccount.setChecked(bchk);
    }

    private void getDocumentTree() {

        if (BuildConfig.USE_MOCK_DATA) {
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    String documentTreeJson = GeneralMethod.readFile("DocumentTree.json", LoginActivity.this);
                    DocumentTreeArray documentTreeArray = GeneralMethod.transformJsonStringToObject(documentTreeJson, DocumentTreeArray.class);
                    handleGetDocumentTreeResponse(documentTreeArray);
                    progressDialog.cancel();
                }
            }, 2000);
        } else {
            ApiClient.getService().getDocumentTree()
                    .enqueue(new ApiCallBack<DocumentTreeArray>(this) {
                        @Override
                        public void success(DocumentTreeArray documentTreeArray) {
                            handleGetDocumentTreeResponse(documentTreeArray);
                            progressDialog.cancel();
                        }

                        @Override
                        public void failure(List<String> listError) {
                            GeneralMethod.clearUserData();
                            progressDialog.cancel();
                            Toast.makeText(getApplicationContext(), getString(R.string.msg_can_not_get_document_tree), Toast.LENGTH_SHORT).show();
                        }
                    });
        }

    }

    private void handleGetDocumentTreeResponse(DocumentTreeArray documentTreeArray) {
        ArrayList<DocumentTreeItem> arrayListData = new ArrayList<>();
        if (documentTreeArray != null && documentTreeArray.getDocumentTreeItem() != null) {
            ArrayList<DocumentTreeItem> documentTreeItems = documentTreeArray.getDocumentTreeItem();
            for (int i = 0; i < documentTreeItems.size(); i++) {

                DocumentTreeItem docToAdd = documentTreeItems.get(i);
                docToAdd.setRoot(true);
                arrayListData.add(docToAdd);
//                            databaseHelper.insertDocumentTree(arrayListData.get(i));
                Log.d(TAG, "IdDocumentTree: " + arrayListData.size());

            }
            XoonitApplication.getInstance().setDocumentTreeItemList(arrayListData);
            String token = mSharePref.accessToken().getOr("");
            JWT jwt = new JWT(token);
            Claim claim = jwt.getClaim("appinfo");
            String appinfoJson = claim.asString();
            JsonElement element = JsonParser.parseString(appinfoJson);
            JsonObject object = element.getAsJsonObject();
            String nickName = object.get("NickName").getAsString();
            String userID = email;
            if (object.get("UserGuid") != null) {
                userID = object.get("UserGuid").getAsString();
            }
            XoonitApplication.getInstance().getSharePref()
                    .nickName().put(nickName);
            XoonitApplication.getInstance().getSharePref()
                    .userID().put(userID);
            FireBaseManagement.logEventScreenTransition(this,
                    ConstantFireBaseTracking.HOME_ACTIVITY,
                    ConstantFireBaseTracking.LOGIN_ACTIVITY,
                    ConstantFireBaseTracking.ACTION_LOGIN_BUTTON);
            mSharePref.nickName().put(nickName);
            mSharePref.userID().put(userID);
            FireBaseManagement.installFireBase(FirebaseAuth.getInstance(), FirebaseDatabase.getInstance().getReference(), mSharePref);
            startActivityWithPushAnimation(new Intent(this, ActivityHome_.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK));
            finish();
        } else {
            GeneralMethod.clearUserData();
            Toast.makeText(getApplicationContext(), getString(R.string.msg_can_not_get_document_tree), Toast.LENGTH_SHORT).show();
        }
    }

    @Click(R.id.text_forgot_password)
    void onForgotPasswordPressed() {
        FireBaseManagement.logEventScreenTransition(this,
                ConstantFireBaseTracking.FORGOTPASSWORD_ACTIVITY,
                ConstantFireBaseTracking.LOGIN_ACTIVITY,
                ConstantFireBaseTracking.ACTION_FORGOTPASSWORD_BUTTON);
        startActivityWithPushAnimation(new Intent(this, ActivityForgotPassword_.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
    }

    @Click(R.id.textview_signup)
    void onSignUpButtonClick() {
        FireBaseManagement.logEventScreenTransition(this,
                ConstantFireBaseTracking.SINGUP_ACTIVITY,
                ConstantFireBaseTracking.LOGIN_ACTIVITY,
                ConstantFireBaseTracking.ACTION_SIGNUP_BUTTON);
        startActivityWithPushAnimation(new Intent(this, ActivitySignUp_.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
    }

    @Override
    public void onBackPressed() {
        if (back_pressed + 2000 > System.currentTimeMillis()) {
            super.onBackPressed();
        } else {
            Toast.makeText(this,
                    "Press once again to exit!", Toast.LENGTH_SHORT)
                    .show();
        }
        back_pressed = System.currentTimeMillis();
    }
}
