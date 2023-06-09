package com.leva;

import android.content.Intent;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class MailBoxModule extends ReactContextBaseJavaModule {
    private static final String REACT_MODULE = "MailBoxModule";

    MailBoxModule(ReactApplicationContext context) {
        super(context);
    }
    @ReactMethod
    public void launchMailApp() {
        Intent intent = new Intent(Intent.ACTION_MAIN);
        intent.addCategory(Intent.CATEGORY_APP_EMAIL);
        getCurrentActivity().startActivity(intent);
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_MODULE;
    }

}
