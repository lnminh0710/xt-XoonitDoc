package com.xoonit.camera.fragments.Base;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

import com.xoonit.camera.R;

import org.androidannotations.annotations.AfterViews;
import org.androidannotations.annotations.EFragment;

@EFragment
public abstract class BaseContainerFragment extends Fragment {

    @AfterViews
    protected abstract void afterViews();

    /**
     * Add new child fragment on page
     *
     * @param fragment       new child fragment
     * @param addToBackStack true or false
     */
    public void replaceFragment(@NonNull Fragment fragment, boolean addToBackStack, boolean isAnimation) {
        FragmentTransaction transaction = getChildFragmentManager()
                .beginTransaction();
        if (addToBackStack) {
            transaction.addToBackStack(fragment.getClass().getName());
        }
        if (isAnimation) {
            transaction.setCustomAnimations(R.anim.slide_in_from_right, R.anim.slide_out_to_left, R.anim.slide_in_from_left, R.anim.slide_out_to_right);
        }
        transaction.replace(R.id.flContainer, fragment, fragment.getClass().getName());
        transaction.commit();
        getChildFragmentManager().executePendingTransactions();
    }

    public void addFragment(@NonNull Fragment fragment, boolean addToBackStack, boolean isAnimation) {
        FragmentTransaction transaction = getChildFragmentManager()
                .beginTransaction();
        if (addToBackStack) {
            transaction.addToBackStack(fragment.getClass().getName());
        }
        if (isAnimation) {
            transaction.setCustomAnimations(R.anim.slide_in_from_right, R.anim.slide_out_to_left, R.anim.slide_in_from_left, R.anim.slide_out_to_right);
        }
        transaction.add(R.id.flContainer, fragment, fragment.getClass().getName());
        transaction.commit();
        getChildFragmentManager().executePendingTransactions();
    }

    /**
     * @return true if popFragment - false if backStackEntry is empty
     */
    public boolean popFragment() {
        if (getChildFragmentManager().getBackStackEntryCount() > 1 && ((BaseFragment) getCurrentFragment()).canPopBack()) {
            getChildFragmentManager().popBackStack();
            return true;
        }
        return false;
    }

    /**
     * Find current Fragment, that can be null
     */
    public Fragment getCurrentFragment() {
        return getChildFragmentManager().findFragmentById(R.id.flContainer);
    }

    /**
     * This function is used to pop all fragment
     */
    public void popAllFragment() {
        if (getChildFragmentManager().getBackStackEntryCount() > 1) {
            getChildFragmentManager().popBackStack(getChildFragmentManager().getBackStackEntryAt(1).getName(), FragmentManager.POP_BACK_STACK_INCLUSIVE);
        }
    }
}
