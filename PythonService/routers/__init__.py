""" routes """

from routers.deskew_route import blueprint as deskew_api
from routers.extract_route import blueprint as extract_api
from routers.service_route import blueprint as service_api
from routers.ocr_manually_route import blueprint as service_manually_ocr_api


def init_routers(app):
    """ create routers """

    app.register_blueprint(deskew_api, url_prefix='/api/deskew')

    # processing files
    app.register_blueprint(extract_api, url_prefix='/api/extract')

    app.register_blueprint(service_api, url_prefix='/api/service')
    app.register_blueprint(service_manually_ocr_api, url_prefix='/api/ocr')
