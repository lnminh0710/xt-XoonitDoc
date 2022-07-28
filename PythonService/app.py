from flask import Flask

from routers import init_routers

import logging
import logging.config
import os


from controllers.extract import ocr_controller

#from controllers import ocr

app = Flask(__name__)
init_routers(app)
path = os.path.abspath(os.path.join(
    os.path.dirname(os.path.abspath(__file__))))
print(path)
logging.config.fileConfig(path + '/logging.conf')
logger = logging.getLogger('sLogger')

print('--------------')
ocr_controller.start_servicex()

# if __name__ == "__main__":
#     app.run(debug=0)
