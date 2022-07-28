import configparser
import os

path = os.path.abspath(os.path.join(
    os.path.dirname(os.path.abspath(__file__)), os.pardir))
config = configparser.ConfigParser()


def read_config():
    global config

    config.read(path + '/config.ini')
