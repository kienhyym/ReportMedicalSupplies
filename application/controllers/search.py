from application.server import app
from gatco.response import json

@app.route('/api/v1/search', methods=['POST'])
async def search(request):
    param = request.json
    data = [
            {
                "pos_id": 125,
                "pos_name": "Yu Tang - Chùa Láng",
                "pos_longitude": 105.8078288,
                "pos_latitude": 21.0231976,
                "pos_radius_detal": 100,
                "pos_parent" :   "YUTANG",
                "description" :   "",
                "open_time":    "09:00 - 22:30",
                "phone_number":    "842466883232",
                "pos_address":    "32 Chùa Láng, Q. Đống Đa, Hà Nội",
                "image_path":    "https://image.foodbook.vn/fb/pos/2018-05-26-10_08_28_4C4F404E-FD57-4331-88E8-D79B449CC16F.JPG",
                "image_path_thumb":    "https://image.foodbook.vn/fb/pos/2018-05-26-09_30_15_4C4F404E-FD57-4331-88E8-D79B449CC16F.JPG",
                "cashback": 10,
                "estimate_cashback_amount":    20000
            },
            {
                "pos_id": 126,
                "pos_name": "Yu Tang 2 - Chùa Láng",
                "pos_longitude": 105.8078288,
                "pos_latitude": 21.0231976,
                "pos_radius_detal": 100,
                "pos_parent" :   "YUTANG",
                "description" :   "",
                "open_time":    "09:00 - 22:30",
                "phone_number":    "842466883232",
                "pos_address":    "32 Chùa Láng, Q. Đống Đa, Hà Nội",
                "image_path":    "https://image.foodbook.vn/fb/pos/2018-05-26-10_08_28_4C4F404E-FD57-4331-88E8-D79B449CC16F.JPG",
                "image_path_thumb":    "https://image.foodbook.vn/fb/pos/2018-05-26-09_30_15_4C4F404E-FD57-4331-88E8-D79B449CC16F.JPG",
                "cashback": 15,
                "estimate_cashback_amount":    31000
             }
            ]
    return json({"objects":data})