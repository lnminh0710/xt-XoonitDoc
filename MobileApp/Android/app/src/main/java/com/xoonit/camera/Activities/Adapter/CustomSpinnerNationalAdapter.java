package com.xoonit.camera.Activities.Adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageView;

import com.xoonit.camera.Model.CountryPhoneNumber;
import com.xoonit.camera.R;

import java.util.List;

public class CustomSpinnerNationalAdapter extends BaseAdapter {

    private Context context;
    private List<CountryPhoneNumber> arrayList;
    private int resIdLayout;

    public CustomSpinnerNationalAdapter(Context context,List<CountryPhoneNumber> arrayList,int resIdLayout){
        this.context= context;
        this.arrayList = arrayList;
        this.resIdLayout=resIdLayout;
    }

    @Override
    public int getCount() {
        return arrayList.size();
    }

    @Override
    public CountryPhoneNumber getItem(int position) {
        return arrayList.get(position);
    }

    @Override
    public long getItemId(int position) {
        return 0;
    }
    @Override
    public View getView(int position, View convertView, ViewGroup parent) {

        LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        ViewHolder viewHolder;
        if(convertView==null){
            convertView = inflater.inflate(resIdLayout,parent,false);
            viewHolder = new ViewHolder();
            viewHolder.imageView= convertView.findViewById(R.id.custom_national_flag);
        }else{
            viewHolder = (ViewHolder) convertView.getTag();
        }
        viewHolder.imageView.setImageResource(arrayList.get(position).getImgCountry());
        convertView.setTag(viewHolder);
        return convertView;

    }

    class ViewHolder{
        ImageView imageView;
    }

}
