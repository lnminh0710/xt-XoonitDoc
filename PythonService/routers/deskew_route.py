""" deskew_route.py """

from flask import Blueprint, request
from flask_restplus import Api, Resource, fields

from controllers.extract.image_controller import deskew_image
from utils.http_util import format_respond

blueprint = Blueprint('DeskewRoute', __name__)
api = Api(blueprint)


@api.route("/image")
class DeskewImage(Resource):
    parser = api.model('Resource', {
        'img_buffer': fields.String(description='img_buffer', required=True),
        'file_name': fields.String(description='file_name', required=True),
    })

    @api.expect(parser, validate=True)
    def post(self):
        data = request.get_json()
        img_buffer = data['img_buffer']
        file_name = data['file_name']

        return format_respond(deskew_image, img_buffer, file_name)
