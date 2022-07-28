from utils.deskew import img_deskew
from utils.google_vision import detect_document
from utils.google_vision import detect_document_buffer


def process_by_google_vision(file_path_input: str):
    return detect_document(file_path_input)


def deskew_image(img_buffer, file_name, angle_skip):
    return img_deskew(img_buffer, file_name, angle_skip)


def process_by_google_vision_with_buffer(img_buff):
    return detect_document_buffer(img_buff)
