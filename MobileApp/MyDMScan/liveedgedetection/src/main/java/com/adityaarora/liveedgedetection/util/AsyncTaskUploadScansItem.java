package com.adityaarora.liveedgedetection.util;

import android.content.Context;
import android.os.AsyncTask;
import android.util.JsonReader;
import android.util.Log;

import com.adityaarora.liveedgedetection.Database.DatabaseHelper;
import com.adityaarora.liveedgedetection.Database.ScansContainerItem;
import com.adityaarora.liveedgedetection.Database.ScansImages;
import com.adityaarora.liveedgedetection.constants.ScanConstants;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.StringReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.util.List;

public class AsyncTaskUploadScansItem extends AsyncTask<String, String, String> {

    //region Variables
    private DatabaseHelper databaseHelper;
    Gson gson;
    JsonParser parser;
    Context context;
    private String token = "";
    private ScansContainerItem scansContainerItem;
    private boolean IsUserClicked = false;
    //endregion

    //region Constructors
    public AsyncTaskUploadScansItem(Context context) {
        this.context = context;
    }

    public AsyncTaskUploadScansItem(Context context, ScansContainerItem scansContainerItemParam, String tokenAuthen, boolean isUserClicked) {
        this.context = context;
        this.scansContainerItem = scansContainerItemParam;
        this.token = tokenAuthen;
        IsUserClicked = isUserClicked;
    }
    //endregion

    @Override
    protected void onPreExecute() {
        databaseHelper = new DatabaseHelper(this.context);
        gson = new Gson();
//        gson.setLei
        parser = new JsonParser();
    }

    @Override
    protected String doInBackground(String... strings) {
        int idScansContainerItem = postDocumentToServer(scansContainerItem);
        // Update into database
        if (idScansContainerItem > 0) {
            if(IsUserClicked){
                databaseHelper.updateScansContainerItem(scansContainerItem.getLotItemId(), scansContainerItem.getIdScansContainer(), true, scansContainerItem.getNotes(), idScansContainerItem, scansContainerItem.getNumberOfImages(), IsUserClicked);
            }else{
                databaseHelper.updateScansContainerItem(scansContainerItem.getLotItemId(), scansContainerItem.getIdScansContainer(), true, scansContainerItem.getNotes(), idScansContainerItem, scansContainerItem.getNumberOfImages());
            }
        }
        return "";
    }
    private int postDocumentToServer(ScansContainerItem scansContainerItem) {

        /*
         * Post Image To API
         * */
        try {
            String boundary = Long.toHexString(System.currentTimeMillis()) + "";
            String CRLF = "\r\n";
            String charset = "UTF-8";

            URL urlPostImage = new URL(ScanConstants.PrefixHostDocumentProcessing + "ConvertImage/UploadImages");

            HttpURLConnection urlConnectionPostImage = (HttpURLConnection) urlPostImage.openConnection();
            urlConnectionPostImage.setDoInput(true);
            urlConnectionPostImage.setDoOutput(true);
            urlConnectionPostImage.setRequestMethod("POST");

            urlConnectionPostImage.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
            urlConnectionPostImage.addRequestProperty("Authorization", "Bearer " + token);
            if(scansContainerItem.getIdRepScansDocumentType()==0){
                    scansContainerItem.setIdRepScansDocumentType(1);
                }

            String dataPostImage = gson.toJson(scansContainerItem);

            String formdataTemplate = CRLF + "--" + boundary + CRLF + "Content-Disposition: form-data; name=\"OrderScanning\";\r\n\r\n" + dataPostImage + "";

            OutputStream output = urlConnectionPostImage.getOutputStream();

            PrintWriter writer = new PrintWriter(new OutputStreamWriter(output, charset), true);

            writer.append(formdataTemplate).append(CRLF);

            //Add IsKeepFileName
//            String isKeepFilename = "--" + boundary + CRLF + "Content-Disposition: form-data; name=\"IsKeepFileName\";\r\n\r\n" + true + "";
//            writer.append(isKeepFilename).append(CRLF);

            // File data
            // Add for list of images
            List<ScansImages> lstScansImages = databaseHelper.getScansImages(scansContainerItem.getLotItemId());
            for(int i=0; i< lstScansImages.size();i++){
                File imagefile = new File(lstScansImages.get(i).getImagePath(), lstScansImages.get(i).getImageName());
                writer.append("--" + boundary).append(CRLF);
                writer.append("Content-Disposition: form-data; name=\"uplTheFile\"; filename=\"" + imagefile.getName() + "\"").append(CRLF);
                writer.append("Content-Type: application/octet-stream").append(CRLF);
                writer.append(CRLF).flush();
                InputStream in = new FileInputStream(imagefile.getAbsolutePath());
                try {

                    // Transfer bytes from in to out
                    byte[] buf = new byte[1024];
                    int len;
                    while ((len = in.read(buf)) > 0) {
                        output.write(buf, 0, len);

                    }
                    output.flush();
                    in.close();
                    writer.append(CRLF);
                    writer.flush();

                } finally {
                    //                    in.close();
                }
            }

            // End of multipart/form-data.
            writer.append(CRLF).append("--" + boundary + "--").flush();
//
            String responesPostImage = convertInputStreamToString(urlConnectionPostImage.getInputStream());
            responesPostImage = responesPostImage.substring(1,responesPostImage.length()-1);
            responesPostImage = responesPostImage.replaceAll("\\\\", "");
            System.out.println(responesPostImage);

            try {
                JsonElement jeItem = parser.parse(responesPostImage);
                JsonReader jsonReader = new JsonReader(new StringReader(boundary));
                jsonReader.setLenient(true);
                JsonObject joItem = jeItem.getAsJsonObject();
                JsonObject joResult= joItem.get("result").getAsJsonObject();
                int idScanContainerItem = joResult.get("returnID").getAsInt();
                // Update to database
                return  idScanContainerItem;
            } catch (Exception ex) {
                Log.d("PostImage", "error: " + ex.getMessage());
            }
        } catch (ProtocolException ep) {
            Log.d("PostImage", "ProtocolException: " + ep.getMessage());
            return 0;
        } catch (MalformedURLException em) {
            Log.d("PostImage", "MalformedURLException: " + em.getMessage());
            return 0;
        } catch (IOException ioe) {
            Log.d("PostImage", "IOException: " + ioe.getMessage());
            return 0;
        } catch (Exception ex_post_image) {
            Log.d("PostImage", "error: " + ex_post_image.getMessage());
            return 0;
        }
        return 0;
    }

    private String convertInputStreamToString(InputStream inputStream) {
        StringBuilder sb = new StringBuilder();
        try {
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream, "utf-8"));
            String line;
            while ((line = bufferedReader.readLine()) != null) {
                sb.append(line);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return sb.toString();
    }
    //endregion
}
