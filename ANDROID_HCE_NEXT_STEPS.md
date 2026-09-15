# Android HCE Next Steps

This app now calls a Capacitor plugin named `HceBridge` from Vue.

## 1) Ensure Android project exists

Run from project root:

```bash
npx cap add android
```

## 2) Create native Capacitor plugin class

Create file:

- `android/app/src/main/java/bn/gov/egc/businesscard/mobile/plugins/HceBridgePlugin.java`

Example:

```java
package bn.gov.egc.businesscard.mobile.plugins;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.PluginMethod;

@CapacitorPlugin(name = "HceBridge")
public class HceBridgePlugin extends Plugin {

    @PluginMethod
    public void setCardPayload(PluginCall call) {
        String url = call.getString("url", "");
        HceState.setPayload(url);
        JSObject ret = new JSObject();
        ret.put("ok", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void enableHce(PluginCall call) {
        HceState.setEnabled(true);
        JSObject ret = new JSObject();
        ret.put("ok", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void disableHce(PluginCall call) {
        HceState.setEnabled(false);
        JSObject ret = new JSObject();
        ret.put("ok", true);
        call.resolve(ret);
    }
}
```

## 3) Add shared HCE state helper

Create file:

- `android/app/src/main/java/bn/gov/egc/businesscard/mobile/plugins/HceState.java`

Example:

```java
package bn.gov.egc.businesscard.mobile.plugins;

public class HceState {
    private static boolean enabled = false;
    private static String payload = "";

    public static synchronized void setEnabled(boolean value) {
        enabled = value;
    }

    public static synchronized boolean isEnabled() {
        return enabled;
    }

    public static synchronized void setPayload(String value) {
        payload = value == null ? "" : value;
    }

    public static synchronized String getPayload() {
        return payload;
    }
}
```

## 4) Add HostApduService

Create file:

- `android/app/src/main/java/bn/gov/egc/businesscard/mobile/hce/BusinessCardHostApduService.java`

Example:

```java
package bn.gov.egc.businesscard.mobile.hce;

import android.nfc.cardemulation.HostApduService;
import android.os.Bundle;
import java.nio.charset.StandardCharsets;
import bn.gov.egc.businesscard.mobile.plugins.HceState;

public class BusinessCardHostApduService extends HostApduService {
    private static final byte[] SW_OK = {(byte) 0x90, 0x00};
    private static final byte[] SW_CONDITIONS_NOT_SATISFIED = {(byte) 0x69, (byte) 0x85};

    @Override
    public byte[] processCommandApdu(byte[] commandApdu, Bundle extras) {
        if (!HceState.isEnabled()) {
            return SW_CONDITIONS_NOT_SATISFIED;
        }

        String payload = HceState.getPayload();
        byte[] data = payload.getBytes(StandardCharsets.UTF_8);
        byte[] response = new byte[data.length + SW_OK.length];

        System.arraycopy(data, 0, response, 0, data.length);
        System.arraycopy(SW_OK, 0, response, data.length, SW_OK.length);
        return response;
    }

    @Override
    public void onDeactivated(int reason) {
    }
}
```

## 5) Add HCE entries to AndroidManifest.xml

In `android/app/src/main/AndroidManifest.xml` add:

```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc.hce" android:required="true" />
```

Inside `<application>` add:

```xml
<service
    android:name=".hce.BusinessCardHostApduService"
    android:exported="true"
    android:permission="android.permission.BIND_NFC_SERVICE">
    <intent-filter>
        <action android:name="android.nfc.cardemulation.action.HOST_APDU_SERVICE" />
    </intent-filter>

    <meta-data
        android:name="android.nfc.cardemulation.host_apdu_service"
        android:resource="@xml/apduservice" />
</service>
```

## 6) Create AID config

Create file:

- `android/app/src/main/res/xml/apduservice.xml`

Example:

```xml
<?xml version="1.0" encoding="utf-8"?>
<host-apdu-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/app_name"
    android:requireDeviceUnlock="false">
    <aid-group
        android:category="other"
        android:description="Business Card AID Group">
        <aid-filter android:name="F0010203040506" />
    </aid-group>
</host-apdu-service>
```

## 7) Build/sync

```bash
npm run build
npx cap sync android
npx cap open android
```

Then run on an Android device with NFC and test APDU reads.
