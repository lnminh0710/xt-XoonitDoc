package com.xoonit.camera.Activities;

import android.annotation.SuppressLint;
import android.content.Context;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;


import androidx.annotation.NonNull;
import androidx.viewpager.widget.PagerAdapter;
import androidx.viewpager.widget.ViewPager;

import com.xoonit.camera.Database.ScansImages;
import com.xoonit.camera.R;
import com.squareup.picasso.Picasso;

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


        File img = new File(ImgList.get(position).getImagePath(), ImgList.get(position).getImageName());
        if (img.exists()) {
//            Bitmap myBitmap = BitmapFactory.decodeFile(img.getAbsolutePath());
            ImageView imageView = (ImageView) view.findViewById(R.id.scanned_image);
//            imageView.setImageBitmap(myBitmap);
            Picasso.with(context)
                    .load(img)
                    .fit()
                    .into(imageView);

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





