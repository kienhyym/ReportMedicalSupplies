'''
Created on May 25, 2018

@author: namdv
'''
from kafka import KafkaProducer
from kafka import KafkaConsumer
from kafka import KafkaClient
import json
import threading
import asyncio
import fastavro
from fastavro import writer
from application.controllers.preprocess import sync_tiemchung_to_mevabe



SCHEMA = {
  "type" : "record",
  "name" : "TiemChung",
  "namespace" : "com.mevabe.apps",
  "fields" : [ {
    "name" : "tiemchung",
    "type" : {
      "type" : "array",
      "items" : {
        "type" : "record",
        "name" : "tiemchung",
        "fields" : [ {
          "name" : "somuitiem",
          "type" : "string"
        }, {
          "name" : "updated_at",
          "type" : "string"
        }, {
          "name" : "tenvacxin",
          "type" : "string"
        }, {
          "name" : "id",
          "type" : "long"
        }, {
          "name" : "motavacxin",
          "type" : "string"
        }, {
          "name" : "canboyte_id",
          "type" : [ "string", "null" ]
        }, {
          "name" : "ngaytiem",
          "type" : "string"
        }, {
          "name" : "tencanboyte",
          "type" : "string"
        }, {
          "name" : "thoigiantiem",
          "type" : "string"
        }, {
          "name" : "mavacxin",
          "type" : "string"
        }, {
          "name" : "ngayhentiemlansau",
          "type" : "string"
        }, {
          "name" : "donvitiemchung",
          "type" : "string"
        } ]
      }
    }
  }, {
    "name" : "bo",
    "type" : {
      "type" : "record",
      "name" : "bo",
      "fields" : [ {
        "name" : "nghenghiep",
        "type" : "string"
      }, {
        "name" : "trinhdohocvan",
        "type" : "string"
      }, {
        "name" : "hoten",
        "type" : "string"
      }, {
        "name" : "dantoc",
        "type" : "string"
      }, {
        "name" : "ngaysinh",
        "type" : "string"
      } ]
    }
  }, {
    "name" : "meobj",
    "type" : {
      "type" : "record",
      "name" : "meobj",
      "fields" : [ {
        "name" : "xaphuong_id",
        "type" : [ "string", "null" ]
      }, {
        "name" : "thonxom",
        "type" : [ "string", "null" ]
      }, {
        "name" : "trinhdohocvan",
        "type" : "string"
      }, {
        "name" : "ngaysinh",
        "type" : "string"
      }, {
        "name" : "bhyt_sudungden",
        "type" : "string"
      }, {
        "name" : "chuho",
        "type" : [ "string", "null" ]
      }, {
        "name" : "noisinh",
        "type" : "string"
      }, {
        "name" : "gioitinh",
        "type" : "long"
      }, {
        "name" : "email",
        "type" : "string"
      }, {
        "name" : "quanhuyen",
        "type" : [ "string", "null" ]
      }, {
        "name" : "hoten",
        "type" : "string"
      }, {
        "name" : "nghenghiep",
        "type" : [ "string", "null" ]
      }, {
        "name" : "diachi",
        "type" : "string"
      }, {
        "name" : "thonxom_id",
        "type" : [ "string", "null" ]
      }, {
        "name" : "macongdan",
        "type" : "string"
      }, {
        "name" : "dantoc",
        "type" : [ "string", "null" ]
      }, {
        "name" : "xaphuong",
        "type" : [ "string", "null" ]
      }, {
        "name" : "bhyt_sothe",
        "type" : "string"
      }, {
        "name" : "bhyt_sudungtu",
        "type" : "string"
      }, {
        "name" : "dienthoai",
        "type" : "string"
      }, {
        "name" : "tinhthanh",
        "type" : [ "string", "null" ]
      }, {
        "name" : "bhyt_ngaycap",
        "type" : "string"
      }, {
        "name" : "tinhthanh_id",
        "type" : [ "string", "null" ]
      }, {
        "name" : "quanhuyen_id",
        "type" : [ "string", "null" ]
      } ]
    }
  }, {"name" : "qrcode_id", "type" : "string"}, 
  {"name" : "appkey", "type" : "string"}, 
  {"name" : "con",
    "type" : {
      "type" : "record",
      "name" : "con",
      "fields" : [ {
        "name" : "xaphuong_id",
        "type" : [ "string", "null" ]
      }, {
        "name" : "thonxom",
        "type" : [ "string", "null" ]
      }, {
        "name" : "ngaysinh",
        "type" : "string"
      }, {
        "name" : "bhyt_sudungden",
        "type" : "string"
      }, {
        "name" : "chuho",
        "type" : [ "string", "null" ]
      }, {
        "name" : "noisinh",
        "type" : "string"
      }, {
        "name" : "gioitinh",
        "type" : "long"
      }, {
        "name" : "quanhuyen",
        "type" : [ "string", "null" ]
      }, {
        "name" : "hoten",
        "type" : "string"
      }, {
        "name" : "thonxom_id",
        "type" : [ "string", "null" ]
      }, {
        "name" : "dantoc",
        "type" : [ "string", "null" ]
      }, {
        "name" : "xaphuong",
        "type" : [ "string", "null" ]
      }, {
        "name" : "bhyt_sothe",
        "type" : "string"
      }, {
        "name" : "bhyt_sudungtu",
        "type" : "string"
      }, {
        "name" : "tinhthanh",
        "type" : [ "string", "null" ]
      }, {
        "name" : "bhyt_ngaycap",
        "type" : "string"
      }, {
        "name" : "tinhthanh_id",
        "type" : [ "string", "null" ]
      }, {
        "name" : "quanhuyen_id",
        "type" : [ "string", "null" ]
      } ]
    }
  } ]
}

def read_file_avro(filepath, topic):
    with open(filepath, 'rb') as fp:
        reader = fastavro.reader(fp)
        for record in reader:
            push_to_kafka(topic, record)
            print(record)
#         records = [r for r in reader]
    
def write_avro_file(filepath, records):
#     try:
    
    with open(filepath, 'wb') as outwriter:#encoding='UTF-8'
        writer(outwriter, SCHEMA, records)
    try:
#         topic = app.config.get("topic_producer_kafka_tiemchung", None)
        topic = 'tiemchung_mevabe_xaphuong'
        read_file_avro(filepath, topic)
#         newthread = worker_producer_kafka(1, "Thread-Producer-TiemChung",1, "tiemchung.avro", topic)
#         newthread.start()
#         newthread.join()
        
        
        
#         worker_consumer.join()
    except:
        print ("Error: unable to start thread")
    return True

def get_server_kafka():
    return '103.74.120.230:9092'

def ensure_topic_existed(topic):
    try:
        server_info = get_server_kafka()
        client = KafkaClient(server_info)
        client.ensure_topic_exists(topic)
        client.close()
    except ValueError:
        print(ValueError.message)

def push_to_kafka(topic, data):
#         '103.74.120.230:9092'
#         producer = KafkaProducer(bootstrap_servers=serverInfo)
        # for _ in range(100):
#         future = producer.send('namdv_test', b'{"value":"dang van nam", "key":"namdv"}')
    print("push_to_kafka "+str(topic))
    ensure_topic_existed(topic)
    server_info = get_server_kafka()
    producer = KafkaProducer(bootstrap_servers=[server_info], value_serializer=lambda m: json.dumps(m).encode('utf-8'))
    future = producer.send(topic, data)
    result = future.get(timeout=60)
    print(result)
    producer.flush()
        
# def listen_kafka(topic):
# #     try:
# #     ensure_topic_existed(topic)
#     server_info = get_server_kafka()
#     consumer = KafkaConsumer(topic, bootstrap_servers=[server_info], value_deserializer=lambda m: json.loads(m.decode('utf-8')))
#     for data in consumer:
#         print('listen_kafka consumer topic='+ str(topic))
#         print(data)
#         sync_tiemchung_to_mevabe(data.value)
#     except :
#         print(ValueError.message)



# class worker_producer_kafka (threading.Thread):
#     def __init__(self, threadID, name, counter, filepath,topic ):
#         threading.Thread.__init__(self)
#         self.threadID = threadID
#         self.name = name
#         self.counter = counter
#         self.filepath = filepath
#         self.topic = topic
#     def run(self):
#         print ("Starting worker_producer_kafka" + self.name)
#         read_file_avro(self.filepath, self.topic)
#         print ("Exiting worker_producer_kafka" + self.name)
        
# class kafka_consumer_worker (threading.Thread):
#     def __init__(self, threadID, name, counter, topic):
#         threading.Thread.__init__(self)
#         self.threadID = threadID
#         self.name = name
#         self.counter = counter
#         self.topic = topic
#          
#     def run(self):
# #         asyncio.set_event_loop(asyncio.new_event_loop())
#         print ("Starting kafka_consumer_worker" + self.name)
#         listen_kafka(self.topic)
#         print ("Exiting kafka_consumer_worker" + self.name)
        
        
