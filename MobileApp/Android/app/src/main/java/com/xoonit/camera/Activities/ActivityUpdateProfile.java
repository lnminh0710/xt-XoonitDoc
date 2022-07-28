package com.xoonit.camera.Activities;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.annotation.Nullable;

import com.xoonit.camera.Activities.Adapter.CustomSpinnerNationalAdapter;
import com.xoonit.camera.Activities.Base.BaseActivity;
import com.xoonit.camera.Database.DatabaseHelper;
import com.xoonit.camera.Database.User;
import com.xoonit.camera.Model.CountryPhoneNumber;
import com.xoonit.camera.R;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;

import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.ViewById;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.List;
import java.util.Objects;


@SuppressLint("Registered")
@EActivity(R.layout.activity_update_profile)
public class ActivityUpdateProfile extends BaseActivity implements View.OnClickListener {
    @ViewById(R.id.spinner_national)
    Spinner spinnerNational;
    @ViewById(R.id.spinner_month)
    AutoCompleteTextView spinnerMonth;
    @ViewById(R.id.spinner_day)
    AutoCompleteTextView spinnerDay;
    @ViewById(R.id.spinner_year)
    AutoCompleteTextView spinnerYear;
    @ViewById(R.id.edit_text_phonenumber)
    EditText edtPhoneNumber;
    @ViewById(R.id.Checkbox_Term)
    CheckBox checkboxTerm;
    @ViewById(R.id.button_signup)
    Button btnSignUp;
    @ViewById(R.id.text_SignIn)
    TextView textViewSignIn;
    @ViewById(R.id.button_back_signup2)
    ImageButton btnBackSignUp;

    private static final String TAG = "SIGNUP: ";
    private boolean isTermchecked = false;
    String phonenumber, birthday, language;

    private DatabaseHelper database;

    private SignUpStepTwoListener listener;
    private User user = new User();


    private void init() {
        database = new DatabaseHelper(ActivityUpdateProfile.this);
        checkboxTerm.setOnClickListener(this);
        btnSignUp.setOnClickListener(this);
        btnBackSignUp.setOnClickListener(this);
        textViewSignIn.setOnClickListener(this);
        initSpinnerData();
    }

    @Override
    protected void afterViews() {
        init();
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    public interface SignUpStepTwoListener {
        void getUserInfo(User user);
    }

    private void initSpinnerData() {

        final ArrayList<CountryPhoneNumber> list = new ArrayList<>();
        List<String> arrayFirstNumber = Arrays.asList(getResources().getStringArray(R.array.FirstPhoneNumber_Array));
        Integer[] resIdFlags = {R.drawable.vietnam, R.drawable.united_kingdom, R.drawable.germany, R.drawable.japan, R.drawable.portugal, R.drawable.spain};

        for (int i = 0; i < 5; i++) {
            list.add(new CountryPhoneNumber(resIdFlags[i], arrayFirstNumber.get(i)));
        }

        CustomSpinnerNationalAdapter simpleAdapter = new CustomSpinnerNationalAdapter(ActivityUpdateProfile.this, list, R.layout.custom_list_spinner_country_national);
        spinnerNational.setAdapter(simpleAdapter);
        spinnerNational.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                edtPhoneNumber.setText(list.get(position).getFirstNumber());
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
            }
        });

        List<String> listmonths = Arrays.asList(getResources().getStringArray(R.array.Month_array));
        ArrayAdapter<String> adapter = new ArrayAdapter<>(Objects.requireNonNull(this), R.layout.support_simple_spinner_dropdown_item, listmonths);
        spinnerMonth.setAdapter(adapter);

        List<Integer> listday = new ArrayList<>();
        for (int i = 1; i < 32; i++) {
            listday.add(i);
        }
        ArrayAdapter<Integer> dayAdapter = new ArrayAdapter<>(this, R.layout.support_simple_spinner_dropdown_item, listday);
        spinnerDay.setAdapter(dayAdapter);

        int year = Calendar.getInstance().get(Calendar.YEAR);
        List<Integer> listyear = new ArrayList<>();
        for (int i = (year - 120); i < (year - 10); i++) {
            listyear.add(i);
        }
        ArrayAdapter<Integer> yearAdapter = new ArrayAdapter<>(this, R.layout.support_simple_spinner_dropdown_item, listyear);
        spinnerYear.setAdapter(yearAdapter);

    }

    @Override
    public void onClick(View v) {
        int id = v.getId();
        switch (id) {
            case R.id.button_signup:

//                if (onValidatetionInfo()) {
//                    user.setDateOfBirth(birthday);
//                    user.setPhoneNr(phonenumber);
//                    user.setIdRepLanguage(language);
//                    listener.getUserInfo(user);
//                    AsyncTaskSignUp signUp = new AsyncTaskSignUp(activity, user);
//                    signUp.execute();
//                }
                FireBaseManagement.logEventScreenTransition(ActivityUpdateProfile.this,
                        ConstantFireBaseTracking.CONGRAT_ACTIVITY,
                        ConstantFireBaseTracking.UPDATE_PROFILE_ACTIVITY,
                        ConstantFireBaseTracking.ACTION_CONGRAT_BUTTON);
                startActivityWithPushAnimation(new Intent(this, ActivityCongrat_.class)
                        .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK));
                finish();
                break;
            case R.id.text_SignIn: {
                user.setLoginName("");
                user.setPassword("");
                FireBaseManagement.logEventScreenTransition(ActivityUpdateProfile.this,
                        ConstantFireBaseTracking.LOGIN_ACTIVITY,
                        ConstantFireBaseTracking.UPDATE_PROFILE_ACTIVITY,
                        ConstantFireBaseTracking.ACTION_LOGIN_BUTTON);
                startActivityWithPushAnimation(new Intent(this, LoginActivity_.class)
                        .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK));
                finish();
                break;
            }
            case R.id.button_back_signup2: {
                finish();
                break;
            }
            case R.id.Checkbox_Term: {
                // show term
                if (isTermchecked) {
                    isTermchecked = false;
                    checkboxTerm.setChecked(false);
//                    checkboxTerm.performClick();
                } else {
                    isTermchecked = true;
                    checkboxTerm.setChecked(true);
//                    checkboxTerm.performClick();
                }
            }
        }
    }
}
