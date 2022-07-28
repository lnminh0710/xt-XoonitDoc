package com.xoonit.camera.Database;

public class Images {

    private String base64_string;
    private String FileName;
    private int PageNr =1;

    public String getBase64_string() {
        return base64_string;
    }

    public void setBase64_string(String base64_string)
    {
        this.base64_string = base64_string;
    }

    public String getFileName() {
        return FileName;
    }

    public void setFileName(String fileName) {
        FileName = fileName;
    }

    public int getPageNr() {
        return PageNr;
    }

    public void setPageNr(int pageNr) {
        pageNr = pageNr;
    }
}
