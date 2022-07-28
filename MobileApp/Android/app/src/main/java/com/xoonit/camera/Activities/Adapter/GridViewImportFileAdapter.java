package com.xoonit.camera.Activities.Adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import com.xoonit.camera.Model.FolderItem;
import com.xoonit.camera.R;

import java.util.ArrayList;

public class GridViewImportFileAdapter extends BaseAdapter {

    private Context mContext;
    private int reslayout;
    private ArrayList<ArrayList<FolderItem>> folderItemArrayList;

    public GridViewImportFileAdapter(Context mContext, int reslayout, ArrayList<ArrayList<FolderItem>> folderItemArrayList) {
        this.mContext = mContext;
        this.reslayout = reslayout;
        this.folderItemArrayList = folderItemArrayList;
    }

    @Override
    public int getCount() {
        return folderItemArrayList.size();
    }

    @Override
    public Object getItem(int position) {
        return folderItemArrayList.get(position);
    }

    @Override
    public long getItemId(int position) {
        return 0;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        ViewHolderImport viewHolder;
        if(convertView==null){
            LayoutInflater inflater = (LayoutInflater) mContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            convertView = inflater.inflate(reslayout,parent,false);
            viewHolder = new ViewHolderImport();
            viewHolder.btnfolder = convertView.findViewById(R.id.imageview_folder);
            viewHolder.txtFolderName = convertView.findViewById(R.id.textview_folder_name);
            convertView.setTag(viewHolder);
        }else{
            viewHolder = (ViewHolderImport) convertView.getTag();
        }
            viewHolder.txtFolderName.setText(folderItemArrayList.get(position).get(0).getFolderName());

        return convertView;
    }
    class ViewHolderImport{
        ImageView btnfolder;
        TextView txtFolderName;
    }
}
