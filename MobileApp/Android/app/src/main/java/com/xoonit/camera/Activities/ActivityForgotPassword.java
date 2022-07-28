package com.xoonit.camera.Activities;

import android.annotation.SuppressLint;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

import com.xoonit.camera.Activities.Base.BaseActivity;
import com.xoonit.camera.R;

import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.ViewById;


@SuppressLint("Registered")
@EActivity(R.layout.activity_forgot_password)
public class ActivityForgotPassword extends BaseActivity  implements View.OnClickListener {
    @ViewById(R.id.button_send_mail)
    Button btnSendMail;
    @ViewById(R.id.edit_text_mail)
    EditText edtEmail;

    @Override
    protected void afterViews() {
        btnSendMail.setOnClickListener(this);
    }

    @Override
    public void onClick(View v) {
        if (v.getId()==R.id.button_send_mail){
            String mail = edtEmail.getText().toString();
            //

        }
    }

}
