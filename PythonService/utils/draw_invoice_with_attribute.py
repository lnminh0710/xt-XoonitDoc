import os
import cv2
import numpy as np
import json
import requests as rq
import ast
from datetime import datetime
import sys

import utils.server_connection as sc
from utils.invoice_processing import Document


def get_min_max(vertices, scale=0.5):
    min_x = 10000
    min_y = 10000
    max_x = 0
    max_y = 0
    points = []
    for v in vertices:
        x = v.get('x')
        y = v.get('y')
        points.append([x, y])
        min_x = min(min_x, x)
        min_y = min(min_y, y)
        max_x = max(max_x, x)
        max_y = max(max_y, y)

    return min_x, min_y, max_x, max_y, points


class TextOnInvoice:
    def __init__(self, width, height, document_modules=None,
                 path_save=None, view_image=False, scale_percentage=1):
        if document_modules is None:
            pass
        else:
            self.document_modules = document_modules
        self.font = cv2.FONT_HERSHEY_SIMPLEX
        self.thickness_text = 1
        self.color_co = (255, 0, 0)
        self.text_style = cv2.LINE_AA
        self.scale = scale_percentage
        # word
        self.color_word = (0, 0, 0)
        self.color_rec_word = (0, 0, 255)
        self.color_rec_polylines = (255, 255, 0)
        self.thickness_rec_word = 1
        # line
        self.color_line = (217, 179, 140)
        self.color_rec_line = (255, 0, 0)
        self.thickness_rec_line = 1
        # other
        self.width = int((width * 1.5) * scale_percentage)
        self.height = int((height * 1.5) * scale_percentage)
        self.img = np.zeros([self.height, self.width, 3], dtype=np.uint8)
        self.img.fill(255)
        # note
        size = cv2.getTextSize("w", self.font, 0.4, self.thickness_text)
        # cv2.putText(self.img, "line", (5, 28), self.font, 0.5, self.color_line, self.thickness_text, self.textstyle)
        # cv2.rectangle(self.img, (4, 14), (5 + size[0][1] * 4, 29), self.color_rec_line, self.thickness_rec_line)
        for key, value in json_document.items():
            if value['Text'] == "":
                continue
            for word in value['words']:
                print(word)
                cv2.putText(self.img, word['Value'],
                            (int(word['left'] * self.scale), int(word['top'] * self.scale)),
                            self.font, 0.4, self.color_word, self.thickness_text, self.text_style)
                cv2.rectangle(self.img,
                              (int(word['left'] * self.scale), int(word['top'] * self.scale) - (size[0][1] + 2)),
                              (int((word['left'] + word['width']) * self.scale),
                               int((word['top'] + word['height']) * self.scale) - (size[0][1] + 2)),
                              self.color_rec_word, self.thickness_rec_word)
        # Resize image
        if view_image:
            img_resize = cv2.resize(self.img, None, fx=self.scale, fy=self.scale)
            cv2.imshow('Image', img_resize)
            key = cv2.waitKey(0)
            if key == 27:
                cv2.destroyAllWindows()

        if path_save is not None:
            cv2.imwrite(path_save, self.img)


class Word:
    def __init__(self, word=None, paragraph=None, line=None):
        if word is not None:
            self.x, self.y, self.x1, self.y1, self.points = get_min_max(word.get('bounding_poly').get('vertices'), 0.5)
            self.text = word.get('description')
        if paragraph is not None:
            self.x = paragraph.x
            self.y = paragraph.y
            self.x1 = paragraph.x1
            self.y1 = paragraph.y1
            self.text = paragraph.text
            self.diff_y = paragraph.diff_y
        if line is not None:
            self.x = line.x
            self.y = line.y
            self.x1 = line.x1
            self.y1 = line.y1
            self.text = line.text


if __name__ == '__main__':
    # id_document_container_ocr, ocr_json = run_with_json_ocr('inv_water')
    id_document_scan = 152
    path_json_save = "../test/data/db_json/inv_" + str(id_document_scan) + ".json"
    path_image_save = "../test/data/db_json/inv_" + str(id_document_scan) + "_{}.jpg"
    if not os.path.isfile(path_json_save):
        ocr_json = sc.get_ocr_json_with_scan_id(id_document_scan)
        count = 1
        # Write image
        for data in ocr_json:
            count += 1
            # Write json
            with open(path_json_save, 'w+') as outfile:
                outfile.write(json.dumps(ocr_json))
                outfile.close()
                print("Write successfully")
    else:
        print("File is existed")
        with open(path_json_save, 'r') as outfile:
            ocr_json = json.loads(outfile.read())
            outfile.close()
            print("Read successfully")
    id_document_container_ocr = ocr_json[0]['IdDocumentContainerOcr']
    ocr_json = ocr_json[0]['OCRJson']

    # for page in ocr_json:
    ocr_data = json.loads(ocr_json)

    doc = Document(id_document_container_ocr, ocr_data)
    data_res = doc.extract_inv()
    doc.print_all()
    json_document = json.loads(data_res[0]['JsonDocumentModules'])

    path_image_save = "../test/data/db_json/inv_module_" + str(id_document_scan) + ".jpg"
    TextOnInvoice(width=doc.width, height=doc.height,
                  document_modules=json_document,
                  path_save=path_image_save,
                  view_image=False, scale_percentage=0.8)
    print(data_res)
