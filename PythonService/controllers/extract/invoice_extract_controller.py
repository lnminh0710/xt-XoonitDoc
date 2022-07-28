from utils.invoice_processing import Document


class ExtractInvoice:
    def extract_invoice(id_document_container_ocr, ocr_json):
        print(id_document_container_ocr)
        print(len(ocr_json))
        doc = Document(id_document_container_ocr, ocr_json)
        response = doc.extract_inv()
        return response
