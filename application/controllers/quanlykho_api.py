
from application.extensions import apimanager
from gatco_restapi.helpers import to_dict
from application.server import app
from sqlalchemy import or_
from gatco.response import json
from datetime import datetime
import ujson
import asyncio
import aiohttp
import time

from application.models.model_quanlykho import *
from application.controllers.helpers.helper_common import validate_user, convert_text_khongdau
from application.database import db


apimanager.create_api(MedicalSupplies,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[], PUT_SINGLE=[]),
    postprocess=dict(POST=[],PUT_SINGLE=[]),
    collection_name='medical_supplies')

apimanager.create_api(ReportOrganization,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[], PUT_SINGLE=[]),
    postprocess=dict(POST=[],PUT_SINGLE=[]),
    collection_name='report_organization')