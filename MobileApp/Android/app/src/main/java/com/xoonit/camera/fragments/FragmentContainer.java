package com.xoonit.camera.fragments;

import com.xoonit.camera.R;
import com.xoonit.camera.fragments.Base.BaseContainerFragment;

import org.androidannotations.annotations.EFragment;

@EFragment(R.layout.fragment_container)
public class FragmentContainer extends BaseContainerFragment {


    @Override
    protected void afterViews() {
        replaceFragment(FragmentHome_.builder().build(), true, false);
    }
}
