package com.adityaarora.liveedgedetection.activity;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Typeface;
import android.support.annotation.Nullable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import com.adityaarora.liveedgedetection.Database.DatabaseHelper;
import com.adityaarora.liveedgedetection.Database.ScansContainer;
import com.adityaarora.liveedgedetection.Database.ScansContainerItem;
import com.adityaarora.liveedgedetection.R;
import com.adityaarora.liveedgedetection.constants.ScanConstants;
import com.adityaarora.liveedgedetection.util.StringUtils;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import static com.adityaarora.liveedgedetection.constants.ScanConstants.LotItemId;


public class CustomListAdapter extends ArrayAdapter<ScansContainerItem> {

    //region Variables
    private Activity context;
    private DatabaseHelper databaseHelper;
    private int layoutRescourceid;
    int LotItemId;
    public ImageHolder imageHolder = null;
    private List<ScansContainerItem> lstScansContainerItem;
    //endregion

    //region Constructors
    public CustomListAdapter(Activity context, int custom_image_list, List<ScansContainerItem> lstScansContainerItem) {
        super(context, custom_image_list, lstScansContainerItem);
        this.context = context;
        layoutRescourceid = custom_image_list;
        this.lstScansContainerItem = lstScansContainerItem;
    }
    //endregion

    //region adapter event
    @SuppressLint("SetTextI18n")
    @Override
    public View getView(final int position, View convertView, final ViewGroup parent) {
        View row = convertView;

        final ScansContainerItem scansContainerItem = lstScansContainerItem.get(position);
        if (row == null) {
            LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            row = inflater.inflate(layoutRescourceid, parent, false);
            imageHolder = new ImageHolder();
            imageHolder.imageTypeId = (TextView) row.findViewById(R.id.imageIdType);
            imageHolder.imageProperty = (TextView) row.findViewById(R.id.imageProperty);
            imageHolder.Bitmap = (ImageView) row.findViewById(R.id.Bitmap);
            imageHolder.textNote = (ImageView) row.findViewById(R.id.textNote);
            imageHolder.checkBox = (CheckBox) row.findViewById(R.id.selectionCheck);
            imageHolder.checkBox.setVisibility(View.GONE);
            imageHolder.checkBox.setTag(position);
            imageHolder.checkBox.setChecked(scansContainerItem.isChecked());
            imageHolder.checkBox.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {

                @Override
                public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                    ScansContainerItem scansContainerItemCheckbox = (ScansContainerItem) imageHolder.checkBox
                            .getTag();
                    scansContainerItemCheckbox.setChecked(buttonView.isChecked());

                    notifyDataSetChanged();
                }


            });
            imageHolder.checkBox.setTag(lstScansContainerItem.get(position));
            imageHolder.scansContainerItem = lstScansContainerItem.get(position);
            row.setTag(imageHolder);

            //Assign data to view
            imageHolder.imageTypeId.setText(StringUtils.GetDocumentTypeById(getContext(), scansContainerItem.getIdRepScansDocumentType()));
            imageHolder.imageProperty.setText(scansContainerItem.getScannedFilename() + " \n"
                    + "Pages: " + scansContainerItem.getNumberOfImages());
            File image = new File(scansContainerItem.getScannedPath(), scansContainerItem.getScannedFilename());
            BitmapFactory.Options bmOptions = new BitmapFactory.Options();
            Bitmap bitmap = BitmapFactory.decodeFile(image.getAbsolutePath(), bmOptions);
//        bitmap = Bitmap.createScaledBitmap(bitmap, parent.getWidth(), parent.getHeight(), true);
            bitmap = Bitmap.createScaledBitmap(bitmap, 50 * 3, 70 * 3, true);
            imageHolder.Bitmap.setImageBitmap(bitmap);
            if (scansContainerItem.getNotes() == null | scansContainerItem.getNotes() == "") {
                imageHolder.textNote.setVisibility(View.INVISIBLE);
            } else {
                imageHolder.textNote.setVisibility(View.VISIBLE);
            }
        } else {
            imageHolder = (ImageHolder) row.getTag();
        }
        return row;
    }
    //endregion

    //region internal class
    public class ImageHolder {
        ImageView Bitmap;
        TextView imageProperty;
        ImageView textNote;
        ImageView deleteButton;
        TextView imageTypeId;
        CheckBox checkBox;
        ScansContainerItem scansContainerItem;
    }
    //endregion
}
