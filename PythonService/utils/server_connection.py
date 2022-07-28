import json
import requests as rq
import ast

# url_unique_service = 'http://orderprocessingservice.xena.local/UniqueService'
# api_save_doc_invoice = "http://orderprocessing.xena.local/api/DocumentContainer/SaveDocumentContainerProcessed"

url_unique_service = 'http://10.1.32.18:9966/UniqueService'
api_save_doc_invoice = 'http://10.1.32.18:9966/api/DocumentContainer/SaveDocumentContainerProcessed'


# url_unique_service = 'http://mydmsaot.xena.local/UniqueService'
# api_save_doc_invoice = 'http://mydmsaot.xena.local/api/DocumentContainer/SaveDocumentContainerProcessed'


def get_ocr_json_with_scan_id(id_document):
    print('START GET DOC')
    data = {
        "Request":
            {
                "ModuleName": "GlobalModule",
                "ServiceName": "GlobalService",
                "Data":
                    {
                        '''"MethodName"''': '''"SpB06GetDocumentContainer"''',
                        '''"CrudType"''': '''"Read"''',
                        '''"Object"''': '''"DocumentContainerOCRById"''',
                        '''"AppModus"''': '''"0"''',
                        '''"IdLogin"''': '''"1"''',
                        '''"LoginLanguage"''': '''"1"''',
                        '''"IdApplicationOwner"''': '''"1"''',
                        '''"GUID"''': '''"1"''',
                        '''"IdDocumentContainerFileType"''': '''"4"''',
                        '''"PageSize"''': '''"20"''',
                        '''"IdDocumentContainerScans"''': '''"''' + str(id_document) + '''"'''
                    }
            }
    }

    response = rq.post(url_unique_service, json=data, headers={
        'Content-Type': 'application/json', 'Connection': 'close'})
    docs = None
    if 'Data' in (response.json()):
        data_record = (response.json()['Data'])
        if data_record is not None:
            records = ast.literal_eval(data_record)
            if len(records) > 0 and len(records[0]) > 0:
                docs = records[0]
    print('FINISHING GETTING DOC')
    return docs


def request_save_data_invoice(data):
    print(data)
    # json_ocr = [
    #     {"IdDocumentContainerOcr": "85",
    #      "JsonDocumentModules": "{\"GrossAmount\": null, \"Amount\": null, \"Discount\": null, \"Discount%\": null, \"Currency\": null, \"InvoiceDate\": \"26.05.2017\", \"Street\": \"Seestrasse\", \"StreetNr\": \"1\", \"StreetAddition1\": null, \"StreetAddition2\": null, \"StreetAddition3\": null, \"PoBox\": null, \"Zip\": \"8000\", \"Zip2\": null, \"Place\": \"Z\\u00fcrich\", \"Area\": null, \"ArticleNr\": null, \"ArticleName\": null, \"ArticlePrice\": null, \"ArticleQty\": null, \"CommType\": null, \"CommValue\": null, \"CommNotes\": null, \"Company\": \"Garax AG\", \"FirstName\": \"Anzahl\", \"LastName\": \"Einheit\", \"Title\": null, \"Middlename\": null, \"NameAdditiion\": null}",
    #      "IsActive": "true"}
    # ]
    response = rq.post(api_save_doc_invoice, json=data, headers={
        'Content-Type': 'application/json', 'Connection': 'close'})
    print(
        'response request_save_data_invoice: \n' + repr(response))
    return response


if __name__ == '__main__':
    request_save_data_invoice(None)
