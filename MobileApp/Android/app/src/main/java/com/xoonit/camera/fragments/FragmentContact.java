package com.xoonit.camera.fragments;

import android.app.ProgressDialog;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.xoonit.camera.BuildConfig;
import com.xoonit.camera.Model.ContactItem;
import com.xoonit.camera.Model.ContactResponse;
import com.xoonit.camera.R;
import com.xoonit.camera.fragments.Adapter.ListContactAdapter;
import com.xoonit.camera.fragments.Base.BaseFragment;
import com.xoonit.camera.utils.FireBase.ConstantFireBaseTracking;
import com.xoonit.camera.utils.FireBase.FireBaseManagement;
import com.xoonit.camera.utils.GeneralMethod;
import com.xoonit.camera.utils.Logger;

import org.androidannotations.annotations.EFragment;
import org.androidannotations.annotations.ViewById;

import java.util.ArrayList;

@EFragment(R.layout.fragment_contact)
public class FragmentContact extends BaseFragment {
    @ViewById(R.id.tvDocumentCount)
    TextView tvDocumentCount;
    @ViewById(R.id.pager_number)
    TextView pagerNumber;
    @ViewById(R.id.btnPrevious)
    ImageButton btnPrevious;
    @ViewById(R.id.btnNext)
    ImageButton btnNext;
    @ViewById(R.id.tvPageOf)
    TextView tvPageOf;
    @ViewById(R.id.rvContactList)
    RecyclerView rvContactList;


    private Context mContext;
    private ListContactAdapter listContactAdapter;
    private ProgressDialog progressDialog;
    private ArrayList<ContactItem> contactItemArrayList = new ArrayList<>();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        mContext = container.getContext();
        FireBaseManagement.logFireBaseEvent(mContext, ConstantFireBaseTracking.CONTACT_FRAGMENT);
        return null;
    }

    @Override
    protected void afterViews() {
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
        rvContactList.setLayoutManager(layoutManager);
        listContactAdapter = new ListContactAdapter(mContext, contactItemArrayList);
        listContactAdapter.setClickListener(position -> {
            Logger.Debug("On contact item clicked");
            addFragment(FragmentContactDetail_.builder().contactItem(contactItemArrayList.get(position)).build(),
                    true, true);
        });
        rvContactList.setHasFixedSize(true);
        rvContactList.setAdapter(listContactAdapter);
    }


    private void getContact() {
        progressDialog.show();
        if (BuildConfig.USE_MOCK_DATA) {
            new Handler().postDelayed(() -> {
                String contactJson = GeneralMethod.readFile("JsonListContact.json", mContext);
                ContactResponse contactResponse = GeneralMethod.transformJsonStringToObject(contactJson, ContactResponse.class);
                if (contactResponse != null
                        && contactResponse.getContactItem().size() > 0
                ) {
                    contactItemArrayList.clear();
                    contactItemArrayList.addAll(contactResponse.getContactItem());
                    listContactAdapter.notifyDataSetChanged();
                    tvDocumentCount.setText(String.valueOf(contactItemArrayList.size()));
                    progressDialog.cancel();
                }
                progressDialog.dismiss();
            }, 1000);
        }
    }

}
