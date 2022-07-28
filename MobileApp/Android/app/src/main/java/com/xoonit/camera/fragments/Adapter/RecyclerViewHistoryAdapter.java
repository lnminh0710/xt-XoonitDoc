package com.xoonit.camera.fragments.Adapter;

import android.content.Context;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.xoonit.camera.Model.History;
import com.xoonit.camera.R;
import com.xoonit.camera.utils.ConstantUtils;

import java.util.ArrayList;

public class RecyclerViewHistoryAdapter extends RecyclerView.Adapter<RecyclerViewHistoryAdapter.ItemHistory> {

    private Context mContext;
    private int resLayout;
    private ArrayList<History> arrayListHistory;
    private ItemClickListener itemClickListener;

    public RecyclerViewHistoryAdapter(Context mContext, int resLayout, ArrayList<History> arrayListHistory) {
        this.mContext = mContext;
        this.resLayout = resLayout;
        this.arrayListHistory = arrayListHistory;
    }

    @NonNull
    @Override
    public ItemHistory onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(mContext).inflate(resLayout,parent,false);
        return new RecyclerViewHistoryAdapter.ItemHistory(view);
    }
    @Override
    public void onBindViewHolder(@NonNull ItemHistory holder, int position) {
        holder.onBindData(arrayListHistory.get(position));
    }

    @Override
    public int getItemCount() {
        return arrayListHistory.size();
    }

    class ItemHistory extends RecyclerView.ViewHolder{
        TextView syncStatus,fileName,totalImage,docType,devices,scanTime,scannedDate,cloudAdress;

        public ItemHistory(@NonNull View itemView) {
            super(itemView);
            syncStatus = itemView.findViewById(R.id.textview_status_upload);
            fileName = itemView.findViewById(R.id.textview_filename_history);
            totalImage = itemView.findViewById(R.id.textview_total_history);
            docType = itemView.findViewById(R.id.textview_document_type_history);
            devices = itemView.findViewById(R.id.textview_devices_history);
            scanTime = itemView.findViewById(R.id.textview_scan_time_history);
            scannedDate = itemView.findViewById(R.id.textview_scanned_date_history);
            cloudAdress = itemView.findViewById(R.id.textview_cloud_history);
        }

        public void onBindData(History history){

            if(!TextUtils.isEmpty(history.getSyncStatus())){
                syncStatus.setText(history.getSyncStatus());
                switch (history.getSyncStatus()){
                    case ConstantUtils.SYNC_STATUS.DONE:
                        syncStatus.setBackgroundResource(R.color.upload_done);
                        break;
                    case ConstantUtils.SYNC_STATUS.LOADING:
                        syncStatus.setBackgroundResource(R.color.upload_loading);
                        break;
                    case  ConstantUtils.SYNC_STATUS.ERROR:
                        syncStatus.setBackgroundResource(R.color.upload_error);
                        break;
                }
            }

            if(!TextUtils.isEmpty(history.getFileName())){
                fileName.setText(history.getFileName());
            }

            if(!TextUtils.isEmpty(String.valueOf(history.getTotalImage()))){
                totalImage.setText(String.valueOf(history.getTotalImage()));
            }
            if(!TextUtils.isEmpty(history.getDocumentType())){
                docType.setText(history.getDocumentType());
            }
            if(!TextUtils.isEmpty(history.getDevices())){
                devices.setText(history.getDevices());
            }

            if(!TextUtils.isEmpty(history.getScanTime())){
                scanTime.setText(history.getScanTime());
            }
            if(!TextUtils.isEmpty(history.getScannedDate())){
                scannedDate.setText(history.getScannedDate());
            }
            if(!TextUtils.isEmpty(history.getCloudAddress())){
                cloudAdress.setText(history.getCloudAddress());
            }
        }
    }

    void setOnItemClickListener(ItemClickListener itemClickListener){
        this.itemClickListener = itemClickListener;
    }
    public interface ItemClickListener{
        void onItemClick(int position);
    }
}
