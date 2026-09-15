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
