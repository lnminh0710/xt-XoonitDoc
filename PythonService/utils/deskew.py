import os

import cv2
import numpy as np

# Deskew image to 0 or 180 degree


def img_deskew(img_buffer, file_name, angle_skip):
    # CV2
    # Get currentpath
    path = os.path.abspath(os.path.join(
        os.path.dirname(os.path.abspath(__file__)), os.pardir))
    path = os.path.join(path, 'tmp')
    if(os.path.exists(path) == False):
        os.mkdir(path)
    img_path_tmp = os.path.join(path, file_name)
    _, file_extension = os.path.splitext(img_path_tmp)
    print(img_path_tmp)
    with open(img_path_tmp, 'wb') as file:
        file.write(img_buffer)

    # Load file from image
    image = cv2.imread(img_path_tmp)
    image_dimension = image.shape
    image_height = image_dimension[0]
    image_width = image_dimension[1]

    # creating copy of original image
    orig = image.copy()

    # convert to grayscale and blur to smooth
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # dilate image
    kernel = np.ones((5, 5), np.uint8)
    erode = cv2.erode(gray, kernel, iterations=5)
    dilation = cv2.dilate(erode, kernel, iterations=1)

    _, contours, _ = cv2.findContours(
        dilation, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

    angles = []

    for contour in contours:
        rect = cv2.minAreaRect(contour)
        box = cv2.boxPoints(rect)
        box = np.int0(box)

        cv2.drawContours(dilation, [box], 0, (0, 0, 255), 2)

    for contour in contours:
        rect = cv2.minAreaRect(contour)
        angle = rect[-1]
        rect_height = rect[1][0]
        rect_width = rect[1][1]
        # print('# Height: ', rect_height, ' # Width: ', rect_width)
        # print('# Angle: ', angle)
        if rect_width >= rect_height:
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle
        else:
            if angle < -45:
                angle = -angle
            else:
                angle = -(90 + angle)
        angles.append(angle)

    arr_remove = [90, -90, 0, -0]
    for item in arr_remove:
        while item in angles:
            angles.remove(item)

    if (len(angles) == 0):
        angle_min = 0
        angle_max = 0
        os.remove(img_path_tmp)
        print(' 0 0')
        return
    else:
        angle_min = int(min(angles)) - 1
        angle_max = int(max(angles)) + 1

    counts = []
    for i in range(angle_min, angle_max, 1):
        count = len(list(x for x in angles if (i <= x <= i+1) and x != 0))
        if count > 10:
            counts.append([i, count])

    angles = np.array(angles)
    angles_final = []
    for count in counts:
        ang = angles[np.logical_and(
            angles >= count[0], angles <= count[0] + 1)]
        angles_final.extend(ang)
    if len(angles_final) == 0:
        print('angles_final')
        os.remove(img_path_tmp)
        return
    avg_angle = sum(angles_final) / len(angles_final)

    avg_angle = -avg_angle

    center_x = int(image_height/2)
    center_y = int(image_height/2)

    root_mat = cv2.getRotationMatrix2D((center_x, center_y), avg_angle, 1.0)
    print('# Average angle: ', avg_angle)

    if (float(avg_angle) > float(angle_skip) or (float(avg_angle) < 0 and (float(avg_angle) < float(-angle_skip)))):
        if abs(avg_angle) < 45:
            rotated = cv2.warpAffine(image, root_mat, (image_width, image_height),
                                     flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        else:
            rotated = cv2.warpAffine(image, root_mat, (image_height, image_width),
                                     flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

        _, encoded_image = cv2.imencode(file_extension, rotated)
        os.remove(img_path_tmp)
        return encoded_image.tobytes()

    os.remove(img_path_tmp)
    print('dont rotate image')
    return


# with open('./20190822-141236.938_Order.tiff.1.png', 'rb') as file:
#     img_content = file.read()

# end_img = img_deskew(img_content, '1.png')
# with open('./tmp/1_rotated.png', 'wb') as file:
#     file.write(end_img)
