package com.xoonit.camera.utils;

import com.xoonit.camera.Database.DocumentTreeItem;
import com.xoonit.camera.XoonitApplication;

public class StringUtils {

    public static String GetDocumentTypeById(int Id) {
        for (DocumentTreeItem documentTree : XoonitApplication.getInstance().getDocumentTreeItemList()) {
            if (documentTree.getData().getIDDocumentTree() == Id) {
                return documentTree.getData().getGroupName();
            }
        }
        return "Unknown";
    }
//
//    public static String GetDocumentCodeById(int Id){
//        switch (Id) {
//            case 10:
//                return "_KRE";
//            case 20:
//                return "_DEB";
//            case 30:
//                return "_BAB";
//            case 40:
//                return "_ST";
//            case 50:
//                return "_SPE";
//            case 60:
//                return "_DIV";
//        }
//        return "";
//    }


}
