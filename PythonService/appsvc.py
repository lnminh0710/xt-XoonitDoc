# uncomment the next import line to get print to show up or see early
# exceptions if there are errors then run
#   python -m win32traceutil
# to see the output
#import win32traceutil
import win32serviceutil
from cheroot import wsgi

from app import app
from common import init_config
from common.config import config

PORT_TO_BIND = 8089
# CONFIG_FILE = 'production.ini'
SERVER_NAME = '0.0.0.0'

SERVICE_NAME = "XoontecMyDMSOCRService"
SERVICE_DISPLAY_NAME = "Xoontec MyMds OCR Service"
SERVICE_DESCRIPTION = """This service is used to deskew, process ocr and extract data for document"""
# addr = '0.0.0.0', 8070


class OCRService(win32serviceutil.ServiceFramework):
    """Python Web Service."""

    _svc_name_ = SERVICE_NAME
    _svc_display_name_ = SERVICE_DISPLAY_NAME
    _svc_deps_ = None        # sequence of service names on which this depends
    # Only exists on Windows 2000 or later, ignored on Windows NT
    _svc_description_ = SERVICE_DESCRIPTION
    # server = wsgi.Server(addr, app)

    def SvcDoRun(self):
        global PORT_TO_BIND
        init_config()
        env = config["environment"]
        PORT_TO_BIND = int(env['port'])
        SERVER_NAME = env['host']
        # import os, sys
        # path = os.path.dirname(os.path.abspath(__file__))
        # os.chdir(path)
        self.server = wsgi.Server(
            (SERVER_NAME, PORT_TO_BIND), app)

        self.server.start()
        print('OK')
        # try:
        #     self.server.start()
        # except KeyboardInterrupt:
        #     self.server.stop()

    def SvcStop(self):
        self.server.stop()


if __name__ == '__main__':
    win32serviceutil.HandleCommandLine(OCRService)
