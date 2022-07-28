using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using SkiaSharp;
using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using DMS.Models;

namespace DMS.Utils
{
    /*
    https://www.paddo.org/asp-net-core-image-resizing-middleware/
    https://www.csharpcodi.com/csharp-examples/SkiaSharp.SKBitmap.Resize(SkiaSharp.SKBitmap,%20SkiaSharp.SKBitmap,%20SkiaSharp.SKBitmapResizeMethod)/
    */

    public interface IImageResizer
    {
        byte[] ResizeImage(FileInfoItem fileInfoItem, IQueryCollection query);
    }

    public class ImageResizer : IImageResizer
    {
        struct ResizeParams
        {
            public bool hasParams;
            public int w;
            public int h;
            public bool autorotate;
            public int quality; // 0 - 100
            public string format; // png, jpg, jpeg
            public string rmode; //resize mode: pad, max, crop, stretch

            public static string[] modes = new string[] { "pad", "max", "crop", "stretch" };

            public override string ToString()
            {
                var sb = new StringBuilder();
                sb.Append($"w: {w}, ");
                sb.Append($"h: {h}, ");
                sb.Append($"autorotate: {autorotate}, ");
                sb.Append($"quality: {quality}, ");
                sb.Append($"format: {format}, ");
                sb.Append($"mode: {rmode}");

                return sb.ToString();
            }
        }

        private readonly IMemoryCache _memoryCache;

        public ImageResizer(IMemoryCache memoryCache)
        {
            _memoryCache = memoryCache;
        }

        public byte[] ResizeImage(FileInfoItem fileInfoItem, IQueryCollection query)
        {
            // hand to next middleware if we are dealing with an image but it doesn't have any usable resize querystring params
            var resizeParams = GetResizeParams(query, fileInfoItem.Extension);

            var lastWriteTimeUtc = File.GetLastWriteTimeUtc(fileInfoItem.FullFileName);
            var imageData = GetImageData(fileInfoItem.FullFileName, resizeParams, lastWriteTimeUtc);

            var bytes = imageData.ToArray();

            // cleanup
            imageData.Dispose();
            return bytes;
        }

        private ResizeParams GetResizeParams(IQueryCollection query, string fileExtension)
        {
            ResizeParams resizeParams = new ResizeParams();

            // before we extract, do a quick check for resize params
            resizeParams.hasParams =
                resizeParams.GetType().GetTypeInfo()
                .GetFields().Where(f => f.Name != "hasParams")
                .Any(f => query.ContainsKey(f.Name));

            // png, jpg, jpeg without .
            if (query.ContainsKey("format"))
                resizeParams.format = query["format"];
            else
                resizeParams.format = fileExtension.Substring(fileExtension.LastIndexOf('.') + 1);

            resizeParams.format = resizeParams.format.ToLowerInvariant();

            if (query.ContainsKey("autorotate"))
                bool.TryParse(query["autorotate"], out resizeParams.autorotate);

            int quality = 100;
            if (query.ContainsKey("quality"))
                int.TryParse(query["quality"], out quality);
            resizeParams.quality = quality;

            int w = 0;
            if (query.ContainsKey("w"))
                int.TryParse(query["w"], out w);
            resizeParams.w = w;

            int h = 0;
            if (query.ContainsKey("h"))
                int.TryParse(query["h"], out h);
            resizeParams.h = h;

            resizeParams.rmode = "max";
            // only apply mode if it's a valid mode and both w and h are specified
            if (h != 0 && w != 0 && query.ContainsKey("rmode") && ResizeParams.modes.Any(m => query["rmode"] == m))
                resizeParams.rmode = query["rmode"];

            return resizeParams;
        }

        private SKData GetImageData(string imagePath, ResizeParams resizeParams, DateTime lastWriteTimeUtc)
        {
            // check cache and return if cached
            //long cacheKey = imagePath.GetHashCode() + lastWriteTimeUtc.ToBinary() + resizeParams.ToString().GetHashCode();

            //byte[] imageBytes;
            //bool isCached = _memoryCache.TryGetValue<byte[]>(cacheKey, out imageBytes);
            //if (isCached)
            //{
            //    //_logger.LogInformation("Serving from cache");
            //    return SKData.CreateCopy(imageBytes);
            //}

            SKEncodedOrigin origin; // this represents the EXIF orientation
            SKFilterQuality skFilterQuality;
            var bitmap = LoadBitmap(File.OpenRead(imagePath), out origin, out skFilterQuality); // always load as 32bit (to overcome issues with indexed color)

            // if autorotate = true, and origin isn't correct for the rotation, rotate it
            if (resizeParams.autorotate && origin != SKEncodedOrigin.TopLeft)
                bitmap = RotateAndFlip(bitmap, origin);

            if (resizeParams.w > bitmap.Width) resizeParams.w = bitmap.Width;
            if (resizeParams.h > bitmap.Height) resizeParams.h = bitmap.Height;

            // if either w or h is 0, set it based on ratio of original image
            if (resizeParams.h == 0)
                resizeParams.h = (int)Math.Round(bitmap.Height * (float)resizeParams.w / bitmap.Width);
            else if (resizeParams.w == 0)
                resizeParams.w = (int)Math.Round(bitmap.Width * (float)resizeParams.h / bitmap.Height);

            // if we need to crop, crop the original before resizing
            if (resizeParams.rmode == "crop")
                bitmap = Crop(bitmap, resizeParams);

            // store padded height and width
            var paddedHeight = resizeParams.h;
            var paddedWidth = resizeParams.w;

            // if we need to pad, or max, set the height or width according to ratio
            if (resizeParams.rmode == "pad" || resizeParams.rmode == "max")
            {
                var bitmapRatio = (float)bitmap.Width / bitmap.Height;
                var resizeRatio = (float)resizeParams.w / resizeParams.h;

                if (bitmapRatio > resizeRatio) // original is more "landscape"
                    resizeParams.h = (int)Math.Round(bitmap.Height * ((float)resizeParams.w / bitmap.Width));
                else
                    resizeParams.w = (int)Math.Round(bitmap.Width * ((float)resizeParams.h / bitmap.Height));
            }
            if (resizeParams.w == 0 && resizeParams.h == 0)
            {
                resizeParams.w = bitmap.Width;
                resizeParams.h = bitmap.Height;
            }
            // resize
            var resizedImageInfo = new SKImageInfo(resizeParams.w, resizeParams.h, SKImageInfo.PlatformColorType, bitmap.AlphaType);
            var resizedBitmap = bitmap.Resize(resizedImageInfo, skFilterQuality);

            // optionally pad
            if (resizeParams.rmode == "pad")
                resizedBitmap = Pad(resizedBitmap, paddedWidth, paddedHeight, resizeParams.format != "png");

            // encode
            var resizedImage = SKImage.FromBitmap(resizedBitmap);
            var encodeFormat = GetSKEncodedImageFormat(resizeParams.format);
            SKData imageData = resizedImage.Encode(encodeFormat, resizeParams.quality);

            // Set cache options.
            //var cacheEntryOptions = new MemoryCacheEntryOptions()
            //    // Keep in cache for this time, reset time if accessed.
            //    .SetSlidingExpiration(TimeSpan.FromHours(1));//1 hours

            // cache the result
            //_memoryCache.Set<byte[]>(cacheKey, imageData.ToArray(), cacheEntryOptions);

            // cleanup
            resizedImage.Dispose();
            bitmap.Dispose();
            resizedBitmap.Dispose();

            return imageData;
        }

        private SKBitmap RotateAndFlip(SKBitmap original, SKEncodedOrigin origin)
        {
            // these are the origins that represent a 90 degree turn in some fashion
            var differentOrientations = new SKEncodedOrigin[]
            {
                SKEncodedOrigin.LeftBottom,
                SKEncodedOrigin.LeftTop,
                SKEncodedOrigin.RightBottom,
                SKEncodedOrigin.RightTop
            };

            // check if we need to turn the image
            bool isDifferentOrientation = differentOrientations.Any(o => o == origin);

            // define new width/height
            var width = isDifferentOrientation ? original.Height : original.Width;
            var height = isDifferentOrientation ? original.Width : original.Height;

            var bitmap = new SKBitmap(width, height, original.AlphaType == SKAlphaType.Opaque);

            // todo: the stuff in this switch statement should be rewritten to use pointers
            switch (origin)
            {
                case SKEncodedOrigin.LeftBottom:

                    for (var x = 0; x < original.Width; x++)
                        for (var y = 0; y < original.Height; y++)
                            bitmap.SetPixel(y, original.Width - 1 - x, original.GetPixel(x, y));
                    break;

                case SKEncodedOrigin.RightTop:

                    for (var x = 0; x < original.Width; x++)
                        for (var y = 0; y < original.Height; y++)
                            bitmap.SetPixel(original.Height - 1 - y, x, original.GetPixel(x, y));
                    break;

                case SKEncodedOrigin.RightBottom:

                    for (var x = 0; x < original.Width; x++)
                        for (var y = 0; y < original.Height; y++)
                            bitmap.SetPixel(original.Height - 1 - y, original.Width - 1 - x, original.GetPixel(x, y));

                    break;

                case SKEncodedOrigin.LeftTop:

                    for (var x = 0; x < original.Width; x++)
                        for (var y = 0; y < original.Height; y++)
                            bitmap.SetPixel(y, x, original.GetPixel(x, y));
                    break;

                case SKEncodedOrigin.BottomLeft:

                    for (var x = 0; x < original.Width; x++)
                        for (var y = 0; y < original.Height; y++)
                            bitmap.SetPixel(x, original.Height - 1 - y, original.GetPixel(x, y));
                    break;

                case SKEncodedOrigin.BottomRight:

                    for (var x = 0; x < original.Width; x++)
                        for (var y = 0; y < original.Height; y++)
                            bitmap.SetPixel(original.Width - 1 - x, original.Height - 1 - y, original.GetPixel(x, y));
                    break;

                case SKEncodedOrigin.TopRight:

                    for (var x = 0; x < original.Width; x++)
                        for (var y = 0; y < original.Height; y++)
                            bitmap.SetPixel(original.Width - 1 - x, y, original.GetPixel(x, y));
                    break;

            }

            original.Dispose();

            return bitmap;
        }

        private SKBitmap Pad(SKBitmap original, int paddedWidth, int paddedHeight, bool isOpaque)
        {
            // setup new bitmap and optionally clear
            var bitmap = new SKBitmap(paddedWidth, paddedHeight, isOpaque);
            var canvas = new SKCanvas(bitmap);
            if (isOpaque)
                canvas.Clear(new SKColor(255, 255, 255)); // we could make this color a resizeParam
            else
                canvas.Clear(SKColor.Empty);

            // find co-ords to draw original at
            var left = original.Width < paddedWidth ? (paddedWidth - original.Width) / 2 : 0;
            var top = original.Height < paddedHeight ? (paddedHeight - original.Height) / 2 : 0;

            var drawRect = new SKRectI
            {
                Left = left,
                Top = top,
                Right = original.Width + left,
                Bottom = original.Height + top
            };

            // draw original onto padded version
            canvas.DrawBitmap(original, drawRect);
            canvas.Flush();

            canvas.Dispose();
            original.Dispose();

            return bitmap;
        }

        private SKBitmap Crop(SKBitmap original, ResizeParams resizeParams)
        {
            var cropSides = 0;
            var cropTopBottom = 0;

            // calculate amount of pixels to remove from sides and top/bottom
            if ((float)resizeParams.w / original.Width < resizeParams.h / original.Height) // crop sides
                cropSides = original.Width - (int)Math.Round((float)original.Height / resizeParams.h * resizeParams.w);
            else
                cropTopBottom = original.Height - (int)Math.Round((float)original.Width / resizeParams.w * resizeParams.h);

            // setup crop rect
            var cropRect = new SKRectI
            {
                Left = cropSides / 2,
                Top = cropTopBottom / 2,
                Right = original.Width - cropSides + cropSides / 2,
                Bottom = original.Height - cropTopBottom + cropTopBottom / 2
            };

            // crop
            SKBitmap bitmap = new SKBitmap(cropRect.Width, cropRect.Height);
            original.ExtractSubset(bitmap, cropRect);
            original.Dispose();

            return bitmap;
        }

        private SKBitmap LoadBitmap(Stream stream, out SKEncodedOrigin origin, out SKFilterQuality skFilterQuality)
        {
            SKBitmap bitmap = null;
            using (var s = new SKManagedStream(stream))
            {
                using (var codec = SKCodec.Create(s))
                {
                    origin = codec.EncodedOrigin;
                    var info = codec.Info;
                    bitmap = new SKBitmap(info.Width, info.Height, SKImageInfo.PlatformColorType, info.IsOpaque ? SKAlphaType.Opaque : SKAlphaType.Premul);

                    //1mb: 1048576, 500kb: 512000, 300kb: 307200
                    skFilterQuality = s.Length > 307200 ? SKFilterQuality.High : SKFilterQuality.None;

                    IntPtr length;
                    var result = codec.GetPixels(bitmap.Info, bitmap.GetPixels(out length));
                    if (result == SKCodecResult.Success || result == SKCodecResult.IncompleteInput)
                    {
                        codec.Dispose();
                    }
                    else
                    {
                        codec.Dispose();
                        throw new ArgumentException("Unable to load bitmap from provided data");
                    }
                }
                stream.Dispose();
            }
            return bitmap;
        }

        private SKEncodedImageFormat GetSKEncodedImageFormat(string format)
        {
            //".png", ".jpg", ".jpeg", ".gif", ".bmp", ".jfif"
            switch (format)
            {
                case "jpeg":
                case "jpg":
                    return SKEncodedImageFormat.Jpeg;
                case "bmp":
                    return SKEncodedImageFormat.Bmp;
                case "gif":
                    return SKEncodedImageFormat.Gif;
                case "ico":
                    return SKEncodedImageFormat.Ico;
                case "png":
                    return SKEncodedImageFormat.Png;
                default:
                    return SKEncodedImageFormat.Jpeg;
            }
        }
    }
}
