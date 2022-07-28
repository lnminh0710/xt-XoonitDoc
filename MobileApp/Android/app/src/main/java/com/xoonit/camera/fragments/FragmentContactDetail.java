package com.xoonit.camera.fragments;

import android.app.ProgressDialog;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.xoonit.camera.BuildConfig;
import com.xoonit.camera.Dialog.ReviewCaptureDialog;
import com.xoonit.camera.Model.ContactItem;
import com.xoonit.camera.Model.DocumentByFolderResponse;
import com.xoonit.camera.Model.DocumentByFolderResult;
import com.xoonit.camera.Model.DocumentDetailData;
import com.xoonit.camera.Model.DocumentDetailResponse;
import com.xoonit.camera.R;
import com.xoonit.camera.fragments.Adapter.ListContactAttachmentAdapter;
import com.xoonit.camera.fragments.Base.BaseFragment;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;
import com.xoonit.camera.utils.GeneralMethod;
import com.xoonit.camera.utils.Logger;

import org.androidannotations.annotations.EFragment;
import org.androidannotations.annotations.FragmentArg;
import org.androidannotations.annotations.ViewById;

import java.util.ArrayList;

@EFragment(R.layout.fragment_contact_detail)
public class FragmentContactDetail extends BaseFragment {
    @ViewById(R.id.tvPath)
    TextView tvPath;
    @ViewById(R.id.imgCompanyThumbnail)
    ImageView imgCompanyThumbnail;
    @ViewById(R.id.tvCompanyNameTitle)
    TextView tvCompanyNameTitle;
    @ViewById(R.id.tvCompanyWebSite)
    TextView tvCompanyWebSite;
    @ViewById(R.id.edtCompanyName)
    EditText edtCompanyName;
    @ViewById(R.id.edtFirstName)
    EditText edtFirstName;
    @ViewById(R.id.edtLastName)
    EditText edtLastName;
    @ViewById(R.id.edtAddress)
    EditText edtAddress;
    @ViewById(R.id.edtAddress1)
    EditText edtAddress1;
    @ViewById(R.id.edtAddress2)
    EditText edtAddress2;
    @ViewById(R.id.edtAddress3)
    EditText edtAddress3;
    @ViewById(R.id.edtPhone)
    EditText edtPhone;
    @ViewById(R.id.edtEmail)
    EditText edtEmail;
    @ViewById(R.id.edtInternet)
    EditText tvInternet;
    @ViewById(R.id.rvContactAttachmentList)
    RecyclerView rvContactAttachmentList;

    @FragmentArg
    ContactItem contactItem;

    private Context mContext;
    private ListContactAttachmentAdapter listContactAttachmentAdapter;
    private ProgressDialog progressDialog;
    private ArrayList<DocumentByFolderResult> listAttachment;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        mContext = container.getContext();
        listAttachment = new ArrayList<>();
        return null;
    }

    @Override
    protected void afterViews() {
        FireBaseManagement.logFireBaseEvent(mContext, ConstantFireBaseTracking.CONTACT_DETAIL_FRAGMENT);
        initializeAllView();
        getContact();
    }

    private void initializeAllView() {
        progressDialog = new ProgressDialog(mContext);
        progressDialog.setMessage("Loading...");
        progressDialog.setCancelable(false);
        initializeAdapter();
    }

    private void initializeAdapter() {
        final LinearLayoutManager layoutManager = new LinearLayoutManager(mContext);
        layoutManager.setOrientation(RecyclerView.VERTICAL);
        rvContactAttachmentList.setLayoutManager(layoutManager);
        listContactAttachmentAdapter = new ListContactAttachmentAdapter(mContext, listAttachment);
        listContactAttachmentAdapter.setClickListener(position -> {
            Logger.Debug("On contact attachment item clicked");
        });
        rvContactAttachmentList.setHasFixedSize(true);
        listContactAttachmentAdapter.setClickListener(position -> reviewDocument(listAttachment.get(position)));
        rvContactAttachmentList.setAdapter(listContactAttachmentAdapter);
    }


    private void getContact() {
        progressDialog.show();
        if (BuildConfig.USE_MOCK_DATA) {

            //TODO get contact by ID
            setupViewWithContact(contactItem);
            getAttachment();
        }
    }

    private void setupViewWithContact(ContactItem contactItem) {
        GeneralMethod.setTextViewText(tvCompanyNameTitle, contactItem.getCompanyName());
        GeneralMethod.setTextViewText(tvCompanyWebSite, contactItem.getCompanyWebSite());
        GeneralMethod.setTextViewText(tvPath, contactItem.getPath());

        GeneralMethod.setEditTextText(edtAddress, contactItem.getAddress());
        GeneralMethod.setEditTextText(edtAddress1, null);
        GeneralMethod.setEditTextText(edtAddress2, null);
        GeneralMethod.setEditTextText(edtAddress3, null);
        GeneralMethod.setEditTextText(edtCompanyName, contactItem.getCompanyName());
        GeneralMethod.setEditTextText(edtEmail, contactItem.getEmail());
        GeneralMethod.setEditTextText(edtFirstName, contactItem.getFirstName());
        GeneralMethod.setEditTextText(edtLastName, contactItem.getLastName());
        GeneralMethod.setEditTextText(edtPhone, contactItem.getPath());
    }

    private void getAttachment() {
        if (BuildConfig.USE_MOCK_DATA) {
            new Handler().postDelayed(new Runnable() {
                @Override
                public void run() {
                    String documentByFolderJson = GeneralMethod.readFile("JsonListDocumentHome.json", mContext);
                    DocumentByFolderResponse documentByFolderResponse = GeneralMethod.transformJsonStringToObject(documentByFolderJson, DocumentByFolderResponse.class);
                    if (documentByFolderResponse != null
                            && documentByFolderResponse.getItem() != null
                            && documentByFolderResponse.getItem().getResults() != null
                            && documentByFolderResponse.getItem().getResults().size() > 0) {
                        ArrayList<DocumentByFolderResult> documentByFolderResultList = documentByFolderResponse.getItem().getResults();

                        listAttachment.clear();
                        listAttachment.addAll(documentByFolderResultList);
                        listContactAttachmentAdapter.notifyDataSetChanged();
                    }

                    progressDialog.dismiss();
                }
            }, 1000);
        }
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

}
