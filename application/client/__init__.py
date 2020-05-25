import aiohttp
import asyncio
import ujson
from gatco.response import json
from application.server import app
import socket

class HTTPClient(object):
    #def __init__(self, url=None):
    #    pass
        #self._url = url
    @staticmethod
    async def get(url, params=None, headers = {}):
        #resp = None
        conn = aiohttp.TCPConnector(
            family=socket.AF_INET,
            verify_ssl=False,
        )
        headers["Content-Type"] = "application/json"
        async with aiohttp.ClientSession(headers=headers, connector=conn) as session:
            async with session.get(url, params=params) as response:
                if (response.status == 200) or (response.status == 201):
                    resp = await response.json()
                    return resp
                elif ((response.status == 520) and ("error_code" in response)):
                    resp = await response.json()
                    return resp
                else:
                    return {"error_code": "HTTP_ERROR", "error_message": await response.text()} 
        return {"error_code": "UNKNOWN_ERROR", "error_message": ""} 

    @staticmethod
    async def get_textplain(url, params=None, headers = {}):
        #resp = None
        conn = aiohttp.TCPConnector(
            family=socket.AF_INET,
            verify_ssl=False,
        )
        headers["Content-Type"] = "text/plain; charset=utf-8"
        async with aiohttp.ClientSession(headers=headers, connector=conn) as session:
            async with session.get(url, params=params) as response:
                print(await response.text())
                if (response.status == 200) or (response.status == 201):
                    # resp = await response.json()
                    return response
                elif ((response.status == 520) and ("error_code" in response)):
                    # resp = await response.json()
                    return response
                else:
                    return {"error_code": "HTTP_ERROR", "error_message": await response.text()} 
        return {"error_code": "UNKNOWN_ERROR", "error_message": ""} 
    
    
    @staticmethod
    async def post(url, data, headers = {}):
        #resp = None
        headers["Content-Type"] = "application/json"
        async with aiohttp.ClientSession(headers=headers, json_serialize=ujson.dumps) as session:
            async with session.post(url, json=data) as response:
                if (response.status == 200) or (response.status == 201):
                    resp = await response.json()
                    return resp
                elif (response.status == 520):
                    resp = await response.json()
                    return resp
                else:
                    return {"error_code": "HTTP_ERROR", "error_message": await response.text()} 
        return {"error_code": "UNKNOWN_ERROR", "error_message": ""}
    
    @staticmethod
    async def put(url, data, headers = {}):
        #resp = None
        headers["Content-Type"] = "application/json"
        async with aiohttp.ClientSession(headers=headers, json_serialize=ujson.dumps) as session:
            async with session.put(url, json=data) as response:
                if (response.status == 200) or (response.status == 201):
                    resp = await response.json()
                    return resp
                else:
                    return {"error_code": "HTTP_ERROR", "error_message": await response.text()} 
        return {"error_code": "UNKNOWN_ERROR", "error_message": ""}
    
    
class BlockchainClient(object):
    @staticmethod
    async def request(method, param):
        network_id = app.config['BLOCKCHAIN_NETWORK_ID']
        url = app.config['BLOCKCHAIN_RPC_URL']
        payload = {
                   'jsonrpc': '2.0',
                   'method': method,
                   'params': param,
                   'id': network_id
        }
        
        response = await HTTPClient.post(url, data=payload)
        if 'result' in response:
            return {"result": response['result']}
        if ('error' in response) and ('message' in response['error']):
            return {"error_code":"BACKEND_ERROR", "error_message": response['error']['message']}
        return {"error_code": "UNKNOWN_ERROR", "error_message": ""}