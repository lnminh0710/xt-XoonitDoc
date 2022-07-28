package com.xoonit.camera.fragments.Base;

import android.content.Intent;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;

import com.xoonit.camera.Activities.Base.BaseActivity;

import org.androidannotations.annotations.AfterViews;
import org.androidannotations.annotations.EFragment;

@EFragment
public abstract class BaseFragment extends Fragment {

    @AfterViews
    protected abstract void afterViews();

    /**
     * Add new child fragment on page
     *
     * @param fragment       new child fragment
     * @param addToBackStack true or false
     */
    protected void replaceFragment(@NonNull Fragment fragment, boolean addToBackStack, boolean isAnimation) {
        if (getParentFragment() instanceof BaseContainerFragment) {
            ((BaseContainerFragment) getParentFragment()).replaceFragment(fragment, addToBackStack, isAnimation);
        }
    }

    protected void addFragment(@NonNull Fragment fragment, boolean addToBackStack, boolean isAnimation) {
        if (getParentFragment() instanceof BaseContainerFragment) {
            ((BaseContainerFragment) getParentFragment()).addFragment(fragment, addToBackStack, isAnimation);
        }
    }

    protected void addFragmentFromViewPager(@NonNull Fragment fragment, boolean addToBackStack, boolean isAnimation) {
        if (getParentFragment() != null && getParentFragment().getParentFragment() instanceof BaseContainerFragment) {
            ((BaseContainerFragment) getParentFragment().getParentFragment()).addFragment(fragment, addToBackStack, isAnimation);
        }
    }

    protected void replaceFragmentFromViewPager(@NonNull Fragment fragment, boolean addToBackStack, boolean isAnimation) {
        if (getParentFragment() != null && getParentFragment().getParentFragment() instanceof BaseContainerFragment) {
            ((BaseContainerFragment) getParentFragment().getParentFragment()).replaceFragment(fragment, addToBackStack, isAnimation);
        }
    }

    public void startActivityWithPushAnimation(Intent intent) {
        if (getActivity() instanceof BaseActivity) {
            ((BaseActivity) getActivity()).startActivityWithPushAnimation(intent);
        }
    }

    /**
     * @param message is message.
     */
    public void showErrorToast(String message) {
        if (getActivity() instanceof BaseActivity) {
            ((BaseActivity) getActivity()).showErrorToast(message);
        }
    }

    public void replaceFragmentWithPushAnimation(@NonNull Fragment fragment, int containerViewId, boolean addToBackStack) {
        if (getActivity() instanceof BaseActivity) {
            ((BaseActivity) getActivity()).replaceFragmentWithPushAnimation(fragment, containerViewId, addToBackStack);
        }
    }

    public void showDialog(String title, String message, int gravity, String leftButton, View.OnClickListener leftListener, String rightButton, View.OnClickListener rightListener) {
        if (getActivity() instanceof BaseActivity) {
            ((BaseActivity) getActivity()).showDialog(title, message, gravity, leftButton, leftListener, rightButton, rightListener);
        }
    }

    public void showAlert(String title, String message, String button, View.OnClickListener listener) {
        if (getActivity() instanceof BaseActivity) {
            ((BaseActivity) getActivity()).showAlert(title, 0, message, button, null, null, 0, listener, null, null);
        }
    }

    /**
     * Check show/hide keyboard
     */
    public void setKeyboardShown(boolean isShowKeyboard, int keyboardHeight) {
        //no-up
    }

    public boolean canPopBack() {
        return true;
    }
}
