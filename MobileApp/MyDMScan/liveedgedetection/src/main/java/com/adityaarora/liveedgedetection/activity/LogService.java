package com.adityaarora.liveedgedetection.activity;

import android.annotation.TargetApi;
import android.app.Service;
import android.content.Intent;
import android.graphics.Bitmap;
import android.os.Binder;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.util.Log;

import com.adityaarora.liveedgedetection.util.AsyncTaskRunner;

import java.util.Date;

public class LogService extends Service {

    //region Variables
    Handler handler = new Handler();
    // Binder given to clients
    private final IBinder binder = new LocalBinder();
    //end region

    //region internal class
    public class LocalBinder extends Binder {
        LogService getService() {
            // Return this instance of LocalService so clients can call public methods
            return LogService.this;
        }
    }
    //endregion

    //region events
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                Log.d("LogService", "run: " + new Date().toString());
                handler.postDelayed(this, 1000);
                AsyncTaskRunner runner = new AsyncTaskRunner(LogService.this);
                runner.execute();
            }
        }, 300000);
        return binder;
    }
    //endregion
}

