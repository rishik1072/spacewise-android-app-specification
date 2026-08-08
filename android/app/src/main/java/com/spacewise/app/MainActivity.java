package com.spacewise.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(DeviceScannerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
