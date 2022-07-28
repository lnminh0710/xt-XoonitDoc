package com.xoonit.camera.utils;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.graphics.Color;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.xoonit.camera.R;


public class CustomToastUpload extends Toast {

    /**
     * Construct an empty Toast object.  You must call {@link #setView} before you
     * can call {@link #show}.
     *
     * @param context The context to use.  Usually your {@link Application}
     *                or {@link Activity} object.
     */

    public CustomToastUpload(Context context) {
        super(context);
    }

    public static Toast makeText(Context context, String Message, int duration){

        Toast toast = new Toast(context);
        toast.setDuration(duration);
        View layout = LayoutInflater.from(context).inflate(R.layout.custom_toast_upload_notification,null,false);
        TextView txtview1 = layout.findViewById(R.id.textView_message_notification);
        txtview1.setText(Message);
        toast.setGravity(Gravity.TOP|Gravity.CENTER,0,300);
        toast.setView(layout);
        return toast;

    }
    public static Toast makeErrorText(Context context, String Message, int duration) {
        Toast toast = new Toast(context);
        toast.setDuration(duration);
        View layout = LayoutInflater.from(context).inflate(R.layout.custom_toast_upload_fail, null, false);
        TextView txtview1 = layout.findViewById(R.id.textView_message_notification_fail);
        LinearLayout lnContainer = layout.findViewById(R.id.lnContainer);
        lnContainer.setBackgroundColor(Color.parseColor("#ff2600"));
        txtview1.setText(Message);
        toast.setGravity(Gravity.TOP | Gravity.CENTER, 0, 300);
        toast.setView(layout);
        return toast;
    }
}
