import ast
import datetime
import json
import logging
import os
import threading
import shutil

import requests as rq
from flask import Blueprint, make_response, jsonify, request
from flask_restplus import Api, Resource, fields
from flask_api import status

from common import init_config
from common.config import config
from controllers.extract.image_controller import process_by_google_vision
from controllers.extract.invoice_extract_controller import ExtractInvoice
from controllers.extract.image_controller import process_by_google_vision_with_buffer
from controllers.extract.image_controller import deskew_image

from PIL import Image

blueprint = Blueprint('OCRManuallyRoute', __name__)
api = Api(blueprint)

init_config()


@api.route('/manually')
class OCRManuallyService(Resource):
    url_unique_service = config["unique_service"]["url"]
    invoice_keywords = config["unique_service"]["invoice_keywords"]
    url_sync_ES = config["api_sync_es"]["url"]
    api_save_doc_invoice = config["api_save_doc_invoice"]["url"]
    angle_skip = config["deskew"]["angle_skip"]
    api_update_image_after_deskew = config["deskew"]["url"]

    logger = logging.getLogger('sLogger')

    def post(self):
        self.logger.debug('Start execute request OCR manually: ')
        data = request.get_json()
        self.logger.debug(data)

        if data is None:
            return make_response(jsonify(message='No body data', error='No Data'), status.HTTP_400_BAD_REQUEST)
        if (data['OcrDocs'] is None):
            return make_response(jsonify(message='Failed. No OCR Id', error='No Data'), status.HTTP_400_BAD_REQUEST)

        result_ocrs = []
        IdDocumentContainerScanss = []
        for doc in data['OcrDocs']:
            _ocr_id = doc['OcrId']
            rotate_angle_temp = doc['Rotate']

            if(type(rotate_angle_temp) is str):
                rotate_angle = -(int(rotate_angle_temp))
            else:
                rotate_angle = -(rotate_angle_temp)

            result_run = self.extract_data_of_documment(
                self.url_unique_service, self.invoice_keywords, self.url_sync_ES, self.api_save_doc_invoice, str(_ocr_id), rotate_angle)
            result_ocrs.append(result_run)
            if (rotate_angle != 0):
                IdDocumentContainerScanss.append(
                    doc['IdDocumentContainerScans'])

        if(len(IdDocumentContainerScanss) > 0):
            try:
                self.request_update_image_deskew(
                    self.api_update_image_after_deskew, IdDocumentContainerScanss)
            except Exception as err_update:
                self.logger.error('error when call update images after deskew')
                self.logger.error(IdDocumentContainerScanss)
                self.logger.exception(err_update)

        return {'Message': result_ocrs}

    def request_update_image_deskew(self, _api_update_image_after_deskew, IdDocumentContainerScanss):
        # {"Files":["\\\\file.xena.local\\MyDMS\\XenaScan\\lamhn_xena\\20190918-131950.410_Order.tiff.1.png"]
        self.logger.debug('Start call deskew image: ')
        self.logger.debug(IdDocumentContainerScanss)
        arr = IdDocumentContainerScanss

        body_request = {'IdDocumentContainerScans': ''}
        body_request['IdDocumentContainerScans'] = arr
        print(body_request)
        response = rq.post(_api_update_image_after_deskew, json=body_request, headers={
            'Content-Type': 'application/json', 'Connection': 'close'})
        print('response request_update_image_deskew: ' + repr(response))
        return response

    def extract_data_of_documment(self, _url_unique_service, _invoice_keywords, _url_sync_ES, _api_save_doc_invoice, _ocr_id, rotate_angle):
        print(datetime.datetime.now().time(),
              ' extract_data_of_documment ocr_id: ' + _ocr_id)
        result_ocr = {'OcrId': _ocr_id, 'Status': 'DONE'}

        try:
            doc_arr = self.get_document_to_ocr(_url_unique_service, _ocr_id)
            if (doc_arr is None):
                result_ocr['Status'] = 'Error: ' + \
                    'Not found document from DB.'
                return result_ocr
            else:
                for docs in doc_arr:
                    image_changed_angle = False
                    image_rotate = ''
                    if (docs['PathFolder'] is None or docs['FileName'] is None):
                        print('Path of Image not found from DB.')
                        result_ocr['Status'] = 'Error: ' + \
                            'Path of Image not found from DB.'
                        return result_ocr

                    img_name = str(docs['FileName'])
                    original_path = str(docs['PathFolder']) + '\\' + img_name
                    # rotate image
                    if (rotate_angle != 0):
                        img_name = self.rotate_image(
                            str(docs['PathFolder']), img_name, rotate_angle)
                        if (img_name.startswith('Error:')):
                            result_ocr['Status'] = img_name
                            return result_ocr
                        else:
                            image_changed_angle = True
                            image_rotate = str(
                                docs['PathFolder']) + '\\' + img_name

                    print('img_name after rotate_image: ' + img_name)
                    full_path = str(docs['PathFolder']) + '\\' + img_name
                    print('full_path after rotate_image: ' + full_path)
                    # print(full_path)
                    if (os.path.exists(full_path)):
                        data_ocr = process_by_google_vision(full_path)
                        ocr_text = ''

                        if 'full_text_annotation' in data_ocr:
                            if 'text' in data_ocr['full_text_annotation']:
                                ocr_text = data_ocr['full_text_annotation']['text']

                        if ocr_text is None or len(ocr_text) == 0:
                            if 'text_annotations' in data_ocr:
                                try:
                                    text_arr = data_ocr['text_annotations'][0]['description']
                                    ocr_text = text_arr
                                except Exception as err_parse:
                                    ocr_text = ''
                                    try:
                                        self.logger.exception(err_parse)
                                    except Exception as identifier:
                                        print(identifier)

                        try:
                            data_ocr["full_text_annotation"]["text"] = "<br />".join(
                                data_ocr["full_text_annotation"]["text"].split("\n"))
                            data_ocr["full_text_annotation"]["text"] = data_ocr["full_text_annotation"]["text"].replace(
                                '\\', '\\\\')
                            data_ocr["full_text_annotation"]["text"] = data_ocr["full_text_annotation"]["text"].replace(
                                '"', '')

                            len_text_anno = len(data_ocr["text_annotations"])
                            print('Length of Array Text-Annotation: ' +
                                  str(len_text_anno))
                            for i in range(len_text_anno):
                                data_ocr["text_annotations"][i]["description"] = "<br />".join(
                                    data_ocr["text_annotations"][i]["description"].split("\n"))
                                data_ocr["text_annotations"][i]["description"] = data_ocr["text_annotations"][i]["description"].replace(
                                    '"', '')
                                data_ocr["text_annotations"][i]["description"] = "\\\\".join(
                                    data_ocr["text_annotations"][i]["description"].split("\\"))

                            len_page = len(
                                data_ocr["full_text_annotation"]["pages"])
                            for p in range(len_page):
                                len_block = len(
                                    data_ocr["full_text_annotation"]["pages"][p]["blocks"])
                                for b in range(len_block):
                                    len_para = len(
                                        data_ocr["full_text_annotation"]["pages"][p]["blocks"][b]["paragraphs"])
                                    for pa in range(len_para):
                                        len_words = len(
                                            data_ocr["full_text_annotation"]["pages"][p]["blocks"][b]["paragraphs"][pa]["words"])
                                        for w in range(len_words):
                                            len_symbols = len(
                                                data_ocr["full_text_annotation"]["pages"][p]["blocks"][b]["paragraphs"][pa]["words"][w]["symbols"])
                                            for sb in range(len_symbols):
                                                txt_local = data_ocr["full_text_annotation"]["pages"][p]["blocks"][
                                                    b]["paragraphs"][pa]["words"][w]["symbols"][sb]["text"]
                                                if (txt_local is not None):
                                                    txt_local = txt_local.replace(
                                                        '"', '')
                                                    txt_local = "\\\\".join(
                                                        txt_local.split("\\"))
                                                    data_ocr["full_text_annotation"]["pages"][p]["blocks"][b][
                                                        "paragraphs"][pa]["words"][w]["symbols"][sb]["text"] = txt_local

                            # full_text_annotation    pages[] blocks[] paragraphs[] words[] symbols[] text

                        except Exception as err_parse:
                            data_ocr = ''

                        if (data_ocr is not None):
                            try:
                                data_ocr = self.check_confidence_value(
                                    self, data_ocr)
                            except Exception as err_parse:
                                print('error check_confidence_value')
                                print(err_parse)

                        docs['OCRJson'] = data_ocr

                        if ocr_text is None or len(ocr_text) == 0:
                            docs['OCRText'] = ''
                        else:
                            docs['OCRText'] = "<br />".join(
                                ocr_text.split("\n"))
                            docs['OCRText'] = docs['OCRText'].replace(
                                '\\', '\\\\')
                            docs['OCRText'] = docs['OCRText'].replace('"', '')

                        del docs['PathFolder']

                        docs['IdRepDocumentContainerOcrType'] = '1'

                        docs['IsActive'] = '1'

                        docs['IdRepDocumentType'] = '2'
                        # if (docs['IdRepDocumentType'] is not None):
                        #     del docs['IdRepDocumentType']
                        invoice_kws = _invoice_keywords.split(",")
                        for kw in invoice_kws:
                            if kw in docs['OCRText'] or kw.upper() in docs['OCRText']:
                                docs['IdRepDocumentType'] = '1'

                        # pagenr = str(docs['FileName'])
                        # try:
                        #     pagenr = (pagenr[0:pagenr.rfind('.')])
                        #     pagenr = pagenr[pagenr.rfind('.')+1:]
                        # except Exception as err_parse_page:
                        #     pagenr = '1'

                        #docs['PageNr'] = pagenr
                        docs['GUID'] = docs['FileName']

                        del docs['FileName']

                        # logger.warning('data OCR: %s', docs)
                        idDocOcr = '1'
                        try:
                            responsesavedata = self.save_data_ocr(
                                _url_unique_service, docs)

                            data_obj = json.loads(responsesavedata.text)
                            data_res = data_obj["Data"]
                            # print(type(data_res))
                            result_obj = json.loads(data_res)
                            # print(result_obj)
                            print(result_obj[0][0]["ReturnID"])
                            # print(type(result_obj[0][0]["ReturnID"]))

                            idDocOcrs = result_obj[0][0]["ReturnID"]

                            idDocOcr = str(idDocOcrs)
                        except Exception as err_save:
                            # raise err_save
                            result_ocr['Status'] = 'Error: ' + str(err_save)
                            self.logger.error(docs)
                            self.logger.exception(err_save)

                        try:
                            if (len(docs['OCRJson']) > 0 and docs['IdRepDocumentType'] == '1' and len(idDocOcr) > 0):
                                # if (len(idDocOcr) > 0):
                                print('Start ExtractInvoice')
                                print(
                                    '----------------------------------------------------------------------------------------------------------------------')
                                print(len(docs['OCRJson']))
                                response_extract = ExtractInvoice.extract_invoice(
                                    idDocOcr, docs['OCRJson'])
                                print('response_extract')
                                print(response_extract)
                                # self.request_save_data_invoice(
                                #     _api_save_doc_invoice, response_extract)

                        except Exception as err_extract:
                            print('err_extract :')
                            print(err_extract)
                            self.logger.error(docs['OCRJson'])
                            self.logger.exception(err_extract)

                        # Update Image after OCR
                        try:
                            print(
                                'original_path before call update_image_file: ' + original_path)
                            print(
                                'image_rotate before call update_image_file: ' + image_rotate)
                            if image_changed_angle:
                                self.update_image_file(
                                    original_path, image_rotate)
                        except Exception as err_change_img:
                            print('err_change_img :' + image_rotate)
                            print('original_path :' + original_path)
                            print(err_change_img)

                    else:
                        print('Path Image not EXIST :' + full_path)

        except Exception as err:
            result_ocr['Status'] = 'Error: ' + str(err)
        return result_ocr

    def rotate_image(self, image_path, image_name, rotate_angle):
        name_not_extension = os.path.splitext(image_name)[0]
        extension_img = os.path.splitext(image_name)[1]
        save_to_img_name = name_not_extension + \
            '.' + str(rotate_angle) + '_' + \
            datetime.datetime.now().strftime('%H%M%S') + extension_img
        print('save_to_img_name (rotate_image): ' + save_to_img_name)
        try:
            im = Image.open(image_path + '\\' + image_name)
            if (type(rotate_angle) == int):
                im = im.rotate(rotate_angle, None, 1)
            else:
                im = im.rotate(int(rotate_angle), None, 1)
            im.save(image_path + '\\' + save_to_img_name,
                    optimize=True, quality=95)
            try:
                im.close()
            except Exception as err_close:
                print('error close image rotated after save ')
                print(err_close)
        except Exception as err:
            self.logger.error('rotate_image image_path: ' +
                              image_path + '  image_name : ' + image_name)
            self.logger.exception(err)
            return 'Error: (RotateImage) ' + str(err)

        return save_to_img_name

    def get_document_to_ocr(self, _url_unique_service, _ocr_id):
        print('start get doc')
        object_ocr_id = '"' + _ocr_id + '"'
        data = {
            "Request":
                {
                    "ModuleName"	: "GlobalModule",
                    "ServiceName"	: "GlobalService",
                    "Data":
                    {
                        '''"MethodName"'''	: '''"SpB06GetDocumentContainer"''',
                        '''"CrudType"'''		: '''"Read"''',
                        '''"Object"''': '''"DocumentContainerScansForFileByIdDocumentContainerOcr"''',
                        '''"AppModus"''': '''"0"''',
                        '''"IdLogin'"''': '''"1"''',
                        '''"LoginLanguage"''': '''"1"''',
                        '''"IdApplicationOwner"''': '''"1"''',
                        '''"GUID"''': '''"value"''',
                        '''"IdDocumentContainerFileType"''': '''"4"''',
                        '''"IdDocumentContainerOCR"''': object_ocr_id,
                        '''"TopRows"''': '''"10"'''
                    }
                }
        }

        print(data)
        response = rq.post(_url_unique_service, json=data, headers={
            'Content-Type': 'application/json', 'Connection': 'close'})

        docs = None
        if ('Data' in (response.json())):
            data_record = (response.json()['Data'])
            if(data_record is not None):
                records = ast.literal_eval(data_record)
                if(len(records) > 0 and len(records[0]) > 0):
                    docs = records[0]

        return docs

    def save_data_ocr(self, _url_unique_service, data_ocr):
        data_str = json.dumps(data_ocr).replace('"', '\\\"')
        js_doc = {
            '\\\"DocumentContainerOCR\\\"': [data_str]
        }

        data = {
            "Request":
                {
                    "ModuleName"	: "GlobalModule",
                    "ServiceName"	: "GlobalService",
                    "Data":
                    {
                        '''"MethodName"'''	: '''"SpB06CallDocumentContainer"''',
                        '''"Object"''': '''"DocumentContainerOCR"''',
                        '''"AppModus"''': '''"0"''',
                        '''"IdLogin"''': '''"1"''',
                        '''"LoginLanguage"''': '''"1"''',
                        '''"IdApplicationOwner"''': '''"1"''',
                        '''"GUID"''': '''"421a143a-d2de-4dfe-8752-5b5dfda84ecc"''',
                        '''"JSONDocumentContainerOCR"''': js_doc
                    }
                }
        }
        # json.dumps
        print('execute save_data_ocr ')
        # print(data)
        # logger.warning('data OCR: %s', data)
        response = rq.post(_url_unique_service, json=data, headers={
            'Content-Type': 'application/json', 'Connection': 'close'})
        print('response SAVE: ' + repr(response))
        return response

    def request_es_for_document(self, _url_sync_ES, idDocOcr):
        print('start sync ES ' + idDocOcr)
        # /ElasticSync/SyncDocOCR?idDocOcr=5235
        url_sync_ES_full = _url_sync_ES + '=' + idDocOcr

        response = rq.get(url_sync_ES_full)

        return response

    def request_save_data_invoice(self, _api_save_doc_invoice, data):
        # print(data)
        #     _api_save_doc_invoice = "http://orderprocessing.xena.local/api/DocumentContainer/SaveDocumentContainerProcessed"
        #     data = [
        # {"IdDocumentContainerOcr": "85",
        #  "JsonDocumentModules": "{\"GrossAmount\": null, \"Amount\": null, \"Discount\": null, \"Discount%\": null, \"Currency\": null, \"InvoiceDate\": \"26.05.2017\", \"Street\": \"Seestrasse\", \"StreetNr\": \"1\", \"StreetAddition1\": null, \"StreetAddition2\": null, \"StreetAddition3\": null, \"PoBox\": null, \"Zip\": \"8000\", \"Zip2\": null, \"Place\": \"Z\\u00fcrich\", \"Area\": null, \"ArticleNr\": null, \"ArticleName\": null, \"ArticlePrice\": null, \"ArticleQty\": null, \"CommType\": null, \"CommValue\": null, \"CommNotes\": null, \"Company\": \"Garax AG\", \"FirstName\": \"Anzahl\", \"LastName\": \"Einheit\", \"Title\": null, \"Middlename\": null, \"NameAdditiion\": null}",
        #  "IsActive": "true"}
        #     ]
        response = rq.post(_api_save_doc_invoice, json=data, headers={
                           'Content-Type': 'application/json', 'Connection': 'close'})
        print('response request_save_data_invoice: ' + repr(response))
        return response

    def detect_labels_local(self):
        """Detects labels in the file."""
        from google.cloud import vision
        import io
        client = vision.ImageAnnotatorClient()

        path = 'D:/tmp/DMS/4.png'
        with io.open(path, 'rb') as image_file:
            content = image_file.read()

        image = vision.types.Image(content=content)

        response = client.label_detection(image=image)
        labels = response.label_annotations
        print('Labels:')

        for label in labels:
            print(label.description)

    def detect_labels_uri(self):
        """Detects labels in the file located in Google Cloud Storage or on the Web."""
        from google.cloud import vision
        client = vision.ImageAnnotatorClient()
        image = vision.types.Image()
        image.source.image_uri = 'https://www.digital-invoice-template.com/wp-content/themes/digitalsisco/dist/img/invoices/invoice-freshbooks-default.jpg'

        response = client.label_detection(image=image)
        labels = response.label_annotations
        print('Labels:')
        print(labels)

        for label in labels:
            print(label.description)

    def detect_logos(self):
        """Detects logos in the file."""
        from google.cloud import vision
        import io
        client = vision.ImageAnnotatorClient()

        # with io.open(path, 'rb') as image_file:
        #     content = image_file.read()

        # image = vision.types.Image(content=content)

        image = vision.types.Image()
        image.source.image_uri = 'https://www.digital-invoice-template.com/wp-content/themes/digitalsisco/dist/img/invoices/invoice-freshbooks-default.jpg'

        response = client.logo_detection(image=image)
        logos = response.logo_annotations
        print('Logos:')

        for logo in logos:
            print(logo.description)

    def save_data_invoice(self, _url_unique_service, data_ocr):
        #  v = {}
        # dt = self.save_data_invoice(self.url_unique_service, v)
        # return dt
        # data_ocr = json.dumps({
        #     'Invoice': {
        #         '''Collaborator''': '''123''',
        #         '''IdPersonBank''': '''1'''	,
        #         '''IdPersonRemitter''': '''1''',
        #         '''IdRepCurrencyCode''': '''1''',
        #         '''IdDocumentTree''': '''2''',
        #         '''IdPersonBeneficiary''': '''1''',
        #         '''IdDocumentContainerScans''': '''2''',
        #         '''IsGuarantee''': '''true''', '''IsActive''': '''true'''
        #     }
        # }).replace('"', '\\\"')

        data_ocr = json.dumps({
            "Invoice": {
                "Collaborator": "123",
                "IdPersonBank": "1"	,
                "IdPersonRemitter": "1",
                "IdRepCurrencyCode": "1",
                "IdDocumentTree": "2",
                "IdPersonBeneficiary": "1",
                "IdDocumentContainerScans": "2",
                "IsGuarantee": "true",
                "IsActive": "true"
            }
        }).replace('"', '\\\\\\"')

        print(data_ocr)
        data_tax = None

        data_fields = None

        # data_str = json.dumps(data_ocr).replace('"', '\\\"')
        # js_doc = {
        #     '\\\"DocumentContainerOCR\\\"': [data_str]
        # }

        data = {
            "Request":
                {
                    "ModuleName"	: "GlobalModule",
                    "ServiceName"	: "GlobalService",
                    "Data":
                    {
                        '''"MethodName"'''	: '''"SpCallInvoice"''',
                        '''"CrudType"'''	: '''"Create"''',
                        '''"Object"''': '''"Invoice"''',
                        '''"AppModus"''': '''"0"''',
                        '''"IdLogin"''': '''"1"''',
                        '''"LoginLanguage"''': '''"1"''',
                        '''"IdApplicationOwner"''': '''"1"''',
                        '''"GUID"''': '''"421a143a-d2de-4dfe-8752-5b5dfda84ecc"''',
                        '''"JSONInvoice"''': data_ocr,
                        '''"JSONTaxAmount"''': data_tax,
                        '''"JSONDynamicFieldsInvoice"''': data_fields
                    }
                }
        }
        # json.dumps
        print('execute save_data_invoice ')
        # print(data)
        # logger.warning('data OCR: %s', data)
        response = rq.post(_url_unique_service, json=data, headers={
            'Content-Type': 'application/json', 'Connection': 'close'})
        print('response SAVE: ' + repr(response))
        return response

    def update_image_file(self, old_file, rotated_file):
        try:
            extension_img = os.path.splitext(old_file)[1]
            name_not_extension = os.path.splitext(old_file)[0]

            bk_path = name_not_extension + '_bk_' + \
                datetime.datetime.now().strftime('%H%M%S') + extension_img
            # print('bk_path: ' + bk_path)
            # try:
            #     os.rename(old_file, bk_path)
            # except Exception as err_rename:
            #     print(err_rename)

            try:
                #shutil.copy(old_file, bk_path)
                os.remove(old_file)
            except Exception as err2:
                print(err2)
                self.logger.error('old_file: ' + old_file +
                                  '  bk_path img: ' + bk_path)
                self.logger.exception(err2)
            shutil.copy(rotated_file, old_file)
            os.remove(rotated_file)
        except Exception as err_update_image:
            print('update_image_file: ' + old_file +
                  '  rotate img: ' + rotated_file)
            print(err_update_image)
            try:
                self.logger.error('update_image_file: ' +
                                  old_file + '  rotate img: ' + rotated_file)
                self.logger.exception(err_update_image)
            except Exception as identifier:
                print(identifier)

    def check_confidence_value(self, data_ocr):
        v = '"' + (str(data_ocr)) + '"'
        v = v.replace("\"confidence\": .", "\"confidence\": 0.")
        decoded = json.loads(v)
        return decoded

    def _testing(self):
        js_temp = {
            'a': 'aa  ddd',
            'b': 5,
            'cin': .99
        }
        v = '"' + (str(js_temp)) + '"'
        v = v.replace(".99", "0.99")
        decoded = json.loads(v)
        print(decoded)
        # return
        # self.detect_labels_local()
        # data = '\\asdadb\asd.png'
        # body_request = {'Files':[data]}
        # print(body_request)
        # return
        print('starting')
        full_path = '\\\\file.xena.local\\MyDMS\\XenaScan\\rfi_xena\\dk.png'
        temp_file = full_path + '.bk.png'
        # os.rename(full_path, temp_file)
        os.remove(temp_file)
        return
        img_path = '\\\\file.xena.local\\MyDMS\\XenaScan\\rfi_xena\\deskew.tiff.1.png'
        print(img_path)
        respone_d = self.request_update_image_deskew(
            self.api_update_image_after_deskew, img_path)
        print(respone_d)
        return respone_d
