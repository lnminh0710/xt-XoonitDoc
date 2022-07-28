package com.xoonit.camera.Activities;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.os.Bundle;
import android.os.Handler;
import android.speech.RecognizerIntent;
import android.util.Base64;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.SubMenu;
import android.view.View;
import android.view.ViewStub;
import android.widget.AdapterView;
import android.widget.EditText;
import android.widget.GridView;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBar;
import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.view.menu.MenuBuilder;
import androidx.appcompat.widget.AppCompatCheckBox;
import androidx.appcompat.widget.SearchView;
import androidx.appcompat.widget.Toolbar;
import androidx.core.content.ContextCompat;
import androidx.core.view.GravityCompat;
import androidx.drawerlayout.widget.DrawerLayout;

import com.google.android.material.navigation.NavigationView;
import com.xoonit.camera.Database.DatabaseHelper;
import com.xoonit.camera.Database.DocumentTreeItem;
import com.xoonit.camera.Database.Images;
import com.xoonit.camera.Database.ScansContainerItem;
import com.xoonit.camera.Database.ScansImages;
import com.xoonit.camera.Database.UploadImages;
import com.xoonit.camera.Model.UploadImageResponse;
import com.xoonit.camera.R;
import com.xoonit.camera.XoonitApplication;
import com.xoonit.camera.api.core.ApiCallBack;
import com.xoonit.camera.api.core.ApiClient;
import com.xoonit.camera.fragments.MainActivity;
import com.xoonit.camera.utils.ConstantUtils;
import com.xoonit.camera.utils.GeneralMethod;
import com.xoonit.camera.utils.LoadingDialog;
import com.xoonit.camera.utils.Logger;
import com.xoonit.camera.utils.ScanConstants;

import org.jetbrains.annotations.Nullable;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.TimeZone;
import java.util.UUID;

public class GridViewActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener, AdapterView.OnItemLongClickListener, AdapterView.OnItemClickListener {
    private DrawerLayout drawerLayout;
    private ActionBarDrawerToggle toggle;
    GridView gridViewSingle, gridViewMultiple;
    com.xoonit.camera.Activities.CustomListViewAdapter customListViewAdapter;
    com.xoonit.camera.Activities.CustomListViewMultipleAdapter customListViewMultipleAdapter;
    private View navHeaderView;
    private ListView listViewSingle, ListViewMulti;
    private DatabaseHelper databaseHelper;
    public int REQ_CODE_SPEECH_INPUT = 101;
    private AppCompatCheckBox checkBox_Single, checkBoxMulti, checkBoxAllSingle, checkBoxAllMultiple;
    private CustomListAdapter gridViewAdapter;
    private com.xoonit.camera.Activities.CustomListMutilpleAdapter gridMultipleAdapter;
    private ArrayList<ScansImages> scansImagesList, scansImagesKreditoren, scansImagesDebitoren, scansImagesBankbelege, scansImagesSteuern, scansImagesSpesenbelege, scansImagesDiverses;
    private ArrayList<ScansImages> scansImagesListMultiple;
    private ViewStub stubGridSingle;
    private ViewStub stubGridMultiple;
    private NavigationView navigationView;
    private AlertDialog alertDialog;
    private ImageButton btnAddText, btnAddVoice, btnDelete;
    private ImageButton btnAbout;
    private ImageButton btnAddTextMulti, btnAddVoiceMulti, btnDeleteAll;
    private ImageButton btnDoneSingle, btnDoneMulti;
    private ImageButton btnSwitchMode, btnSwitchModeMulti, btnReload, btnReloadMulti;
    private ImageButton btnSendAll, btnSendAllMulti;

    private Toolbar toolbar_top, toolbar_top_muti;
    private TextView textUsers;
    private TextView titleFolder, titleSetting, textHeader, textHeaderMulti;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_list);
        init();
        //button mode single
        databaseHelper = new DatabaseHelper(this);
        scansImagesList = databaseHelper.getScansImagesSingle();
        scansImagesListMultiple = databaseHelper.getScansImagesBatch();
        switchView();
    }

    public void init() {
        navigationView = findViewById(R.id.nav_view);
        stubGridSingle = findViewById(R.id.girdviewSingle);
        stubGridMultiple = findViewById(R.id.gridviewMutilple);
        stubGridSingle.inflate();
        stubGridMultiple.inflate();
        textHeader = findViewById(R.id.TextHeader_single);
        textHeaderMulti = findViewById(R.id.textHeader_multi);
        checkBox_Single = findViewById(R.id.checkboxSingle);
        checkBoxMulti = findViewById(R.id.checkBoxMulti);
        gridViewSingle = findViewById(R.id.gird_single);
        gridViewMultiple = findViewById(R.id.gird_mutilple);
        btnReload = findViewById(R.id.btnAddDocFromList);
        btnReloadMulti = findViewById(R.id.btnAddDocFromListMulti);
        btnSwitchMode = findViewById(R.id.btnSwitchMode);
        btnSwitchModeMulti = findViewById(R.id.btnSwitchModeMulti);
        btnDoneSingle = findViewById(R.id.btnDoneSingle);
        btnDoneSingle.setVisibility(View.GONE);
        btnDoneMulti = findViewById(R.id.btnDoneMultiple);
        btnDoneMulti.setVisibility(View.GONE);
        checkBoxAllSingle = findViewById(R.id.checkboxAllSingle);
        checkBoxAllSingle.setVisibility(View.GONE);
        checkBoxAllMultiple = findViewById(R.id.checkboxAllMultiple);
        checkBoxAllMultiple.setVisibility(View.GONE);
        btnAddText = findViewById(R.id.btnAddTextList);
        btnAddText.setEnabled(false);
        btnAddText.setImageDrawable(getResources().getDrawable(R.drawable.text_off));
        btnAddVoice = findViewById(R.id.btnAddVoiceList);
        btnAddVoice.setEnabled(false);
        btnAddVoice.setImageDrawable(getResources().getDrawable(R.drawable.voice_off));
        btnDelete = findViewById(R.id.btnDeleteAll);
        btnDelete.setEnabled(false);
        btnDelete.setImageDrawable(getResources().getDrawable(R.drawable.can_off));
        drawerLayout = findViewById(R.id.drawer_layout);
        navHeaderView = navigationView.inflateHeaderView(R.layout.nav_header_main);
        textUsers = navHeaderView.findViewById(R.id.nav_header_textView);
        btnSendAll = findViewById(R.id.button_sendAll);
        btnSendAllMulti = findViewById(R.id.button_sendAllMulti);
//        textUsers.setText("Welcome,"+ " "+ ScanConstants.DefaultUserNickName);
//        textUsers = navHeaderView.findViewById(R.id.nav_header_textView);
        textUsers.setText("Welcome");

//        textUsers.setText(ScanConstants.DefaultUserLoginName);
        listViewSingle = findViewById(R.id.list_view_single);
        ListViewMulti = findViewById(R.id.list_view_multi);
        navigationView.setBackgroundColor(getResources().getColor(R.color.white));
        navigationView.setItemTextColor(ColorStateList.valueOf(getResources().getColor(R.color.lightMydm)));
        navigationView.setItemIconTintList(getResources().getColorStateList(R.color.lightMydm));

    }


    private void setupNavigationDrawer() {
        ActionBarDrawerToggle toggle =
                new ActionBarDrawerToggle
                        (this,
                                drawerLayout,
                                toolbar_top,
                                R.string.navigation_drawer_open, R.string.navigation_drawer_close
                        );

        toggle.syncState();
    }

    private void closeDrawer() {
        drawerLayout.closeDrawer(GravityCompat.START);
        DoneSave(null);
    }

    @Override
    public boolean onNavigationItemSelected(@NonNull MenuItem item) {
        closeDrawer();
        for (DocumentTreeItem doc : XoonitApplication.getInstance().getDocumentTreeItemList()) {
            if (item.getItemId() == doc.getData().getIDDocumentTree()) {
                scansImagesList = databaseHelper
                        .getScansImagesSingleByDocumentTreeId(doc.getData().getIDDocumentTree());
                scansImagesListMultiple = databaseHelper
                        .getScansImagesBatchByDocumentTreeId(doc.getData().getIDDocumentTree());

                setAdapters();
                textHeader.setText(doc.getData().getGroupName());
                textHeaderMulti.setText(String.format("%s %s", doc.getData().getGroupName(), getString(R.string.Batch)));
            }
        }
        switch (item.getItemId()) {
            case ConstantUtils.ALL_FOLDER_MENU_ID:
                scansImagesList = databaseHelper.getScansImagesSingle();
                scansImagesListMultiple = databaseHelper.getScansImagesBatch();
                setAdapters();
                textHeader.setText(getString(R.string.All));
                textHeaderMulti.setText(String.format("%s %s", getString(R.string.All), getString(R.string.Batch)));
                break;
            case ConstantUtils.LOGOUT_MENU_ID:
                AlertDialog.Builder builder = new AlertDialog.Builder(this)
                        .setMessage("Do want to Log out ?")
                        .setPositiveButton("OK", (dialog, which) -> {
                            GeneralMethod.clearUserData();

                            Intent intent = new Intent(GridViewActivity.this, com.xoonit.camera.Activities.LoginActivity_.class);
                            startActivity(intent);
                            finish();
                        })
                        .setNegativeButton("Cancel", (dialog, which) -> {
                            dialog.dismiss();
                        });
                AlertDialog dialog = builder.create();
                dialog.show();
                break;
            default:
                break;
        }
        return true;
    }

    private void setupBuggerLeftMenu() {
        Menu menu = navigationView.getMenu();
        menu.clear();
        SubMenu folderMenu = menu.addSubMenu(getString(R.string.TitleFolder));
        int allPhotoCount = databaseHelper.getSizeAllPhoto().size();
        folderMenu.add(Menu.NONE, ConstantUtils.ALL_FOLDER_MENU_ID, Menu.NONE, getString(R.string.folder_name_format, "All photo", allPhotoCount));
        folderMenu.findItem(ConstantUtils.ALL_FOLDER_MENU_ID).setIcon(ContextCompat.getDrawable(this, R.drawable.ic_icons8_folder));
        for (DocumentTreeItem doc : XoonitApplication.getInstance().getDocumentTreeItemList()) {
            int photoCountById = databaseHelper.getListPhotoByIdDocumentTree(doc.getData().getIDDocumentTree()).size();
            folderMenu.add(Menu.NONE, doc.getData().getIDDocumentTree(), Menu.NONE, getString(R.string.folder_name_format, doc.getData().getGroupName(), photoCountById));
            folderMenu.findItem(doc.getData().getIDDocumentTree()).setIcon(ContextCompat.getDrawable(this, R.drawable.ic_icons8_folder));
        }
        SubMenu settingMenuItem = menu.addSubMenu(getString(R.string.TitleSetting));
        settingMenuItem.add(Menu.NONE, ConstantUtils.ABOUT_MENU_ID, Menu.NONE, getString(R.string.mnu_about));
        settingMenuItem.findItem(ConstantUtils.ABOUT_MENU_ID).setIcon(ContextCompat.getDrawable(this, R.drawable.ic_info_black_24dp));
        settingMenuItem.add(Menu.NONE, ConstantUtils.LOGOUT_MENU_ID, Menu.NONE, getString(R.string.log_out));
        settingMenuItem.findItem(ConstantUtils.LOGOUT_MENU_ID).setIcon(ContextCompat.getDrawable(this, R.drawable.ic_power_settings_new_24px));
    }

    public void switchView() {
        scansImagesList = databaseHelper.getScansImagesSingle();
        scansImagesListMultiple = databaseHelper.getScansImagesBatch();
        if (ScanConstants.ViewMode == 0) {
            btnSwitchMode.setEnabled(true);
            stubGridSingle.setVisibility(View.VISIBLE);
            stubGridMultiple.setVisibility(View.GONE);
            btnSendAllMulti.setEnabled(false);
            btnSendAll.setEnabled(true);
            btnSwitchMode.setImageDrawable(getResources().getDrawable(R.drawable.single_mode));
            btnReload.setImageDrawable(getResources().getDrawable(R.drawable.camera_single));
            btnAddText = findViewById(R.id.btnAddTextList);
            btnAddVoice = findViewById(R.id.btnAddVoiceList);
            btnDelete = findViewById(R.id.btnDeleteAll);
            toolbar_top = findViewById(R.id.toolbar_top_single);
            setSupportActionBar(toolbar_top);
            setupNavigationDrawer();
            navigationView.setNavigationItemSelectedListener(this);
            onDisableControlToolbar();
            ActionBar actionBar = getSupportActionBar();
            actionBar.setDisplayHomeAsUpEnabled(true);
            actionBar.setHomeButtonEnabled(true);
            actionBar.setHomeAsUpIndicator(R.drawable.ic_icons8_menu);
        } else {
            btnSwitchModeMulti.setEnabled(true);
            stubGridSingle.setVisibility(View.GONE);
            stubGridMultiple.setVisibility(View.VISIBLE);
            btnSendAll.setEnabled(false);
            btnSendAllMulti.setEnabled(true);
            btnSwitchMode.setImageDrawable(getResources().getDrawable(R.drawable.batch_mode));
            btnReloadMulti.setImageDrawable(getResources().getDrawable(R.drawable.camera_single));
            btnAddTextMulti = findViewById(R.id.btnAddTextListMulti);
            btnAddVoiceMulti = findViewById(R.id.btnAddVoiceListMulti);
            btnDeleteAll = findViewById(R.id.btnDeleteAllMulti);
            toolbar_top = findViewById(R.id.toolbar_top_multi);
            setSupportActionBar(toolbar_top);
            setupNavigationDrawer();
            navigationView.setNavigationItemSelectedListener(this);
            onDisableControlToolbar();
            ActionBar actionBar = getSupportActionBar();
            actionBar.setDisplayHomeAsUpEnabled(true);
            actionBar.setHomeButtonEnabled(true);
            actionBar.setHomeAsUpIndicator(R.drawable.ic_icons8_menu);
        }
        setupBuggerLeftMenu();
        setAdapters();
    }

    public void setAdapters() {
        if (ScanConstants.ViewMode == 0) {
            if (ScanConstants.ViewContainer == 1) {
                //region GridView
                listViewSingle.setVisibility(View.GONE);
                gridViewSingle.setVisibility(View.VISIBLE);
                gridViewAdapter = new CustomListAdapter(this, R.layout.custom_image_list, scansImagesList);
                gridViewSingle.setAdapter(gridViewAdapter);
                gridViewSingle.setOnItemLongClickListener(this);
                gridViewSingle.setOnItemClickListener(this);
                //endregion
            } else {
                //region ListView
                listViewSingle.setVisibility(View.VISIBLE);
                gridViewSingle.setVisibility(View.GONE);
                customListViewAdapter = new com.xoonit.camera.Activities.CustomListViewAdapter(this, R.layout.custom_listview_single, scansImagesList);
                listViewSingle.setAdapter(customListViewAdapter);
                listViewSingle.setOnItemLongClickListener(this);
                listViewSingle.setOnItemClickListener(this);
                //endregion
            }
        } else {
            if (ScanConstants.ViewContainer == 1) {
                //region GridView
                ListViewMulti.setVisibility(View.GONE);
                gridViewMultiple.setVisibility(View.VISIBLE);
                gridMultipleAdapter = new com.xoonit.camera.Activities.CustomListMutilpleAdapter(this, R.layout.custom_image_mutilple_list, scansImagesListMultiple);
                gridViewMultiple.setAdapter(gridMultipleAdapter);
                gridViewMultiple.setOnItemLongClickListener(this);
                gridViewMultiple.setOnItemClickListener(this);
                //endregion
            } else {
                //region ListView
                ListViewMulti.setVisibility(View.VISIBLE);
                gridViewMultiple.setVisibility(View.GONE);
                customListViewMultipleAdapter = new com.xoonit.camera.Activities.CustomListViewMultipleAdapter(this, R.layout.custom_listview_multiple, scansImagesListMultiple);
                ListViewMulti.setAdapter(customListViewMultipleAdapter);
                ListViewMulti.setOnItemLongClickListener(this);
                ListViewMulti.setOnItemClickListener(this);
                //endregion
            }
        }
    }

    @Override
    public void onBackPressed() {

        if (checkBoxAllSingle.getVisibility() == View.VISIBLE || checkBoxAllMultiple.getVisibility() == View.VISIBLE) {
            DoneSave(null);
        } else {
            Intent intent = new Intent(GridViewActivity.this, MainActivity.class);
            startActivity(intent);
            finish();
        }
    }

    public void SwitchMode(View view) {
        if (ScanConstants.ViewMode == 0) {
            ScanConstants.ViewMode = 1;
        } else {
            ScanConstants.ViewMode = 0;
        }
        switchView();
    }

    public void DoneSave(View view) {
        if (ScanConstants.ViewMode == 0) {
            doDoneButton();
        } else doDoneButtonMulti();
    }

    public void doDoneButton() {
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                btnSwitchMode.setEnabled(true);
                btnDoneSingle.setVisibility(View.GONE);
                checkBoxAllSingle.setChecked(false);
                checkBoxAllSingle.setVisibility(View.GONE);
                onDisableControlToolbar();
                onDoneSelected();
                btnReload.setImageDrawable(getResources().getDrawable(R.drawable.camera_single));
                btnReload.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        Intent intent = new Intent(GridViewActivity.this, MainActivity.class);
                        startActivity(intent);
                        finish();
                    }
                });
                gridViewSingle.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                        Intent intent = new Intent(GridViewActivity.this, com.xoonit.camera.Activities.PreviewActivity.class);
                        String IdScansImage = String.valueOf(scansImagesList.get(position).getIdScansImage());
                        intent.putExtra(ScanConstants.StrImageId, IdScansImage);
                        startActivity(intent);
                    }
                });
                btnDoneSingle.setVisibility(View.GONE);
            }
        }, 10);
    }

    private void onDoneSelected() {
        if (ScanConstants.ViewMode == 0) {
            if (ScanConstants.ViewContainer == 1) {
                gridViewAdapter.showAllCheckBox(false);
                gridViewSingle.setOnItemClickListener(this);
            } else {
                listViewSingle.setOnItemClickListener(this);
                customListViewAdapter.showAllCheckBox(false);
            }
        } else {
            if (ScanConstants.ViewContainer == 1) {
                gridMultipleAdapter.showAllCheckBox(false);
                gridViewMultiple.setOnItemClickListener(this);
            } else {
                ListViewMulti.setOnItemClickListener(this);
                customListViewMultipleAdapter.showAllCheckBox(false);
            }
        }
    }

    public void ReloadCamera(View view) {
        Intent intent = new Intent(GridViewActivity.this, MainActivity.class);
        startActivity(intent);
        finish();
    }

    // Delete photos selected in list
    public void DeleteAll(View view) {
        new AlertDialog.Builder(this)
                .setIcon(android.R.drawable.ic_dialog_alert)
                .setTitle("Confrim")
                .setMessage("Are you sure you want to delete these document?")
                .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        ArrayList<ScansImages> selectedDelete = new ArrayList<ScansImages>();
                        // Get selected list images from single put into selectedGroup
                        for (int i = 0; i < scansImagesList.size(); i++) {
                            if (scansImagesList.get(i).getCheckboxState()) {
                                // get Dir of file
                                File mDir = new File(scansImagesList.get(i).getImagePath());
                                if (mDir.listFiles() != null) {
                                    int sizeDir = Objects.requireNonNull(mDir.listFiles()).length;
                                    File file = new File(scansImagesList.get(i).getImagePath(), scansImagesList.get(i).getImageName());
                                    if (sizeDir == 1) {
                                        file.delete();
                                        mDir.delete();
                                    } else if (sizeDir == 0)
                                        mDir.delete();
                                    else
                                        file.delete();
                                }
                                selectedDelete.add(scansImagesList.get(i));
                                databaseHelper.deleteSingleScansImagesbyId(scansImagesList.get(i).getIdScansImage());

                            }
                        }
                        scansImagesList.removeAll(selectedDelete);
                        // Refresh  gridview
                        btnReload.setImageResource(R.drawable.camera_single);
                        switchView();
                        doDoneButton();
                    }

                })
                .setNegativeButton("No", null)
                .show();
    }

    public void DeleteAllMulti(View v) {

        new AlertDialog.Builder(this)
                .setIcon(android.R.drawable.ic_dialog_alert)
                .setTitle("Confrim")
                .setMessage("Are you sure you want to delete these document?")
                .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        ArrayList<ScansImages> selectedDelete = new ArrayList<ScansImages>();
                        // Get selected list images from single put into selectedGroup
                        for (int i = 0; i < scansImagesListMultiple.size(); i++) {
                            if (scansImagesListMultiple.get(i).getCheckboxState()) {
                                List<ScansImages> batchDocument = databaseHelper.getScansImagesByGroupNr(scansImagesListMultiple.get(i).getGroupNr());
                                //get Dir
                                for (ScansImages scanItem : batchDocument) {
                                    File mDirectory = new File(scanItem.getImagePath());
                                    File file = new File(scanItem.getImagePath(), scanItem.getImageName());
                                    if (mDirectory.listFiles() != null) {
                                        int sizeDir = Objects.requireNonNull(mDirectory.listFiles()).length;
                                        if (sizeDir == 1) {
                                            file.delete();
                                            mDirectory.delete();
                                        } else if (sizeDir == 0)
                                            mDirectory.delete();
                                        else {
                                            file.delete();
                                        }
                                    }
                                }
                                selectedDelete.add(scansImagesListMultiple.get(i));
                                databaseHelper.deleteGroupScansImagesbyGroupNr(scansImagesListMultiple.get(i).getGroupNr());
                            }
                        }
                        scansImagesListMultiple.removeAll(selectedDelete);
                        // Refresh  gridview
                        btnReload.setImageResource(R.drawable.camera_single);
                        switchView();
                        doDoneButtonMulti();
                    }

                })
                .setNegativeButton("No", null)
                .show();
    }

    private void startProgressBar(int max) {
        LoadingDialog.getInstance().showLoadingDialog(GridViewActivity.this, max, getString(R.string.uploading_image));
    }

    private void incrementLoadingProgress() {
        LoadingDialog.getInstance().incrementLoadingProgress();
    }

    /* Send all files to Server and Delete them  */
    public void SendAll(View view) throws IOException {
        scansImagesListMultiple = databaseHelper.getScansImagesBatch();
        //From single
        ArrayList<UploadImages> requestArray = new ArrayList<>();
        if (scansImagesList != null && scansImagesList.size() > 0) {
            //region Upload Single Mode
            for (int i = 0; i < scansImagesList.size(); i++) {

                List<Images> imagesArrayList = new ArrayList<>();
                ScansImages scansImages = scansImagesList.get(i);
                File file = new File(scansImages.getImagePath(), scansImages.getImageName());
                byte[] bytes = convertFiletoByteArray(file);
                String basre64_string = Base64.encodeToString(bytes, Base64.DEFAULT);
                String strbase64 = basre64_string.replace("\n", "");
                Images images = new Images();
                images.setBase64_string(strbase64);
                String filename = scansImages.getImageName();
                images.setFileName(filename);
                imagesArrayList.add(images);
                // add ImagesArraylist to uploadRequest
                UploadImages Request = new UploadImages();
                Request.setImages(imagesArrayList);
                //create ScanContainer
                Request.setScanningLotItemData(getScanImagesRequest(scansImages.getIdDocumentTree()));
                //add single images to request
                requestArray.add(Request);

            }
        }
        //endregion

        //region Multiple Mode
        if (scansImagesListMultiple != null && scansImagesListMultiple.size() > 0) {
            for (int i = 0; i < scansImagesListMultiple.size(); i++) {
                List<ScansImages> scansImagesByGroup = databaseHelper.getScansImagesByGroupNr(scansImagesListMultiple.get(i).getGroupNr());
                List<Images> imagesArrayListMulti = new ArrayList<>();
                for (ScansImages scanImage : scansImagesByGroup) {
                    File file = new File(scanImage.getImagePath(), scanImage.getImageName());
                    byte[] bytes = convertFiletoByteArray(file);
                    String basre64_string = Base64.encodeToString(bytes, Base64.DEFAULT);
                    String strbase64 = basre64_string.replace("\n", "");
                    String filename = scanImage.getImageName();
                    Images images = new Images();
                    images.setBase64_string(strbase64);
                    images.setFileName(filename);
                    images.setPageNr(scansImagesByGroup.indexOf(scanImage) + 1);
                    imagesArrayListMulti.add(images);

                    Log.d("DocumentTree", "TreeID: " + scanImage.getIdDocumentTree());
                }
                // add ImagesArraylist to uploadRequest
                UploadImages request = new UploadImages();
                request.setImages(imagesArrayListMulti);
                //create ScanContainer
                request.setScanningLotItemData(getScanImagesRequest(scansImagesByGroup.get(0).getIdDocumentTree()));
                //add single images to request
                requestArray.add(request);
            }
        }
//endregion
        if (requestArray.size() > 0) {
            startProgressBar(requestArray.size());
            //Run async task
            for (UploadImages requestsItem : requestArray) {
                uploadImageToServer(requestsItem);
            }
            //Reset
            ScanConstants.CurrentLotId = 0;
            ScanConstants.CurrentIdScansContainerItem = 0;
            ScanConstants.CurrentPageNr = 0;
        }
    }

    private void onUploadImageResponse(UploadImages uploadImages, UploadImageResponse uploadImageResponse) {
        Logger.Debug("Upload image success: " + uploadImageResponse);
        uploadImageResponse.getItem();
        if (uploadImageResponse.getItem().getResult() != null && uploadImageResponse.getItem().getResult().isSuccess()) {
            if (uploadImages.getImages().size() == 1) {
                for (ScansImages scanImage : scansImagesList) {
                    if (scanImage.getImageName().equals(uploadImages.getImages().get(0).getFileName())) {
                        databaseHelper.deleteSingleScansImagesbyId(scanImage.getIdScansImage());
                        break;
                    }
                }
            } else {
                boolean isBreak = false;
                for (ScansImages scanImage : scansImagesListMultiple) {
                    if (isBreak) {
                        break;
                    }
                    for (Images image : uploadImages.getImages()) {
                        if (image.getFileName().equals(scanImage.getImageName())) {
                            databaseHelper.deleteGroupScansImagesbyGroupNr(scanImage.getGroupNr());
                            isBreak = true;
                            break;
                        }
                    }
                }
            }
            switchView();
        } else {
            onUploadImageFailed(uploadImages.getImages().get(0).getFileName());
        }
    }

    private void onUploadImageFailed(String fileName) {
        Logger.Debug("Upload image failed: " + fileName);
        Toast.makeText(getApplicationContext(), "Fail to upload image: " + fileName, Toast.LENGTH_SHORT).show();
    }


    private void uploadImageToServer(UploadImages uploadImages) {
        String token = XoonitApplication.getInstance().getSharePref().accessToken().getOr("");
        if (token != null) {
            ApiClient.getService().uploadImage(uploadImages)
                    .enqueue(new ApiCallBack<UploadImageResponse>(this) {
                        @Override
                        public void success(UploadImageResponse uploadImageResponse) {
                            onUploadImageResponse(uploadImages, uploadImageResponse);
                            incrementLoadingProgress();
                        }

                        @Override
                        public void failure(List<String> listError) {
                            onUploadImageFailed(uploadImages.getImages().get(0).getFileName());
                            incrementLoadingProgress();
                        }
                    });
        }
    }

    private ScansContainerItem getScanImagesRequest(int idDocumentTree) {
        ScansContainerItem scansContainerItem = new ScansContainerItem();
        scansContainerItem.setIdRepScansContainerType(1);
        scansContainerItem.setIdRepScanDeviceType(2);
        scansContainerItem.setCustomerNr("1");
        scansContainerItem.setMediaCode("1");
        TimeZone tz1 = TimeZone.getTimeZone("UTC");
        SimpleDateFormat sdformat2 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
        sdformat2.setTimeZone(tz1);
        scansContainerItem.setScannedDateUTC(sdformat2.format(new Date()));
        scansContainerItem.setCoordinatePageNr(0);
//        scansItemMulti.setNumberOfImages(ScanConstants.GroupNr);
        scansContainerItem.setNumberOfImages(1);
        scansContainerItem.setSourceScanGUID(UUID.randomUUID().toString());
        scansContainerItem.setSynced(true);
        scansContainerItem.setIsActive("1");
        scansContainerItem.setUserClicked(true);
        if (idDocumentTree > 0)
            scansContainerItem.setIdDocumentTree(String.valueOf(idDocumentTree));
        return scansContainerItem;
    }

    //mode single
    public void EditListView(@Nullable View view) {
        runBackground();
    }

    //region User define function
    private void editListViewMode() {
        if (ScanConstants.ViewContainer == 1) {
            gridViewAdapter.showAllCheckBox(true);
        } else customListViewAdapter.showAllCheckBox(true);
        btnDoneSingle.setVisibility(View.VISIBLE);
        checkBoxAllSingle.setVisibility(View.VISIBLE);
        checkBoxAllSingle.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (checkBoxAllSingle.isChecked()) {
                    if (ScanConstants.ViewContainer == 1) {
                        gridViewAdapter.checkAllCheckBox(true);
                    } else customListViewAdapter.checkAllCheckBox(true);
                    btnReload.setImageDrawable(getResources().getDrawable(R.drawable.group_by));
                    onEnableControlToolbar();
                } else {
                    if (ScanConstants.ViewContainer == 1) {
                        gridViewAdapter.checkAllCheckBox(false);
                    } else customListViewAdapter.checkAllCheckBox(false);
                    btnReload.setImageDrawable(getResources().getDrawable(R.drawable.camera_single));
                    onDisableControlToolbar();
                }
            }
        });
    }

    public void runBackground() {
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                editListViewMode();
            }
        }, 10);
    }

    public boolean GroupBy(View view) {

        int singleCount = gridViewSingle.getAdapter().getCount();
        ArrayList<ScansImages> selectedGroup = new ArrayList<ScansImages>();
        // Get selected list images from single put into selectedGroup
        for (int i = 0; i < singleCount; i++) {
            if (scansImagesList.get(i).getCheckboxState()) {
                if (selectedGroup.size() > 0
                        && selectedGroup.get(0).getIdDocumentTree() != scansImagesList.get(i).getIdDocumentTree()) {
                    ScanConstants.GroupNr = 0;
                    Toast.makeText(getApplicationContext(), R.string.group_2_different_docuement_type_error, Toast.LENGTH_SHORT).show();
                    return false;
                }
                selectedGroup.add(scansImagesList.get(i));
                if (ScanConstants.GroupNr == 0) {
                    ScanConstants.GroupNr = scansImagesList.get(i).getIdScansImage();
                }

            }
        }
        // Save list selectedGroup into database and remove from single
        for (int j = selectedGroup.size() - 1; j >= 0; j--) {
            databaseHelper.updateScansImagesByGroupNr(selectedGroup.get(j).getIdScansImage(), ScanConstants.GroupNr);
        }
        scansImagesList.removeAll(selectedGroup);
        if (ScanConstants.ViewContainer == 1) {
            // Refresh single gridview
            gridViewAdapter.notifyDataSetChanged();
        } else {
            customListViewAdapter.notifyDataSetChanged();
        }
        btnReload.setImageResource(R.drawable.camera_single);
        btnReload.setImageDrawable(getResources().getDrawable(R.drawable.camera_single));

        btnReload.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(GridViewActivity.this, MainActivity.class);
                startActivity(intent);
//                finish();
            }
        });
        ScanConstants.GroupNr = 0;
        doDoneButton();
        return true;
    }

    // mode multi
    public void EditListViewMulti(@Nullable View view) {
        runBackgroundMulti();
    }

    public void runBackgroundMulti() {
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                editListViewModeMulti();
            }
        }, 10);
    }

    private void editListViewModeMulti() {
        if (ScanConstants.ViewContainer == 1) {
            gridMultipleAdapter.showAllCheckBox(true);
        } else customListViewMultipleAdapter.showAllCheckBox(true);
        btnDoneMulti.setVisibility((View.VISIBLE));
        checkBoxAllMultiple.setVisibility(View.VISIBLE);
        checkBoxAllMultiple.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (checkBoxAllMultiple.isChecked()) {
                    if (ScanConstants.ViewContainer == 1) {
                        gridMultipleAdapter.checkAllCheckBox(true);
                    } else {
                        customListViewMultipleAdapter.checkAllCheckBox(true);
                    }
                    btnReloadMulti.setImageDrawable(getResources().getDrawable(R.drawable.group_out));
                    onEnableControlToolbar();
                } else {
                    if (ScanConstants.ViewContainer == 1) {
                        gridMultipleAdapter.checkAllCheckBox(false);
                    } else {
                        customListViewMultipleAdapter.checkAllCheckBox(false);
                    }
                    btnReloadMulti.setImageDrawable(getResources().getDrawable(R.drawable.camera_single));
                    onDisableControlToolbar();
                }
            }
        });
    }

    public void GroupOut(View view) {
        int multiCount = gridViewMultiple.getAdapter().getCount();
        ArrayList<ScansImages> selectedUnGroup = new ArrayList<ScansImages>();
        // Get selected list images from single put into selectedGroup
        for (int i = 0; i < multiCount; i++) {
            if (scansImagesListMultiple.get(i).getCheckboxState()) {
                ScansImages selectedUngroupItem = scansImagesListMultiple.get(i);
                List<ScansImages> scansImagesFromGroup = databaseHelper.getScansImagesByGroupNr(selectedUngroupItem.getGroupNr());
                selectedUnGroup.add(selectedUngroupItem);
                for (int j = 0; j < scansImagesFromGroup.size(); j++) {
                    ScansImages scansImageToSingle = scansImagesFromGroup.get(j);
                    scansImageToSingle.setGroupNr(0);
                    databaseHelper.updateScansImagesByGroupNr(scansImageToSingle.getIdScansImage(), scansImageToSingle.getGroupNr());
                    scansImagesList.add(scansImageToSingle);
                }
            }
        }
        scansImagesListMultiple.removeAll(selectedUnGroup);
        if (ScanConstants.ViewContainer == 1) {
            // Refresh multiple gridview
            gridMultipleAdapter = new com.xoonit.camera.Activities.CustomListMutilpleAdapter(GridViewActivity.this, R.layout.custom_image_mutilple_list, scansImagesListMultiple);
            gridViewMultiple.setAdapter(gridMultipleAdapter);

        } else {
            // Refresh multiple gridview
            customListViewMultipleAdapter = new com.xoonit.camera.Activities.CustomListViewMultipleAdapter(GridViewActivity.this, R.layout.custom_listview_multiple, scansImagesListMultiple);
            ListViewMulti.setAdapter(customListViewMultipleAdapter);
        }
        btnReloadMulti.setImageDrawable(getResources().getDrawable(R.drawable.camera_single));
        btnReloadMulti.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(GridViewActivity.this, MainActivity.class);
                startActivity(intent);
                finish();
            }
        });
        doDoneButtonMulti();
    }

    public void doDoneButtonMulti() {
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                btnSwitchModeMulti.setEnabled(true);
                btnDoneMulti.setVisibility(View.GONE);
                checkBoxAllMultiple.setChecked(false);
                checkBoxAllMultiple.setVisibility(View.GONE);
                onDisableControlToolbar();
                onDoneSelected();
                for (int i = 0; i < scansImagesListMultiple.size(); i++) {
                    gridMultipleAdapter.showAllCheckBox(false);
                    btnReloadMulti.setImageDrawable(getResources().getDrawable(R.drawable.camera_single));
                    btnReloadMulti.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            Intent intent = new Intent(GridViewActivity.this, MainActivity.class);
                            startActivity(intent);
                            finish();
                        }
                    });
                }
                gridViewMultiple.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                        Intent intent = new Intent(GridViewActivity.this, com.xoonit.camera.Activities.PreviewActivity.class);
                        String GroupNr = String.valueOf(scansImagesListMultiple.get(position).getGroupNr());
                        intent.putExtra(ScanConstants.StrGroupNr, GroupNr);
                        startActivity(intent);
                        finish();
                    }
                });
                btnDoneMulti.setVisibility(View.GONE);
            }
        }, 10);
    }

    public void onEnableControlToolbar() {
        if (ScanConstants.ViewMode == 0) {
            btnAddText.setEnabled(true);
            btnAddText.setImageDrawable(getResources().getDrawable(R.drawable.text_open));
            btnAddVoice.setEnabled(true);
            btnAddVoice.setImageDrawable(getResources().getDrawable(R.drawable.voice_open));
            btnDelete.setEnabled(true);
            btnDelete.setImageDrawable(getResources().getDrawable(R.drawable.can_open));
        } else {
            btnAddTextMulti.setEnabled(true);
            btnAddTextMulti.setImageDrawable(getResources().getDrawable(R.drawable.text_open));
            btnAddVoiceMulti.setEnabled(true);
            btnAddVoiceMulti.setImageDrawable(getResources().getDrawable(R.drawable.voice_open));
            btnDeleteAll.setEnabled(true);
            btnDeleteAll.setImageDrawable(getResources().getDrawable(R.drawable.can_open));
        }
    }

    public void onDisableControlToolbar() {
        if (ScanConstants.ViewMode == 0) {
            btnAddText.setEnabled(false);
            btnAddText.setImageDrawable(getResources().getDrawable(R.drawable.text_off));
            btnAddVoice.setEnabled(false);
            btnAddVoice.setImageDrawable(getResources().getDrawable(R.drawable.voice_off));
            btnDelete.setEnabled(false);
            btnDelete.setImageDrawable(getResources().getDrawable(R.drawable.can_off));
        } else {
            btnAddTextMulti.setEnabled(false);
            btnAddTextMulti.setImageDrawable(getResources().getDrawable(R.drawable.text_off));
            btnAddVoiceMulti.setEnabled(false);
            btnAddVoiceMulti.setImageDrawable(getResources().getDrawable(R.drawable.voice_off));
            btnDeleteAll.setEnabled(false);
            btnDeleteAll.setImageDrawable(getResources().getDrawable(R.drawable.can_off));
        }
    }

    // function Single
    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_CODE_SPEECH_INPUT) {
            if (resultCode == RESULT_OK && null != data) {
                ArrayList<String> result = data
                        .getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                String voiceNotes = result.get(0);
                //process gridview
                if (ScanConstants.ViewMode == 0) {
                    int singleCount = gridViewSingle.getAdapter().getCount();
                    // Get selected list images from single put into selectedGroup
                    for (int i = 0; i < singleCount; i++) {
                        if (scansImagesList.get(i).getCheckboxState()) {
//                            scansImagesList.get(i).setTextNotes(voiceNotes);
                            databaseHelper.updateScansImagesByNotes(scansImagesList.get(i));
                        }
                    }
                    // Refresh single gridview
                    gridViewAdapter = new CustomListAdapter(this, R.layout.custom_image_list, scansImagesList);
                    gridViewAdapter.notifyDataSetChanged();
                    btnReload.setImageResource(R.drawable.camera_single);
                } else {
                    int multiCount = gridViewMultiple.getAdapter().getCount();
                    // Get selected list images from single put into selectedGroup
                    for (int i = 0; i < multiCount; i++) {
                        if (scansImagesListMultiple.get(i).getCheckboxState()) {
//                            scansImagesListMultiple.get(i).setTextNotes(voiceNotes);
                            databaseHelper.updateScansImagesByNotesMultiple(scansImagesListMultiple.get(i).getGroupNr(), scansImagesListMultiple.get(i).getNotes());

                        }
                    }
                    // Refresh multiple gridview
                    gridMultipleAdapter = new com.xoonit.camera.Activities.CustomListMutilpleAdapter(this, R.layout.custom_image_mutilple_list, scansImagesListMultiple);
                    gridMultipleAdapter.notifyDataSetChanged();
                    btnReload.setImageResource(R.drawable.camera_single);
                }
                if (voiceNotes != "") {
                    //Snack bar
                    Toast.makeText(getApplicationContext(), "Note added:" + voiceNotes, Toast.LENGTH_SHORT).show();
                }
                doDoneButton();
            }
        }
    }

    public void AddVoiceNotes(View view) {
        promptSpeechInput();
    }

    public void AddTextNotes(View view) {
        final EditText txtAddNotes = new EditText(GridViewActivity.this);
        // create the AlertDialog as final
        AlertDialog.Builder builder = new AlertDialog.Builder(GridViewActivity.this);
        builder.setTitle(getString(R.string.note_title));
        builder.setIcon(R.drawable.ic_comment_black_24dp);
        builder.setView(txtAddNotes);
        builder.setPositiveButton(getString(R.string.note_ok_button), new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int id) {
                txtAddNotes.setFocusable(false);
                String textNotes = txtAddNotes.getText().toString();
                //process gridview
                if (ScanConstants.ViewMode == 0) {
                    int singleCount = gridViewSingle.getAdapter().getCount();
                    // Get selected list images from single put into selectedGroup
                    for (int i = 0; i < singleCount; i++) {
                        if (scansImagesList.get(i).getCheckboxState()) {
//                            scansImagesList.get(i).setTextNotes(textNotes);
                            databaseHelper.updateScansImagesByNotes(scansImagesList.get(i));
                        }
                    }
                    // Refresh single gridview
                    gridViewAdapter.notifyDataSetChanged();
                    btnReload.setImageResource(R.drawable.camera_single);
                } else {
                    int multiCount = gridViewMultiple.getAdapter().getCount();
                    // Get selected list images from single put into selectedGroup
                    for (int i = 0; i < multiCount; i++) {
                        if (scansImagesListMultiple.get(i).getCheckboxState()) {
//                            scansImagesListMultiple.get(i).setTextNotes(textNotes);
                            databaseHelper.updateScansImagesByNotesMultiple(scansImagesListMultiple.get(i).getGroupNr(), scansImagesListMultiple.get(i).getNotes());
                        }
                    }
                    // Refresh multiple gridview

                    gridMultipleAdapter.notifyDataSetChanged();
                    btnReload.setImageResource(R.drawable.camera_single);
                }
                //Snack bar
                Toast.makeText(getApplicationContext(), "Note added:" + txtAddNotes.getText(), Toast.LENGTH_SHORT).show();
                doDoneButton();
            }
        }).setNegativeButton(getString(R.string.note_cancel_button), new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int id) {
                // removes the AlertDialog in the screen
                dialog.dismiss();
            }
        });
        final AlertDialog dialog = builder.create();
        dialog.show();
    }

    private void promptSpeechInput() {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);

        String language_code = getString(R.string.language_code);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, language_code);

        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, language_code);
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


    @SuppressLint("RestrictedApi")
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        if (menu instanceof MenuBuilder) {
            ((MenuBuilder) menu).setOptionalIconsVisible(true);
        }
        inflater.inflate(R.menu.menu_listmenu_toolbar, menu);
        if (ScanConstants.ViewMode != 0) {
            menu.removeItem(R.id.sort_by);
        }
        if (ScanConstants.ViewContainer == 1) {
            menu.findItem(R.id.list_view).setIcon(R.drawable.list_view_24dp);
            menu.findItem(R.id.list_view).setTitle("List View");
        } else {
            menu.findItem(R.id.list_view).setIcon(R.drawable.grid_view_24dp);
            menu.findItem(R.id.list_view).setTitle("Gird View");
        }
        SearchView searchView = (SearchView) menu.findItem(R.id.search_image).getActionView();
        searchView.setQueryHint("Search...");
        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                Toast.makeText(GridViewActivity.this, "Search Submit", Toast.LENGTH_SHORT).show();
                if (ScanConstants.ViewMode == 0) {
                    gridViewAdapter.getFilter().filter(query);
                } else gridMultipleAdapter.getFilter().filter(query);
                return true;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                Toast.makeText(GridViewActivity.this, "Search TextChange", Toast.LENGTH_SHORT).show();
                if (ScanConstants.ViewMode == 0) {
                    gridViewAdapter.getFilter().filter(newText);
                } else gridMultipleAdapter.getFilter().filter(newText);
                return true;
            }
        });
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        switch (item.getItemId()) {
            case R.id.about:
                AlertDialog.Builder builder = new AlertDialog.Builder(GridViewActivity.this);
                builder.setTitle(getString(R.string.mnu_about));
                builder.setMessage("myDM camera Version reslease 1.0");
                builder.setPositiveButton(getString(R.string.note_ok_button), new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                    }
                });
                final AlertDialog dialog = builder.create();
                dialog.show();
                break;
            case R.id.sort_by:
                AlertDialog.Builder builders = new AlertDialog.Builder(GridViewActivity.this);
                builders.setTitle(getString(R.string.sortby));
                String[] typeSort = {"ASC"};
                String[] column = {"ImageName"};
                CharSequence[] values = {"Doc Name (A to Z)", "Doc Name (Z to A)", "Creation Time (A to Z)", "Creation Time(Z to A)"};
                builders.setSingleChoiceItems(values, -1, new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int item) {
                        switch (item) {
                            case 0:
                                typeSort[0] = "ASC";
                                column[0] = "ImageName";
                                break;
                            case 1:

                                typeSort[0] = "DESC";
                                column[0] = "ImageName";
                                break;
                            case 2:
                                typeSort[0] = "ASC";
                                column[0] = "CreatedDate";
                                break;
                            case 3:
                                typeSort[0] = "DESC";
                                column[0] = "CreatedDate";
                                break;
                        }
                    }
                });
                builders.setPositiveButton(getString(R.string.note_ok_button), new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        scansImagesList = databaseHelper.sortDataByCondition(typeSort[0], column[0]);
                        if (ScanConstants.ViewContainer == 1) {
                            gridViewAdapter = new CustomListAdapter(GridViewActivity.this, R.layout.custom_image_list, scansImagesList);
                            gridViewSingle.setAdapter(gridViewAdapter);
                        } else {
                            customListViewAdapter = new CustomListViewAdapter(GridViewActivity.this
                                    , R.layout.custom_listview_single, scansImagesList);
                            listViewSingle.setAdapter(customListViewAdapter);
                        }
                    }
                });
                builders.setNegativeButton(getString(R.string.note_cancel_button), new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.dismiss();
                    }
                });

                final AlertDialog dialogs = builders.create();
                dialogs.show();
                break;
            case R.id.select_checkbox:
                SelectionMode();
                return true;

            case R.id.list_view:
                DoneSave(null);
                if (ScanConstants.ViewContainer == 1) {
                    ScanConstants.ViewContainer = 0;
                    item.setIcon(R.drawable.grid_view_24dp);
                    item.setTitle("Gird View");
                } else {
                    ScanConstants.ViewContainer = 1;
                    item.setIcon(R.drawable.list_view_24dp);
                    item.setTitle("List View");
                }
                setAdapters();
                return true;

        }
        return true;
    }

    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        if (ScanConstants.ViewMode == 0) {
            Intent intent = new Intent(GridViewActivity.this, com.xoonit.camera.Activities.PreviewActivity.class);
            String IdScansImage = String.valueOf(scansImagesList.get(position).getIdScansImage());
            intent.putExtra(ScanConstants.StrImageId, IdScansImage);
            startActivity(intent);
            finish();
        } else {
            Intent intent = new Intent(GridViewActivity.this, com.xoonit.camera.Activities.PreviewActivity.class);
            String GroupNr = String.valueOf(scansImagesListMultiple.get(position).getGroupNr());
            intent.putExtra(ScanConstants.StrGroupNr, GroupNr);
            startActivity(intent);
            finish();
        }
    }

    @Override
    public boolean onItemLongClick(AdapterView<?> parent, View view, int position, long id) {
        if (ScanConstants.ViewMode == 0) {
            btnSwitchMode.setEnabled(false);
            if (ScanConstants.ViewContainer == 1) {
                //region SingleMode GridView
                gridViewSingle.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                        checkBox_Single = view.findViewById(R.id.checkboxSingle);
                        checkBox_Single.performClick();
                        if (checkBox_Single.isChecked()) {
                            gridViewAdapter.setCheckedStateItem(true, position);
                        } else gridViewAdapter.setCheckedStateItem(false, position);
                        onEnableControlToolbar();
                    }
                });
                //endregion
            } else {
                //region SingleMode ListView
                listViewSingle.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                        checkBox_Single = view.findViewById(R.id.checkboxsingle_custom_listview);
                        checkBox_Single.performClick();
                        if (checkBox_Single.isChecked()) {
                            customListViewAdapter.setCheckedStateItem(true, position);
                        } else customListViewAdapter.setCheckedStateItem(false, position);
                        onEnableControlToolbar();
                    }
                });
                //endregion
            }
            EditListView(null);
            btnReload.setImageDrawable(getResources().getDrawable(R.drawable.group_by));
            btnReload.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    int dem = 0;
                    for (int i = 0; i < scansImagesList.size(); i++) {
                        if (scansImagesList.get(i).getCheckboxState()) {
                            dem++;
                        }
                    }
                    if (dem >= 2) {
                        boolean result = GroupBy(v);
                        if (result) {
                            onDisableControlToolbar();
                        }
                    } else
                        Toast.makeText(GridViewActivity.this, "You Can't Group 1 Item !", Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            btnSwitchModeMulti.setEnabled(false);
            EditListViewMulti(view);
            if (ScanConstants.ViewContainer == 1) {
                gridViewMultiple.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, final View view, int position, long id) {
                        checkBoxMulti = view.findViewById(R.id.checkBoxMulti);
                        checkBoxMulti.performClick();
                        if (checkBoxMulti.isChecked()) {
                            gridMultipleAdapter.setCheckedStateItem(true, position);
                        } else gridMultipleAdapter.setCheckedStateItem(false, position);

                        onEnableControlToolbar();
                        btnReloadMulti.setImageDrawable(getResources().getDrawable(R.drawable.group_out));
                        btnReloadMulti.setOnClickListener(new View.OnClickListener() {
                            @Override
                            public void onClick(View v) {
                                GroupOut(v);
                            }
                        });
                    }
                });
            } else {
                ListViewMulti.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, final View view, int position, long id) {
                        checkBoxMulti = view.findViewById(R.id.checkbox_custom_listview_multi);
                        checkBoxMulti.performClick();
                        if (checkBoxMulti.isChecked()) {
                            customListViewMultipleAdapter.setCheckedStateItem(true, position);
                        } else customListViewMultipleAdapter.setCheckedStateItem(false, position);

                        onEnableControlToolbar();
                        btnReloadMulti.setImageDrawable(getResources().getDrawable(R.drawable.group_out));
                        btnReloadMulti.setOnClickListener(new View.OnClickListener() {
                            @Override
                            public void onClick(View v) {
                                GroupOut(v);
                            }
                        });
                    }
                });

            }
        }
        return true;
    }

    private void SelectionMode() {
        if (ScanConstants.ViewMode == 0) {
            btnSwitchMode.setEnabled(false);
            if (ScanConstants.ViewContainer == 1) {
                //region SingleMode GridView
                EditListView(null);
                gridViewSingle.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                        if (gridViewAdapter.getItem(position).getCheckboxState()) {
                            gridViewAdapter.setCheckedStateItem(false, position);
                        } else gridViewAdapter.setCheckedStateItem(true, position);

                        checkBox_Single = view.findViewById(R.id.checkboxSingle);
                        checkBox_Single.performClick();
                        onEnableControlToolbar();
                    }
                });
                //endregion
            } else {
                //region SingleMode ListView
                EditListView(null);
                listViewSingle.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                        if (customListViewAdapter.getItem(position).getCheckboxState()) {
                            customListViewAdapter.setCheckedStateItem(false, position);
                        } else customListViewAdapter.setCheckedStateItem(true, position);

                        checkBox_Single = view.findViewById(R.id.checkboxsingle_custom_listview);
                        checkBox_Single.performClick();
                        onEnableControlToolbar();
                    }
                });
                //endregion
            }
            btnReload.setImageDrawable(getResources().getDrawable(R.drawable.group_by));
            btnReload.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    int dem = 0;
                    for (int i = 0; i < scansImagesList.size(); i++) {
                        if (scansImagesList.get(i).getCheckboxState()) {
                            dem++;
                        }
                    }
                    if (dem >= 2) {
                        boolean result = GroupBy(v);
                        if (result) {
                            onDisableControlToolbar();
                        }
                    } else
                        Toast.makeText(GridViewActivity.this, "You Can't Group 1 Item !", Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            btnSwitchModeMulti.setEnabled(false);
            EditListViewMulti(null);
            if (ScanConstants.ViewContainer == 1) {
                gridViewMultiple.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, final View view, int position, long id) {

                        if (gridMultipleAdapter.getItem(position).getCheckboxState()) {
                            gridMultipleAdapter.setCheckedStateItem(false, position);
                        } else gridMultipleAdapter.setCheckedStateItem(true, position);
                        checkBoxMulti = view.findViewById(R.id.checkBoxMulti);
                        checkBoxMulti.performClick();
                        onEnableControlToolbar();
                        btnReloadMulti.setImageDrawable(getResources().getDrawable(R.drawable.group_out));
                        btnReloadMulti.setOnClickListener(new View.OnClickListener() {
                            @Override
                            public void onClick(View v) {
                                GroupOut(v);
                            }
                        });
                    }
                });
            } else {
                ListViewMulti.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, final View view, int position, long id) {

                        if (customListViewMultipleAdapter.getItem(position).getCheckboxState()) {
                            customListViewMultipleAdapter.setCheckedStateItem(false, position);
                        } else customListViewMultipleAdapter.setCheckedStateItem(true, position);
                        checkBoxMulti = view.findViewById(R.id.checkbox_custom_listview_multi);
                        checkBoxMulti.performClick();
                        onEnableControlToolbar();
                        btnReloadMulti.setImageDrawable(getResources().getDrawable(R.drawable.group_out));
                        btnReloadMulti.setOnClickListener(new View.OnClickListener() {
                            @Override
                            public void onClick(View v) {
                                GroupOut(v);
                            }
                        });
                    }
                });

            }
        }
    }

    private byte[] convertFiletoByteArray(File file) throws IOException {

        byte[] bytes = new byte[(int) file.length()];
        FileInputStream fis = null;
        try {
            fis = new FileInputStream(file);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        fis.read(bytes);
        fis.close();
        return bytes;
    }

}




