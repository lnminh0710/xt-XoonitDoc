package com.xoonit.camera.fragments;

import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.GridView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.xoonit.camera.Activities.Adapter.CustomAdapterGridviewCapture;
import com.xoonit.camera.BuildConfig;
import com.xoonit.camera.Database.ScansImages;
import com.xoonit.camera.Dialog.ReviewCaptureDialog;
import com.xoonit.camera.Model.CaptureSuccessResponse;
import com.xoonit.camera.R;
import com.xoonit.camera.fragments.Base.BaseFragment;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;
import com.xoonit.camera.utils.GeneralMethod;

import org.androidannotations.annotations.EFragment;
import org.androidannotations.annotations.ViewById;

import java.util.ArrayList;

@EFragment(R.layout.fragment_capture)
public class FragmentCapture extends BaseFragment implements AdapterView.OnItemClickListener {
    @ViewById(R.id.textview_address_document_capture)
    public TextView textAddress;
    @ViewById(R.id.gridview_fragment_capture)
    public GridView gridViewCapture;

    private Context mContext;
    private ArrayList<ScansImages> captureArrayList;
    private ReviewCaptureDialog reviewCaptureDialog;
    private CustomAdapterGridviewCapture adapterGridviewCapture;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        mContext = container.getContext();
        return null;
    }

    @Override
    protected void afterViews() {
        FireBaseManagement.logFireBaseEvent(mContext, ConstantFireBaseTracking.CAPTURE_FRAGMENT);
        init();
        getDataCapture();
    }

    private void init() {
        textAddress.setText("Invoice / Building / Diverses");
    }

    private void getDataCapture() {
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                if (BuildConfig.USE_MOCK_DATA) {
                    String jsonCaptureData = GeneralMethod.readFile("CaptureMockData.json", mContext);
                    CaptureSuccessResponse response = GeneralMethod.transformJsonStringToObject(jsonCaptureData, CaptureSuccessResponse.class);
                    captureArrayList = new ArrayList<>();
                    if (response != null && response.getCaptureArray() != null) {
                        captureArrayList.clear();
                        captureArrayList.addAll(response.getCaptureArray());
                        adapterGridviewCapture = new CustomAdapterGridviewCapture(getContext(), R.layout.custom_gridview_fragment_capture, captureArrayList);
                        gridViewCapture.setAdapter(adapterGridviewCapture);
                        adapterGridviewCapture.notifyDataSetChanged();
                    } else {
                        Toast.makeText(getContext(), "Can not get Capture !", Toast.LENGTH_SHORT).show();
                    }
                }
            }
        }, 500);
        gridViewCapture.setOnItemClickListener(this);

    }


    @Override
    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
        ReviewCapture(position);
    }

    private void ReviewCapture(int position) {
        ScansImages scansImages = captureArrayList.get(position);
        ArrayList<String> urlList = new ArrayList<>();
        urlList.add(scansImages.getImgURL());
        reviewCaptureDialog = new ReviewCaptureDialog(mContext, urlList, scansImages.getImagePath());
        reviewCaptureDialog.show();
    }
}
