using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace DMS.Utils
{
    public class ImageUtil
    {
        public static double ConvertBytesToMegabytes(long bytes)
        {
            return (bytes / 1024f) / 1024f;
        }

        public static double ConvertKilobytesToMegabytes(long kilobytes)
        {
            return kilobytes / 1024f;
        }
        public static bool RewriteImage(Stream stream, string saveFilePath, bool isDisposeImage = false, Encoder encoder = null, long encoderValue = 90L)
        {
            var bmpUpload = (Bitmap)Image.FromStream(stream);
            return RewriteImage(bmpUpload, saveFilePath, isDisposeImage, encoder, encoderValue);
        }

        public static bool RewriteImage(string sourceFilePath, string saveFilePath, bool isDisposeImage = false, Encoder encoder = null, long encoderValue = 90L)
        {
            if (!File.Exists(sourceFilePath)) return false;

            var bmpUpload = (Bitmap)Image.FromFile(sourceFilePath, true);
            return RewriteImage(bmpUpload, saveFilePath, isDisposeImage, encoder, encoderValue);
        }

        public static bool RewriteImage(Bitmap sourceBitmap, string saveFilePath, bool isDisposeImage = false, Encoder encoder = null, long encoderValue = 90L)
        {
            if (sourceBitmap == null) return false;

            ImageCodecInfo[] info = ImageCodecInfo.GetImageEncoders();
            var encoderParams = new EncoderParameters(1);
            encoderParams.Param[0] = new EncoderParameter(encoder ?? Encoder.Quality, encoderValue);
            sourceBitmap.Save(saveFilePath, info[1], encoderParams);

            encoderParams.Dispose();
            if (isDisposeImage)
            {
                sourceBitmap.Dispose();
            }
            return true;
        }
        public static MemoryStream ConvertBase64ToStream(string imgBase64string)
        {
            byte[] bytes = Convert.FromBase64String(imgBase64string);
            MemoryStream memoryStream = new MemoryStream(bytes);
            return memoryStream;
        }
    }
}
