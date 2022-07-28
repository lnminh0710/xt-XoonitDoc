package com.xoonit.camera.Activities;

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
import androidx.appcompat.widget.AppCompatCheckBox;

import com.xoonit.camera.Database.ScansImages;
import com.xoonit.camera.R;
import com.xoonit.camera.utils.StringUtils;
import com.squareup.picasso.Picasso;

import java.io.File;
import java.util.ArrayList;

public class CustomListViewAdapter extends ArrayAdapter<ScansImages> implements Filterable {

    private Context mContext;
    private int layoutResId;
    private ArrayList<ScansImages> ImagesList;
    private boolean pressed;
    private boolean checkAll;

    CustomFilter filter;
    ArrayList<ScansImages> filterList;

    public CustomListViewAdapter(@NonNull Context context, int resource, ArrayList<ScansImages> scansImagesList) {
        super(context, resource,scansImagesList);
        this.mContext = context;
        this.layoutResId= resource;
        this.ImagesList = scansImagesList;
        pressed =false;
        checkAll=false;
    }

    @Override
    public int getCount() {
        return ImagesList.size();
    }

    @Override
    public ScansImages getItem(int position) {
        return ImagesList.get(position);
    }

    @Override
    public long getItemId(int position) {
        return ImagesList.get(position).getIdScansImage();
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        ViewHolder holder;
        View myView = convertView;

        if(myView !=null){
            holder = (ViewHolder) myView.getTag();
        }else{
            LayoutInflater inflater = (LayoutInflater) mContext.getSystemService(mContext.LAYOUT_INFLATER_SERVICE);
            myView = inflater.inflate(layoutResId,parent,false);
            holder = new ViewHolder();
            holder.mScansImages = myView.findViewById(R.id.img_custom_listview);
            holder.txtDocType = myView.findViewById(R.id.text_doctype_listview);
            holder.txtImagesName= myView.findViewById(R.id.textimage_name_listview);
            holder.checkbox = myView.findViewById(R.id.checkboxsingle_custom_listview);
            convertView.setTag(holder);
        }

        if (pressed) {
            holder.checkbox.setVisibility(View.VISIBLE);
        } else {
            holder.checkbox.setVisibility(View.INVISIBLE);
            ImagesList.get(position).setCheckboxState(false);
        }

        //Assign data to view
        if (ImagesList.get(position).getCheckboxState()) {
            holder.checkbox.setChecked(true);
        } else {
            holder.checkbox.setChecked(false);
        }

        holder.txtDocType.setText(StringUtils.GetDocumentTypeById(ImagesList.get(position).getIdDocumentTree()));
        holder.txtImagesName.setText(ImagesList.get(position).getImageName());
        File image = new File(ImagesList.get(position).getImagePath(), ImagesList.get(position).getImageName());
        Picasso.with(mContext)
                .load(image)
                .fit()
                .into(holder.mScansImages);
        myView.setTag(holder);


        return myView;
    }
    class ViewHolder{

        private ImageView mScansImages;
        private TextView txtDocType;
        private TextView txtImagesName;
        private AppCompatCheckBox checkbox;

    }

    public void showAllCheckBox(boolean b) {
        this.pressed = b;
        notifyDataSetChanged();
    }
    public void checkAllCheckBox(boolean b) {
        this.checkAll = b;
        for (ScansImages Object : ImagesList) {
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
            ImagesList.get(position).setCheckboxState(true);
        } else {
            ImagesList.get(position).setCheckboxState(false);
        }
        notifyDataSetChanged();
    }

    @Override
    public Filter getFilter() {
        filter =new CustomFilter();
        return filter;
    }
    private class CustomFilter extends Filter{
        @Override
        protected FilterResults performFiltering(CharSequence constraint) {
            FilterResults results = new FilterResults();
            if(constraint !=null && constraint.length() >0){
                constraint=constraint.toString().toUpperCase();
                ArrayList<ScansImages> filter = new ArrayList<>();
                for(int i=0;i<filterList.size();i++){
                    String mDoc = StringUtils.GetDocumentTypeById(filterList.get(i).getIdDocumentTree()).toLowerCase();
                    Log.d("DocumentType", "performFiltering: "+mDoc);
                    if(mDoc.contains(constraint.toString().toLowerCase())){
                        Log.d("DocumentType", "performFiltering: "+mDoc.contains(constraint));
                        ScansImages images = filterList.get(i);
                        filter.add(images);
                    }
                }
                results.count = filter.size();
                results.values = filter;
            }else{
                results.count=filterList.size();
                results.values=filterList;
            }
            return results;
        }

        @Override
        protected void publishResults(CharSequence constraint, FilterResults results) {
            ImagesList= (ArrayList<ScansImages>) results.values;
            notifyDataSetChanged();
        }
    }
}
