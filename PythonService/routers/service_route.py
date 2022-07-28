import ast
import datetime
import json
import logging
import os
import threading

import requests as rq
from apscheduler.schedulers.background import BackgroundScheduler
from flask import Blueprint, request
from flask_restplus import Api, Resource, fields

from common import init_config
from common.config import config
from controllers.extract.image_controller import process_by_google_vision
from controllers.extract.invoice_extract_controller import ExtractInvoice
from controllers.extract.image_controller import process_by_google_vision_with_buffer
from controllers.extract.image_controller import deskew_image

blueprint = Blueprint('ServiceRoute', __name__)
api = Api(blueprint)

init_config()


# logging.basicConfig(filename='ocr_data.log', level=logging.DEBUG)
# logger = logging.getLogger('tcpserver')
# logger.warning('data OCR: %s', {'asda': 'vavvva'})


@api.route('/autoservice')
class AutoService(Resource):
    is_running = False
    scheduler = BackgroundScheduler()
    job = None
    thread_run_scheduler = None
    url_unique_service = config["unique_service"]["url"]
    invoice_keywords = config["unique_service"]["invoice_keywords"]
    url_sync_ES = config["api_sync_es"]["url"]
    api_save_doc_invoice = config["api_save_doc_invoice"]["url"]
    angle_skip = config["deskew"]["angle_skip"]
    api_update_image_after_deskew = config["deskew"]["url"]

    logger = logging.getLogger('sLogger')
    # def __init__(self):
    #     status_action = self.start_service()
    #     print(status_action)

    def post(self):

        data = request.args
        if self.is_running is None:
            self.is_running = False

        status_action = 'no action'

        if (data.get('action') == 'start'):
            status_action = self.start_service()
        elif (data.get('action') == 'stop'):
            status_action = self.stop_service()

        return {'Message': status_action}

    def start_service(self):
        if self.scheduler.get_job('extract_doc') is not None:
            return 'Service is Running'

        self.init_job()

        return 'Service is started'

    def init_job(self):
        self.logger.debug(' init_job  ' + self.url_unique_service)

        try:
            self.start_service_extract()
        except Exception as err:
            self.logger.error(err)
            raise err

        try:
            self.scheduler.add_job(
                self.start_service_extract, 'cron', minute='*', id='extract_doc')
            if(self.scheduler.state != 1):
                # Start the scheduler
                self.scheduler.start()
        except Exception as err:
            self.logger.error(err)

        return

    def stop_service(self):
        self.logger.debug(' (stop_service) STATE Job   ', self.scheduler.state)
        # if(self.scheduler.state == 1):
        self.is_running = False
        try:
            if self.scheduler.get_job('extract_doc') is not None:
                try:
                    self.scheduler.remove_job('extract_doc')
                except Exception as err:
                    self.logger.error(err)
            else:
                return 'Service is not running'
        except Exception as err:
            self.logger.error(err)

        return 'Service is stopped'

    def start_service_extract(self):
        if self.is_running == True:
            return
        self.is_running = True
        self.extract_data_of_documment(
            self.url_unique_service, self.invoice_keywords, self.url_sync_ES, self.api_save_doc_invoice)

    def extract_data_of_documment(self, _url_unique_service, _invoice_keywords, _url_sync_ES, _api_save_doc_invoice):
        self.logger.debug(' extract_data_of_documment: ' + _url_unique_service)
        try:
            doc_arr = self.get_document_to_ocr(_url_unique_service)
            if (doc_arr is None):
                self.logger.debug('No data ready to OCR')
                self.is_running = False
                return
            else:
                for docs in doc_arr:
                    if self.is_running == False:
                        break
                    if (docs['PathFolder'] is None or docs['FileName'] is None):
                        self.logger.debug('Path of Image not found from DB.')
                        self.logger.debug(docs)
                        continue
                    full_path = str(docs['PathFolder']) + \
                        '\\' + str(docs['FileName'])
                    # self.logger.debug(full_path)
                    if (os.path.exists(full_path)):
                        # full_path = 'D:\\Xoontec\\Test\\XenaScan\\invoice.png'
                        try:
                            with open(full_path, 'rb') as image_file:
                                content = image_file.read()
                        except Exception as err_parse:
                            self.logger.error(err_parse)

                        imgbuff = None
                        try:
                            imgbuff = deskew_image(
                                content, str(docs['FileName']), self.angle_skip)
                        except Exception as err_parse:
                            self.logger.error(err_parse)

                        try:
                            if imgbuff is None:
                                imgbuff = content
                            else:
                                # Call API create TIFF - PDF files when Image changed
                                try:
                                    self.update_image_file(full_path, imgbuff)
                                    respone_d = self.request_update_image_deskew(
                                        self.api_update_image_after_deskew, full_path)
                                except Exception as err_update_image:
                                    self.logger.error(
                                        'err_update_image: ' + full_path)
                                    self.logger.error(err_update_image)

                            if content is None:
                                data_ocr = process_by_google_vision(full_path)
                            else:
                                data_ocr = process_by_google_vision_with_buffer(
                                    imgbuff)
                        except Exception as err_parse:
                            self.logger.error(err_parse)

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
                                    self.logger.error(err_parse)
                                    ocr_text = ''
                                    # raise err_parse
                        try:
                            data_ocr["full_text_annotation"]["text"] = "<br />".join(
                                data_ocr["full_text_annotation"]["text"].split("\n"))
                            data_ocr["full_text_annotation"]["text"] = data_ocr["full_text_annotation"]["text"].replace(
                                '\\', '\\\\')
                            data_ocr["full_text_annotation"]["text"] = data_ocr["full_text_annotation"]["text"].replace(
                                '"', '')

                            len_text_anno = len(data_ocr["text_annotations"])
                            # print('Length of Array Text-Annotation: ' +
                            #       str(len_text_anno))
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
                            self.logger.error(err_parse)
                            data_ocr = ''
                            # print(err_parse)
                        if (data_ocr is not None):
                            try:
                                data_ocr = self.check_confidence_value(
                                    data_ocr)
                            except Exception as err_parse:
                                self.logger.error(
                                    'error check_confidence_value')
                                self.logger.error(err_parse)

                        docs['OCRJson'] = data_ocr

                        if ocr_text is None or len(ocr_text) == 0:
                            docs['OCRText'] = ''
                        else:
                            docs['OCRText'] = "<br />".join(
                                ocr_text.split("\n"))
                            docs['OCRText'] = docs['OCRText'].replace(
                                '\\', '\\\\')
                            docs['OCRText'] = docs['OCRText'].replace('"', '')

                        if 'IdDocumentContainerOcr' in docs:
                            del docs['IdDocumentContainerOcr']

                        del docs['PathFolder']

                        docs['IdRepDocumentContainerOcrType'] = '1'

                        docs['IsActive'] = '1'

                        docs['IdRepDocumentType'] = '2'
                        invoice_kws = _invoice_keywords.split(",")
                        for kw in invoice_kws:
                            if kw in docs['OCRJson'] or kw.upper() in docs['OCRText']:
                                docs['IdRepDocumentType'] = '1'

                        if(docs['IdRepDocumentType'] != '1'):
                            self.logger.debug(
                                'cannot detect keywords of invoice')
                            # print(docs['OCRJson'])
                            # print(docs['OCRText'])
                            # return

                        pagenr = str(docs['FileName'])
                        try:
                            pagenr = (pagenr[0:pagenr.rfind('.')])
                            pagenr = pagenr[pagenr.rfind('.')+1:]
                        except Exception as err_parse_page:
                            pagenr = '1'
                            self.logger.error(err_parse)
                            # raise err_parse_page

                        docs['PageNr'] = pagenr
                        docs['GUID'] = str(docs['FileName'])
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
                            # print(result_obj[0][0]["ReturnID"])
                            # print(type(result_obj[0][0]["ReturnID"]))

                            idDocOcrs = result_obj[0][0]["ReturnID"]

                            idDocOcr = str(idDocOcrs)
                        except Exception as err_save:
                            self.logger.error(err_save)
                            self.is_running = False
                        try:
                            if (len(idDocOcr) > 0):
                                self.request_es_for_document(
                                    _url_sync_ES, idDocOcr)
                        except Exception as err_sync:
                            self.logger.debug('err_sync: ')
                            self.logger.error(err_sync)

                        try:
                            if (len(docs['OCRJson']) > 0 and docs['IdRepDocumentType'] == '1' and len(idDocOcr) > 0):
                                self.logger.debug('document is invoice')
                            else:
                                self.logger.debug('document is not invoice')
                            # return
                            # print('Start ExtractInvoice')
                            # print(
                            #     '----------------------------------------------------------------------------------------------------------------------')
                            # print(len(docs['OCRJson']))
                            response_extract = ExtractInvoice.extract_invoice(
                                idDocOcr, docs['OCRJson'])
                            # print('response_extract ')
                            # print(response_extract)
                            self.request_save_data_invoice(
                                _api_save_doc_invoice, response_extract)

                        except Exception as err_extract:
                            self.logger.debug('err_extract :')
                            self.logger.error(err_extract)
                        # self.is_running = False
                    else:
                        self.logger.debug('Path Image not EXIST :' + full_path)

                    # self.is_running = False
                    if self.is_running == False:
                        break
        except Exception as err:
            self.logger.error(err)
            raise err
            # exist_data = False

        self.is_running = False
        return

    def get_document_to_ocr(self, _url_unique_service):
        self.logger.debug('start get doc')
        data = {
            "Request":
                {
                    "ModuleName"	: "GlobalModule",
                    "ServiceName"	: "GlobalService",
                    "Data":
                    {
                        '''"MethodName"'''	: '''"SpB06GetDocumentContainer"''',
                        '''"CrudType"'''		: '''"Read"''',
                        '''"Object"''': '''"DocumentContainerScansForFile"''',
                        '''"AppModus"''': '''"0"''',
                        '''"IdLogin'"''': '''"1"''',
                        '''"LoginLanguage"''': '''"1"''',
                        '''"IdApplicationOwner"''': '''"1"''',
                        '''"GUID"''': '''"value"''',
                        '''"IdDocumentContainerFileType"''': '''"4"''',
                        '''"TopRows"''': '''"10"'''
                    }
                }
        }

        response = rq.post(_url_unique_service, json=data, headers={
            'Content-Type': 'application/json', 'Connection': 'close'})
        # print('after get doc')
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
        self.logger.debug('execute save_data_ocr ')
        # print(data)
        # logger.warning('data OCR: %s', data)
        response = rq.post(_url_unique_service, json=data, headers={
            'Content-Type': 'application/json', 'Connection': 'close'})
        self.logger.debug('response SAVE: ' + repr(response))
        return response

    def request_es_for_document(self, _url_sync_ES, idDocOcr):
        self.logger.debug('start sync ES ' + idDocOcr)
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
        self.logger.debug(
            'response request_save_data_invoice: ' + repr(response))
        return response

    def update_image_file(self, full_path, imgbuff):
        try:
            temp_file = full_path + '.bk.png'
            os.rename(full_path, temp_file)
            with open(full_path, 'wb') as file:
                file.write(imgbuff)
            if (os.path.exists(full_path)):
                os.remove(temp_file)
            else:
                os.rename(temp_file, full_path)
                print(
                    'cannot update Image content changed to image file. (Rollback success)')
        except Exception as err_update_image:
            print('update_image_file: ' + full_path)
            self.logger.error(update_image_file)

    def request_update_image_deskew(self, _api_update_image_after_deskew, data):
        # {"Files":["\\\\file.xena.local\\MyDMS\\XenaScan\\lamhn_xena\\20190918-131950.410_Order.tiff.1.png"]
        arr = [data]
        body_request = {'Files': ''}
        body_request['Files'] = arr
        self.logger.debug(body_request)

        response = rq.post(_api_update_image_after_deskew, json=body_request, headers={
            'Content-Type': 'application/json', 'Connection': 'close'})
        self.logger.debug(
            'response request_update_image_deskew: ' + repr(response))
        return response

    def check_confidence_value(self, data_ocr):
        v = '"' + (str(data_ocr)) + '"'
        v = v.replace("\"confidence\": .", "\"confidence\": 0.")
        decoded = json.loads(v)
        return decoded

    def _test_get_document_to_ocr(self, url_unique_service):
        print('_test_get_document_to_ocr')
        data = {
            "Request":
                {
                    "ModuleName"	: "GlobalModule",
                    "ServiceName"	: "GlobalService",
                    "Data":
                    {
                        '''"MethodName"'''	: '''"SpB06GetDocumentContainer"''',
                        '''"CrudType"'''		: '''"Read"''',
                        '''"Object"''': '''"DocumentContainerScansForFile"''',
                        '''"AppModus"''': '''"0"''',
                        '''"IdLogin'"''': '''"1"''',
                        '''"LoginLanguage"''': '''"1"''',
                        '''"IdApplicationOwner"''': '''"1"''',
                        '''"GUID"''': '''"value"''',
                        '''"TopRows"''': '''"1"''',
                    }
                }
        }

        response = rq.post(url_unique_service, json=data, headers={
            'Content-Type': 'application/json'})
        # print("status_code:" + str(response.status_code))
        print(((response.json())))
        # print(json.loads(str(response.json())))
        lx = ast.literal_eval(response.json()['Data'])
        print(len(lx))
        print(type(lx[0]))
        print((lx[0][0]))
        print(type(lx[0][0]))
        print(type((response.json()['Data'])))
        print((json.loads(response.json())))
        docs = ''
        if ('Data' in (response.json())):
            data_record = (response.json()['Data'])
            if(data_record != None):
                records = ast.literal_eval(data_record)
                if(len(records) > 0 and len(records[0]) > 0):
                    docs = records[0][0]

        print(docs)

        # print('response: ' + repr(response))
        return response

    def _test_save_data_ocr(self, url_unique_service, data_ocr):

        # ocr_text = {
        #     '''"Name1"''': '''"ocr 001"''',
        #     '''"Name2"''': '''"ocr 002"''',
        #     '''"Name3"''': '''"no data here"'''
        # }

        # data_js = {
        #     '''"IdDocumentContainerScans"''': '''"91"''',
        #     '''"IdRepDocumentContainerOcrType"''': '''"1"''',
        #     '''"IdRepDocumentType"''': '''"1"''',
        #     '''"OCRText"''': {},
        #     '''"OCRJson"''': {},
        #     '''"IsActive"''': '''"1"'''
        # }

        JSONDocumentContainerOCR = {
            '''"DocumentContainerOCR"''': [data_ocr]
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
                        '''"IdLogin'"''': '''"1"''',
                        '''"LoginLanguage"''': '''"1"''',
                        '''"IdApplicationOwner"''': '''"1"''',
                        '''"GUID"''': '''"421a143a-d2de-4dfe-8752-5b5dfda84ecc"''',
                        '''"JSONDocumentContainerOCR"''': json.dumps(JSONDocumentContainerOCR)
                    }
                }
        }

        # print("json:" + str(data))

        response = rq.post(url_unique_service, json=data, headers={
            'Content-Type': 'application/json'})
        # print("status_code:" + str(response.status_code))
        # print("json:" + str(response.json()))
        # print('response: ' + repr(response))
        return response
