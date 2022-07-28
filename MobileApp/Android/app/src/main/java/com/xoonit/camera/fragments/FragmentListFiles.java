package com.xoonit.camera.fragments;

import android.app.ProgressDialog;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.GridView;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.xoonit.camera.Activities.Adapter.GridViewFileFolderAdapter;
import com.xoonit.camera.Activities.Base.BaseActivity;
import com.xoonit.camera.Model.FolderItem;
import com.xoonit.camera.R;
import com.xoonit.camera.fragments.Base.BaseFragment;
import com.xoonit.camera.utils.FileUtils;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;
import com.xoonit.camera.utils.Logger;

import org.androidannotations.annotations.Click;
import org.androidannotations.annotations.EFragment;
import org.androidannotations.annotations.FragmentArg;
import org.androidannotations.annotations.ViewById;

import java.io.File;
import java.io.FilenameFilter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.atomic.AtomicInteger;

@EFragment(R.layout.fragment_itemfiles)
public class FragmentListFiles extends BaseFragment implements AdapterView.OnItemClickListener {

    @ViewById(R.id.button_upload_import_file)
    ImageButton btnUploadFiles;
    @ViewById(R.id.button_delete_import_file)
    ImageButton btnDeleteFiles;
    @ViewById(R.id.button_folder_importfile)
    ImageButton btnFolder;

    @ViewById(R.id.gridview_itemfiles_eachfolder)
    GridView gvItemFiles;

    @FragmentArg
    String folderPath;
    private ArrayList<FolderItem> arrayListFile = new ArrayList<>();
    private Context mContext;
    private GridViewFileFolderAdapter gridViewFileFolderAdapter;
    private ProgressDialog progressDialog;
    private ArrayList<FolderItem> selectedList = new ArrayList<>();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        mContext = container.getContext();
        return null;
    }

    @Override
    protected void afterViews() {
        initControl();
        FireBaseManagement.logFireBaseEvent(mContext, ConstantFireBaseTracking.LIST_FILE_FRAGMENT);
    }

    private void initControl() {
        progressDialog = new ProgressDialog(mContext);
        progressDialog.setMessage("Loading...");
        progressDialog.setCancelable(false);
        initFilesData();
    }

    private void initFilesData() {
        progressDialog.show();
            if (!folderPath.equals("")) {
                Logger.Debug(" FolderPath: " + folderPath);
                getFilesInFolder(folderPath);
                if (!arrayListFile.isEmpty()) {
                    gridViewFileFolderAdapter = new GridViewFileFolderAdapter(mContext, R.layout.item_listfiles_folder, arrayListFile);
                    gvItemFiles.setAdapter(gridViewFileFolderAdapter);
                    gvItemFiles.setOnItemClickListener(this);
                }
                progressDialog.dismiss();
            }else {
                Toast.makeText(mContext, "No images found, please check and try again !", Toast.LENGTH_SHORT).show();
                progressDialog.dismiss();
            }

    }

    @Click(R.id.button_folder_importfile)
    void OnItemGroupFilesClicked() {
        Toast.makeText(mContext, "To be Implement !", Toast.LENGTH_SHORT).show();
    }

    @Click(R.id.button_delete_import_file)
    void OnItemDeleteFilesClicked() {
        if (!arrayListFile.isEmpty()) {
            if (!selectedList.isEmpty()) {
                onDeleteFiles();
            } else {
                Toast.makeText(mContext, "You must select item !", Toast.LENGTH_SHORT).show();
            }
        } else {
            Toast.makeText(mContext, "Nothing to delete !", Toast.LENGTH_SHORT).show();
        }
    }

    @Click(R.id.button_upload_import_file)
    void OnItemUploadFilesClicked() {
        Toast.makeText(mContext, "To be Implement !", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        if (arrayListFile.get(position).isChecked()) {
            selectedList.remove(arrayListFile.get(position));
            arrayListFile.get(position).setChecked(false);
        } else {
            selectedList.add(arrayListFile.get(position));
            arrayListFile.get(position).setChecked(true);
        }
        gridViewFileFolderAdapter.notifyDataSetChanged();
    }

    private void getFilesInFolder(String rootDirectory) {

            File mFile = new File(rootDirectory);
            String ROOT_DIRECTORY = mFile.toString();
            List<File> listFolder = new ArrayList<>();
            if (mFile.isDirectory() && mFile.listFiles() != null) {
                listFolder = Arrays.asList(Objects.requireNonNull(mFile.listFiles()));
            }

            // array of valid image file extensions
            String[] extensions = new String[]{"jpeg", "jpg", "png", "pdf", "tiff"};
            FilenameFilter[] filter = new FilenameFilter[extensions.length];

            int i = 0;
            for (final String type : extensions) {
                filter[i] = (dir, name) -> name.endsWith("." + type);
                i++;
            }

            FileUtils fileUtils = new FileUtils();
            if (!listFolder.isEmpty()) {
                List<File> Files = fileUtils.listFilesAsArray(new File(ROOT_DIRECTORY), filter, -1);
                if (Files.size() > 0) {
                    for (int count = 0; count < Files.size(); count++) {
                        FolderItem folderItem = new FolderItem(getSubFolder(Files.get(count).getPath()), ROOT_DIRECTORY + "/" + getSubFolder(Files.get(count).getPath()), Files.get(count).getName(), Files.get(count).getAbsolutePath(), false);
                        arrayListFile.add(folderItem);
                    }
                }
            }

    }
    private String getSubFolder(String path) {
        String[] folderName = path.split("/");
        return folderName[folderName.length - 1];
    }

    private void onDeleteFiles() {
        AtomicInteger countFileDeleteSuccess = new AtomicInteger();
        ((BaseActivity) mContext).showDialog("Delete Files", "Are you sure delete these file ?", Gravity.CENTER,
                "Cancel", v -> {
                }, "Ok", v -> {
                    // Get selected list images from single put into selectedGroup
                    for (int i = 0; i < selectedList.size(); i++) {
                        if (selectedList.get(i).isChecked()) {
                            // get file in Dir
                            File files = new File(arrayListFile.get(i).getFilePath());
                            if (files.delete()) {
                                countFileDeleteSuccess.addAndGet(1);
                            }
                        }
                    }
                    arrayListFile.removeAll(selectedList);
                    // Refresh  gridview
                    gridViewFileFolderAdapter.notifyDataSetChanged();
                    Toast.makeText(mContext, "Delete " + countFileDeleteSuccess + " File Successefully !", Toast.LENGTH_SHORT).show();
                });
    }
}
