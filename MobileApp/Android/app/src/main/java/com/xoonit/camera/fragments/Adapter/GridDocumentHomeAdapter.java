package com.xoonit.camera.fragments.Adapter;

import android.annotation.SuppressLint;
import android.content.Context;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import androidx.annotation.Nullable;

import com.bumptech.glide.Glide;
import com.xoonit.camera.Model.DocumentByFolderResult;
import com.xoonit.camera.R;
import com.xoonit.camera.XoonitApplication;
import com.xoonit.camera.utils.ConstantUtils;

import java.util.ArrayList;

public class GridDocumentHomeAdapter extends ArrayAdapter<DocumentByFolderResult> {

    //region Variables
    private Context context;
    private int layoutResourceId;
    private ArrayList<DocumentByFolderResult> documentList;
    private GridDocumentHomeAdapter.ItemClickListener mClickListener;


    public GridDocumentHomeAdapter(Context context, int layout, ArrayList<DocumentByFolderResult> documentList) {
        super(context, layout, documentList);
        this.context = context;
        this.layoutResourceId = layout;
        this.documentList = documentList;
    }

    public DocumentByFolderResult getItem(int position) {
        return documentList.get(position);
    }

    public static class ItemGridViewHolder {
        ImageView imgExtension;
        TextView tvName;
        RelativeLayout rlContainer;
    }

    @Override
    public int getCount() {
        return documentList.size();
    }

    @SuppressLint("SetTextI18n")
    @Override
    public View getView(int position, @Nullable View convertView, @Nullable ViewGroup parent) {
        ItemGridViewHolder holder;

        if (convertView == null) {
            LayoutInflater inflater = LayoutInflater.from(getContext());
            convertView = inflater.inflate(layoutResourceId, parent, false);
            holder = new ItemGridViewHolder();
            holder.imgExtension = convertView.findViewById(R.id.imgExtension);
            holder.tvName = convertView.findViewById(R.id.tvName);
            holder.rlContainer = convertView.findViewById(R.id.rlContainer);
            convertView.setTag(holder);
        } else {
            holder = (GridDocumentHomeAdapter.ItemGridViewHolder) convertView.getTag();
        }

        String[] fileNameSplit = documentList.get(position).getLocalFileName().split("\\.");
        String extension = fileNameSplit[fileNameSplit.length - 1];
        String fileName =  documentList.get(position).getLocalFileName().substring(0, documentList.get(position).getLocalFileName().lastIndexOf("." + extension));
        if (!TextUtils.isEmpty(extension)) {
            switch (extension) {
                case ConstantUtils.EXTENSION_TYPE.PDF:
                    Glide.with(XoonitApplication.getInstance().getApplicationContext())
                            .load(R.drawable.ic_pdf)
                            .into(holder.imgExtension);
                    break;
                case ConstantUtils.EXTENSION_TYPE.PNG:
                    Glide.with(XoonitApplication.getInstance().getApplicationContext())
                            .load(R.drawable.ic_picture)
                            .into(holder.imgExtension);
                    break;
                case ConstantUtils.EXTENSION_TYPE.TIFF:
                    Glide.with(XoonitApplication.getInstance().getApplicationContext())
                            .load(R.drawable.ic_docx)
                            .into(holder.imgExtension);
                    break;
            }
        }

        if (!TextUtils.isEmpty(fileName)) {
            holder.tvName.setText(fileName);
        }

        holder.rlContainer.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mClickListener != null) {
                    mClickListener.onItemClick(position);
                }
            }
        });

        return convertView;
    }

    // allows clicks events to be caught
    public void setClickListener(GridDocumentHomeAdapter.ItemClickListener itemClickListener) {
        this.mClickListener = itemClickListener;
    }

    // parent activity will implement this method to respond to click events
    public interface ItemClickListener {
        void onItemClick(int position);
    }
}
