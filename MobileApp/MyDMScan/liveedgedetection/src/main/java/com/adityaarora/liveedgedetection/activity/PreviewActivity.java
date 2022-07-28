package com.adityaarora.liveedgedetection.activity;

import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.ActivityNotFoundException;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.support.annotation.RequiresApi;
import android.support.design.widget.Snackbar;
import android.support.v4.view.ViewPager;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import com.adityaarora.liveedgedetection.Database.DatabaseHelper;
import com.adityaarora.liveedgedetection.Database.ScansContainerItem;
import com.adityaarora.liveedgedetection.Database.ScansImages;
import com.adityaarora.liveedgedetection.R;
import com.adityaarora.liveedgedetection.constants.ScanConstants;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class PreviewActivity extends AppCompatActivity {

    //region Variables
    ImageView scannedImageView;

    private DatabaseHelper databaseHelper;
    ProgressDialog progressDialog = null;
    private TextView txtNote;
    ViewPager viewPager;
    int LotItemId;
    List<ScansImages> imgList;
    TextView docHeader;
    private String typeSelectDoc;

    private final int REQ_CODE_SPEECH_INPUT = 100;
    //endregion

    //region Activity events
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        setContentView(R.layout.activity_preview);
        scannedImageView = findViewById(R.id.scanned_image);
        txtNote = findViewById(R.id.txtNote);
        txtNote.setVisibility(View.INVISIBLE);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        docHeader = (TextView) findViewById(R.id.docHeader);
        String typeCreditor = getString(R.string.type_creditor);
        String typeReceivableAccounts = getString(R.string.type_receivable_accounts);
        String typeBankSiege = getString(R.string.type_bank_siege);
        String typeTaxes = getString(R.string.type_taxes);
        String typeExpenseReceipts = getString(R.string.type_expense_receipts);
        String typeVarious = getString(R.string.type_various);
        typeSelectDoc = getString(R.string.type_select_doc);
        switch (ScanConstants.IdRepScanDocumentType) {
            case 0:
                docHeader.setText(typeCreditor);
                break;
            case 1:
                docHeader.setText(typeReceivableAccounts);
                break;
            case 2:
                docHeader.setText(typeBankSiege);
                break;
            case 3:
                docHeader.setText(typeTaxes);
                break;
            case 4:
                docHeader.setText(typeExpenseReceipts);
                break;
            case 5:
                docHeader.setText(typeVarious);
                break;
        }
        databaseHelper = new DatabaseHelper(this);
        Intent intent = getIntent();
        LotItemId = Integer.parseInt(intent.getStringExtra(ScanConstants.LotItemId));
        imgList = databaseHelper.getScansImages(LotItemId);
        viewPager = findViewById(R.id.view_pager);
        ViewPageAdapter viewPageAdapter = new ViewPageAdapter(this, imgList);
        viewPager.setAdapter(viewPageAdapter);
        viewPager.addOnPageChangeListener(new ViewPager.OnPageChangeListener() {
            @Override
            public void onPageScrolled(int i, float v, int i1) {

            }

            @Override
            public void onPageSelected(int i) {

            }

            @Override
            public void onPageScrollStateChanged(int i) {

            }
        });
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
        final EditText txtAddNotes = new EditText(PreviewActivity.this);
        // create the AlertDialog as final
        AlertDialog.Builder builder = new AlertDialog.Builder(PreviewActivity.this);
        builder.setTitle(getString(R.string.note_title));
        builder.setIcon(R.drawable.ic_comment_black_24dp);
//        builder.setMessage("Please enter note");
        builder.setView(txtAddNotes);
        builder.setPositiveButton(getString(R.string.note_ok_button), new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int id) {
                txtAddNotes.setFocusable(false);
                ScanConstants.EditText = txtAddNotes.getText().toString();
                ScansContainerItem scansContainerItem = databaseHelper.getScansContainerItemById(LotItemId);
                databaseHelper.updateScansContainerItem(scansContainerItem.getLotItemId(), scansContainerItem.getIdScansContainer(), scansContainerItem.isSynced(), ScanConstants.EditText, 0, scansContainerItem.getNumberOfImages());
                //Snack bar
                Toast.makeText(getApplicationContext(), "Note added: " + txtAddNotes.getText(), Toast.LENGTH_SHORT).show();
            }
        }).setNegativeButton(getString(R.string.note_cancel_button), new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int id) {
                // removes the AlertDialog in the screen
            }
        });
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
                txtNote.setText(result.get(0));
                if (txtNote.getText() != "") {
                    txtNote.setVisibility(View.VISIBLE);
                    //Snack bar
                    Toast.makeText(getApplicationContext(), "Note added:" + txtNote.getText(), Toast.LENGTH_SHORT).show();
                }
            }
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.menu_layout, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle item selection
        int itemId = item.getItemId();
        if (itemId == R.id.abouts) {
            try {


                AlertDialog alertDialog = new AlertDialog.Builder(PreviewActivity.this,R.style.MyDialogStyle2).create(); //Read Update
                alertDialog.setTitle("About");
                alertDialog.setMessage("Version 1.0");

                alertDialog.setButton("OK", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int which) {
//                     here you can add functions
                    }
                });

                alertDialog.show();  //<-- See This!
            } catch (Exception ignored) {
            }

            return true;
        }
//        else if (itemId == R.id.settings) {
//
//            return true;
//        }
        return super.onOptionsItemSelected(item);
    }
    //endregion

    //region User defined event
    public void Back(View view) {
        Intent PreviewIntent = new Intent(PreviewActivity.this, ListViewActivity.class);
        startActivity(PreviewIntent);
    }

    public void DeleteDoc(View view) {
        for (int i = 0; i < imgList.size(); i++) {
            File fdelete = new File(imgList.get(i).getImagePath(), imgList.get(i).getImageName());
            if (fdelete.exists()) {
                fdelete.delete();
            }
        }
        //Delete db
        databaseHelper.deleteScansContainerItem(LotItemId);
        Toast.makeText(getApplicationContext(), "Detele Successful", Toast.LENGTH_SHORT).show();
//        Snackbar.make(viewPager, "Delete Successful", 10).show();
        Intent PreviewIntent = new Intent(PreviewActivity.this, ListViewActivity.class);
        startActivity(PreviewIntent);
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
    //endregion
}