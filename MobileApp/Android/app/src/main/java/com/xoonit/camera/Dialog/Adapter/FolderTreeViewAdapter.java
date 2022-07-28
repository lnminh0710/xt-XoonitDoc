package com.xoonit.camera.Dialog.Adapter;

import android.annotation.SuppressLint;
import android.content.Context;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.xoonit.camera.Database.DocumentTreeItem;
import com.xoonit.camera.R;

import java.util.List;

public class FolderTreeViewAdapter extends RecyclerView.Adapter<FolderTreeViewAdapter.ItemListDocumentTreeViewHolder> {
    private Context context;
    private List<DocumentTreeItem> documentTreeItemList;
    private ItemClickListener mClickListener;

    // data is passed into the constructor
    public FolderTreeViewAdapter(Context context, List<DocumentTreeItem> documentTreeItemList) {
        this.context = context;
        this.documentTreeItemList = documentTreeItemList;
    }

    @NonNull
    @Override
    public ItemListDocumentTreeViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_list_tree, parent, false);
        return new FolderTreeViewAdapter.ItemListDocumentTreeViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ItemListDocumentTreeViewHolder holder, int position) {
        holder.onBindData(documentTreeItemList.get(position));
    }

    @Override
    public int getItemCount() {
        return documentTreeItemList.size();
    }

    public class ItemListDocumentTreeViewHolder extends RecyclerView.ViewHolder {
        TextView tvFolderName, tvFolderCount, tvFileCount;
        ImageView imgIcon;
        ImageButton btnArrowRight;
        RelativeLayout itemContainer;

        public ItemListDocumentTreeViewHolder(@NonNull View itemView) {
            super(itemView);
            tvFolderName = itemView.findViewById(R.id.tvFolderName);
            tvFolderCount = itemView.findViewById(R.id.tvFolderCount);
            imgIcon = itemView.findViewById(R.id.imgIcon);
            btnArrowRight = itemView.findViewById(R.id.btnArrowRight);
            itemContainer = itemView.findViewById(R.id.itemContainer);
            tvFileCount = itemView.findViewById(R.id.tvFileCount);
        }


        @SuppressLint("SetTextI18n")
        public void onBindData(DocumentTreeItem documentTreeItem) {

            if (documentTreeItem.getData().getQuantity() > 0) {
                tvFolderCount.setVisibility(View.VISIBLE);
                if (documentTreeItem.getData().getQuantity() > 99) {
                    tvFolderCount.setText(R.string.maximum_file);
                } else {
                    tvFolderCount.setText(String.valueOf(documentTreeItem.getData().getQuantity()));
                }
            } else {
                tvFolderCount.setVisibility(View.GONE);
            }

            if (documentTreeItem.getData().getQuantityParent() > 0) {
                tvFileCount.setVisibility(View.VISIBLE);
                if (documentTreeItem.getData().getQuantityParent() > 99) {
                    tvFileCount.setText(R.string.maximum_file);
                } else {
                    tvFileCount.setText(String.valueOf(documentTreeItem.getData().getQuantityParent()));
                }
            } else {
                tvFileCount.setVisibility(View.GONE);
            }

            if (!TextUtils.isEmpty(documentTreeItem.getData().getGroupName())) {
                tvFolderName.setText(documentTreeItem.getData().getGroupName());
            }
            tvFolderCount.setText(String.valueOf(documentTreeItem.getData().getQuantity()));
            if (documentTreeItem.getChildren() != null && documentTreeItem.getChildren().size() > 0) {
                btnArrowRight.setVisibility(View.VISIBLE);
            } else {
                btnArrowRight.setVisibility(View.GONE);
            }

            itemContainer.setOnClickListener(v -> {
                if (mClickListener != null) {
                    mClickListener.showFileInFolder(getAdapterPosition());
                }
            });
            btnArrowRight.setOnClickListener(v -> {
                if (mClickListener != null) {
                    mClickListener.showListFolder(getAdapterPosition());
                }
            });

        }
    }

    // allows clicks events to be caught
    public void setClickListener(ItemClickListener itemClickListener) {
        this.mClickListener = itemClickListener;
    }

    // parent activity will implement this method to respond to click events
    public interface ItemClickListener {
        void showListFolder(int position);

        void showFileInFolder(int position);
    }
}
