package com.xoonit.camera.fragments;

import android.app.ProgressDialog;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.GridView;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.xoonit.camera.BuildConfig;
import com.xoonit.camera.Dialog.ReviewCaptureDialog;
import com.xoonit.camera.Model.DocumentByFolderResponse;
import com.xoonit.camera.Model.DocumentByFolderResult;
import com.xoonit.camera.Model.DocumentDetailData;
import com.xoonit.camera.Model.DocumentDetailResponse;
import com.xoonit.camera.R;
import com.xoonit.camera.fragments.Adapter.GridDocumentHomeAdapter;
import com.xoonit.camera.fragments.Adapter.ListDocumentHomeAdapter;
import com.xoonit.camera.fragments.Base.BaseFragment;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;
import com.xoonit.camera.utils.GeneralMethod;

import org.androidannotations.annotations.Click;
import org.androidannotations.annotations.EFragment;
import org.androidannotations.annotations.FragmentArg;
import org.androidannotations.annotations.ViewById;

import java.util.ArrayList;

@EFragment(R.layout.fragment_home)
public class FragmentHome extends BaseFragment {
    @ViewById(R.id.rvDocumentList)
    RecyclerView rvDocumentList;
    @ViewById(R.id.gridDocumentHome)
    GridView gridDocumentHome;
    @ViewById(R.id.imgBtnViewByList)
    ImageButton imgBtnViewByList;
    @ViewById(R.id.imgBtnViewByGrid)
    ImageButton imgBtnViewByGrid;
    @ViewById(R.id.tvDocumentCount)
    TextView tvDocumentCount;


    private Context mContext;
    private ListDocumentHomeAdapter listDocumentHomeAdapter;
    private GridDocumentHomeAdapter gridDocumentHomeAdapter;
    private ProgressDialog progressDialog;
    private ArrayList<DocumentByFolderResult> documentByFolderResultArrayList = new ArrayList<>();

    @FragmentArg
    int idDocumentTree;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        mContext = container.getContext();
        return null;
    }

    @Override
    protected void afterViews() {
        FireBaseManagement.logFireBaseEvent(mContext, ConstantFireBaseTracking.HOME_FRAGMENT);
        initializeAllView();
        getDocument();
    }

    private void initializeAllView() {
        progressDialog = new ProgressDialog(mContext);
        progressDialog.setMessage("Loading...");
        progressDialog.setCancelable(false);
        initializeListViewDocument(documentByFolderResultArrayList);
        initializeGridViewDocument(documentByFolderResultArrayList);
    }

    private void initializeListViewDocument(ArrayList<DocumentByFolderResult> documentList) {
        final LinearLayoutManager layoutManager = new LinearLayoutManager(mContext);
        layoutManager.setOrientation(RecyclerView.VERTICAL);
        rvDocumentList.setLayoutManager(layoutManager);
        listDocumentHomeAdapter = new ListDocumentHomeAdapter(mContext, documentList);
        listDocumentHomeAdapter.setClickListener(position -> reviewDocument(documentList.get(position)));
        rvDocumentList.setHasFixedSize(true);
        rvDocumentList.setAdapter(listDocumentHomeAdapter);
    }

    private void initializeGridViewDocument(ArrayList<DocumentByFolderResult> documentList) {
        gridDocumentHomeAdapter = new GridDocumentHomeAdapter(mContext, R.layout.item_grid_document_home, documentList);
        gridDocumentHomeAdapter.setClickListener(position -> reviewDocument(documentList.get(position)));
        gridDocumentHome.setAdapter(gridDocumentHomeAdapter);
    }

    private void reviewDocument(DocumentByFolderResult documentByFolderResult) {
        progressDialog.show();
        if (BuildConfig.USE_MOCK_DATA) {
            new Handler().postDelayed(() -> {
                String documentDetailDataJson = GeneralMethod.readFile("DocumentDetail.json", mContext);
                DocumentDetailResponse documentDetailResponse = GeneralMethod.transformJsonStringToObject(documentDetailDataJson, DocumentDetailResponse.class);
                if (documentDetailResponse != null
                        && documentDetailResponse.getItem() != null
                        && documentDetailResponse.getItem().getData() != null
                        && documentDetailResponse.getItem().getData().size() > 0) {
                    ArrayList<DocumentDetailData> documentDetailDataArrayList = documentDetailResponse.getItem().getData();
                    ArrayList<String> imageUrlList = new ArrayList<>();
                    for (DocumentDetailData doc : documentDetailDataArrayList) {
                        String documentURL = GeneralMethod.MockGetDocumentUrl(doc.getScannedPath(), doc.getFileName());
                        imageUrlList.add(documentURL);
                    }
                    new ReviewCaptureDialog(mContext, imageUrlList, documentByFolderResult.getCloudMediaPath()).show();
                }
                progressDialog.dismiss();
            }, 1000);
        }
        //TODO get document detail
    }

    private void getDocument() {
        progressDialog.show();
        if (idDocumentTree == 0) //Get root folder
        {
            if (BuildConfig.USE_MOCK_DATA) {
                new Handler().postDelayed(() -> {
                    String documentByFolderJson = GeneralMethod.readFile("JsonListDocumentHome.json", mContext);
                    DocumentByFolderResponse documentByFolderResponse = GeneralMethod.transformJsonStringToObject(documentByFolderJson, DocumentByFolderResponse.class);
                    handleGetDocumentByFolderResponse(documentByFolderResponse);
                    progressDialog.dismiss();
                }, 1000);
            }
        } else {
            //Get folder by id document tree
            if (BuildConfig.USE_MOCK_DATA) {
                new Handler().postDelayed(() -> {
                    String documentByFolderJson = GeneralMethod.readFile("DocumentByFolder.json", mContext);
                    DocumentByFolderResponse documentByFolderResponse = GeneralMethod.transformJsonStringToObject(documentByFolderJson, DocumentByFolderResponse.class);
                    handleGetDocumentByFolderResponse(documentByFolderResponse);
                    progressDialog.dismiss();
                }, 1000);
            }
        }
    }

    private void handleGetDocumentByFolderResponse(DocumentByFolderResponse documentByFolderResponse) {
        if (documentByFolderResponse != null
                && documentByFolderResponse.getItem() != null
                && documentByFolderResponse.getItem().getResults() != null
                && documentByFolderResponse.getItem().getResults().size() > 0) {
            ArrayList<DocumentByFolderResult> documentByFolderResultList = documentByFolderResponse.getItem().getResults();
            documentByFolderResultArrayList.clear();
            documentByFolderResultArrayList.addAll(documentByFolderResultList);
            gridDocumentHomeAdapter.notifyDataSetChanged();
            listDocumentHomeAdapter.notifyDataSetChanged();
            tvDocumentCount.setText(String.valueOf(documentByFolderResultList.size()));
        }
    }

    @Click(R.id.imgBtnViewByList)
    void onViewByListButtonClick() {
        gridDocumentHome.setVisibility(View.GONE);
        rvDocumentList.setVisibility(View.VISIBLE);
    }

    @Click(R.id.imgBtnViewByGrid)
    void onViewByGridButtonClick() {
        gridDocumentHome.setVisibility(View.VISIBLE);
        rvDocumentList.setVisibility(View.GONE);
    }

}
