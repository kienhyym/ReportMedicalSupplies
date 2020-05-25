#from gatco.exceptions import ServerError
from application.server import app
from gatco.response import json
from application.database import redisdb, db
from application.client import HTTPClient 
from application.models.models import  Notify, NotifyUser
import random
import os
from sqlalchemy import or_,and_
from math import floor


import asyncio
import aiohttp
import hashlib
import ujson
import uuid
import string
from datetime import datetime,timezone
import time
from gatco_restapi.helpers import to_dict

import datetime

import firebase_admin
from firebase_admin import messaging,credentials
# cred = credentials.Certificate("./application/config/drlinks-60439-7dd5cd02649d.json")


# import argparse
# import json
# import requests

# from oauth2client.service_account import ServiceAccountCredentials

# PROJECT_ID = 'capthuocyte360'
# BASE_URL = 'https://fcm.googleapis.com'
# FCM_ENDPOINT = 'v1/projects/' + PROJECT_ID + '/messages:send'
# FCM_URL = BASE_URL + '/' + FCM_ENDPOINT
# SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'


# # [START retrieve_access_token]
# def _get_access_token():
#   """Retrieve a valid access token that can be used to authorize requests.
#   :return: Access token.
#   """
#   credentials = ServiceAccountCredentials.from_json_keyfile_name(
#       '../../config/capthuocyte360-firebase-adminsdk-q2g9e-07aa6302d0.json', SCOPES)
#   access_token_info = credentials.get_access_token()
#   return access_token_info.access_token
# # [END retrieve_access_token]

# def _send_fcm_message(fcm_message):
#   """Send HTTP request to FCM with given message.
#   Args:
#     fcm_message: JSON object that will make up the body of the request.
#   """
#   # [START use_access_token]
#   headers = {
#     'Authorization': 'Bearer ' + _get_access_token(),
#     'Content-Type': 'application/json; UTF-8',
#   }
#   # [END use_access_token]
#   resp = requests.post(FCM_URL, data=json.dumps(fcm_message), headers=headers)

#   if resp.status_code == 200:
#     print('Message sent to Firebase for delivery, response:')
#     print(resp.text)
#   else:
#     print('Unable to send message to Firebase')
#     print(resp.text)

# def _build_common_message():
#   """Construct common notifiation message.
#   Construct a JSON object that will be used to define the
#   common parts of a notification message that will be sent
#   to any app instance subscribed to the news topic.
#   """
#   return {
#     'message': {
#       'topic': 'news',
#       'notification': {
#         'title': 'FCM Notification',
#         'body': 'Notification from FCM'
#       }
#     }
#   }

# def _build_override_message():
#   """Construct common notification message with overrides.
#   Constructs a JSON object that will be used to customize
#   the messages that are sent to iOS and Android devices.
#   """
#   fcm_message = _build_common_message()

#   apns_override = {
#     'payload': {
#       'aps': {
#         'badge': 1
#       }
#     },
#     'headers': {
#       'apns-priority': '10'
#     }
#   }

#   android_override = {
#     'notification': {
#       'click_action': 'android.intent.action.MAIN'
#     }
#   }

#   fcm_message['message']['android'] = android_override
#   fcm_message['message']['apns'] = apns_override

#   return fcm_message


async def send_notify_single(user_id, title, content, notify_type ,url, iteminfo):
    try:

        if(title is None or title == ""):
            title = "Thông báo kết quả"
        notify_record = Notify()
        notify_record.title = title
        notify_record.content = content
        notify_record.type = notify_type
        notify_record.iteminfo = iteminfo
        notify_record.url = url
        db.session.add(notify_record)
        db.session.flush()
        
        notify_user = NotifyUser()
        notify_user.user_id = user_id
        notify_user.notify_id = notify_record.id
        notify_user.notify_at = floor(time.time())
        db.session.add(notify_user)
        db.session.commit()
        
        iteminfo["url"] = url
        iteminfo["content"] = content
        iteminfo["title"] = title

        data_notify = iteminfo
        firebase_token = redisdb.get("notify_token:" + str(user_id))
        print("send_notify_single.token===",firebase_token)
        if firebase_token is not None:
            firebase_token = firebase_token.decode('utf8')
            
            await send_firebase_notify(firebase_token, content, data_notify)

        firebase_token_web = redisdb.get("notify_token_web:" + str(user_id))
        print("firebase_token_web=====",firebase_token_web)
        if firebase_token_web is not None:
            firebase_token_web = firebase_token_web.decode('utf8')
            data_notify_web = {"title":title, "content":content, "url":url}
            webpush_message(firebase_token_web,title,content, data_notify_web)
            # await send_firebase_notify(firebase_token_web, content, to_dict(notify_record))
    except Exception as error:
        print(error)
        pass


async def send_notify_multiple(list_user_id, title, content, id_datkham):
    if(title is None or title == ""):
        title = "Thông báo đặt khám"
    notify_record = Notify()
    notify_record.title = title
    notify_record.content = content
    notify_record.type = "text"
    notify_record.action = {"datkham_id":str(id_datkham)}
    db.session.add(notify_record)
    db.session.flush()
    notify_record.url = app.config.get("DOMAIN_URL") + "/#dangkykham/model?id="+str(id_datkham)
    notify_user_list = []
    for uid in list_user_id:
        notify_user = NotifyUser()
        notify_user.user_id = uid
        notify_user.notify_id = notify_record.id
        notify_user.notify_at = floor(time.time())
        db.session.add(notify_user)
    
        # notify user
        user_notify_token = redisdb.get("notify_token:" + str(uid))
        if user_notify_token is not None:
            user_notify_token = user_notify_token.decode('utf8')
            notify_user_list.append(user_notify_token)
    db.session.commit()
    await send_firebase_notify(notify_user_list, title, to_dict(notify_record))




async def send_firebase_notify(firebase_tokens, body, data):
    # try:
        # cred = credentials.Certificate("./application/config/drlinks-60439-firebase-adminsdk-xryu8-6ab523a18c.json")
        # firebase_admin.initialize_app(cred)
    # cred = credentials.RefreshToken('/opt/deploys/capthuoc360/repo/application/config/drlinks-60439-firebase-adminsdk-xryu8-558c8e5deb.json')
    # default_app = firebase_admin.initialize_app()
    # accessTokenInfo = cred.get_access_token()
    # print(accessTokenInfo)
    # expiry = time.mktime(accessTokenInfo.expiry.timetuple())
    # currentTime = time.time()
    # if int(expiry) <= int(currentTime):
    #     print("chay vao RefreshToken")
    #     firebase_admin.credentials.RefreshToken('../../config/drlinks-60439-firebase-adminsdk-xryu8-558c8e5deb.json')
        
        # send_to_token(firebase_tokens[0],data)
        # send_all(firebase_tokens[0],data["title"],data["content"],data)
        # all_platforms_message(firebase_tokens[0],data["title"],data["content"], data)
        # apns_message(firebase_tokens[0],data["title"],data["content"], data)

    send_notify_ios_android(firebase_tokens,data["title"],data["content"], data)
        # webpush_message(firebase_tokens,data["title"],data["content"], data)
        # server_key = app.config.get("FIREBASE_SERVER_KEY")
        # fb_headers = {
        #     "Content-Type": "application/json",
        #     "Authorization": "key=" + server_key
        # }
        # url = "https://fcm.googleapis.com/fcm/send"
        # if "title" not in data:
        #     data["title"] = body
        # params = {
        #     "data": data,
        #     "notification": {
        #         "title":data["title"],
        #         "body": body,
        #         "sound": "bell.mp3"
        #     },
        #     "registration_ids": firebase_tokens  # this is list token [token]
        # }
        # print("server_key===",server_key)
        # print(params)
        # async with aiohttp.ClientSession(headers=fb_headers, json_serialize=ujson.dumps) as session:
        #     async with session.post(url, json=params) as response:
        #         # if response.status == 200:
        #         print(response)
        #         await response.json()

    # except ValueError:
    #     print(ValueError)
    #     pass


def send_to_token(registration_token=None, data=None):
    # [START send_to_token]
    # This registration token comes from the client FCM SDKs.
    # registration_token = token

    # See documentation on defining a message payload.
    message = messaging.Message(
        data=data,
        token=registration_token
    )

    # Send a message to the device corresponding to the provided
    # registration token.
    response = messaging.send(message)
    # Response is a message ID string.
    print('Successfully sent message:', response)
    # [END send_to_token]


def send_to_topic():
    # [START send_to_topic]
    # The topic name can be optionally prefixed with "/topics/".
    topic = 'highScores'

    # See documentation on defining a message payload.
    message = messaging.Message(
        data={
            'score': '850',
            'time': '2:45',
        },
        topic=topic,
    )

    # Send a message to the devices subscribed to the provided topic.
    response = messaging.send(message)
    # Response is a message ID string.
    print('Successfully sent message:', response)
    # [END send_to_topic]


def send_to_condition():
    # [START send_to_condition]
    # Define a condition which will send to devices which are subscribed
    # to either the Google stock or the tech industry topics.
    condition = "'stock-GOOG' in topics || 'industry-tech' in topics"

    # See documentation on defining a message payload.
    message = messaging.Message(
        notification=messaging.Notification(
            title='$GOOG up 1.43% on the day',
            body='$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.',
        ),
        condition=condition,
    )

    # Send a message to devices subscribed to the combination of topics
    # specified by the provided condition.
    response = messaging.send(message)
    # Response is a message ID string.
    print('Successfully sent message:', response)
    # [END send_to_condition]


def send_dry_run():
    message = messaging.Message(
        data={
            'score': '850',
            'time': '2:45',
        },
        token='token',
    )

    # [START send_dry_run]
    # Send a message in the dry run mode.
    response = messaging.send(message, dry_run=True)
    # Response is a message ID string.
    print('Dry run successful:', response)
    # [END send_dry_run]


def send_notify_ios_android(registration_token, title, body, data):
    # [START android_message]
    try:
        message = messaging.Message(
            notification=messaging.Notification(title, body,'https://drlinks.yte360.com/static/images/ic_launcher.png'),
                token=registration_token,
                data=data,
                android=messaging.AndroidConfig(
                    ttl=datetime.timedelta(seconds=3600),
                    priority='normal',
                    notification=messaging.AndroidNotification(
                        title=title,
                        body=body,
                        sound='bell.mp3',
                        icon='https://drlinks.yte360.com/static/images/ic_launcher.png',
                        # color='#f45342'
                    )
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            alert=messaging.ApsAlert(
                                title=title,
                                body=body,
                            ),
                            badge=1,
                        )
                    )
                )
            )
        # [END android_message]
        print("send_notify_ios_android.data===",data)
        response = messaging.send(message)
        print("send send_notify_ios_android====",response)
    except Exception as error:
        print(error)
        pass

def apns_message(registration_token, title, body, data):
    # [START apns_message]
    message = messaging.Message(
        token=registration_token,
        data=data,
        apns=messaging.APNSConfig(
            payload=messaging.APNSPayload(
                aps=messaging.Aps(
                    alert=messaging.ApsAlert(
                        title=title,
                        body=body,
                    ),
                    badge=1,
                ),
            ),
        )
    )
    # [END apns_message]
    response = messaging.send(message)
    print("send notify IOS====",response)


def webpush_message(registration_token, title, body, data):
    try:

        print("webpush_message.data====",data)
        # [START webpush_message]
        message = messaging.Message(
            notification=messaging.Notification(title, body,'https://drlinks.yte360.com/static/images/ic_launcher.png'),
            token=registration_token,
            data=data,
            webpush=messaging.WebpushConfig(
                notification=messaging.WebpushNotification(
                    title=str(title),
                    body=str(body),
                    icon='https://drlinks.yte360.com/static/images/favicon/favicon-96x96.png',
                ),
            )
        )
        response = messaging.send(message)
        print("send webpush_message====",response)
    except Exception as error:
        print(error)
        pass


def all_platforms_message(registration_token, title, body, data):
    # [START multi_platforms_message]
    message = messaging.Message(
            notification=messaging.Notification(title, body,'https://drlinks.yte360.com/static/images/ic_launcher.png'),
            token=registration_token,
            data=data,
            android=messaging.AndroidConfig(
                ttl=datetime.timedelta(seconds=3600),
                priority='normal',
                notification=messaging.AndroidNotification(
                    title=title,
                    body=body,
                    sound='bell.mp3',
                    icon='https://drlinks.yte360.com/static/images/ic_launcher.png',
                    # color='#f45342'
                ),
            ),
            apns=messaging.APNSConfig(
                headers={'apns-priority': '10'},
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        alert=messaging.ApsAlert(
                            title=title,
                            body=body,
                        ),
                        badge=42,
                        sound='bell.mp3'
                    ),
                ),
            )
            

        )

    # [END multi_platforms_message]
    response = messaging.send(message)
    # See the BatchResponse reference documentation
    # for the contents of response.
    print(response)
    # print('{0} messages were sent successfully'.format(response))


def subscribe_to_topic():
    topic = 'highScores'
    # [START subscribe]
    # These registration tokens come from the client FCM SDKs.
    registration_tokens = [
        'YOUR_REGISTRATION_TOKEN_1',
        # ...
        'YOUR_REGISTRATION_TOKEN_n',
    ]

    # Subscribe the devices corresponding to the registration tokens to the
    # topic.
    response = messaging.subscribe_to_topic(registration_tokens, topic)
    # See the TopicManagementResponse reference documentation
    # for the contents of response.
    print(response.success_count, 'tokens were subscribed successfully')
    # [END subscribe]


def unsubscribe_from_topic():
    topic = 'highScores'
    # [START unsubscribe]
    # These registration tokens come from the client FCM SDKs.
    registration_tokens = [
        'YOUR_REGISTRATION_TOKEN_1',
        # ...
        'YOUR_REGISTRATION_TOKEN_n',
    ]

    # Unubscribe the devices corresponding to the registration tokens from the
    # topic.
    response = messaging.unsubscribe_from_topic(registration_tokens, topic)
    # See the TopicManagementResponse reference documentation
    # for the contents of response.
    print(response.success_count, 'tokens were unsubscribed successfully')
    # [END unsubscribe]


def send_all(registration_token,title, body, data):
    # registration_token = 'YOUR_REGISTRATION_TOKEN'
    # [START send_all]
    # Create a list containing up to 500 messages.
    #  notification=messaging.Notification(title, body,'https://drlinks.yte360.com/static/images/icon-thuoc.png'),

    messages = [
        messaging.Message(
            notification=messaging.Notification(title, body,'https://drlinks.yte360.com/static/images/ic_launcher.png'),
            token=registration_token,
            data=data,
            android=messaging.AndroidConfig(
                ttl=datetime.timedelta(seconds=3600),
                priority='normal',
                notification=messaging.AndroidNotification(
                    title=title,
                    body=body,
                    sound='bell.mp3',
                    icon='https://drlinks.yte360.com/static/images/ic_launcher.png',
                    # color='#f45342'
                ),
            ),
            apns=messaging.APNSConfig(
                headers={'apns-priority': '10'},
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        alert=messaging.ApsAlert(
                            title=title,
                            body=body,
                        ),
                        badge=42,
                        sound='bell.mp3'
                    ),
                ),
            )
            

        ),

        
        # ...
        # messaging.Message(
        #     notification=messaging.Notification(title, body),
        #     topic='readers-club',
        # ),
    ]

    response = messaging.send_all(messages)
    # See the BatchResponse reference documentation
    # for the contents of response.
    print('{0} messages were sent successfully'.format(response.success_count))
    # [END send_all]


def send_multicast():
    # [START send_multicast]
    # Create a list containing up to 500 registration tokens.
    # These registration tokens come from the client FCM SDKs.
    registration_tokens = [
        'YOUR_REGISTRATION_TOKEN_1',
        # ...
        'YOUR_REGISTRATION_TOKEN_N',
    ]

    message = messaging.MulticastMessage(
        data={'score': '850', 'time': '2:45'},
        tokens=registration_tokens,
    )
    response = messaging.send_multicast(message)
    # See the BatchResponse reference documentation
    # for the contents of response.
    print('{0} messages were sent successfully'.format(response.success_count))
    # [END send_multicast]


def send_multicast_and_handle_errors():
    # [START send_multicast_error]
    # These registration tokens come from the client FCM SDKs.
    registration_tokens = [
        'YOUR_REGISTRATION_TOKEN_1',
        # ...
        'YOUR_REGISTRATION_TOKEN_N',
    ]

    message = messaging.MulticastMessage(
        data={'score': '850', 'time': '2:45'},
        tokens=registration_tokens,
    )
    response = messaging.send_multicast(message)
    if response.failure_count > 0:
        responses = response.responses
        failed_tokens = []
        for idx, resp in enumerate(responses):
            if not resp.success:
                # The order of responses corresponds to the order of the registration tokens.
                failed_tokens.append(registration_tokens[idx])
        print('List of tokens that caused failures: {0}'.format(failed_tokens))
    # [END send_multicast_error]