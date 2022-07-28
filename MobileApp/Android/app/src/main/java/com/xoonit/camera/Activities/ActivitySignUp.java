package com.xoonit.camera.Activities;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.util.Patterns;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;

import com.xoonit.camera.Activities.Base.BaseActivity;
import com.xoonit.camera.Database.User;
import com.xoonit.camera.R;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;

import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.ViewById;

import java.util.regex.Matcher;
import java.util.regex.Pattern;


@SuppressLint("Registered")
@EActivity(R.layout.activity_signup)
public class ActivitySignUp extends BaseActivity  implements View.OnClickListener {
    @ViewById(R.id.button_back_signup2)
    ImageButton btnBackSignUp;
    @ViewById(R.id.button_next_create_accout)
    Button btnNextCreateAccount;
    @ViewById(R.id.text_sign_in)
    TextView txtSignIn;
    @ViewById(R.id.text_input_firstname)
    EditText edtFirstName;
    @ViewById(R.id.text_input_lastname)
    EditText edtLastName;
    @ViewById(R.id.text_input_loginname)
    EditText edtLoginName;
    @ViewById(R.id.text_input_email)
    EditText edtEmailAddress;
    @ViewById(R.id.text_input_password)
    EditText edtPassword;
    @ViewById(R.id.text_input_confirm_password)
    EditText edtComfirmPassword;


    public void initialView() {
        btnBackSignUp.setOnClickListener(this);
        btnNextCreateAccount.setOnClickListener(this);
        txtSignIn.setOnClickListener(this);
    }
    private String firstname, lastname, loginname, email, password, confirmpassword;

    private User user = new User();


    @Override
    protected void afterViews() {
        initialView();
    }

    public boolean ValidateInfoCreateAccount() {

        firstname = edtFirstName.getText().toString().trim();
        lastname = edtLastName.getText().toString().trim();
        loginname = edtLoginName.getText().toString().trim();
        email = edtEmailAddress.getText().toString().trim();
        password = edtPassword.getText().toString().trim();
        confirmpassword = edtComfirmPassword.getText().toString().trim();

        if (firstname.isEmpty()) {
            edtFirstName.setError("This field must not be null");
            edtFirstName.requestFocus();
            return false;
        }
        if (lastname.isEmpty()) {
            edtLastName.setError("This field must not be null");
            edtLastName.requestFocus();
            return false;
        }
        if (loginname.isEmpty()) {
            edtLoginName.setError("This field must not be null");
            edtLoginName.requestFocus();
            return false;
        }
        if (email.isEmpty()) {
            edtEmailAddress.setError("This field must not be null");
            edtEmailAddress.requestFocus();
            return false;
        } else if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            edtEmailAddress.setError("Please enter valid mail address ");
            edtEmailAddress.requestFocus();
            return false;
        }
        if (password.isEmpty()) {
            edtPassword.setError("This field must not be null");
            return false;
        } else if (password.length() < 8) {
            edtPassword.setError("Password minimum contain 8 characters");
            edtPassword.requestFocus();
            return false;
        } else if (!validatePassword(password)) {
            edtPassword.setError("Please enter valid password");
            edtPassword.requestFocus();
            return false;
        }

        if (confirmpassword.isEmpty()) {
            edtComfirmPassword.setError("This field must not be null");
            return false;
        } else if (!confirmpassword.equals(password)) {
            edtComfirmPassword.setError("Password not matching");
            edtComfirmPassword.requestFocus();
            return false;
        }

        return true;
    }

    public boolean validatePassword(final String password) {
        Pattern pattern;
        Matcher matcher;
        final String PASSWORD_PATTERN = "^(?=.*[0-9])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{4,}$";
        pattern = Pattern.compile(PASSWORD_PATTERN);
        matcher = pattern.matcher(password);

        return matcher.matches();
    }

    @Override
    public void onClick(View v) {
        int id = v.getId();
        switch (id) {
            case R.id.button_next_create_accout:
                // validateinfor and next to step 2
//                if (ValidateInfoCreateAccount()) {
//                    user.setFirstName(firstname);
//                    user.setLastName(lastname);
//                    user.setLoginName(loginname);
//                    user.setEmail(email);
//                    user.setPassword(password);
//                    ActivityUpdateProfile_.intent(this)
//                            .flags(Intent.FLAG_ACTIVITY_NEW_TASK)
//                            .start();
//                }
                FireBaseManagement.logEventScreenTransition(this,
                        ConstantFireBaseTracking.UPDATE_PROFILE_ACTIVITY,
                        ConstantFireBaseTracking.SINGUP_ACTIVITY,
                        ConstantFireBaseTracking.ACTION_UPDATE_BUTTON);
                startActivityWithPushAnimation(new Intent(this, ActivityUpdateProfile_.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
                break;
            case R.id.text_sign_in:
            case R.id.button_back_signup2: {
                // back to Login Activity
                FireBaseManagement.logEventScreenTransition(this,
                        ConstantFireBaseTracking.LOGIN_ACTIVITY,
                        ConstantFireBaseTracking.SINGUP_ACTIVITY,
                        ConstantFireBaseTracking.ACTION_LOGIN_BUTTON);
                startActivityWithPushAnimation(new Intent(this, LoginActivity_.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
                finish();
                break;
            }
        }
    }
}
