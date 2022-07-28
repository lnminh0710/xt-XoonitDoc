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


class TextOnImage:
    def __init__(self, width, height, words=None, paragraphs=None, subparagraphs=None, paragraphgroups=None, lines=None,
                 show=0, path_save=None, view_image=False, scale_percentage=1):
        # default
        self.font = cv2.FONT_HERSHEY_SIMPLEX
        self.thickness_text = 1
        self.color_co = (255, 0, 0)
        self.textstyle = cv2.LINE_AA
        self.scale = scale_percentage
        self.thickness_rec_default = 1
        self.thickness_rec_default = 1
        # word
        self.color_word = (0, 0, 0)
        self.color_rec_word = (0, 0, 255)
        self.color_rec_polylines = (255, 255, 0)
        self.thickness_rec_word = 1
        # line
        self.color_line = (217, 179, 140)
        self.color_rec_line = (255, 0, 0)
        self.thickness_rec_line = 1
        # para
        self.color_para = (194, 255, 102)
        self.color_rec_para = (0, 255, 0)
        self.thickness_rec_para = 2
        # paragroup
        self.color_para_group = (66, 161, 245)
        self.color_rec_para_group = (66, 161, 245)
        self.thickness_rec_para_group = 3
        # other
        self.words = words
        self.width = int((width * 2) * scale_percentage)
        self.height = int((height * 2) * scale_percentage)
        self.img = np.zeros([self.height, self.width, 3], dtype=np.uint8)
        self.img.fill(255)
        # note
        size = cv2.getTextSize("w", self.font, 0.4, self.thickness_text)
        cv2.putText(self.img, "word", (5, 12), self.font, 0.5, self.color_word, self.thickness_text, self.textstyle)
        cv2.putText(self.img, "line", (5, 28), self.font, 0.5, self.color_line, self.thickness_text, self.textstyle)
        cv2.putText(self.img, "paragraph", (5, 44), self.font, 0.5, self.color_para, self.thickness_text,
                    self.textstyle)
        cv2.putText(self.img, "coordinate", (5, 60), self.font, 0.5, self.color_co, self.thickness_text, self.textstyle)
        cv2.rectangle(self.img, (4, 1), (5 + size[0][1] * 4, 13), self.color_rec_word, self.thickness_rec_word)
        cv2.rectangle(self.img, (4, 14), (5 + size[0][1] * 4, 29), self.color_rec_line, self.thickness_rec_line)
        cv2.rectangle(self.img, (4, 30), (5 + size[0][1] * 9, 45), self.color_rec_para, self.thickness_rec_para)
        # show mode 0=showall, 1=showword, 2=showpara
        if show == 0:
            # Display text
            if words is not None:
                for w in words:
                    word = Word(word=w)
                    cv2.putText(self.img, word.text, (int(word.x * self.scale), int(word.y * self.scale)), self.font,
                                0.4, self.color_word, self.thickness_text, self.textstyle)
                    # size = cv2.getTextSize(word.text, self.font, 0.4, self.thickness_text)
                    cv2.rectangle(self.img, (int(word.x * self.scale), int(word.y * self.scale) - (size[0][1] + 2)),
                                  (int(word.x1 * self.scale), int(word.y1 * self.scale) - (size[0][1] + 2)),
                                  self.color_rec_word, self.thickness_rec_word)
                    # cv2.putText(self.img, f"{word.x}", (int(word.x*self.scale), int(word.y*self.scale) + size[0][1] + 2), self.font, 0.3, self.color_co, self.thickness_text, self.textstyle)            

            # Display lines
            if lines is not None:
                for l in lines:
                    line = Word(line=l)
                    # print(word.text)
                    cv2.putText(self.img, line.text, (int(line.x * self.scale), int(line.y * self.scale)), self.font,
                                0.4, self.color_line, self.thickness_text, self.textstyle)
                    # size = cv2.getTextSize(line.text, self.font, 0.4, self.thickness_text)
                    cv2.rectangle(self.img, (int(line.x * self.scale), int(line.y * self.scale) - (size[0][1] + 2)),
                                  (int(line.x1 * self.scale), int(line.y1 * self.scale) - (size[0][1] + 2)),
                                  self.color_rec_line, self.thickness_rec_line)

            # Display para
            if paragraphs is not None:
                for p in paragraphs:
                    para = Word(paragraph=p)
                    # cv2.putText(self.img,para.text, (int(para.x*self.scale), int(para.y*self.scale)), self.font, 0.4, self.color_para, self.thickness_text, self.textstyle)
                    # size = cv2.getTextSize(para.text, self.font, 0.4, self.thickness_text)
                    cv2.rectangle(self.img, (int(para.x * self.scale), int(para.y * self.scale) - (size[0][1] + 2)),
                                  (int(para.x1 * self.scale), int(para.y1 * self.scale) - (size[0][1] + 2)),
                                  self.color_rec_para, self.thickness_rec_para)
                    cv2.putText(self.img, f"({para.x},{para.y})({para.x1},{para.y1})",
                                (int(para.x * self.scale), int(para.y * self.scale) + size[0][1] + 2), self.font, 0.3,
                                self.color_co, self.thickness_text, self.textstyle)

                    # Display para
            if paragraphgroups is not None:
                for pg in paragraphgroups:
                    para = Word(paragraph=pg)
                    # cv2.putText(self.img,para.text, (int(para.x*self.scale), int(para.y*self.scale)), self.font, 0.4, self.color_para, self.thickness_text, self.textstyle)
                    # size = cv2.getTextSize(para.text, self.font, 0.4, self.thickness_text)
                    cv2.rectangle(self.img, (int(para.x * self.scale), int(para.y * self.scale) - (size[0][1] + 2)),
                                  (int(para.x1 * self.scale), int(para.y1 * self.scale) - (size[0][1] + 2)),
                                  self.color_rec_para_group, self.thickness_rec_para_group)
                    cv2.putText(self.img, f"{para.y}, {para.diff_y}, {para.y1},{para.x1 - para.x}",
                                (int(para.x * self.scale), int(para.y * self.scale) - size[0][1] - 8), self.font, 0.3,
                                self.color_word, self.thickness_text, self.textstyle)
        elif show == 1:
            # Display text
            if words is not None:
                for w in words:
                    word = Word(word=w)
                    # print(word.text)
                    cv2.putText(self.img, word.text, (int(word.x * self.scale), int(word.y * self.scale)), self.font,
                                0.4, self.color_word, self.thickness_text, self.textstyle)
                    size = cv2.getTextSize(word.text, self.font, 0.4, self.thickness_text)
                    cv2.rectangle(self.img, (int(word.x * self.scale), int(word.y * self.scale) - (size[0][1] + 2)),
                                  (int(word.x1 * self.scale), int(word.y1 * self.scale) - (size[0][1] + 2)),
                                  self.color_rec_word, self.thickness_rec_word)
                    for point in word.points:
                        point[0] = point[0] * self.scale
                        point[1] = point[1] * self.scale - (size[0][1] + 2)
                    arr = np.array(word.points, np.int32)
                    arr = arr.astype(np.int32, copy=True)
                    arr = arr.reshape((-1, 1, 2))
                    cv2.polylines(self.img, [arr], True, self.color_rec_polylines, self.thickness_rec_word)
                    # cv2.putText(self.img, f"{word.y}", (int(word.x*self.scale), int(word.y*self.scale) + size[0][1] + 2), self.font, 0.3, self.color_co, self.thickness_text, self.textstyle) 
        elif show == 2:
            # Display para
            if paragraphs is not None:
                for p in paragraphs:
                    para = Word(paragraph=p)
                    cv2.putText(self.img, para.text, (int(para.x * self.scale), int(para.y * self.scale)), self.font,
                                0.4, self.color_para, self.thickness_text, self.textstyle)
                    size = cv2.getTextSize(para.text, self.font, 0.4, self.thickness_text)
                    cv2.rectangle(self.img, (int(para.x * self.scale), int(para.y * self.scale) - (size[0][1] + 2)),
                                  (int(para.x1 * self.scale), int(para.y1 * self.scale) - (size[0][1] + 2)),
                                  self.color_rec_para, self.thickness_rec_para)
                    # cv2.putText(self.img, f"{para.x}", (int(para.x*self.scale), int(para.y*self.scale) + size[0][1] + 2), self.font, 0.3, self.color_co, self.thickness_text, self.textstyle)
        elif show == 3:
            # Display para
            if subparagraphs is not None:
                for sp in subparagraphs:
                    for p in sp.graphs:
                        para = Word(paragraph=p)
                        # cv2.putText(self.img,para.text, (int(para.x*self.scale), int(para.y*self.scale)), self.font, 0.4, self.color_para, self.thickness_text, self.textstyle)
                        size = cv2.getTextSize(para.text, self.font, 0.4, self.thickness_text)
                        cv2.rectangle(self.img, (int(para.x * self.scale), int(para.y * self.scale) - (size[0][1] + 2)),
                                      (int(para.x1 * self.scale), int(para.y1 * self.scale) - (size[0][1] + 2)),
                                      self.color_rec_para, self.thickness_rec_para)
                        # cv2.putText(self.img, f"{para.x}", (int(para.x*self.scale), int(para.y*self.scale) + size[0][1] + 2), self.font, 0.3, self.color_co, self.thickness_text, self.textstyle)
                        for l in p.lines:
                            line = Word(paragraph=l)
                            cv2.putText(self.img, line.text, (int(line.x * self.scale), int(line.y * self.scale)),
                                        self.font, 0.4, self.color_line, self.thickness_text, self.textstyle)
                            size = cv2.getTextSize(line.text, self.font, 0.4, self.thickness_text)
                            cv2.rectangle(self.img,
                                          (int(line.x * self.scale), int(line.y * self.scale) - (size[0][1] + 2)),
                                          (int(line.x1 * self.scale), int(line.y1 * self.scale) - (size[0][1] + 2)),
                                          self.color_rec_line, self.thickness_rec_line)
                            # cv2.putText(self.img, f"{line.x}", (int(line.x*self.scale), int(line.y*self.scale) + size[0][1] + 2), self.font, 0.3, self.color_co, self.thickness_text, self.textstyle)
        elif show == 4:
            # Display text
            if lines is not None:
                for l in lines:
                    line = Word(line=l)
                    # print(word.text)
                    cv2.putText(self.img, line.text, (int(line.x * self.scale), int(line.y * self.scale)), self.font,
                                0.4, self.color_line, self.thickness_text, self.textstyle)
                    size = cv2.getTextSize(line.text, self.font, 0.4, self.thickness_text)
                    cv2.rectangle(self.img, (int(line.x * self.scale), int(line.y * self.scale) - (size[0][1] + 2)),
                                  (int(line.x1 * self.scale), int(line.y1 * self.scale) - (size[0][1] + 2)),
                                  self.color_rec_line, self.thickness_rec_line)
                    # for point in line.points:
                    #     point[0] = point[0]*self.scale
                    #     point[1] = point[1]*self.scale - (size[0][1] + 2)
                    # arr = np.array(line.points, np.int32)                    
                    # arr = arr.astype(np.int32, copy=True)
                    # arr = arr.reshape((-1,1,2))
                    # cv2.polylines(self.img, [arr], True, self.color_rec_polylines, self.thickness_rec_line)
                    # cv2.putText(self.img, f"{line.y}", (int(line.x*self.scale), int(line.y*self.scale) + size[0][1] + 2), self.font, 0.3, self.color_co, self.thickness_text, self.textstyle) 

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


def preview_invoice_with_extract_doc(id_document: int, doc: Document, show=0, path_save=None, view=False):
    TextOnImage(doc.width, doc.height, lines=doc.lines,
                paragraphs=doc.paragraphs,
                paragraphgroups=doc.paragraph_groups,
                show=show, path_save=path_save, view_image=view)


def preview_invoice(id_document, json_ocr, show=0, path_save=None, view=False):
    # Read textAnnotations
    ocr_data = json.loads(json_ocr)
    list_of_words = ocr_data['text_annotations']
    first_word = Word(list_of_words[0])
    width = int(first_word.x1 * 0.5) + 20
    height = int(first_word.y1 * 0.5) + 20
    doc = Document(id_document, ocr_data)
    # doc.paragraphs.sort(key=lambda p: p.y)
    TextOnImage(width, height, lines=doc.lines,
                paragraphs=doc.paragraphs,
                paragraphgroups=doc.paragraph_groups,
                show=show, path_save=path_save, view_image=view)


if __name__ == '__main__':

    # read database > get json and draw attribute
    # id_document = 152
    # ocr_json = server_connection.get_ocr_json_with_scan_id(id_document)
    # path_image_save = "test/data/db_json/inv_" + str(id_document) + "_{}.jpg"
    # path_json_save = "test/data/db_json/inv_" + str(id_document) + ".json"
    # count = 1
    # # Write image
    # for data in ocr_json:
    #     preview_invoice(data['OCRJson'], show=0, path_save=path_image_save.format(count))
    #     count += 1
    #
    # if not os.path.isfile(path_json_save):
    #     with open(path_json_save, 'w+') as outfile:
    #         outfile.write(json.dumps(ocr_json))
    #         outfile.close()
    #         print("Write successfully")
    # else:
    #     print("File is existed")
    id_document = 152
    path_image_save = "../test/data/db_json/inv_" + str(id_document) + "_{}.jpg"
    path_json_save = "../test/data/db_json/inv_" + str(id_document) + ".json"
    if not os.path.isfile(path_json_save):
        ocr_json = sc.get_ocr_json_with_scan_id(id_document)
        if ocr_json is None:
            print("Error")
            sys.exit()
        count = 1
        # Write image
        for data in ocr_json:
            print(data)
            preview_invoice(id_document, data['OCRJson'], show=0, path_save=path_image_save.format(count), view=False)
            count += 1
            # Write json
            with open(path_json_save, 'w+') as outfile:
                outfile.write(json.dumps(ocr_json))
                outfile.close()
                print("Write successfully")
    else:
        print("File is existed")
