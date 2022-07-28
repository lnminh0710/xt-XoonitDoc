package com.xoonit.camera.Dialog;

import android.app.Dialog;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.switchmaterial.SwitchMaterial;
import com.xoonit.camera.Database.DocumentTreeItem;
import com.xoonit.camera.Dialog.Adapter.FolderTreeViewAdapter;
import com.xoonit.camera.R;
import com.xoonit.camera.XoonitApplication;
import com.xoonit.camera.utils.ConstantUtils;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;
import com.xoonit.camera.utils.Logger;

import java.util.ArrayList;

public class ListTreeDialog extends Dialog implements View.OnClickListener {

    private Context context;

    private Button btnTree, btnFavorite;
    private SwitchMaterial switchModeTree;
    private LinearLayout lnHeaderMainFolder;
    private RelativeLayout rlHeaderSubFolder;
    private RecyclerView rcTreeList;
    private ImageButton btnBack, btnClose;
    private TextView tvSubFolderPath;

    private ItemClickListener itemClickListener;

    private ArrayList<DocumentTreeItem> documentTreeItemArrayList;
    private ArrayList<DocumentTreeItem> subFolderList;
    private FolderTreeViewAdapter folderTreeViewAdapter;

    public ListTreeDialog(@NonNull Context context) {
        super(context);
        this.context = context;
        documentTreeItemArrayList = new ArrayList<>();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.dialog_list_tree);
        btnTree = findViewById(R.id.btnTree);
        btnFavorite = findViewById(R.id.btnFavorite);
        switchModeTree = findViewById(R.id.switchModeTree);
        lnHeaderMainFolder = findViewById(R.id.lnHeaderMainFolder);
        rlHeaderSubFolder = findViewById(R.id.rlHeaderSubFolder);
        rcTreeList = findViewById(R.id.rcTreeList);
        btnBack = findViewById(R.id.btnBack);
        btnClose = findViewById(R.id.btnClose);
        tvSubFolderPath = findViewById(R.id.tvSubFolderPath);
        subFolderList = new ArrayList<>();
        this.documentTreeItemArrayList.addAll(XoonitApplication.getInstance().getDocumentTreeItemList());
        FireBaseManagement.logFireBaseEvent(context, ConstantFireBaseTracking.TREE_DIALOG);
        initItemClickListener();
        initAdapter();
        setupHeader();
    }

    private void initAdapter() {
        final LinearLayoutManager layoutManager = new LinearLayoutManager(context);
        layoutManager.setOrientation(RecyclerView.VERTICAL);
        rcTreeList.setLayoutManager(layoutManager);
        rcTreeList.setHasFixedSize(true);
        folderTreeViewAdapter = new FolderTreeViewAdapter(context, documentTreeItemArrayList);
        folderTreeViewAdapter.setClickListener(new FolderTreeViewAdapter.ItemClickListener() {
            @Override
            public void showListFolder(int position) {
                if (documentTreeItemArrayList.get(position).getChildren() != null
                        && documentTreeItemArrayList.get(position).getChildren().size() > 0) {
                    ArrayList<DocumentTreeItem> subFolder = documentTreeItemArrayList.get(position).getChildren();
                    subFolderList.add(documentTreeItemArrayList.get(position));
                    documentTreeItemArrayList.clear();
                    documentTreeItemArrayList.addAll(subFolder);
                    folderTreeViewAdapter.notifyDataSetChanged();
                    setupHeader();
                }
            }

            @Override
            public void showFileInFolder(int position) {
                cancel();
                FireBaseManagement.logEventScreenTransition(context,
                        ConstantFireBaseTracking.HOME_ACTIVITY,
                        ConstantFireBaseTracking.LIST_TREE_DIALOG,
                        ConstantFireBaseTracking.ACTION_HOME_BUTTON);
                Intent bi = new Intent();
                bi.putExtra(ConstantUtils.BROADCAST_FOLDER_TO_OPEN, documentTreeItemArrayList.get(position).getData().getIDDocumentTree());
                bi.putExtra(ConstantUtils.BROADCAST_FOLDER_NAME_TO_OPEN, documentTreeItemArrayList.get(position).getData().getGroupName());
                bi.setAction(ConstantUtils.BROADCAST_OPEN_FOLDER);
                context.sendBroadcast(bi);
            }
        });
        rcTreeList.setAdapter(folderTreeViewAdapter);
    }

    private void setupHeader() {
        if (documentTreeItemArrayList != null && documentTreeItemArrayList.size() > 0) {
            if (documentTreeItemArrayList.get(0).isRoot()) {
                lnHeaderMainFolder.setVisibility(View.VISIBLE);
                rlHeaderSubFolder.setVisibility(View.GONE);
            } else {
                lnHeaderMainFolder.setVisibility(View.GONE);
                rlHeaderSubFolder.setVisibility(View.VISIBLE);
                if (subFolderList.size() > 0) {
                    tvSubFolderPath.setText(getSubFolderPath());
                }
            }
        }
    }

    private String getSubFolderPath() {
        String subFolderPath = "";
        for (DocumentTreeItem doc : subFolderList) {
            subFolderPath = subFolderPath + doc.getData().getGroupName();
            if (subFolderList.indexOf(doc) < (subFolderList.size() - 1)) {
                subFolderPath = subFolderPath + "/";
            }
        }
        return subFolderPath;
    }

    private void initItemClickListener() {
        if (itemClickListener != null) {
            btnTree.setOnClickListener(this);
            btnFavorite.setOnClickListener(this);
            btnClose.setOnClickListener(this);
        }
        switchModeTree.setOnCheckedChangeListener((buttonView, isChecked) -> {
            if (itemClickListener != null) {
                itemClickListener.onSwitchTreeValueChange(isChecked);
            }
        });

        btnBack.setOnClickListener(v -> {
            if (subFolderList.size() > 0) {
                subFolderList.remove((subFolderList.size() - 1));
            }
            documentTreeItemArrayList.clear();
            if (subFolderList.size() == 0) {
                documentTreeItemArrayList.addAll(XoonitApplication.getInstance().getDocumentTreeItemList());
            } else {
                documentTreeItemArrayList.addAll(subFolderList.get((subFolderList.size() - 1)).getChildren());
            }
            folderTreeViewAdapter.notifyDataSetChanged();
            setupHeader();
        });
    }

    public void setItemClickListener(ItemClickListener itemClickListener) {
        this.itemClickListener = itemClickListener;
    }

    public void gotoRootFolder() {
        documentTreeItemArrayList.clear();
        subFolderList.clear();
        documentTreeItemArrayList.addAll(XoonitApplication.getInstance().getDocumentTreeItemList());
        folderTreeViewAdapter.notifyDataSetChanged();
        setupHeader();
    }

    @Override
    public void onClick(View v) {
        if (itemClickListener != null) {
            switch (v.getId()) {
                case R.id.btnTree:
                    Logger.Debug("on Tree button Clicked");
                    itemClickListener.onButtonTreeClick();
                    break;
                case R.id.btnFavorite:
                    Logger.Debug("on Favorite button Clicked");
                    itemClickListener.onButtonFavoriteClick();
                    break;
                case R.id.btnClose:
                    Logger.Debug("on Close button Clicked");
                    itemClickListener.onCloseButtonClick();
                    break;
                default:
                    break;
            }
        }
        dismiss();
    }

    public interface ItemClickListener {
        void onButtonTreeClick();

        void onButtonFavoriteClick();

        void onSwitchTreeValueChange(boolean value);

        void onCloseButtonClick();
    }


}
