package com.xoonit.camera.Activities;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.widget.AppCompatButton;
import androidx.appcompat.widget.AppCompatCheckBox;

import com.squareup.picasso.Picasso;
import com.xoonit.camera.Database.DatabaseHelper;
import com.xoonit.camera.Database.ScansImages;
import com.xoonit.camera.R;
import com.xoonit.camera.utils.CustomToast;
import com.xoonit.camera.utils.CustomToastUpload;

import java.io.File;
import java.util.ArrayList;

public class CustomPhotoAdapter extends ArrayAdapter {
    private Activity context;
    private int layoutRescourceid;
    private ArrayList<ScansImages> imagesList;
    private boolean isPressed;
    private boolean checkAll;
    private DatabaseHelper databaseHelper;
    //    private int row_checked = -1 ;
    public CustomPhotoAdapter(Activity context, int layout, ArrayList<ScansImages> imagesList) {
        super(context, layout, imagesList);
        this.context = context;
        this.layoutRescourceid = layout;
        this.imagesList = imagesList;
        this.isPressed = false;
        this.checkAll = false;
        this.databaseHelper = new DatabaseHelper(context);
    }
    @Override
    public long getItemId(int position) {
        return imagesList.get(position).getIdScansImage();
    }

    public ScansImages getItem(int position) {
        return imagesList.get(position);
    }

    @Override
    public int getCount() {
        return imagesList.size();
    }

    @SuppressLint({"SetTextI18n", "ResourceAsColor"})
    @Override
    public View getView(int position, @Nullable View convertView, @Nullable ViewGroup parent) {
        View myView = convertView;
        ImageHolder holder;

        if (myView == null) {
            LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            myView = inflater.inflate(layoutRescourceid, parent, false);
            holder = new ImageHolder();
            holder.btndelete = myView.findViewById(R.id.button_delete_capture);
            holder.checkBox = myView.findViewById(R.id.checkbox_photos);
            holder.text_doc_type = myView.findViewById(R.id.textview_doctype_capture);
            holder.text_doc_pages = myView.findViewById(R.id.textview_document_pages);
            holder.Bitmap = myView.findViewById(R.id.img_capture);

        } else {
            holder = (ImageHolder) myView.getTag();
        }

        if (isPressed) {
            holder.btndelete.setVisibility(View.INVISIBLE);
            holder.checkBox.setVisibility(View.VISIBLE);
            holder.Bitmap.setBackgroundColor(Color.parseColor("#102027"));
        } else {
            holder.btndelete.setVisibility(View.VISIBLE);
            holder.checkBox.setVisibility(View.INVISIBLE);
            holder.Bitmap.setBackgroundColor(Color.parseColor("#000000"));
            imagesList.get(position).setCheckboxState(false);
        }

        //Assign data to view
        if (imagesList.get(position).getCheckboxState()) {
            holder.checkBox.setChecked(true);
        } else {
            holder.checkBox.setChecked(false);
        }
        // Events Delete capture when click the icon recycle bin
        holder.btndelete.setOnClickListener(v ->{
            AlertDialog.Builder builder = new AlertDialog.Builder(context);
            builder.setMessage("Delete this item ?");
            builder.setPositiveButton("OK",(dialog, which) -> {
                File file = new File(imagesList.get(position).getImagePath(),imagesList.get(position).getImageName());
                boolean delete = file.delete();
                Log.d("DELETE", "Result: "+delete);
                databaseHelper.deleteSingleScansImagesbyId(imagesList.get(position).getIdScansImage());
                databaseHelper.close();
                imagesList.remove(position);
                notifyDataSetChanged();
                CustomToastUpload.makeText(context,"Delete Success !", Toast.LENGTH_SHORT).show();
            });
            builder.setNegativeButton("Cancel",(dialog, which) -> {
                dialog.dismiss();
            });
            AlertDialog dialog = builder.create();
            dialog.show();
        });

        holder.text_doc_type.setText("Invoice");
        File image = new File(imagesList.get(position).getImagePath(), imagesList.get(position).getImageName());

        Picasso.with(context)
                .load(image)
                .fit()
                .into(holder.Bitmap);
        myView.setTag(holder);

        return myView;
    }

    public void showAllCheckBox(boolean b) {
        this.isPressed = b;
        notifyDataSetChanged();
    }

    public void checkAllCheckBox(boolean b) {
        this.checkAll = b;
        for (ScansImages Object : imagesList) {
            if (checkAll) {
                Object.setCheckboxState(true);
            } else {
                Object.setCheckboxState(false);
            }
        }
        notifyDataSetChanged();
    }

    public void setCheckedStateItem(boolean stateSelected, int position) {
        if (stateSelected) {
            imagesList.get(position).setCheckboxState(true);
        } else {
            imagesList.get(position).setCheckboxState(false);
        }
        notifyDataSetChanged();
    }

    public class ImageHolder {
        ImageView Bitmap;
        TextView text_doc_type;
        TextView text_doc_pages;
        AppCompatCheckBox checkBox;
        ImageButton btndelete;

    }
}
