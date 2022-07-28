//package com.caminada.camera.utils;
//import android.annotation.SuppressLint;
//import android.content.Context;
//import android.os.AsyncTask;
//import android.util.Log;
//
//
//import com.caminada.camera.Database.DatabaseHelper;
//import com.caminada.camera.Database.ScansContainer;
//import com.caminada.camera.Database.ScansContainerItem;
//import com.caminada.camera.Database.UserHost;
//import com.google.gson.Gson;
//import com.google.gson.JsonElement;
//import com.google.gson.JsonParser;
//import com.google.gson.JsonObject;
//
////import org.json.JSONObject;
//
//import java.io.BufferedReader;
//import java.io.File;
//import java.io.FileInputStream;
//import java.io.IOException;
//import java.io.InputStream;
//import java.io.InputStreamReader;
//import java.io.OutputStream;
//import java.io.OutputStreamWriter;
//import java.io.PrintWriter;
//import java.net.HttpURLConnection;
//import java.net.MalformedURLException;
//import java.net.ProtocolException;
//import java.net.URL;
//import java.util.List;
//
//public class AsyncTaskRunner extends AsyncTask<String, String, String> {
//
//    //region Variables
//    private DatabaseHelper databaseHelper;
//    private Gson gson;
//    private JsonParser parser;
//    @SuppressLint("StaticFieldLeak")
//    private Context context;
//    private int IdScansContainer = 0;
//    //endregion
//
//    //region Constructors
//    public AsyncTaskRunner(Context context) {
//        this.context = context;
//    }
//
//    public AsyncTaskRunner(Context context, int idScansContainer) {
//        this.context = context;
//        this.IdScansContainer = idScansContainer;
//    }
//    //endregion
//
//    //region Async Task events
//    @SuppressLint("WrongThread")
//    @Override
//    protected String doInBackground(String... params) {
//        try {
//            String token = getAuthenInfo();
//            if (IdScansContainer > 0) {
//                {
//                    // Create lot on server and return lotid
//                    ScansContainer scansContainer = databaseHelper.getScansContainerById(IdScansContainer);
//                    // Update lot status into database
//                    // Get list of ScansContainerItem
//                    List<ScansContainerItem> lstScansContainerItem = databaseHelper.getScansContainerItem(scansContainer.getLotId());
//                    for (int j = 0; j < lstScansContainerItem.size(); j++) {
//                        // Assign IdScansContainer to Item
//                        ScansContainerItem scansContainerItem = lstScansContainerItem.get(j);
//                        scansContainerItem.setIdScansContainer(scansContainer.getIdScansContainer());
//                        // Call upload service
//                        AsyncTaskUploadScansItem uploadScansItem = new AsyncTaskUploadScansItem(context, scansContainerItem, token, true);
//                        uploadScansItem.execute();
//                    }
//                    databaseHelper.updateScansContainer(scansContainer.getLotId(), 0, true, true);
//                }
//            } else {
//                List<ScansContainer> lstScanContainer = databaseHelper.getTopScansContainer(1);
//                for (int i = 0; i < lstScanContainer.size(); i++) {
//                    // Create lot on server and return lotid
//                    ScansContainer scansContainer = lstScanContainer.get(i);
//
//                    // Get list of ScansContainerItem
//                    List<ScansContainerItem> lstScansContainerItem = databaseHelper.getScansContainerItem(scansContainer.getLotId());
//                    for (int j = 0; j < lstScansContainerItem.size(); j++) {
//                        // Assign IdScansContainer to Item
//                        ScansContainerItem scansContainerItem = lstScansContainerItem.get(j);
//                        scansContainerItem.setIdScansContainer(scansContainer.getIdScansContainer());
//                        // Call upload service
//                        AsyncTaskUploadScansItem uploadScansItem = new AsyncTaskUploadScansItem(context, scansContainerItem, token, false);
//                        uploadScansItem.execute();
//                    }
//                    // Update lot status into database
//                    databaseHelper.updateScansContainer(scansContainer.getLotId(), 0, true);
//                }
//                return "OK";
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//        return "OK";
//    }
//
//    @Override
//    protected void onPostExecute(String result) {
//        // execution of result of Long time consuming operation
//    }
//
//    @Override
//    protected void onPreExecute() {
//        databaseHelper = new DatabaseHelper(this.context);
//        gson = new Gson();
//        parser = new JsonParser();
//    }
//
//    @Override
//    protected void onProgressUpdate(String... text) {
//
//    }
//    //endregion
//
//    //region User defined function
//    private String getAuthenInfo() {
//        String tokenTmp = "";
//        //Authentication
//        try {
//            URL urlAuthentication = new URL(ScanConstants.PrefixHostDocumentProcessing + "authenticate");
//            HttpURLConnection urlConnectionAuthentication = (HttpURLConnection) urlAuthentication.openConnection();
//            urlConnectionAuthentication.setUseCaches(false);
//            urlConnectionAuthentication.setDoInput(true);
//            urlConnectionAuthentication.setDoOutput(true);
//            urlConnectionAuthentication.setRequestProperty("Content-Type", "application/json");
//
//            urlConnectionAuthentication.setRequestMethod("POST");
//            urlConnectionAuthentication.setRequestProperty("Accept", "application/json");
//            //create authentication data
//            UserHost user = new UserHost(ScanConstants.CurrentUser.getLoginName(), ScanConstants.CurrentUser.getPassword());
//            String dataAuthentication = gson.toJson(user);
//            //Call request
//            try (OutputStream os = urlConnectionAuthentication.getOutputStream()) {
//                byte[] input = dataAuthentication.getBytes("utf-8");
//                os.write(input, 0, input.length);
//            }
//            //Get response
//            String responseAuthen = convertInputStreamToString(urlConnectionAuthentication.getInputStream());
//            JsonElement jeItem = parser.parse(responseAuthen);
//            JsonObject joItem = jeItem.getAsJsonObject();
//            JsonObject joResult = joItem.get("item").getAsJsonObject();
//            JsonObject json = joResult.getAsJsonObject();
////            String act = json.getString("item");
////            json = new JSONObject(act);
//            tokenTmp = json.get("access_token").getAsString();
//        } catch (ProtocolException e) {
//            Log.d("Authenticate", "ProtocolException: " + e.getMessage());
//            return "";
//        } catch (MalformedURLException e) {
//            Log.d("Authenticate", "MalformedURLException: " + e.getMessage());
//            return "";
//        } catch (IOException e) {
//            Log.d("Authenticate", "IOException: " + e.getMessage());
//            return "";
//        } catch (Exception err_authenticate) {
//            Log.d("Authenticate", "error: " + err_authenticate.getMessage());
//            return "";
//        }
//        return tokenTmp;
//    }
//    private String convertInputStreamToString(InputStream inputStream) {
//        StringBuilder sb = new StringBuilder();
//        try {
//            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream, "utf-8"));
//            String line;
//            while ((line = bufferedReader.readLine()) != null) {
//                sb.append(line);
//            }
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//        return sb.toString();
//    }
//    //endregion
//}
