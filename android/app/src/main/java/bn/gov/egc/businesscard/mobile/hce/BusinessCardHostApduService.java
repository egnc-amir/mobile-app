package bn.gov.egc.businesscard.mobile.hce;

import android.nfc.NdefMessage;
import android.nfc.NdefRecord;
import android.nfc.cardemulation.HostApduService;
import android.os.Bundle;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import bn.gov.egc.businesscard.mobile.plugins.HceState;

public class BusinessCardHostApduService extends HostApduService {
    private static final byte[] SW_OK = {(byte) 0x90, 0x00};
    private static final byte[] SW_FILE_NOT_FOUND = {(byte) 0x6A, (byte) 0x82};
    private static final byte[] SW_INS_NOT_SUPPORTED = {(byte) 0x6D, 0x00};
    private static final byte[] SW_CONDITIONS_NOT_SATISFIED = {(byte) 0x69, (byte) 0x85};

    private static final byte[] SELECT_NDEF_APP = hex("00A4040007D276000085010100");
    private static final byte[] SELECT_CC_FILE = hex("00A4000C02E103");
    private static final byte[] SELECT_NDEF_FILE = hex("00A4000C02E104");

    private static final byte[] CAPABILITY_CONTAINER = hex("000F20003B00340406E10401000000FF");

    private enum SelectedFile {
        NONE,
        CC,
        NDEF
    }

    private SelectedFile selectedFile = SelectedFile.NONE;

    @Override
    public byte[] processCommandApdu(byte[] commandApdu, Bundle extras) {
        if (commandApdu == null || commandApdu.length < 4) {
            return SW_INS_NOT_SUPPORTED;
        }

        if (!HceState.isEnabled()) {
            return SW_CONDITIONS_NOT_SATISFIED;
        }

        if (matches(commandApdu, SELECT_NDEF_APP)) {
            selectedFile = SelectedFile.NONE;
            return SW_OK;
        }

        if (matches(commandApdu, SELECT_CC_FILE)) {
            selectedFile = SelectedFile.CC;
            return SW_OK;
        }

        if (matches(commandApdu, SELECT_NDEF_FILE)) {
            selectedFile = SelectedFile.NDEF;
            return SW_OK;
        }

        byte ins = commandApdu[1];
        if ((ins & 0xFF) == 0xB0) {
            return handleReadBinary(commandApdu);
        }

        return SW_INS_NOT_SUPPORTED;
    }

    private byte[] handleReadBinary(byte[] apdu) {
        if (selectedFile == SelectedFile.NONE) {
            return SW_FILE_NOT_FOUND;
        }

        int offset = ((apdu[2] & 0xFF) << 8) | (apdu[3] & 0xFF);
        int length = apdu.length >= 5 ? (apdu[4] & 0xFF) : 0;

        byte[] source;
        if (selectedFile == SelectedFile.CC) {
            source = CAPABILITY_CONTAINER;
        } else {
            source = getNdefFileContent();
        }

        if (offset > source.length) {
            return SW_FILE_NOT_FOUND;
        }

        int end = Math.min(source.length, offset + length);
        if (length == 0) {
            end = source.length;
        }

        byte[] chunk = Arrays.copyOfRange(source, offset, end);
        return concat(chunk, SW_OK);
    }

    private byte[] getNdefFileContent() {
        String payload = HceState.getPayload();
        if (payload == null || payload.isEmpty()) {
            payload = "https://preprod-katalyst.egc.gov.bn/business-card";
        }

        NdefRecord uriRecord = NdefRecord.createUri(payload);
        NdefMessage message = new NdefMessage(new NdefRecord[]{uriRecord});
        byte[] ndef = message.toByteArray();

        int nlen = ndef.length;
        byte[] file = new byte[nlen + 2];
        file[0] = (byte) ((nlen >> 8) & 0xFF);
        file[1] = (byte) (nlen & 0xFF);
        System.arraycopy(ndef, 0, file, 2, nlen);

        return file;
    }

    @Override
    public void onDeactivated(int reason) {
        selectedFile = SelectedFile.NONE;
    }

    private static boolean matches(byte[] value, byte[] expected) {
        return Arrays.equals(value, expected);
    }

    private static byte[] concat(byte[] a, byte[] b) {
        byte[] out = new byte[a.length + b.length];
        System.arraycopy(a, 0, out, 0, a.length);
        System.arraycopy(b, 0, out, a.length, b.length);
        return out;
    }

    private static byte[] hex(String s) {
        int len = s.length();
        byte[] out = new byte[len / 2];

        for (int i = 0; i < len; i += 2) {
            out[i / 2] = (byte) Integer.parseInt(s.substring(i, i + 2), 16);
        }

        return out;
    }
}
