package bn.gov.egc.businesscard.mobile;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import bn.gov.egc.businesscard.mobile.plugins.HceBridgePlugin;

public class MainActivity extends BridgeActivity {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		registerPlugin(HceBridgePlugin.class);
		super.onCreate(savedInstanceState);
	}
}
