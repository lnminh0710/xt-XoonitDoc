import json
import re
import copy
from prettytable import PrettyTable


def get_min_max(vertices):
    min_x = 10000
    min_y = 10000
    max_x = 0
    max_y = 0
    for v in vertices:
        x = v.get('x')
        y = v.get('y')
        if x is not None:
            min_x = min(min_x, x)
            max_x = max(max_x, x)
        if y is not None:
            min_y = min(min_y, y)
            max_y = max(max_y, y)

    return min_x, min_y, max_x, max_y


# Class definition
class OCRWord:
    def __init__(self, f_word):
        self.x, self.y, self.x1, self.y1 = get_min_max(f_word.get('bounding_poly').get('vertices'))
        self.text = f_word.get('description')
        self.height = self.y1 - self.y
        self.width = self.x1 - self.x
        self.top = self.y
        self.left = self.x

    def get_json(self):
        return {"top": self.top, "left": self.left, "width": self.width, "height": self.height, "Value": self.text}


class OCRLine:
    def __init__(self, x, y, x1, y1, text, words=None):
        self.x = x
        self.y = y
        self.x1 = x1
        self.y1 = y1
        self.height = self.y1 - self.y
        self.text = text
        self.words = words
        self.position = None

    def append_words(self, word):
        self.words.append(word)


class OCRParagraph:
    def __init__(self, x, y, x1, y1, text, lines, tag=None):
        # self.percent = 0.3
        self.diff_x = int((x1 - x) * 3 / len(text))
        self.diff_y_line = int((y1 - y) * 0.75)
        self.diff_y = int(y1 - y)
        self.x = x
        self.y = y
        self.x1 = x1
        self.y1 = y1
        self.text = text
        self.lines = lines
        self.tag = tag
        self.height = self.y1 - self.y

    def add_line(self, line):
        self.x = min(self.x, line.x)
        self.y = min(self.y, line.y)
        self.x1 = max(self.x1, line.x1)
        self.y1 = max(self.y1, line.y1)
        self.text = self.text + '\n' + line.text
        self.lines.append(line)

    def intersects(self, other):
        if (
                ((self.x - self.diff_x < other.x < self.x1 + self.diff_x and
                  ((self.y - self.diff_y_line <= other.y <= self.y1 + self.diff_y_line)
                   or (self.y - self.diff_y_line <= other.y1 <= self.y1 + self.diff_y_line)))
                 or (self.x - self.diff_x <= other.x1 <= self.x1 + self.diff_x
                     and ((self.y - self.diff_y_line <= other.y <= self.y1 + self.diff_y_line)
                          or (self.y - self.diff_y_line <= other.y1 <= self.y1 + self.diff_y_line)))
                 or (self.x - self.diff_x >= other.x
                     and self.x1 + self.diff_x <= other.x1
                     and self.y - self.diff_y_line <= other.y
                     and self.y1 + self.diff_y_line >= other.y1)
                 or (self.x - self.diff_x <= other.x
                     and self.x1 + self.diff_x >= other.x1
                     and self.y - self.diff_y_line >= other.y
                     and self.y1 + self.diff_y_line <= other.y1))

                and ((other.height >= self.height >= other.height * 0.7)
                     or (self.height >= other.height >= self.height * 0.7))
        ):
            return True
        else:
            return False

    def check_line_in_paragraph(self, line):
        is_over_lap = self.intersects(line)
        return is_over_lap


class OCRHorizontalParagraphGroup:
    def __init__(self, x, y, x1, y1, diff_y, text, paragraphs, tag=None):
        self.x = x
        self.y = y
        self.x1 = x1
        self.y1 = y1
        self.text = text
        self.paragraphs = paragraphs
        self.tag = [] if tag is None else tag
        self.diff_y = diff_y
        self.width = self.x1 - self.x
        self.max_width_line = None

    def add_paragraph(self, paragraph):
        self.x = min(self.x, paragraph.x)
        self.y = min(self.y, paragraph.y)
        self.x1 = max(self.x1, paragraph.x1)
        self.y1 = max(self.y1, paragraph.y1)
        self.width = self.x1 - self.x
        self.text = self.text + '\n' + paragraph.text
        self.paragraphs.append(paragraph)

    def check_paragraph_in_line(self, other):
        # if ((other.y <= self.y1) and (other.y >= self.y)
        #         or (self.y <= other.y1) and (self.y >= other.y)):

        # print('##### Start merge paragraph in line #######')
        # print('#', self.y, self.y1, self.diff_y, "#")
        # print('#', other.y, other.y1, other.diff_y, "#")
        # print('##### End   merge paragraph in line #######')

        # Check merge paragraph if the first line or last line fix coordinates
        if (((other.y >= self.y - self.diff_y) and (other.y <= self.y + self.diff_y) and (
                self.y >= other.y - other.diff_y) and (self.y <= other.y + other.diff_y))
                or ((other.y1 >= self.y1 - self.diff_y) and (other.y1 <= self.y1 + self.diff_y) and (
                        self.y1 >= other.y1 - other.diff_y) and (self.y1 <= other.y1 + other.diff_y))
                or ((other.y >= self.y) and (other.y1 <= self.y1))
                or ((other.y <= self.y) and (other.y1 >= self.y1))):
            # print("# Merge:", True)
            return True
        else:
            # print("# Merge:", False)
            return False


class Field:
    def __init__(self, name, value, pattern, group, keywords=None, no_need_keywords=False, words=None):
        self.name = name
        self.value = value
        self.pattern = pattern
        self.group = group
        self.keywords = [] if keywords is None else keywords
        self.no_need_keywords = no_need_keywords
        if words is None:
            self.words = []
        else:
            self.words = words

    def get_json(self):
        ws = []
        for w in self.words:
            ws.append(w.get_json())
        response = {"Text": self.value, "words": ws}
        return response


class Contact:
    def __init__(self):
        self.company = Field('B00SharingCompany_Company', '', r'.+\s([Aa][Gg]|[Gg][Mm][Bb][Hh]|[Ii][Nn][Cc])',
                             'Contact')
        self.first_name = Field('B00SharingName_FirstName', '', '^[^\W\d_]+', 'Contact')
        self.last_name = Field('B00SharingName_LastName', '', '[^\W\d_]+$', 'Contact')
        self.street = Field('B00SharingAddress_Street', '',
                            r'.+(strasse|Strasse|str|platz|Platz|weg|Weg|steig)', 'Contact')
        self.street_nr = Field('B00SharingAddress_StreetNr', '', r'[\d]+', 'Contact')
        self.po_box = Field('B00SharingAddress_PoboxLabel', '', r'^(Postfach|postfach)\s[\d]+', 'Contact')
        self.zip = Field('B00SharingAddress_Zip', '', r'^(CH\-)?[\d]{4,6}[\s\w\.]+', 'Contact')
        self.place = Field('B00SharingAddress_Place', '', r'\w+$', 'Contact')
        self.area = Field('B00SharingAddress_Area', '', '', 'Contact')
        self.phone = Field('CompanyPhone', '', r'\s*((0|\+41)\s*(\d{2})(\s+\/)?(\s+\d{3})(\s+\d{2})(\s+\d{2}))', 'Contact', ['Telefon'])
        self.fax = Field('CompanyFax', '', r'\s*((0|\+41)\s*(\d{2})(\s+\/)?(\s+\d{3})(\s+\d{2})(\s+\d{2}))', 'Contact', ['Telefax'])
        self.vat_nr = Field('VatNr', '', r'\s*(CHE[\-\s]*(((\d{3}[\.\s]*){3})(MWST|TVA|IVA)))', 'Contact')

    def object_return_dict(self):
        contact_list = dict()
        for instance in self.__dict__.keys():
            temp = self.__getattribute__(instance)
            contact_list[temp.name] = temp.get_json()
        return contact_list

    def print(self):
        print('############## Start Contact #######################')
        for instance in self.__dict__.keys():
            temp = self.__getattribute__(instance)
            print('# ', str(temp.name), ": ", str(temp.value))
        print('############## Finish Contact #######################\n')


class Invoice:
    def __init__(self):
        self.vat_nr = Field('VatNr', '', r'\s*(CHE[\-\s]*(((\d{3}[\.\s]*){3})(MWST|TVA|IVA)?))', 'Contact', no_need_keywords=True)
        self.iban = Field('IBAN', '', r'[A-Z]{2}[\d\sX]{12,}', 'Invoice', ['IBAN'], True)
        self.contonr = Field('ContoNr', '', r'([A-Z0-9\-\s]{3,})', 'Invoice', ['Konto­Nr', 'Kontonummer', 'Konto'])
        self.customer_nr = Field('CustomerNr', '', r'([A-Z0-9\-\s]{3,})', 'Invoice', ['Kundennummer', 'Kunden Nr', 'Mitgliedsnummer', 'Klindennummer'])
        self.swift_bic = Field('SWIFTBIC', '', r'[A-Z]{8,11}', 'Invoice', ['BIC'])
        self.invoice_nr = Field('InvoiceNr', '', r'[A-Z0-9\-\s]{3,}', 'Invoice', ['Rechnung Nr.', 'Rechnung', 'Rechnungs'])
        self.invoice_date = Field('InvoiceDate', '', r'(\d{2}\s?\.((\s?\d{2}\s?\.)|(\sJanuar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember))\s?(\d{4}|\d{2}))',
                                  'Invoice',
                                  ['Rechnungs-Datum', 'Rechnungsdatum', 'Datum',
                                   'Bestellung vom', 'Bestelldatum'])
        self.invoice_amount = Field('InvoiceAmount', '', r'\d+\.\d{2}', 'Invoice',
                                    ['CHF', 'betrag', 'Rechnungsbetrag'])
        self.phone = Field('Phone', '', r'\s*((0|\+41)\s*(\d{2})(\s+\/)?(\s+\d{3})(\s+\d{2})(\s+\d{2}))', 'Contact',
                           ['Telefon'])
        self.fax = Field('Fax', '', r'\s*((0|\+41)\s*(\d{2})(\s+\/)?(\s+\d{3})(\s+\d{2})(\s+\d{2}))', 'Contact',
                         ['Telefax'])

        # 'fields': [{'field_name': 'InvoiceNr', 'pattern': r'^(([A-Z]){0,2}(\-|\s))?[\d]+(\s\\)?(\s[A-Z]{0,2})?$',
        #             'keyword': ['Kundennummer', 'Rechnungsnr', 'Rechnung Nr.', 'Invoice', 'Nummer'],
        #             'priority': 3},
        #            {'field_name': 'InvoiceDate', 'pattern': r'\d{2}\s?\.\s?\d{2}\s?\.\s?(\d{4}|\d{2})',
        #             'keyword': ['Rechnungs-Datum', 'Rechnungsdatum', 'Datum'], 'priority': 3},
        #            {'field_name': 'ContoNr', 'pattern': r'^[0-9]+(\s[0-9]+)+$',
        #             'keyword': ['Konto­Nr', 'Kontonummer', 'Konto'], 'priority': 3},
        #            {'field_name': 'CustomerNr', 'pattern': r'[\d]+$',
        #             'keyword': ['Kundennummer', 'Kunde'], 'priority': 3},
        #            {'field_name': 'SWIFTBIC', 'pattern': r'[A-Z]{8,11}$',
        #             'keyword': ['BIC'], 'priority': 3},
        #            {'field_name': 'IBAN', 'pattern': r'[\d]{10,20}',
        #             'keyword': ['IBAN'], 'priority': 3},
        #            ]},

    def object_return_dict(self):
        invoice_list = dict()
        for instance in self.__dict__.keys():
            temp = self.__getattribute__(instance)
            invoice_list[temp.name] = temp.get_json()
        return invoice_list

    def print(self):
        print('############## Start Invoice #######################')
        for instance in self.__dict__.keys():
            temp = self.__getattribute__(instance)
            print('# ', str(temp.name), ": ", str(temp.value))
        print('############## Finish Invoice #######################\n')


class Document:
    def __init__(self, id_document_container_ocr, ocr_data):
        # for page in ocr_json:
        self.id_document_container_ocr = id_document_container_ocr
        # Read textAnnotations
        list_of_words = ocr_data['text_annotations']
        self.raw_words = list_of_words
        self.width, self.height = self.process_document_property()
        self.lines = self.process_lines()
        self.paragraphs = self.process_paragraphs()
        self.paragraph_groups = self.find_horizontal_paragraph_group()
        self.addresses = self.find_address()
        self.contacts = self.process_company_from_address()
        self.invoice = self.process_invoice()
        self.items = self.find_items()

    def get_json_response(self):
        result = dict()
        if self.contacts is not None:
            contact_dict = self.contacts[0].object_return_dict()
            result.update(contact_dict)
        if self.invoice is not None:
            invoice_dict = self.invoice.object_return_dict()
            result.update(invoice_dict)
        return json.dumps(result)

    def extract_inv(self):
        json_response = [{"IdDocumentContainerOcr": self.id_document_container_ocr,
                          "JsonDocumentModules": self.get_json_response(),
                          "IsActive": True}]
        return json_response

    def print_item(self):
        try:
            if self.items is not None:
                print("\n")
                print('############## Start Items #######################')
                items = list(
                    filter(lambda para: para.tag == "Item" or para.tag == "Item-Header", self.paragraph_groups))
                items_max_column = max(len(para.paragraphs) for para in items)
                t = PrettyTable()
                for item in self.items:
                    item_array = []
                    for para in item.paragraphs:
                        item_array.append(para.text)
                    for i in range(0, items_max_column - len(item_array)):
                        item_array.append('')
                    if item.tag == "Item-Header":
                        t.field_names = item_array
                    elif item.tag == "Item" or item.tag == "Item-End":
                        t.add_row(item_array)
                    # print('----------------', item.tag, '-----------------')
                    # print(item.text)
                print(t)
        except:
            pass

    def print_all(self):
        if self.contacts is not None:
            for contact in self.contacts:
                contact.print()

        if self.invoice is not None:
            self.invoice.print()

        self.print_item()

    def process_document_property(self):
        first_word = self.raw_words[0]
        x, y, x1, y1 = get_min_max(first_word.get('bounding_poly').get('vertices'))
        # x, y, x1, y1 = get_max_min(first_word.get('bounding_poly').get('vertices'))
        width = x1 - x
        height = y1 - y
        return width, height

    def process_lines(self):
        # Extract text line
        first_word = self.raw_words[0]
        text_lines = first_word.get('description').split('<br />')

        # Process lines
        words_for_line = self.raw_words[1:]
        lines = []
        for text_line in text_lines:
            text_line = str.strip(text_line)
            sel_word = []
            is_found = False
            for word in words_for_line:
                # w_text = word.get('description')
                ocr_word = OCRWord(word)
                if not is_found:
                    if text_line.startswith(ocr_word.text) and ocr_word.text != '':
                        if len(ocr_word.text) < len(text_line):
                            is_found = True
                            sel_word.append(word)
                        elif len(ocr_word.text) == len(text_line):
                            x, y, x1, y1 = get_min_max(word.get('bounding_poly').get('vertices'))
                            # x, y, x1, y1 = get_max_min(word.get('bounding_poly').get('vertices'))
                            line = OCRLine(x, y, x1, y1, text_line, [ocr_word])
                            lines.append(line)
                            words_for_line.remove(word)
                            break
                        # else:
                        # print(f'#### len(w_text) {len(ocr_word.text)} > len(text_line) {len(text_line)}: ')
                else:
                    if ocr_word.text in text_line:
                        sel_x, sel_y, sel_x1, sel_y1 = get_min_max(sel_word[-1].get('bounding_poly').get('vertices'))
                        x, y, x1, y1 = get_min_max(word.get('bounding_poly').get('vertices'))
                        if (sel_y <= y <= sel_y1) or (y <= sel_y <= y1):
                            sel_word.append(word)
                            if text_line.endswith(ocr_word.text):
                                x, y, x1, y1 = get_min_max(sel_word[0].get('bounding_poly').get('vertices'))
                                x2, y2, x3, y3 = get_min_max(sel_word[-1].get('bounding_poly').get('vertices'))
                                ocr_word_list = [OCRWord(item) for item in sel_word]  # Just add
                                line = OCRLine(min(x, x2), min(y, y2), max(x1, x3), max(y1, y3), text_line,
                                               ocr_word_list)
                                lines.append(line)
                                # is_found = False
                                [words_for_line.remove(item) for item in sel_word]
                                break
                            else:
                                continue
                    else:
                        continue
                    #     x, y, x1, y1 = get_min_max(sel_word[0].get('bounding_poly').get('vertices'))
                    #     x2, y2, x3, y3 = get_min_max(sel_word[-1].get('bounding_poly').get('vertices'))
                    #     line = OCRLine(min(x,x2), min(y,y2), max(x1,x3), max(y1,y3), text_line)
                    #     lines.append(line)
                    #     is_found = False
                    #     [words_for_line.remove(item) for item in sel_word]
                    #     print('# This case is not true')

        # print(f'### Len(words_for_line): {len(words_for_line)}')
        # for word in words_for_line:
        #     print(word.get('description'))
        return lines

    def process_paragraphs(self):
        paras = []
        first_line = self.lines[0]
        lines_for_para = self.lines[1:]
        para = OCRParagraph(first_line.x, first_line.y, first_line.x1, first_line.y1, first_line.text, [first_line])
        paras.append(para)
        for line in lines_for_para:
            is_found_para = False
            for p in paras:
                if p.check_line_in_paragraph(line):
                    p.add_line(line)
                    is_found_para = True
                    break
            if not is_found_para:
                p_new = OCRParagraph(line.x, line.y, line.x1, line.y1, line.text, [line])
                paras.append(p_new)
        paras.sort(key=lambda para_key: para_key.y)
        return paras

    # def check_paragraph_inside(self):
    #     paragraph_changes = []
    #     for i in range(0, len(self.paragraphs)):
    #         para_outside = self.paragraphs[i]
    #         if para_outside is None:
    #             continue
    #         for j in range(i + 1, len(self.paragraphs)):
    #             para_inside = self.paragraphs[j]
    #             if ((para_outside.x - 50 < para_inside.x < para_inside.x1 < para_outside.x1 + 50) and
    #                     (para_outside.y - 50 < para_inside.y < para_inside.y1 < para_outside.y1 + 50)):
    #                 para_outside.lines.extend(para_inside.lines)
    #                 para_outside.x = min(para_outside.x, para_inside.x)
    #                 para_outside.y = min(para_outside.y, para_inside.y)
    #                 para_outside.x1 = max(para_outside.x1, para_inside.x1)
    #                 para_outside.y1 = max(para_outside.y1, para_inside.y1)
    #                 para_inside = None
    #                 print("===============")
    #                 print("Location Outside:({},{}),({},{})".format(para_outside.x, para_outside.y,
    #                                                                 para_outside.x1, para_outside.y1))
    #                 # print("Location Inside:({},{}),({},{})".format(para_inside.x, para_inside.y,
    #                 #                                                para_inside.x1, para_inside.y1))
    #                 print("##############")
    #         paragraph_changes.append(para_outside)
    #     print("Finish")
    #     return paragraph_changes

    def find_horizontal_paragraph_group(self):
        para_groups = []
        first_para = self.paragraphs[0]
        para_group = OCRHorizontalParagraphGroup(first_para.x, first_para.y, first_para.x1, first_para.y1,
                                                 first_para.diff_y, first_para.text, [first_para])
        para_groups.append(para_group)
        for p in self.paragraphs[1:]:
            is_found = False
            for pg in para_groups:
                if pg.check_paragraph_in_line(p):
                    pg.add_paragraph(p)
                    is_found = True
                    break
            if not is_found:
                para_group = OCRHorizontalParagraphGroup(p.x, p.y, p.x1, p.y1, p.diff_y, p.text, [p])
                para_groups.append(para_group)
        for pg in para_groups:
            pg.paragraphs.sort(key=lambda para: para.x)
        return para_groups

    def find_value_with_keywords_and_pattern(self, line, field):
        # Finding pattern if field don't need keywords
        if field.no_need_keywords:
            result = re.search(field.pattern, line.text)
            if result:
                field.value = result.group(0).strip()
                self.append_word_coordinates_to_field(field=field, line_check=line)
                # field.words = [line.words[0]]
                line.position = field.name
                return True

        # Finding pattern if keywords exit in line
        for key_word in field.keywords:
            if key_word in line.text:
                result = re.search(field.pattern, line.text[line.text.index(key_word) + len(key_word):])
                if result:
                    field.value = result.group(0).strip()
                    self.append_word_coordinates_to_field(field=field, line_check=line)
                    # field.words = [line.words[0]]
                    line.position = field.name
                    return True
                else:
                    # The key word is found but pattern isn't find
                    # -> The value is existed but it is not in the same line
                    # -> Found other line with sorted line in range x,y of found line's keyword
                    return self.find_text_in_same_line(line, field)

    def find_text_in_same_line(self, line, field):
        filtered_lines = list(filter(
            lambda item: (
                    line.y - line.height < item.y < item.y1 < line.y1 + line.height
                    and line != item and item.x > line.x1), self.lines))
        for filtered_line in filtered_lines:
            result = re.search(field.pattern, filtered_line.text)
            if result:
                field.value = result.group(0).strip()
                # field.words = [line.words[0]]
                self.append_word_coordinates_to_field(field=field, line_check=filtered_line)
                line.position = field.name
                return True
        return False

    def find_address(self):
        pattern_street = r'.+(strasse|Strasse|str|platz|Platz|weg|Weg|steig)\s[\d]+'
        pattern_po_box = r'^(Postfach|postfach)\s[\d]+'
        pattern_plz = r'^(CH\-)?[\d]{4,6}\s\w+'
        adds = []
        for p in self.paragraphs:
            is_street_found = False
            is_po_box = False
            is_plz_found = False
            for line in p.lines:
                result = re.search(pattern_street, line.text.lower())
                if result:
                    is_street_found = True

                result = re.search(pattern_po_box, line.text.lower())
                if result:
                    is_po_box = True

                if is_street_found or is_po_box:
                    result = re.search(pattern_plz, line.text)
                    if result:
                        is_plz_found = True
                        break
            if (is_street_found or is_po_box) and is_plz_found:
                p.tag = 'Address'
                adds.append(p)
        return adds

    @staticmethod
    def append_word_coordinates_to_field(field, line_check):
        for word in line_check.words:
            if word.text in field.value:
                field.words.append(word)
            if field.value.endswith(word.text):
                break

    def process_company_from_address(self):
        contacts = list()
        if len(self.addresses) > 0:
            for address in self.addresses:
                new_contact = Contact()

                # Run ech line in one paragraph
                for line in address.lines:
                    # Company
                    result = re.search(new_contact.company.pattern, line.text)
                    if result:
                        new_contact.company.value = result.group(0).strip()
                        self.append_word_coordinates_to_field(field=new_contact.company, line_check=line)
                        # new_contact.company.words = [line.words[0]]
                        address.lines.remove(line)
                        break

                for line in address.lines:
                    # Fax
                    if self.find_value_with_keywords_and_pattern(line, new_contact.fax):
                        break

                for line in address.lines:
                    # Phone
                    if self.find_value_with_keywords_and_pattern(line, new_contact.phone):
                        break

                for line in address.lines:
                    # Search Address Pattern
                    result = re.search(new_contact.street.pattern, line.text.lower())
                    if result:
                        new_contact.street.value = result.group(0).strip().capitalize()
                        self.append_word_coordinates_to_field(field=new_contact.street, line_check=line)
                        new_contact.street_nr.value = line.text.capitalize() \
                            .replace(new_contact.street.value, '') \
                            .strip()
                        self.append_word_coordinates_to_field(field=new_contact.street_nr, line_check=line)
                        address.lines.remove(line)
                        break

                for line in address.lines:
                    # Search PoBox Pattern
                    result = re.search(new_contact.po_box.pattern, line.text)
                    if result:
                        new_contact.po_box.value = result.group(0).strip()
                        self.append_word_coordinates_to_field(field=new_contact.po_box, line_check=line)
                        address.lines.remove(line)
                        break

                for line in address.lines:
                    # Search Zip pattern
                    result = re.search(new_contact.zip.pattern, line.text)
                    if result:
                        zip_temp = result.group(0).split()
                        new_contact.zip.value = zip_temp[0].strip()
                        self.append_word_coordinates_to_field(field=new_contact.zip, line_check=line)
                        # new_contact.zip.words = [line.words[0]]
                        new_contact.place.value = ' '.join(zip_temp[1:]).strip()
                        self.append_word_coordinates_to_field(field=new_contact.place, line_check=line)
                        # new_contact.place.words = line.words[:-1]
                        address.lines.remove(line)
                        break
                for line in address.lines:
                    # Search Phone pattern
                    result = re.search(new_contact.phone.pattern, line.text)
                    if result:
                        new_contact.phone.value = result.group(0).strip()
                        self.append_word_coordinates_to_field(field=new_contact.phone, line_check=line)
                        # new_contact.phone.words = [line.words[0]]
                        address.lines.remove(line)
                        break

                for line in address.lines:
                    # Search VatNr pattern
                    result = re.search(new_contact.vat_nr.pattern, line.text)
                    if result:
                        new_contact.vat_nr.value = result.group(0).strip()
                        self.append_word_coordinates_to_field(field=new_contact.vat_nr, line_check=line)
                        # new_contact.vat_nr.words = [line.words[0]]
                        address.lines.remove(line)
                        break

                for line in address.lines:
                    # Search Name pattern
                    full_name_pattern = r'^([^\W\d_]+)(\s[^\W\d_]+)+$'
                    result = re.search(full_name_pattern, line.text)
                    if result:
                        full_name_array = result.group(0).split(' ')

                        # result_first_name = re.search(new_contact.first_name.pattern, line.text)
                        # result_last_name = re.search(new_contact.last_name.pattern, line.text)
                        # if result_first_name and result_last_name:
                        new_contact.first_name.value = ' '.join(full_name_array[:len(full_name_array) - 1])
                        self.append_word_coordinates_to_field(field=new_contact.first_name, line_check=line)
                        # new_contact.first_name.words = [line.words[0]]
                        new_contact.last_name.value = full_name_array[-1]
                        self.append_word_coordinates_to_field(field=new_contact.last_name, line_check=line)
                        # new_contact.last_name.words = [line.words[0]]
                        # address.lines.remove(line)
                        # break

                # count_value_new_contact = sum(
                #     new_contact.__getattribute__(instance).value != '' for instance in new_contact.__dict__.keys())
                #
                # count_value_saved_contact = sum(
                #     saved_contacts.__getattribute__(instance).value != '' for instance in
                #     saved_contacts.__dict__.keys())
                #
                # if count_value_new_contact > count_value_saved_contact:
                #     saved_contacts = copy.copy(new_contact)
                contacts.append(new_contact)
            return contacts

    @staticmethod
    def find_keyword_and_define_area(paragraph_groups, tag_find: str):
        common_fields = [{'name': 'invoice_nr', 'tag': 'Invoice', 'is_found': False,
                          'keywords': ['Rechnungnummer', 'Kundennummer', 'Klindennummer',
                                       'Rechnungs', 'Rechnungsnr', 'Rechnung Nr.',
                                       'Invoice', 'Nummer', ]},
                         {'name': 'customer_nr', 'tag': 'Invoice', 'is_found': False,
                          'keywords': ['Kunden Nr', 'Kundennummer', 'Kontonummer', 'Mitgliedsnummer'], }]
        list_find = []
        for pg in paragraph_groups:
            for field in common_fields:
                if tag_find != field['tag']:
                    continue
                for key_word in field['keywords']:
                    # Find keyword in group_paragraph first
                    if key_word in pg.text:
                        # If keyword exist find in each para
                        for p in pg.paragraphs:
                            if p.tag is None and key_word in p.text:
                                p.tag = field['tag']
                        if field['tag'] not in pg.tag:
                            pg.tag.append(field['tag'])
                            list_find.append(pg)

        return list_find

        # for field in common_fields:
        #     for p in self.paragraphs:
        #         print(p)

    def process_invoice(self):
        inv_para_groups = self.find_keyword_and_define_area(self.paragraph_groups, 'Invoice')
        new_invoice = Invoice()
        for pg in inv_para_groups:
            for p in pg.paragraphs:
                # Check in each lines
                for line in p.lines:
                    # Find keyword and pattern in each instance of Invoice Class
                    for instance in new_invoice.__dict__.keys():
                        new_invoice_instance = new_invoice.__getattribute__(instance)

                        # Skip field if field has value
                        if new_invoice_instance.value != '':
                            continue

                        if self.find_value_with_keywords_and_pattern(line, new_invoice_instance):
                            break

        return new_invoice

    def find_items(self):
        # Get array of width
        width_max = max((g.x1 - g.x) for g in self.paragraph_groups)
        # width_arr = [(g.x1 - g.x) for g in self.paragraph_groups]
        # width_max_index_first = width_arr.index(width_max)
        # width_max_index_last = len(width_arr) - width_arr[::-1].index(width_max)

        # Get array of number of columns
        len_max = max(len(x.paragraphs) for x in self.paragraph_groups)
        # len_arr = [len(x.paragraphs) for x in self.paragraph_groups]
        # len_max_index_first = len_arr.index(len_max)
        # len_max_index_last = len(len_arr) - len_arr[::-1].index(len_max)

        # Loop through paragraph groups to find item
        items = []
        is_item_header_found = False
        # Space bw item (paragraph group)
        item_space_y = -1  # -1 Not found item yet
        item_start = None
        previous_item = None

        for pg in self.paragraph_groups:
            if not is_item_header_found:
                # Finding header first with width header maybe small 0.95 max_width
                if pg.width >= 0.95 * width_max:
                    # Compare number of horizontal paragraph with number of columns.
                    # The diff of number is small than 2, maybe this para_group is header
                    if abs(len(pg.paragraphs) - len_max) <= 2:
                        pg.tag = 'Item-Header'
                        item_start = pg
                        is_item_header_found = True
                        items.append(pg)
            else:
                # The Item-Header was found
                # Next line will be list of item
                if item_start is not None:
                    if item_space_y == -1:  # Initial item_space_y
                        item_space_y = pg.y - item_start.y1
                        pg.tag = 'Item'
                        items.append(pg)
                    else:
                        if abs((pg.y - previous_item.y1) <= item_space_y + 10):
                            pg.tag = 'Item'
                            items.append(pg)
                        else:
                            previous_item.tag = 'Item-End'
                            is_item_header_found = False
                            if (pg.x1 - pg.x) >= 0.95 * width_max:
                                if abs(len(pg.paragraphs) - len_max) <= 2:
                                    pg.tag = 'Item-Header'
                                    item_start = pg
                                    is_item_header_found = True
                                    item_space_y = -1
                                    items.append(pg)
                    previous_item = pg

        is_item_end_found = False
        for item in reversed(items):
            if not is_item_end_found:
                if item.tag == 'Item-Header':
                    items.remove(item)
                    break

        return items
