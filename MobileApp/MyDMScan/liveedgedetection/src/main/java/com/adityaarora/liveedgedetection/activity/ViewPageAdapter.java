package com.adityaarora.liveedgedetection.activity;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.support.annotation.NonNull;
import android.support.v4.view.PagerAdapter;
import android.support.v4.view.ViewPager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;

import com.adityaarora.liveedgedetection.Database.ScansContainerItem;
import com.adityaarora.liveedgedetection.Database.ScansImages;
import com.adityaarora.liveedgedetection.R;
import com.adityaarora.liveedgedetection.constants.ScanConstants;

import java.io.File;
import java.util.List;

public class ViewPageAdapter extends PagerAdapter {

    //region Variables
    private Context context;
    private List<ScansImages> ImgList;
    //endregion

    //region Constructors
    ViewPageAdapter(Context context, List<ScansImages> imgList) {
        this.context = context;
        this.ImgList = imgList;
    }
    //endregion

    //region events
    @Override
    public int getCount() {
        return ImgList.size();
    }

    @Override
    public boolean isViewFromObject(@NonNull View view, @NonNull Object o) {
        return view == o;
    }

    @NonNull
    @Override
    public Object instantiateItem(@NonNull ViewGroup container, int position) {
        LayoutInflater layoutInflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        @SuppressLint("InflateParams") View view = layoutInflater.inflate(R.layout.custom_layout, null);
        // Assign image to imageview
        final TextView textNote = (TextView) view.findViewById(R.id.textNotes);
        textNote.getText();


        File img = new File(ImgList.get(position).getImagePath(), ImgList.get(position).getImageName());
        if (img.exists()) {
            Bitmap myBitmap = BitmapFactory.decodeFile(img.getAbsolutePath());
            ImageView imageView = (ImageView) view.findViewById(R.id.scanned_image);
            imageView.setImageBitmap(myBitmap);

            ViewPager vp = (ViewPager) container;
            vp.addView(view, 0);

        }
        return view;
    }

    @Override
    public void destroyItem(@NonNull ViewGroup container, int position, @NonNull Object object) {
        ViewPager vp = (ViewPager) container;
        View view = (View) object;
        vp.removeView(view);
    }
    //endregion
}





