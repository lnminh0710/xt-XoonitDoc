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

import com.xoonit.camera.Model.ContactItem;
import com.xoonit.camera.R;

import java.util.List;

public class ListContactAdapter extends RecyclerView.Adapter<ListContactAdapter.ItemListContactViewHolder> {
    private Context context;
    private List<ContactItem> contactItemList;
    private ItemClickListener mClickListener;

    // data is passed into the constructor
    public ListContactAdapter(Context context, List<ContactItem> contactItemList) {
        this.context = context;
        this.contactItemList = contactItemList;
    }

    @NonNull
    @Override
    public ItemListContactViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(context).inflate(R.layout.item_list_contact, parent, false);
        return new ListContactAdapter.ItemListContactViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ItemListContactViewHolder holder, int position) {
        holder.onBindData(contactItemList.get(position));
    }

    @Override
    public int getItemCount() {
        return contactItemList.size();
    }

    public class ItemListContactViewHolder extends RecyclerView.ViewHolder {
        TextView tvFirstName, tvLastName, tvDateModified, tvAddress;
        CardView cardItemContainer;

        public ItemListContactViewHolder(@NonNull View itemView) {
            super(itemView);
            tvFirstName = itemView.findViewById(R.id.tvFirstName);
            tvDateModified = itemView.findViewById(R.id.tvDateModified);
            tvLastName = itemView.findViewById(R.id.tvLastName);
            tvAddress = itemView.findViewById(R.id.tvAddress);
            cardItemContainer = itemView.findViewById(R.id.cardItemContainer);
        }

        @SuppressLint("SetTextI18n")
        public void onBindData(ContactItem contactItem) {

            if (!TextUtils.isEmpty(contactItem.getAddress())) {
                tvAddress.setText(contactItem.getAddress());
            }
            if (!TextUtils.isEmpty(contactItem.getDateModified())) {
                tvDateModified.setText(contactItem.getDateModified());
            }
            if (!TextUtils.isEmpty(contactItem.getLastName())) {
                tvLastName.setText(contactItem.getLastName());
            }
            if (!TextUtils.isEmpty(contactItem.getFirstName())) {
                tvFirstName.setText(contactItem.getFirstName());
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
