package com.adityaarora.liveedgedetection.util;

import android.content.Context;

import com.adityaarora.liveedgedetection.R;
import com.adityaarora.liveedgedetection.constants.ScanConstants;

public class StringUtils {

    public static String GetDocumentTypeById(Context context, int Id){
        switch (Id) {
            case 1:
                return context.getString(R.string.type_creditor);
            case 2:
                return context.getString(R.string.type_receivable_accounts);
            case 3:
                return context.getString(R.string.type_bank_siege);
            case 4:
                return context.getString(R.string.type_taxes);
            case 5:
                return context.getString(R.string.type_expense_receipts);
            case 6:
                return context.getString(R.string.type_various);
        }
        return context.getString(R.string.type_creditor);
    }

    public static String GetDocumentCodeById(int Id){
        switch (Id) {
            case 1:
                return "KRE";
            case 2:
                return "DEB";
            case 3:
                return "BAB";
            case 4:
                return "ST";
            case 5:
                return "SPE";
            case 6:
                return "DIV";
        }
        return "KRE";
    }

}
