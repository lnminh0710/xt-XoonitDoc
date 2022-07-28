package com.xoonit.camera.Activities;

import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.ActivityNotFoundException;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.viewpager.widget.ViewPager;

import com.xoonit.camera.Database.DatabaseHelper;
import com.xoonit.camera.Database.ScansImages;
import com.xoonit.camera.R;
import com.xoonit.camera.utils.ScanConstants;
import com.google.android.material.snackbar.Snackbar;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class PreviewActivity extends AppCompatActivity {

    //region Variables
    private ImageView scannedImageView;
    private DatabaseHelper databaseHelper;
    private ProgressDialog progressDialog = null;
    private TextView txtNote, textVoice,textNumber;
    private ViewPager viewPager;
    private int IdScansImage;
    private int GroupNr;
    private List<ScansImages> ImgList;

    private final int REQ_CODE_SPEECH_INPUT = 100;
    private Toolbar toolbar;

    //endregion
    //region Activity events
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        setContentView(R.layout.activity_preview);
        scannedImageView = findViewById(R.id.scanned_image);
        toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        databaseHelper = new DatabaseHelper(this);
        Bundle bundle = this.getIntent().getExtras();
        if (ScanConstants.ViewMode == 0) {
            IdScansImage = Integer.parseInt(bundle.getString(ScanConstants.StrImageId));
            ImgList = databaseHelper.getScansImagesById(IdScansImage);
        } else {
            GroupNr = Integer.parseInt(bundle.getString(ScanConstants.StrGroupNr));
            ImgList = databaseHelper.getScansImagesByGroupNr(GroupNr);
        }

        viewPager = findViewById(R.id.view_pager);
        ViewPageAdapter viewPageAdapter = new ViewPageAdapter(this, ImgList);
        viewPager.setOffscreenPageLimit(1);
        viewPager.setAdapter(viewPageAdapter);
    }


    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (progressDialog != null) {
            progressDialog.dismiss();
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    public void alertEditTextKeyboardShown() {

        // creating the EditText widget programatically
        final TextView txtAddNotes = new EditText(PreviewActivity.this);
        // create the AlertDialog as final
        AlertDialog.Builder builder = new AlertDialog.Builder(PreviewActivity.this);
        builder.setTitle(getString(R.string.note_title));
        builder.setIcon(R.drawable.ic_comment_black_24dp);
//        builder.setMessage("Please enter note");
        builder.setView(txtAddNotes);
        builder.setPositiveButton(getString(R.string.note_ok_button), new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int id) {
                if (ScanConstants.ViewMode == 0) {
                    for (int i = 0; i < ImgList.size(); i++) {
                        txtAddNotes.setFocusable(false);
                        ScanConstants.EditText = txtAddNotes.getText().toString();
                        ImgList.get(i).setNotes(ScanConstants.EditText);
//                        txtNote.setVisibility(View.VISIBLE);
//                        txtNote.setText("Note: "  + ScanConstants.EditText);
                        databaseHelper.updateScansImagesByNotes(ImgList.get(i));
                        //Snack bar
                        Toast.makeText(getApplicationContext(), "Note added: " + " " + txtAddNotes.getText(), Toast.LENGTH_SHORT).show();


                    }
                } else {
                    for (int i = 0; i < ImgList.size(); i++) {
                        txtAddNotes.setFocusable(false);
                        ScanConstants.EditText = txtAddNotes.getText().toString();
                        ImgList.get(i).setNotes(ScanConstants.EditText);
//                        txtNote.setVisibility(View.VISIBLE);
//                        txtNote.setText("Note: " + ScanConstants.EditText);

                        databaseHelper.updateScansImagesByNotesMultiple(ImgList.get(i).getGroupNr(), ImgList.get(i).getNotes());

                    }
                }
            }
        }).setNegativeButton(getString(R.string.note_cancel_button), ((dialog1, which) -> {
            dialog1.dismiss();
        }));
        final AlertDialog dialog = builder.create();
        dialog.show();

    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        // Voice
        if (requestCode == REQ_CODE_SPEECH_INPUT) {
            if (resultCode == RESULT_OK && null != data) {
                ArrayList<String> result = data
                        .getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                ScanConstants.textVoice = (result.get(0));
                if (ScanConstants.ViewMode == 0) {
                    for (int i = 0; i < ImgList.size(); i++) {
                        ImgList.get(i).setNotes(ScanConstants.textVoice);
                        databaseHelper.updateScansImagesByNotes(ImgList.get(i));
//                        textVoice.setVisibility(View.VISIBLE);
//                        textVoice.setText("Voice: " + result.get(0));

                    }
                } else {
                    for (int i = 0; i < ImgList.size(); i++) {
                        ImgList.get(i).setNotes(ScanConstants.textVoice);
                        databaseHelper.updateScansImagesByNotesMultiple(ImgList.get(i).getGroupNr(), ImgList.get(i).getNotes());
//                        textVoice.setVisibility(View.VISIBLE);
//                        textVoice.setText("Voice: " + result.get(0));
                    }

                    //Snack bar
                    Toast.makeText(getApplicationContext(), "Voice added:" + textVoice.getText(), Toast.LENGTH_SHORT).show();

                }
            }
        }
    }

    //region User defined event
    public void onClickButtonBackToolbarPreview(View view) {
        Intent PreviewIntent = new Intent(PreviewActivity.this, GridViewActivity.class);
        startActivity(PreviewIntent);
        finish();
    }

    @Override
    public void onBackPressed() {
        Intent PreviewIntent = new Intent(PreviewActivity.this, GridViewActivity.class);
        startActivity(PreviewIntent);
        finish();
    }

    public void DeleteImage(View view) {
        if (ScanConstants.ViewMode == 0) {
            for (int i = 0; i < ImgList.size(); i++) {
                File fdelete = new File(ImgList.get(i).getImagePath(), ImgList.get(i).getImageName());
                if (fdelete.exists()) {
                    fdelete.delete();
                }
                //Delete db
                databaseHelper.deleteSingleScansImagesbyId(IdScansImage);
                Toast.makeText(getApplicationContext(), "Detele Successful", Toast.LENGTH_SHORT).show();
                Snackbar.make(viewPager, "Delete Successful", 10).show();
                Intent PreviewIntent = new Intent(PreviewActivity.this, GridViewActivity.class);
                startActivity(PreviewIntent);
                finish();
            }

        } else {
            for (int i = 0; i < ImgList.size(); i++) {
                File fdelete = new File(ImgList.get(i).getImagePath(), ImgList.get(i).getImageName());
                if (fdelete.exists()) {
                    fdelete.delete();
                }
                //Delete db
                databaseHelper.deleteGroupScansImagesbyGroupNr(GroupNr);
                Toast.makeText(getApplicationContext(), "Detele Successful", Toast.LENGTH_SHORT).show();
                Snackbar.make(viewPager, "Delete Successful", 10).show();
                Intent PreviewIntent = new Intent(PreviewActivity.this, GridViewActivity.class);
                startActivity(PreviewIntent);
                finish();
            }
        }
    }

    public void AddVoice(View view) {
        promptSpeechInput();

    }

    public void AddNote(View view) {
        alertEditTextKeyboardShown();
    }

    //endregion
    //region user defined functions
    private void promptSpeechInput() {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
//        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
//        String astr = Locale.getAvailableLocales().toString();
        String language_code = getString(R.string.language_code);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, language_code);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, language_code);
//        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault());
        intent.putExtra(RecognizerIntent.EXTRA_PROMPT,
                getString(R.string.speech_prompt));
        try {
            startActivityForResult(intent, REQ_CODE_SPEECH_INPUT);


        } catch (ActivityNotFoundException a) {
            Toast.makeText(getApplicationContext(),
                    getString(R.string.speech_not_supported),
                    Toast.LENGTH_SHORT).show();
        }
    }

    public void showSnackBar(View view, String message, int duration) {
        Snackbar.make(view, message, duration).show();
    }

}