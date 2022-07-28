package com.xoonit.camera.Activities.Adapter;

import android.content.Context;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.CheckBox;
import android.widget.ImageView;

import com.bumptech.glide.Glide;
import com.xoonit.camera.Model.FolderItem;
import com.xoonit.camera.R;
import com.xoonit.camera.XoonitApplication;
import com.xoonit.camera.utils.ConstantUtils;

import java.util.ArrayList;

public class GridViewFileFolderAdapter extends BaseAdapter {

    private Context mContext;
    private int resLayout;
    private ArrayList<FolderItem> fileArrayList;
    private Boolean isCheckAll = false;

    public GridViewFileFolderAdapter(Context mContext, int resLayout, ArrayList<FolderItem> fileArrayList) {
        this.mContext = mContext;
        this.resLayout = resLayout;
        this.fileArrayList = fileArrayList;
    }

    @Override
    public int getCount() {
        return fileArrayList.size();
    }

    @Override
    public Object getItem(int position) {
        return fileArrayList.get(position);
    }

    @Override
    public long getItemId(int position) {
        return 0;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        FileFolderViewHolder viewHolder;
        if(convertView == null){
            viewHolder = new FileFolderViewHolder();
            LayoutInflater inflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            convertView = inflater.inflate(resLayout,parent,false);
            viewHolder.imageView = convertView.findViewById(R.id.image_thumnail_files);
            viewHolder.checkBox = convertView.findViewById(R.id.checkbox_thumnailfiles);
            convertView.setTag(viewHolder);
        }else{
            viewHolder = (FileFolderViewHolder) convertView.getTag();
        }

        //Assign data to view
        viewHolder.checkBox.setChecked(fileArrayList.get(position).isChecked());

        String extension = fileArrayList.get(position).getFilePath();
        if (!TextUtils.isEmpty(extension)) {
            if (extension.contains( ConstantUtils.EXTENSION_TYPE.PDF)) {
                Glide.with(XoonitApplication.getInstance().getApplicationContext())
                        .load(R.drawable.ic_pdf)
                        .fitCenter()
                        .into(viewHolder.imageView);
            }else if(extension.contains( ConstantUtils.EXTENSION_TYPE.TIFF)) {
                Glide.with(XoonitApplication.getInstance().getApplicationContext())
                        .load(R.drawable.ic_docx)
                        .fitCenter()
                        .into(viewHolder.imageView);

            }else{
                    Glide.with(XoonitApplication.getInstance().getApplicationContext())
                            .load(fileArrayList.get(position).getFilePath())
                            .fitCenter()
                            .into(viewHolder.imageView);
            }
        }
        return convertView;
    }

    public void checkAllCheckBox(boolean b) {
        this.isCheckAll = b;
        for (FolderItem Object : fileArrayList) {
            if (isCheckAll) {
                Object.setChecked(true);
            } else {
                Object.setChecked(false);
            }
        }
        notifyDataSetChanged();

    }

    class FileFolderViewHolder{
        ImageView imageView;
        CheckBox checkBox;
    }

}
