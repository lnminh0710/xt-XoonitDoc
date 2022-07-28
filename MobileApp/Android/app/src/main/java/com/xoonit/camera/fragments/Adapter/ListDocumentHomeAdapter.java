package com.xoonit.camera.fragments.Adapter;

import android.annotation.SuppressLint;
import android.content.Context;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.RecyclerView;

import com.xoonit.camera.Model.DocumentByFolderResult;
import com.xoonit.camera.R;

import java.util.List;

public class ListDocumentHomeAdapter extends RecyclerView.Adapter<ListDocumentHomeAdapter.ItemListDocumentHomeViewHolder> {
    private Context context;
    private List<DocumentByFolderResult> documentList;
    private ItemClickListener mClickListener;

    // data is passed into the constructor
    public ListDocumentHomeAdapter(Context context, List<DocumentByFolderResult> documentList) {
        this.context = context;
        this.documentList = documentList;
    }

    @NonNull
    @Override
    public ItemListDocumentHomeViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_list_document_home, parent, false);
        return new ListDocumentHomeAdapter.ItemListDocumentHomeViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ItemListDocumentHomeViewHolder holder, int position) {
        holder.onBindData(documentList.get(position));
    }

    @Override
    public int getItemCount() {
        return documentList.size();
    }

    public class ItemListDocumentHomeViewHolder extends RecyclerView.ViewHolder {
        TextView tvDocName, tvDateModified, tvTimeModified, tvExtension;
        CardView cardItemContainer;

        public ItemListDocumentHomeViewHolder(@NonNull View itemView) {
            super(itemView);
            tvDocName = itemView.findViewById(R.id.tvDocName);
            tvDateModified = itemView.findViewById(R.id.tvDateModified);
            tvTimeModified = itemView.findViewById(R.id.tvTimeModified);
            tvExtension = itemView.findViewById(R.id.tvExtension);
            cardItemContainer = itemView.findViewById(R.id.cardItemContainer);
        }

        @SuppressLint("SetTextI18n")
        public void onBindData(DocumentByFolderResult document) {
            String[] fileNameSplit = document.getLocalFileName().split("\\.");
            String extension = fileNameSplit[fileNameSplit.length - 1];
            String fileName =  document.getLocalFileName().substring(0, document.getLocalFileName().lastIndexOf("." + extension));
            if (!TextUtils.isEmpty(fileName)) {
                tvDocName.setText(fileName);
            }

            if (!TextUtils.isEmpty(document.getCreateDate())) {
                tvDateModified.setText(document.getCreateDate());
            }

            if (!TextUtils.isEmpty(extension)) {
                tvExtension.setText(extension);
            }

            cardItemContainer.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    if (mClickListener != null) {
                        mClickListener.onItemClick(getAdapterPosition());
                    }
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
        void onItemClick(int position);
    }
}
