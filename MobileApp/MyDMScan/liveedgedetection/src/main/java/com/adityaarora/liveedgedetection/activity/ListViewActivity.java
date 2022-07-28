package com.adityaarora.liveedgedetection.activity;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Handler;
import android.speech.RecognizerIntent;
import android.support.annotation.Nullable;
import android.support.design.widget.Snackbar;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.Toolbar;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.adityaarora.liveedgedetection.Database.DatabaseHelper;
import com.adityaarora.liveedgedetection.Database.ScansContainerItem;
import com.adityaarora.liveedgedetection.Database.ScansImages;
import com.adityaarora.liveedgedetection.R;
import com.adityaarora.liveedgedetection.constants.ScanConstants;
import com.adityaarora.liveedgedetection.util.AsyncTaskRunner;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class ListViewActivity extends AppCompatActivity {

    //region Variables
    CustomListAdapter arrayAdapter;
    private DatabaseHelper databaseHelper;
    ListView listView;
    Context context;
    public List<ScansContainerItem> LstScansContainerItem;
    TextView textView, txtNrOfDoc;
    private String typeCreditor;
    private String typeReceivableAccounts;
    private String typeBankSiege;
    private String typeTaxes;
    private String typeExpenseReceipts;
    private String typeVarious;
    private String typeSelectDoc;
    CheckBox checkBoxAll, checkBox;
    ImageButton btnDone;
    private final int REQ_CODE_SPEECH_INPUT = 100;
    //endregion

    //region Activity Event
    @SuppressLint("SetTextI18n")
    @Override
    protected void onCreate(final Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_list);
        listView = findViewById(R.id.list_view);
        checkBoxAll = findViewById(R.id.checkBoxAll);
        checkBoxAll.setVisibility(View.INVISIBLE);
        btnDone = findViewById(R.id.btnDone);
        btnDone.setVisibility(View.INVISIBLE);
        final ImageButton btnDelete = findViewById(R.id.btnDeleteAll);
        final ImageButton btnAddVoice = findViewById(R.id.btnAddVoiceList);
        final ImageButton btnAccText = findViewById(R.id.btnAddTextList);
        btnAccText.setEnabled(false);
        btnAccText.setImageResource(R.drawable.comment_enable);
        btnAddVoice.setEnabled(false);
        btnAddVoice.setImageResource(R.drawable.record_enable);
        btnDelete.setEnabled(false);
        btnDelete.setImageResource(R.drawable.can_enable);

        listView.setLongClickable(true);

        //Get Doc Type resource
        typeCreditor = getString(R.string.type_creditor);
        typeReceivableAccounts = getString(R.string.type_receivable_accounts);
        typeBankSiege = getString(R.string.type_bank_siege);
        typeTaxes = getString(R.string.type_taxes);
        typeExpenseReceipts = getString(R.string.type_expense_receipts);
        typeVarious = getString(R.string.type_various);
        typeSelectDoc = getString(R.string.type_select_doc);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        textView = (TextView) findViewById(R.id.docHeader);
        txtNrOfDoc = findViewById(R.id.txtNrOfDoc);
        databaseHelper = new DatabaseHelper(this);
        final List<ScansContainerItem> lstScansContainerItem = databaseHelper.getScansContainerItem(ScanConstants.CurrentLotId);
        LstScansContainerItem = lstScansContainerItem;
        switch (ScanConstants.IdRepScanDocumentType) {
            case 0:
                textView.setText(typeCreditor);
                break;
            case 1:
                textView.setText(typeReceivableAccounts);
                break;
            case 2:
                textView.setText(typeBankSiege);
                break;
            case 3:
                textView.setText(typeTaxes);
                break;
            case 4:
                textView.setText(typeExpenseReceipts);
                break;
            case 5:
                textView.setText(typeVarious);
                break;
        }
        txtNrOfDoc.setText("TOTAL DOCUMENTS " + " : " + LstScansContainerItem.size());
        arrayAdapter = new CustomListAdapter(this, R.layout.custom_image_list, lstScansContainerItem);
        listView.setAdapter(arrayAdapter);
        listView.setChoiceMode(ListView.CHOICE_MODE_MULTIPLE);
        listView.setOnItemLongClickListener(new AdapterView.OnItemLongClickListener() {
            @Override
            public boolean onItemLongClick(AdapterView<?> adapterView, View view, int i, long l) {
                btnAddVoice.setEnabled(true);
                btnAccText.setEnabled(true);
                btnDelete.setEnabled(true);
                editListViewMode();
                btnAddVoice.setImageResource(R.drawable.ic_record_voice_over_black_24dp);
                btnAccText.setImageResource(R.drawable.ic_comment_black_24dp);
                btnDelete.setImageResource(R.drawable.xt_can);
                listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                        CheckBox checkBox = (CheckBox) listView.getChildAt(position).findViewById(R.id.selectionCheck);
                        checkBox.performClick();
                    }
                });
                return true;
            }
        });
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Intent intent = new Intent(ListViewActivity.this, PreviewActivity.class);
                String LotItemId = String.valueOf(LstScansContainerItem.get(position).getLotItemId());
                intent.putExtra(ScanConstants.LotItemId, LotItemId);
                startActivity(intent);
            }
        });

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


                AlertDialog alertDialog = new AlertDialog.Builder(ListViewActivity.this).create(); //Read Update
                alertDialog.setTitle("About");
                alertDialog.setMessage("Version 1.0");

                alertDialog.setButton("OK", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int which) {
//                     here you can add functions
                    }
                });

                alertDialog.show();  //<-- See This!
            } catch (Exception e) {
            }

            return true;
        }
//        else if (itemId == R.id.settings) {
//
//            return true;
//        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        switch (requestCode) {
            case REQ_CODE_SPEECH_INPUT: {
                if (resultCode == RESULT_OK && null != data) {

                    ArrayList<String> result = data
                            .getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                    String voiceNotes = result.get(0);

                    //process database
                    for (int j = LstScansContainerItem.size() - 1; j >= 0; j--) {
                        ScansContainerItem item = LstScansContainerItem.get(j);
                        if (item.isChecked()) {
                            ScansContainerItem scansContainerItem = databaseHelper.getScansContainerItemById(item.getLotItemId());
                            scansContainerItem.setNotes(voiceNotes);
                            databaseHelper.updateScansContainerItem(scansContainerItem.getLotItemId(), scansContainerItem.getIdScansContainer(), scansContainerItem.isSynced(), voiceNotes, 0, scansContainerItem.getNumberOfImages());
                            LstScansContainerItem.set(j, scansContainerItem);
                            arrayAdapter.notifyDataSetChanged();
                        }
                    }

                    if (voiceNotes != "") {
                        //Snack bar
                        Toast.makeText(getApplicationContext(), "Note added:" + voiceNotes, Toast.LENGTH_SHORT).show();
                    }
                    refreshListView();
                    doDoneButton();
                }
                break;
            }
        }
    }
//endregion

    //region User defined event
    public void ReloadCamera(View view) {
        Intent intent = new Intent(ListViewActivity.this, ScanActivity.class);
        startActivity(intent);
    }

    public void DeleteAll(View view) {
        for (int j = LstScansContainerItem.size() - 1; j >= 0; j--) {
            ScansContainerItem item = LstScansContainerItem.get(j);
            if (item.isChecked()) {
                List<ScansImages> lstScansImage = databaseHelper.getScansImages(item.getLotItemId());
                for (int i = 0; i < lstScansImage.size(); i++) {
                    ScansImages img = lstScansImage.get(i);
                    File fdelete = new File(img.getImagePath(), img.getImageName());
                    if (fdelete.exists()) {
                        fdelete.delete();
                    }
                }
                //Delete db
                databaseHelper.deleteScansContainerItem(item.getLotItemId());
                LstScansContainerItem.remove(item);
            }
        }

        refreshListView();
        runBackground();

        if (LstScansContainerItem.size() == 0) {
            databaseHelper.deleteScansContainer(ScanConstants.CurrentLotId);
            Snackbar.make(listView, "Delete Successful", 10).show();
            //Reset value
            ScanConstants.ScanMode = 1;
            ScanConstants.CurrentLotId = 0;
            ScanConstants.CurrentIdScansContainerItem = 0;
            ScanConstants.CurrentPageNr = 0;
            ScanConstants.IdRepScanDocumentType = 0;
            //Back to select menu
            finishActivity(Activity.RESULT_OK);
            Intent intent = new Intent(ListViewActivity.this, ScanActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            startActivity(intent);
        }
    }

    public void SendAll(View view) {
        //Run async task
        AsyncTaskRunner runner = new AsyncTaskRunner(ListViewActivity.this, ScanConstants.CurrentLotId);
        runner.execute();

        //Reset
        ScanConstants.ScanMode = 1;
        ScanConstants.CurrentLotId = 0;
        ScanConstants.CurrentIdScansContainerItem = 0;
        ScanConstants.CurrentPageNr = 0;
        ScanConstants.IdRepScanDocumentType = 0;

        //Back to select menu
        finishActivity(Activity.RESULT_OK);
        Intent intent = new Intent(ListViewActivity.this, ScanActivity.class);

        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(intent);
    }

    public void AddVoiceNotes(View view) {
        promptSpeechInput();
    }

    public void AddTextNotes(View view) {
// creating the EditText widget programatically
        final EditText txtAddNotes = new EditText(ListViewActivity.this);
        // create the AlertDialog as final
        AlertDialog.Builder builder = new AlertDialog.Builder(ListViewActivity.this);
        builder.setTitle(getString(R.string.note_title));
        builder.setIcon(R.drawable.ic_comment_black_24dp);
        builder.setView(txtAddNotes);
        builder.setPositiveButton(getString(R.string.note_ok_button), new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int id) {
                txtAddNotes.setFocusable(false);
                String textNotes = txtAddNotes.getText().toString();
                for (int j = LstScansContainerItem.size() - 1; j >= 0; j--) {
                    ScansContainerItem item = LstScansContainerItem.get(j);
                    if (item.isChecked()) {
                        ScansContainerItem scansContainerItem = databaseHelper.getScansContainerItemById(item.getLotItemId());
                        scansContainerItem.setNotes(textNotes);
                        databaseHelper.updateScansContainerItem(scansContainerItem.getLotItemId(), scansContainerItem.getIdScansContainer(), scansContainerItem.isSynced(), textNotes, 0, scansContainerItem.getNumberOfImages());
                        LstScansContainerItem.set(j, scansContainerItem);
                        arrayAdapter.notifyDataSetChanged();
                    }
                }
                //Snack bar
                Toast.makeText(getApplicationContext(), "Note added:" + txtAddNotes.getText(), Toast.LENGTH_SHORT).show();
                refreshListView();
                doDoneButton();
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

    public void DoneSave(View view) {
        doDoneButton();
    }

    public void doDoneButton() {
        new Handler().postDelayed(new Runnable() {

            @Override
            public void run() {
                for (int i = 0; i < LstScansContainerItem.size(); i++) {
                    CheckBox checkBox = (CheckBox) listView.getChildAt(i).findViewById(R.id.selectionCheck);
                    checkBox.setVisibility(View.GONE);
                    arrayAdapter.notifyDataSetChanged();
                    checkBoxAll.setVisibility(View.INVISIBLE);
                }
                listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                        Intent intent = new Intent(ListViewActivity.this, PreviewActivity.class);
                        String LotItemId = String.valueOf(LstScansContainerItem.get(position).getLotItemId());
                        intent.putExtra(ScanConstants.LotItemId, LotItemId);
                        startActivity(intent);

                    }
                });
                final ImageButton btnDelete = findViewById(R.id.btnDeleteAll);
                final ImageButton btnAddVoice = findViewById(R.id.btnAddVoiceList);
                final ImageButton btnAccText = findViewById(R.id.btnAddTextList);
                btnAccText.setEnabled(false);
                btnAccText.setImageResource(R.drawable.comment_enable);
                btnAddVoice.setEnabled(false);
                btnAddVoice.setImageResource(R.drawable.record_enable);
                btnDelete.setEnabled(false);
                btnDelete.setImageResource(R.drawable.can_enable);
                final ImageButton btnDone = findViewById(R.id.btnDone);
                btnDone.setVisibility(View.INVISIBLE);
            }
        }, 10);
    }

    public void EditListView(View view) {
        runBackground();
    }
//endregion

    //region User define function
    private void editListViewMode() {
        btnDone.setVisibility(View.VISIBLE);
        checkBoxAll = findViewById(R.id.checkBoxAll);
        checkBoxAll.setVisibility(View.VISIBLE);
        checkBoxAll.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (checkBoxAll.isChecked()) {
                    int count = listView.getAdapter().getCount();
                    for (int i = 0; i < count; i++) {
                        LinearLayout itemLayout = (LinearLayout) listView.getChildAt(i); // Find by under LinearLayout
                        checkBox = (CheckBox) itemLayout.findViewById(R.id.selectionCheck);
                        checkBox.setChecked(true);
                        LstScansContainerItem.get(i).setChecked(true);
                        arrayAdapter.notifyDataSetChanged();
                    }
                } else {
                    int count = listView.getAdapter().getCount();
                    for (int i = 0; i < count; i++) {
                        LinearLayout itemLayout = (LinearLayout) listView.getChildAt(i); // Find by under LinearLayout
                        checkBox = (CheckBox) itemLayout.findViewById(R.id.selectionCheck);
//                        checkBoxAll.setChecked(true);
                        checkBox.setChecked(false);
                        LstScansContainerItem.get(i).setChecked(false);
                        arrayAdapter.notifyDataSetChanged();
                    }

                }
            }

        });


        for (int i = 0; i < LstScansContainerItem.size(); i++) {
            CheckBox checkBox = (CheckBox) listView.getChildAt(i).findViewById(R.id.selectionCheck);
            checkBox.setVisibility(View.VISIBLE);
            arrayAdapter.notifyDataSetChanged();
        }
    }

    public void runBackground() {
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                editListViewMode();
                txtNrOfDoc.setText("TOTAL DOCUMENTS " + " : " + LstScansContainerItem.size());
            }
        }, 10);
    }

    public void refreshListView() {
        arrayAdapter = new CustomListAdapter(ListViewActivity.this, R.layout.custom_image_list, LstScansContainerItem);
        listView.setAdapter(arrayAdapter);
//        doDoneButton();
//        runBackground();
    }

    public void alertEditTextKeyboardShown(int lotItemId) {

// creating the EditText widget programatically
        final EditText txtAddNotes = new EditText(ListViewActivity.this);
        final int lotItemIdInner = lotItemId;
        // create the AlertDialog as final
        AlertDialog.Builder builder = new AlertDialog.Builder(ListViewActivity.this);
        builder.setTitle(getString(R.string.note_title));
        builder.setIcon(R.drawable.ic_comment_black_24dp);
//        builder.setMessage("Please enter note");
        builder.setView(txtAddNotes);
        builder.setPositiveButton(getString(R.string.note_ok_button), new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int id) {
                txtAddNotes.setFocusable(false);
                ScanConstants.EditText = txtAddNotes.getText().toString();
                ScansContainerItem scansContainerItem = databaseHelper.getScansContainerItemById(lotItemIdInner);
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
    //endregion
}





