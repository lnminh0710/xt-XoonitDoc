package com.xoonit.camera.Activities;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Filter;
import android.widget.Filterable;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.widget.AppCompatCheckBox;

import com.xoonit.camera.Database.ScansImages;
import com.xoonit.camera.R;
import com.xoonit.camera.utils.StringUtils;
import com.squareup.picasso.Picasso;

import java.io.File;
import java.util.ArrayList;

public class CustomListViewMultipleAdapter extends ArrayAdapter<ScansImages> implements Filterable {


    //region Variables
    private Activity context;
    private int layoutRescourceid;
    private ArrayList<ScansImages> scansImagesList;
    private boolean isPressed;
    private boolean checkAll;

    private ArrayList<ScansImages> filterList;
    private CustomFilter filter;

    //region Constructors
    CustomListViewMultipleAdapter(Activity context, int custom_image_list_Multiple, ArrayList<ScansImages> scanListMutilple) {
        super(context, custom_image_list_Multiple, scanListMutilple);
        this.context = context;
        layoutRescourceid = custom_image_list_Multiple;
        this.scansImagesList = scanListMutilple;
        filterList = scansImagesList;
    }

    //endregion
    @Override
    public int getCount() {
        return scansImagesList.size();
    }

    @Override
    public ScansImages getItem(int position) {
        return scansImagesList.get(position);
    }

    @Override
    public long getItemId(int position) {
        return scansImagesList.get(position).getIdScansImage();
    }

    //region adapter event
    @SuppressLint("SetTextI18n")
    @Override
    public View getView(final int position, View convertView, final ViewGroup parent) {
        View row = convertView;
        ImageHolder imageHolder;
        if (row == null) {
            LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            row = inflater.inflate(layoutRescourceid, parent, false);
            imageHolder = new ImageHolder();
            imageHolder.Bitmap = row.findViewById(R.id.img_custom_listview_multi);
            imageHolder.imageProperty = row.findViewById(R.id.textimage_name_listview_multi);
            imageHolder.imageTypeId = row.findViewById(R.id.text_doctype_listview_multi);
            imageHolder.checkBox = row.findViewById(R.id.checkbox_custom_listview_multi);
            convertView.setTag(imageHolder);
        } else {
            imageHolder = (ImageHolder) row.getTag();
        }
        if (isPressed) {
            imageHolder.checkBox.setVisibility(View.VISIBLE);
        } else {
            imageHolder.checkBox.setVisibility(View.INVISIBLE);
            scansImagesList.get(position).setCheckboxState(false);
        }
        //Assign data to view
        if (scansImagesList.get(position).getCheckboxState()) {
            imageHolder.checkBox.setChecked(true);
        } else {
            imageHolder.checkBox.setChecked(false);
        }
        imageHolder.imageTypeId.setText(StringUtils.GetDocumentTypeById(scansImagesList.get(position).getIdDocumentTree()));
        imageHolder.imageProperty.setText("Page :" + String.valueOf(scansImagesList.get(position).getPageNr()));
        File image = new File(scansImagesList.get(position).getImagePath(), scansImagesList.get(position).getImageName());
        Picasso.with(context)
                .load(image)
                .fit()
                .into(imageHolder.Bitmap);
        row.setTag(imageHolder);

        return row;
    }

    public void showAllCheckBox(boolean b) {
        this.isPressed = b;
        notifyDataSetChanged();
    }

    public void checkAllCheckBox(boolean b) {
        this.checkAll = b;
        for (ScansImages Object : scansImagesList) {
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
            scansImagesList.get(position).setCheckboxState(true);
        } else {
            scansImagesList.get(position).setCheckboxState(false);
        }
        notifyDataSetChanged();
    }
    //region internal class
    public class ImageHolder {
        ImageView Bitmap;
        TextView imageProperty;
        TextView imageTypeId;
        AppCompatCheckBox checkBox;
    }
    //endregion

    @NonNull
    @Override
    public Filter getFilter() {
        filter = new CustomFilter();
        return filter;
    }

    private class CustomFilter extends Filter {
        @Override
        protected FilterResults performFiltering(CharSequence constraint) {
            FilterResults results = new FilterResults();
            if (constraint != null && constraint.length() > 0) {
                constraint = constraint.toString().toUpperCase();
                ArrayList<ScansImages> list = new ArrayList<>();
                for (int i = 0; i < filterList.size(); i++) {
                    String mDoc = StringUtils.GetDocumentTypeById(filterList.get(i).getIdDocumentTree()).toLowerCase();
                    if (mDoc.contains(constraint.toString().toLowerCase())) {
                        list.add(filterList.get(i));
                    }
                }
                results.count = list.size();
                results.values = list;
            } else {
                results.count = filterList.size();
                results.values = filterList;
            }
            return results;
        }

        @Override
        protected void publishResults(CharSequence constraint, FilterResults results) {
            scansImagesList= (ArrayList<ScansImages>) results.values;
            notifyDataSetChanged();
        }
    }
}
