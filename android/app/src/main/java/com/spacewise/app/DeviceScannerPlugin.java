package com.spacewise.app;

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Environment;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@CapacitorPlugin(name = "DeviceScanner")
public class DeviceScannerPlugin extends Plugin {

    @PluginMethod
    public void scanApps(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        List<PackageInfo> packages = pm.getInstalledPackages(0);
        JSArray appsArray = new JSArray();

        for (PackageInfo packageInfo : packages) {
            ApplicationInfo appInfo = packageInfo.applicationInfo;
            // Filter out system apps if you want, but for now we list all or most
            if ((appInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0) {
                // It's a system app, you might want to skip or include
            }
            
            JSObject appObj = new JSObject();
            appObj.put("id", packageInfo.packageName);
            appObj.put("name", pm.getApplicationLabel(appInfo).toString());
            // In a real app, you'd use StorageStatsManager to get accurate size
            // For now, we use a mock size or basic file size of publicSourceDir
            long size = new File(appInfo.publicSourceDir).length();
            appObj.put("sizeBytes", size);
            appObj.put("installedAt", packageInfo.firstInstallTime);
            appObj.put("lastUsedAt", packageInfo.lastUpdateTime); // Approximate
            appsArray.put(appObj);
        }

        JSObject ret = new JSObject();
        ret.put("apps", appsArray);
        call.resolve(ret);
    }

    @PluginMethod
    public void scanFiles(PluginCall call) {
        File root = Environment.getExternalStorageDirectory();
        JSArray filesArray = new JSArray();
        scanDirectory(root, filesArray);
        
        JSObject ret = new JSObject();
        ret.put("files", filesArray);
        call.resolve(ret);
    }

    private void scanDirectory(File dir, JSArray filesArray) {
        File[] files = dir.listFiles();
        if (files == null) return;

        for (File file : files) {
            if (file.isDirectory()) {
                scanDirectory(file, filesArray);
            } else {
                long size = file.length();
                if (size > 0) { // skip empty files
                    JSObject fileObj = new JSObject();
                    fileObj.put("id", UUID.randomUUID().toString()); // Use path as ID or random
                    fileObj.put("name", file.getName());
                    fileObj.put("path", file.getAbsolutePath());
                    fileObj.put("sizeBytes", size);
                    fileObj.put("lastModified", file.lastModified());
                    fileObj.put("type", getFileType(file.getName()));
                    filesArray.put(fileObj);
                }
            }
        }
    }

    private String getFileType(String name) {
        String lowerName = name.toLowerCase();
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".png") || lowerName.endsWith(".jpeg")) return "image";
        if (lowerName.endsWith(".mp4") || lowerName.endsWith(".mkv") || lowerName.endsWith(".avi")) return "video";
        if (lowerName.endsWith(".mp3") || lowerName.endsWith(".wav")) return "audio";
        if (lowerName.endsWith(".apk")) return "apk";
        if (lowerName.endsWith(".pdf") || lowerName.endsWith(".doc")) return "document";
        return "other";
    }
}
