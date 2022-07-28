from flask import Flask

from common import init_config
from common.config import config
from routers import init_routers
import logging
import logging.config

from controllers.extract import ocr_controller
#from controllers.extract import ocr_controller
#from routers.service_route import AutoService


def main():
    """ Main """
    logging.config.fileConfig('logging.conf')
    logger = logging.getLogger('sLogger')
    # logging.basicConfig(filename='logs/ocr_service.log', level=logging.INFO,
    #                     format='%(asctime)s %(message)s', datefmt='%m/%d/%Y %I:%M:%S %p')
    app = Flask(__name__)

    init_config()

    init_routers(app)

    print('--------------')
    ocr_controller.start_servicex()

    env = config["environment"]
    app.run(host="0.0.0.0", port=env["port"], debug=0)
    # int(env["debug"])

    # AutoService()
    # AutoService.start_service()
    #app.register_blueprint(service_api, url_prefix='/api/service')


if __name__ == "__main__":
    main()
