package com.xoonit.camera.Activities;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.text.TextUtils;
import android.view.inputmethod.EditorInfo;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import com.xoonit.camera.Activities.Base.BaseActivity;
import com.xoonit.camera.Dialog.ListTreeDialog;
import com.xoonit.camera.Dialog.MenuDialog;
import com.xoonit.camera.R;
import com.xoonit.camera.fragments.Base.BaseContainerFragment;
import com.xoonit.camera.fragments.Base.BaseFragment;
import com.xoonit.camera.fragments.FragmentCapture_;
import com.xoonit.camera.fragments.FragmentContact_;
import com.xoonit.camera.fragments.FragmentContainer;
import com.xoonit.camera.fragments.FragmentContainer_;
import com.xoonit.camera.fragments.FragmentHistory_;
import com.xoonit.camera.fragments.FragmentHome_;
import com.xoonit.camera.fragments.FragmentImportFile_;
import com.xoonit.camera.fragments.FragmentPhoto_;
import com.xoonit.camera.fragments.MainActivity;
import com.xoonit.camera.utils.ConstantUtils;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;
import com.xoonit.camera.utils.GeneralMethod;
import com.xoonit.camera.utils.Logger;

import org.androidannotations.annotations.Click;
import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.ViewById;


@SuppressLint("Registered")
@EActivity(R.layout.activity_home)
public class ActivityHome extends BaseActivity {
    @ViewById(R.id.fragemnt_home_container)
    FrameLayout frameHomeContainer;
    @ViewById(R.id.btnShowMenu)
    ImageButton btnShowMenu;
    @ViewById(R.id.edtSearch)
    EditText edtSearch;
    @ViewById(R.id.tvHomeTitle)
    TextView tvHomeTitle;

    private long back_pressed = 0;

    private MenuDialog menuDialog;
    private ListTreeDialog listTreeDialog;
    private FragmentContainer fragmentContainer;

    @Override
    protected void afterViews() {
        fragmentContainer = FragmentContainer_.builder().build();
        setupMenu();
        setupSearch();
        setupTreeFolder();
        addFragment(fragmentContainer, R.id.fragemnt_home_container, false);
    }

    @Override
    protected void onResume() {
        super.onResume();
        registerReceiver(openFolderBroadCaster, new IntentFilter(ConstantUtils.BROADCAST_OPEN_FOLDER));
    }

    @Override
    protected void onPause() {
        super.onPause();
        unregisterReceiver(openFolderBroadCaster);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }

    private final BroadcastReceiver openFolderBroadCaster = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            //method used to update your GUI fields
            if (intent.getExtras() != null) {
                FireBaseManagement.logEventScreenTransition(ActivityHome.this,
                        ConstantFireBaseTracking.HOME_FRAGMENT,
                        ConstantFireBaseTracking.HOME_ACTIVITY,
                        ConstantFireBaseTracking.ACTION_HOME_BUTTON);
                int idDocumentTree = intent.getIntExtra(ConstantUtils.BROADCAST_FOLDER_TO_OPEN, -1);
                String folderName = intent.getStringExtra(ConstantUtils.BROADCAST_FOLDER_NAME_TO_OPEN);
                if(!TextUtils.isEmpty(folderName)){
                    tvHomeTitle.setText(folderName);
                } else {
                    tvHomeTitle.setText(R.string.home);
                }
                getCurrentBaseFragment().replaceFragment(FragmentHome_.builder().idDocumentTree(idDocumentTree).build(), false, true);
            }
        }
    };

    @Override
    public void onBackPressed() {
        if (!getCurrentBaseFragment().popFragment() && ((BaseFragment) getCurrentBaseFragment().getCurrentFragment()).canPopBack()) {
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

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == ConstantUtils.REQUEST_OPEN_PHOTO) {
            if (resultCode == Activity.RESULT_OK) {
                if (data.getBooleanExtra(ConstantUtils.IS_OPEN_PHOTO, false)) {
                    FireBaseManagement.logEventScreenTransition(ActivityHome.this,
                            ConstantFireBaseTracking.PHOTO_FRAGMENT,
                            ConstantFireBaseTracking.HOME_ACTIVITY,
                            ConstantFireBaseTracking.ACTION_PHOTO_BUTTON);
                    tvHomeTitle.setText(R.string.photos);
                    getCurrentBaseFragment().replaceFragment(FragmentPhoto_.builder().build(), false, false);
                }
            }
            if (resultCode == Activity.RESULT_CANCELED) {
                //Write your code if there's no result
            }
        }
    }

    public BaseContainerFragment getCurrentBaseFragment() {
        return (BaseContainerFragment) fragmentContainer;
    }

    private void setupSearch() {
        edtSearch.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                //TODO implement search
                return true;
            }
            return false;
        });
    }

    private void setupMenu() {
        menuDialog = new MenuDialog(ActivityHome.this);
//        Objects.requireNonNull(menuDialog.getWindow()).setLayout(WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.MATCH_PARENT);
//        WindowManager.LayoutParams layoutParams = menuDialog.getWindow().getAttributes();
//        layoutParams.gravity = Gravity.TOP | Gravity.CENTER;
//        layoutParams.y = 50;   //y position
//        menuDialog.getWindow().setAttributes(layoutParams);
        menuDialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        menuDialog.setItemClickListener(new MenuDialog.ItemClickListener() {
            @Override
            public void onMyDMItemClick() {
                FireBaseManagement.logEventScreenTransition(ActivityHome.this,
                        ConstantFireBaseTracking.HOME_FRAGMENT,
                        ConstantFireBaseTracking.HOME_ACTIVITY,
                        ConstantFireBaseTracking.ACTION_HOME_BUTTON);
                tvHomeTitle.setText(R.string.home);
                getCurrentBaseFragment().replaceFragment(FragmentHome_.builder().idDocumentTree(0).build(), false, true);
            }

            @Override
            public void onCaptureItemClick() {
                FireBaseManagement.logEventScreenTransition(ActivityHome.this,
                        ConstantFireBaseTracking.CAPTURE_FRAGMENT,
                        ConstantFireBaseTracking.HOME_ACTIVITY,
                        ConstantFireBaseTracking.ACTION_CAPTURE_BUTTON);
                tvHomeTitle.setText(R.string.capture);
                getCurrentBaseFragment().replaceFragment(FragmentCapture_.builder().build(), false, true);
            }

            @Override
            public void onContactItemClick() {
                FireBaseManagement.logEventScreenTransition(ActivityHome.this,
                        ConstantFireBaseTracking.CONTACT_FRAGMENT,
                        ConstantFireBaseTracking.HOME_ACTIVITY,
                        ConstantFireBaseTracking.ACTION_CONTACT_BUTTON);
                tvHomeTitle.setText(R.string.contact);
                getCurrentBaseFragment().replaceFragment(FragmentContact_.builder().build(), false, true);
            }

            @Override
            public void onScanItemClick() {
                FireBaseManagement.logEventScreenTransition(ActivityHome.this,
                        ConstantFireBaseTracking.MAIN_ACTIVITY,
                        ConstantFireBaseTracking.HOME_ACTIVITY,
                        ConstantFireBaseTracking.ACTION_SCAN_BUTTON);
                Intent intentScan = new Intent(ActivityHome.this, MainActivity.class);
                startActivityForResult(intentScan, ConstantUtils.REQUEST_OPEN_PHOTO);
            }

            @Override
            public void onImportItemClick() {
                if (GeneralMethod.checkPermissionStorageEnable(ActivityHome.this)) {
                    FireBaseManagement.logEventScreenTransition(ActivityHome.this,
                            ConstantFireBaseTracking.IMPORT_FILE_FRAGMENT,
                            ConstantFireBaseTracking.HOME_ACTIVITY,
                            ConstantFireBaseTracking.ACTION_IMPORT_BUTTON);
                    tvHomeTitle.setText(R.string.imports);
                    getCurrentBaseFragment().replaceFragment(FragmentImportFile_.builder().build(), false, true);
                } else {
                    GeneralMethod.requestPermissionStorage(ActivityHome.this);
                }
            }

            @Override
            public void onExportItemClick() {
                GeneralMethod.clearUserData();
                getCurrentBaseFragment().popAllFragment();
                startActivityWithPushAnimation(new Intent(ActivityHome.this, LoginActivity_.class).setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK));
                finish();
            }

            @Override
            public void onCloudItemClick() {

            }

            @Override
            public void onUserGuideItemClick() {
            }

            @Override
            public void onHistoryItemClick() {
                FireBaseManagement.logEventScreenTransition(ActivityHome.this,
                        ConstantFireBaseTracking.HISTORY_FRAGMENT,
                        ConstantFireBaseTracking.HOME_ACTIVITY,
                        ConstantFireBaseTracking.ACTION_HISTORY_BUTTON);
                tvHomeTitle.setText(R.string.history);
                getCurrentBaseFragment().replaceFragment(FragmentHistory_.builder().build(), false, true);
            }
        });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            //resume tasks needing this permission
            switch (requestCode) {
                case ConstantUtils.REQUEST_CODE_FOR_STORAGE_PERMISSION: {
                    FireBaseManagement.logEventScreenTransition(ActivityHome.this,
                            ConstantFireBaseTracking.IMPORT_FILE_FRAGMENT,
                            ConstantFireBaseTracking.HOME_ACTIVITY,
                            ConstantFireBaseTracking.ACTION_IMPORT_BUTTON);
                    tvHomeTitle.setText(R.string.imports);
                    getCurrentBaseFragment().replaceFragment(FragmentImportFile_.builder().build(), false, true);
                }

            }
        } else {

            Toast.makeText(this, "Permission NOT granted", Toast.LENGTH_SHORT).show();
        }
    }

    private void setupTreeFolder() {
        listTreeDialog = new ListTreeDialog(ActivityHome.this);
        listTreeDialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        listTreeDialog.setOnCancelListener(dialog -> listTreeDialog.gotoRootFolder());
        listTreeDialog.setItemClickListener(new ListTreeDialog.ItemClickListener() {
            @Override
            public void onButtonTreeClick() {
                Logger.Debug("On Tree Button Clicked");
            }

            @Override
            public void onButtonFavoriteClick() {
                Logger.Debug("On Favorite Button Clicked");
            }

            @Override
            public void onSwitchTreeValueChange(boolean value) {
                Logger.Debug("On Switch tree value change: " + value);
            }

            @Override
            public void onCloseButtonClick() {
                listTreeDialog.cancel();
            }
        });
    }

    @Click(R.id.btnShowMenu)
    void showMenu() {
        menuDialog.show();
    }

    @Click(R.id.btnShowTree)
    void showTreeFolder() {
        listTreeDialog.show();
    }

}
