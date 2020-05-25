import aiohttp
import asyncio
import ujson

class HTTPClient(object):
    #def __init__(self, url=None):
    #    pass
        #self._url = url
    @staticmethod
    async def get(url, headers = {}):
        #resp = None
        headers["Content-Type"] = "application/json"
        async with aiohttp.ClientSession(headers=headers) as session:
            async with session.get(url) as response:
                if (response.status == 200) or (response.status == 201):
                    resp = await response.json()
                    return resp
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