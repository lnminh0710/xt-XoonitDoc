package com.xoonit.camera.fragments;

import android.app.ProgressDialog;
import android.content.Context;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.GridView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.xoonit.camera.Activities.Adapter.GridViewImportFileAdapter;
import com.xoonit.camera.Model.FolderItem;
import com.xoonit.camera.R;
import com.xoonit.camera.fragments.Base.BaseFragment;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;

import org.androidannotations.annotations.Click;
import org.androidannotations.annotations.EFragment;
import org.androidannotations.annotations.ViewById;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@EFragment(R.layout.fragment_import_file)
public class FragmentImportFile extends BaseFragment implements AdapterView.OnItemClickListener {
    @ViewById(R.id.gridview_folder_import_file)
    GridView gvImportFile;

    private Context mContext;
    private ArrayList<ArrayList<FolderItem>> folderItemArrayList = new ArrayList<>();
    private GridViewImportFileAdapter gvImportFileAdapter;
    private ProgressDialog progressDialog;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        mContext = container.getContext();
        return null;
    }

    @Override
    protected void afterViews() {
        initControl();
    }

    private void initControl() {
        progressDialog = new ProgressDialog(mContext);
        progressDialog.setMessage("Loading...");
        progressDialog.setCancelable(false);
        FireBaseManagement.logFireBaseEvent(mContext, ConstantFireBaseTracking.IMPORT_FILE_FRAGMENT);
        getFolderFormDevices();
    }

    private void getFolderFormDevices() {
        progressDialog.show();
        if (!FindFiles().isEmpty()) {
            folderItemArrayList.clear();
            folderItemArrayList.addAll(FindFiles());
            if (!folderItemArrayList.isEmpty()) {
                gvImportFileAdapter = new GridViewImportFileAdapter(mContext, R.layout.item_list_folder, folderItemArrayList);
                gvImportFile.setAdapter(gvImportFileAdapter);
                gvImportFile.setOnItemClickListener(this);
            }
            progressDialog.dismiss();
        } else {
            progressDialog.dismiss();
        }
    }


    @Click(R.id.button_folder_importfile)
    void onBtnFolderClicked() {
        Toast.makeText(mContext, "To be implement !", Toast.LENGTH_SHORT).show();
    }

    @Click(R.id.button_upload_import_file)
    void onBtnUploadClicked() {
        Toast.makeText(mContext, "To be implement !", Toast.LENGTH_SHORT).show();
    }

    @Click(R.id.button_delete_import_file)
    void onBtnDeleteClicked() {
        Toast.makeText(mContext, "To be implement !", Toast.LENGTH_SHORT).show();
    }

    private ArrayList<ArrayList<FolderItem>> FindFiles() {
        ArrayList<ArrayList<FolderItem>> arrayFolder = new ArrayList<>();

        File mFile = Environment.getExternalStorageDirectory();
        String ROOT_DIRECTORY = mFile.toString();
        String[] listPath = mContext.getResources().getStringArray(R.array.arrayPathFolder);
        List<String> listFolderPath = new ArrayList<>();

        for (String path : listPath) {
            listFolderPath.add(ROOT_DIRECTORY + "/" + path);
        }

        if (!listFolderPath.isEmpty()) {
            for (int i = 0; i < listFolderPath.size(); i++) {
                File folder = new File(listFolderPath.get(i));
                if (folder.isDirectory() && folder.listFiles() != null) {
                    List<File> listFile = Arrays.asList(folder.listFiles());
                    if (!listFile.isEmpty()) {
                        ArrayList<FolderItem> folderItemList = new ArrayList<>();
                        for (int count = 0; count < listFile.size(); count++) {
                            FolderItem folderItem = new FolderItem(folder.getName(), folder.getAbsolutePath(), listFile.get(count).getName(), listFile.get(count).getAbsolutePath(), false);
                            folderItemList.add(folderItem);
                        }
                        arrayFolder.add(folderItemList);
                    }
                }
            }
        }
        return arrayFolder;
    }

    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        replaceFragment(FragmentListFiles_.builder().folderPath(folderItemArrayList.get(position).get(0).getFolderPath()).build(), true, true);
    }
}
