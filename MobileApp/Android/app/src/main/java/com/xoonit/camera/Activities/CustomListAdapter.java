package com.xoonit.camera.Activities;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Filter;
import android.widget.Filterable;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.widget.AppCompatCheckBox;

import com.xoonit.camera.Database.ScansImages;
import com.xoonit.camera.R;
import com.xoonit.camera.utils.StringUtils;
import com.squareup.picasso.Picasso;

import java.io.File;
import java.util.ArrayList;


public class CustomListAdapter extends ArrayAdapter<ScansImages> implements Filterable {

    //region Variables
    private Activity context;
    private int layoutRescourceid;
    private ArrayList<ScansImages> imagesList;
    private boolean isPressed;
    private boolean checkAll;
    // Filter
    CustomFilter filter;
    ArrayList<ScansImages> filterList;


    CustomListAdapter(Activity context, int layout, ArrayList<ScansImages> imagesList) {
        super(context, layout, imagesList);
        this.context = context;
        this.layoutRescourceid = layout;
        this.imagesList = imagesList;
        this.isPressed = false;
        this.checkAll = false;
        filterList = imagesList;

    }

    public ScansImages getItem(int position) {
        return imagesList.get(position);
    }

    @Override
    public int getCount() {
        return imagesList.size();
    }

    @SuppressLint("SetTextI18n")
    @Override
    public View getView(int position, @Nullable View convertView, @Nullable ViewGroup parent) {
        View myView = convertView;
        ImageHolder holder;

        if (myView == null) {
            LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            myView = inflater.inflate(layoutRescourceid, parent, false);
            holder = new ImageHolder();
            holder.Bitmap = myView.findViewById(R.id.Bitmap);
            holder.imageProperty = myView.findViewById(R.id.textImage);
            holder.imageTypeId = myView.findViewById(R.id.textType);
            holder.checkBox = myView.findViewById(R.id.checkboxSingle);
            convertView.setTag(holder);
        } else {
            holder = (ImageHolder) myView.getTag();
        }

        if (isPressed) {
            holder.checkBox.setVisibility(View.VISIBLE);
        } else {
            holder.checkBox.setVisibility(View.INVISIBLE);
            imagesList.get(position).setCheckboxState(false);
        }

        //Assign data to view
        if (imagesList.get(position).getCheckboxState()) {
            holder.checkBox.setChecked(true);
        } else {
            holder.checkBox.setChecked(false);
        }
        holder.imageTypeId.setText(StringUtils.GetDocumentTypeById(imagesList.get(position).getIdDocumentTree()));
        holder.imageProperty.setText(imagesList.get(position).getImageName());
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
        TextView imageProperty;
        TextView imageTypeId;
        AppCompatCheckBox checkBox;
    }

    @NonNull
    @Override
    public Filter getFilter() {
        filter = new CustomFilter();
        return filter;
    }

    private class CustomFilter extends Filter {
        @Override
        protected FilterResults performFiltering(CharSequence constraint) {
            Log.d("DocumentType", "constraint: " + constraint);
            FilterResults results = new FilterResults();
            if (constraint != null && constraint.length() > 0) {
                constraint = constraint.toString().toUpperCase();
                ArrayList<ScansImages> filter = new ArrayList<>();
                for (int i = 0; i < filterList.size(); i++) {
                    String mDoc = StringUtils.GetDocumentTypeById(filterList.get(i).getIdDocumentTree()).toUpperCase();
                    Log.d("DocumentType", "performFiltering: " + mDoc);
                    if (mDoc.contains(constraint.toString().toUpperCase())) {
                        Log.d("DocumentType", "performFiltering: " + mDoc.contains(constraint));
                        ScansImages images = filterList.get(i);
                        filter.add(images);
                    }
                }
                results.count = filter.size();
                results.values = filter;
            } else {
                results.count = filterList.size();
                results.values = filterList;
            }
            return results;
        }

        @Override
        protected void publishResults(CharSequence constraint, FilterResults results) {
            imagesList = (ArrayList<ScansImages>) results.values;
            notifyDataSetChanged();
        }
    }
}
