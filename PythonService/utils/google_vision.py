
def detect_document(path):
    """Detects document features in an image."""
    from google.cloud import vision
    from google.protobuf.json_format import MessageToDict

    client = vision.ImageAnnotatorClient()

    with open(path, 'rb') as image_file:
        content = image_file.read()

    image = vision.types.Image(content=content)

    response = client.document_text_detection(image=image)

    return MessageToDict(response, preserving_proto_field_name=True)


def detect_document_buffer(img_buff):
    """Detects document features in an image."""
    from google.cloud import vision
    from google.protobuf.json_format import MessageToDict

    client = vision.ImageAnnotatorClient()

    image = vision.types.Image(content=img_buff)

    response = client.document_text_detection(image=image)

    return MessageToDict(response, preserving_proto_field_name=True)
