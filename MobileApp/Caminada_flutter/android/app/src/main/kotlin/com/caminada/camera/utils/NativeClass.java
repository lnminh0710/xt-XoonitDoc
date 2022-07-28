package com.caminada.camera.utils;

import android.graphics.Bitmap;

import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.MatOfInt;
import org.opencv.core.MatOfPoint;
import org.opencv.core.MatOfPoint2f;
import org.opencv.core.Point;
import org.opencv.core.Rect;
import org.opencv.core.Scalar;
import org.opencv.core.Size;
import org.opencv.imgproc.Imgproc;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class NativeClass {

    static {
        System.loadLibrary("opencv_java3");
    }


    private static final double AREA_LOWER_THRESHOLD = 0.2;
    private static final double AREA_UPPER_THRESHOLD = 0.98;
    private static final double DOWNSCALE_IMAGE_SIZE = 600f;

    public Bitmap getScannedBitmap(Bitmap bitmap, float x1, float y1, float x2, float y2, float x3, float y3, float x4, float y4) {
        PerspectiveTransformation perspective = new PerspectiveTransformation();
        MatOfPoint2f rectangle = new MatOfPoint2f();
        rectangle.fromArray(new Point(x1, y1), new Point(x2, y2), new Point(x3, y3), new Point(x4, y4));
        Mat dstMat = perspective.transform(ImageUtils.bitmapToMat(bitmap), rectangle);
        return ImageUtils.matToBitmap(dstMat);
    }

    private static Comparator<MatOfPoint2f> AreaDescendingComparator = new Comparator<MatOfPoint2f>() {
        public int compare(MatOfPoint2f m1, MatOfPoint2f m2) {
            double area1 = Imgproc.contourArea(m1);
            double area2 = Imgproc.contourArea(m2);
            return (int) Math.ceil(area2 - area1);
        }
    };


    public MatOfPoint2f getPoint(Bitmap bitmap) {
        Mat src = ImageUtils.bitmapToMat(bitmap);


        // Downscale image for better performance.
        double ratio = DOWNSCALE_IMAGE_SIZE / Math.max(src.width(), src.height());
        Size downscaledSize = new Size(src.width() * ratio, src.height() * ratio);
        Mat downscaled = new Mat(downscaledSize, src.type());
        Imgproc.resize(src, downscaled, downscaledSize);

        List<MatOfPoint2f> rectangles = getPoints(downscaled);
        if (rectangles.size() == 0) {
            return null;
        }
        Collections.sort(rectangles, AreaDescendingComparator);
        MatOfPoint2f largestRectangle = rectangles.get(0);
        MatOfPoint2f result = MathUtils.scaleRectangle(largestRectangle, 1f / ratio);
        return result;
    }

    //public native float[] getPoints(Bitmap bitmap);
    public List<MatOfPoint2f> getPoints(Mat src) {

        // Blur the image to filter out the noise.
        Mat blurred = new Mat();
        Imgproc.medianBlur(src, blurred, 11);

        // Set up images to use.
        Mat image = new Mat(blurred.size(), CvType.CV_8U);
        Mat gray = new Mat();
        Mat lines = new Mat();

        // For Core.mixChannels.
        List<MatOfPoint> contours = new ArrayList<>();
        List<MatOfPoint2f> rectangles = new ArrayList<>();

        List<Mat> sources = new ArrayList<>();
        sources.add(blurred);
        List<Mat> destinations = new ArrayList<>();


        destinations.add(image);

        // To filter rectangles by their areas.
        int srcArea = src.rows() * src.cols();

        // Find squares in every color plane of the image.
        for (int c = 0; c < 3; c++) {
            int[] ch = {c, 0};
            MatOfInt fromTo = new MatOfInt(ch);

            Core.mixChannels(sources, destinations, fromTo);

            // Try several threshold levels.
            // Imgproc.cvtColor(gray0,gray,Imgproc.COLOR_mRGBA2RGBA,4);
            Imgproc.bilateralFilter(image, gray, 11, 11, 17);
            Imgproc.Canny(image, gray, 20, 50 );

            Imgproc.threshold(image,gray,150,225, Imgproc.THRESH_OTSU + Imgproc.THRESH_BINARY);


            Imgproc.findContours(gray, contours, new Mat(), Imgproc.RETR_EXTERNAL, Imgproc.CHAIN_APPROX_SIMPLE);
//
            Collections.sort(contours, new Comparator<MatOfPoint>() {
                @Override
                public int compare(MatOfPoint o1, MatOfPoint o2) {
                    return Double.valueOf(Imgproc.contourArea(o2)).compareTo(Imgproc.contourArea(o1));
                }
            });
//            for(int i=0;i<contours.size();i++)
//            {
//                Scalar color = new Scalar(0,225,0);
//                Rect rect = Imgproc.boundingRect(contours[i]);
//                if(rect.width > )
//
//            }
            int contourIdx = -1;
            for (MatOfPoint contour : contours) {
                MatOfPoint2f contourFloat = MathUtils.toMatOfPointFloat(contour);

                double arcLen = Imgproc.arcLength(contourFloat, true) * 0.03;
                // Approximate polygonal curves.
                MatOfPoint2f approxCurve = new MatOfPoint2f();

                Imgproc.approxPolyDP(contourFloat, approxCurve, arcLen, true);
                int biggest = 0;
                double BiggestContourArea = Imgproc.contourArea(contours.get(biggest));
                for (int i = 1; i != contours.size(); ++i) {
                    if ((Imgproc.contourArea(contours.get(i))) > BiggestContourArea) {

                    }
                    biggest = i;
                    BiggestContourArea = Imgproc.contourArea(contours.get(biggest));

                }

                if (approxCurve.toArray().length != 0) {
                    MatOfPoint points = new MatOfPoint(approxCurve.toArray());
                    Rect rect = Imgproc.boundingRect(points);
                    Imgproc.rectangle(gray, new Point(rect.x, rect.y), new Point(rect.x + rect.width, rect.y + rect.height), new Scalar(0, 255, 0), 1);

                }
                Imgproc.drawContours(image, gray, contours, biggest, new Scalar(0, 255, 0),1 );
                if (isRectangle(approxCurve, srcArea)) {
                    rectangles.add(approxCurve);
                }
            }

        }
        return rectangles;

    }

    private boolean isRectangle(MatOfPoint2f polygon, int srcArea) {
        MatOfPoint polygonInt = MathUtils.toMatOfPointInt(polygon);

        if (polygon.rows() != 4) {
            return false;
        }

        double area = Math.abs(Imgproc.contourArea(polygon));
        if (area < srcArea * AREA_LOWER_THRESHOLD || area > srcArea * AREA_UPPER_THRESHOLD) {
            return false;
        }

        if (!Imgproc.isContourConvex(polygonInt)) {
            return false;
        }

        // Check if the all angles are more than 72.54 degrees (cos 0.3).
        double maxCosine = 0;
        Point[] approxPoints = polygon.toArray();

        for (int i = 2; i < 5; i++) {
            double cosine = Math.abs(MathUtils.angle(approxPoints[i % 4], approxPoints[i - 2], approxPoints[i - 1]));
            maxCosine = Math.max(cosine, maxCosine);
        }

        if (maxCosine >= 0.3) {
            return false;
        }

        return true;
    }

}
