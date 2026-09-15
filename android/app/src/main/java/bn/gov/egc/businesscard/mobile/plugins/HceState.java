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
        payload = value == null ? "" : value.trim();
    }

    public static synchronized String getPayload() {
        return payload;
    }
}
