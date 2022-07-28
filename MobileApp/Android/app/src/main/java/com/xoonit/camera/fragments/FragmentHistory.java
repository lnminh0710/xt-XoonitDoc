package com.xoonit.camera.fragments;

import android.app.ProgressDialog;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.xoonit.camera.BuildConfig;
import com.xoonit.camera.Model.History;
import com.xoonit.camera.Model.HistoryResponse;
import com.xoonit.camera.R;
import com.xoonit.camera.fragments.Adapter.RecyclerViewHistoryAdapter;
import com.xoonit.camera.fragments.Base.BaseFragment;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;
import com.xoonit.camera.utils.GeneralMethod;

import org.androidannotations.annotations.EFragment;
import org.androidannotations.annotations.ViewById;

import java.util.ArrayList;

@EFragment(R.layout.fragment_history)
public class FragmentHistory extends BaseFragment {

    @ViewById(R.id.recycler_view_history)
    RecyclerView recyclerView;

    private Context mContext;
    private ArrayList<History> arrayListHistory = new ArrayList<>();
    private RecyclerViewHistoryAdapter rvHistoryAdapter;
    private ProgressDialog progressDialog;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        mContext = container.getContext();
        return null;
    }

    @Override
    protected void afterViews() {
        FireBaseManagement.logFireBaseEvent(mContext, ConstantFireBaseTracking.HISTORY_FRAGMENT);
        initControl();
        getHistoryData();
    }

    private void initControl(){
        progressDialog = new ProgressDialog(mContext);
        progressDialog.setMessage("Loading...");
        progressDialog.setCancelable(false);
        final LinearLayoutManager layoutManager = new LinearLayoutManager(mContext);
        layoutManager.setOrientation(RecyclerView.VERTICAL);
        recyclerView.setLayoutManager(layoutManager);
        rvHistoryAdapter = new RecyclerViewHistoryAdapter(mContext,R.layout.item_list_history,arrayListHistory);
        recyclerView.setHasFixedSize(true);
        recyclerView.setAdapter(rvHistoryAdapter);
    }
    private void getHistoryData(){
        if(BuildConfig.USE_MOCK_DATA){
            new Handler().postDelayed(() -> {
                String jsonHistory = GeneralMethod.readFile("jsonHistory.json",mContext);
                HistoryResponse historyResponse = GeneralMethod.transformJsonStringToObject(jsonHistory,HistoryResponse.class);
                if(historyResponse !=null && historyResponse.getHistoryItem()!=null){
                    arrayListHistory.clear();
                    arrayListHistory.addAll(historyResponse.getHistoryItem());
                    rvHistoryAdapter.notifyDataSetChanged();
                    progressDialog.cancel();
                }
            },500);
        }
    }

}
