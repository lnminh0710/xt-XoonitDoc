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

public class ListContactAttachmentAdapter extends RecyclerView.Adapter<ListContactAttachmentAdapter.ItemListContactAttachmentViewHolder> {
    private Context context;
    private List<DocumentByFolderResult> documentList;
    private ItemClickListener mClickListener;

    // data is passed into the constructor
    public ListContactAttachmentAdapter(Context context, List<DocumentByFolderResult> documentList) {
        this.context = context;
        this.documentList = documentList;
    }

    @NonNull
    @Override
    public ItemListContactAttachmentViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_list_contact_attachment, parent, false);
        return new ListContactAttachmentAdapter.ItemListContactAttachmentViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ItemListContactAttachmentViewHolder holder, int position) {
        holder.onBindData(documentList.get(position));
    }

    @Override
    public int getItemCount() {
        return documentList.size();
    }

    public class ItemListContactAttachmentViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvType, tvDateModified;
        CardView cardItemContainer;

        public ItemListContactAttachmentViewHolder(@NonNull View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tvName);
            tvType = itemView.findViewById(R.id.tvType);
            tvDateModified = itemView.findViewById(R.id.tvDateModified);
            cardItemContainer = itemView.findViewById(R.id.cardItemContainer);
        }

        @SuppressLint("SetTextI18n")
        public void onBindData(DocumentByFolderResult document) {

            if (!TextUtils.isEmpty(document.getLocalFileName())) {
                tvName.setText(document.getLocalFileName());
            }
            if (!TextUtils.isEmpty(document.getCreateDate())) {
                tvDateModified.setText(document.getCreateDate());
            }
            cardItemContainer.setOnClickListener(v -> {
                if (mClickListener != null) {
                    mClickListener.onItemClick(getAdapterPosition());
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
