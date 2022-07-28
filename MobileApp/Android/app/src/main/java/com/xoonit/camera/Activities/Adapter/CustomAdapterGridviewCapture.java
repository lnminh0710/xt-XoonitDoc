package com.xoonit.camera.Activities.Adapter;

import android.annotation.SuppressLint;
import android.content.Context;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import com.squareup.picasso.Picasso;
import com.xoonit.camera.Activities.Base.BaseActivity;
import com.xoonit.camera.Database.DatabaseHelper;
import com.xoonit.camera.Database.ScansImages;
import com.xoonit.camera.R;
import com.xoonit.camera.utils.CustomToast;

import java.util.ArrayList;

public class CustomAdapterGridviewCapture extends BaseAdapter {

    private Context context;
    private ArrayList<ScansImages> listCapture;
    private int IdRes;
    private DatabaseHelper databaseHelper;

    public CustomAdapterGridviewCapture(Context context, int layoutResource, ArrayList<ScansImages> arrayList) {
        this.context = context;
        this.IdRes = layoutResource;
        this.listCapture = arrayList;
        databaseHelper = new DatabaseHelper(context);

    }

    @Override
    public int getCount() {
        return listCapture.size();
    }

    @Override
    public Object getItem(int position) {
        return listCapture.get(position);
    }

    @Override
    public long getItemId(int position) {
        return listCapture.get(position).getIdScansImage();
    }

    @SuppressLint("ViewHolder")
    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        ViewHolder viewHolder;

        if (convertView == null) {
            LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            convertView = inflater.inflate(IdRes, parent, false);
            viewHolder = new ViewHolder();
            viewHolder.imgCapture = convertView.findViewById(R.id.img_capture);
            viewHolder.textDocumentType = convertView.findViewById(R.id.textview_doctype_capture);
            viewHolder.textDocumentPages = convertView.findViewById(R.id.textview_document_pages);
            viewHolder.btnDelete = convertView.findViewById(R.id.button_delete_capture);
            convertView.setTag(viewHolder);
        } else {
            viewHolder = (ViewHolder) convertView.getTag();
        }
        viewHolder.textDocumentType.setText("Invoice");
        viewHolder.textDocumentPages.setText(String.valueOf(listCapture.get(position).getPageNr()));
        Picasso.with(context)
                .load(listCapture.get(position).getImgURL())
                .noFade()
                .fit()
                .into(viewHolder.imgCapture);

        viewHolder.btnDelete.setOnClickListener(v -> {
            ((BaseActivity) context).showDialog("Delete Capture", "Are you sure delete this capture ?", Gravity.CENTER,
                    "Cancel", new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                        }
                    }, "Ok", new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            databaseHelper.deleteSingleScansImagesbyId(listCapture.get(position).getIdScansImage());
                            listCapture.remove(position);
                            notifyDataSetChanged();
                            CustomToast.showToastInfo(context,false,"Delete capture successfully !", R.layout.activity_home);
                        }
                    });

        });

        return convertView;
    }

    class ViewHolder {
        ImageView imgCapture;
        TextView textDocumentType;
        TextView textDocumentPages;
        ImageButton btnDelete;
    }


}
