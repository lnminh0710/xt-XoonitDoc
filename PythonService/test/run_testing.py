import os
import json
import requests as rq
import ast

from utils.invoice_processing import Document
import utils.server_connection as sc
import utils.draw_image as draw_image


def run_with_json_ocr(file_name=None):
    if file_name is None:
        return

    path_json_ocr = "json_ocr/local_json/{}.json".format(file_name)
    if os.path.isfile(path_json_ocr):
        with open(path_json_ocr, 'r') as outfile:
            ocr_json = outfile.read()
            outfile.close()
            print("Read successfully")
    else:
        print("File is not existed")
    # draw_image.preview_invoice(ocr_json)
    return None, ocr_json


def run_with_db(id_document=None):
    if id_document is None:
        print("Please input argument!")
        return
    path_json_save = "data/db_json/inv_" + str(id_document) + ".json"
    path_image_save = "data/db_json/inv_" + str(id_document) + "_{}.jpg"
    if not os.path.isfile(path_json_save):
        ocr_json = sc.get_ocr_json_with_scan_id(id_document)
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

    return ocr_json[0]['IdDocumentContainerOcr'], ocr_json[0]['OCRJson']


if __name__ == "__main__":
    # id_document_container_ocr, ocr_json = run_with_json_ocr('inv_water')
    id_document_scan = 152
    id_document_container_ocr, ocr_json = run_with_db(id_document_scan)

    # for page in ocr_json:
    ocr_data = json.loads(ocr_json)

    doc = Document(id_document_container_ocr, ocr_data)
    data_res = doc.extract_inv()

    path_image_save = "data/db_json/inv_" + str(id_document_scan) + ".jpg"
    draw_image.preview_invoice_with_extract_doc(id_document=id_document_container_ocr,
                                                path_save=path_image_save,
                                                # view=True,
                                                doc=doc, show=0, )

    json_document = json.loads(data_res[0]['JsonDocumentModules'])
    print(data_res)

    # json_response = [{"IdDocumentContainerOcr": id_document_container_ocr,
    #                   "JsonDocumentModules": doc.get_json_response(),
    #                   "IsActive": True}]
    # print(json_response)
    #
    # sc.request_save_data_invoice(json_response)
