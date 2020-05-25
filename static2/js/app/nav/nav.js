define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    return [

        {
            "text": "Lịch kiểm tra",
            "icon": "fa fa-calendar",
            "type": "view",
            // "collectionName": "thietbiduockiemtra",
            "route": "lichthanhtra",
            // "$ref": "app/lichthanhtra/view/ModelView",
            "visible": function() {
                return true
            }
        },
        {
            "text": "Sổ quản lý thiết bị",
            "icon": "fa fa-book",
            "type": "view",
            "collectionName": "equipmentdetails",
            "route": "equipmentdetails/collection",
            "$ref": "app/equipmentdetails/js/CollectionView",
            "visible": function() {
                return true

            }
        },
        {
            "type": "view",
            "collectionName": "equipmentdetails",
            "route": "equipmentdetails/model(/:id)",
            "$ref": "app/equipmentdetails/js/ModelView",
            "visible": function() {
                return false;
            }
        },

        {
            "text": "Hệ thống",
            "icon": "fa fa-home",
            "type": "category",
            "visible": function() {
                return this.checkVaitro([1, 2]);

            },
            "entries": [{
                    "text": "<label class='m-0 ml-4'>Nhân viên</label>",
                    "type": "view",
                    "collectionName": "user",
                    "route": "user/collection",
                    "$ref": "app/hethong/user/js/CollectionView",
                    "visible": function() {
                        return true

                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Khoa</label>",
                    "type": "view",
                    "collectionName": "department",
                    "route": "department/collection",
                    "$ref": "app/hethong/department/view/CollectionView",
                    "visible": function() {
                        return true

                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Phòng</label>",
                    "type": "view",
                    "collectionName": "room",
                    "route": "room/collection",
                    "$ref": "app/hethong/room/view/CollectionView",
                    "visible": function() {
                        return true

                    }
                },
                // {
                // 	"text": "Vai trò",
                // 	"type": "view",
                // 	"collectionName": "rank",
                // 	"route": "rank/collection",
                // 	"$ref": "app/rank/js/CollectionView",
                // 	"visible": function () {
                // 		return true
                // 	}
            ]
        },

        {
            "text": "Danh mục",
            "icon": "fa fa-list-ul",
            "type": "category",
            "visible": function() {
                return this.checkVaitro([1, 2]);

            },
            "entries": [{
                    "text": "<label class='m-0 ml-4'>Trang thiết bị</label>",
                    "type": "view",
                    "collectionName": "medicalequipment",
                    "route": "medicalequipment/collection",
                    "visible": function() {
                        return true
                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Nơi sản xuất</label>",
                    "type": "view",
                    "collectionName": "nation",
                    "route": "nation/collection",
                    "visible": function() {
                        return true;
                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Hãng sản xuất</label>",
                    "type": "view",
                    "collectionName": "manufacturer",
                    "route": "manufacturer/collection",
                    "visible": function() {
                        return true;
                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Nhà cung cấp thiết bị</label>",
                    "type": "view",
                    "collectionName": "organization",
                    "route": "organization/collection",
                    "visible": function() {
                        return true

                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Dụng cụ bảo dưỡng</label>",
                    "type": "view",
                    "collectionName": "preparationtools",
                    "route": "preparationtools/collection",
                    "visible": function() {
                        return true
                    }
                },

            ]
        },

        {
            "text": "Báo cáo thống kê",
            "icon": "fa fa-file-text-o",
            "type": "category",
            "entries": [


                {
                    "text": "<label class='m-0 ml-4'>Kiểm tra thiết bị</label>",
                    "type": "view",
                    "collectionName": "equipmentinspectionform",
                    "route": "equipmentinspectionform/collection",
                    "$ref": "app/chungtu/equipmentinspectionform/js/CollectionView",
                    "visible": function() {
                        return true

                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Yêu cầu sửa chữa</label>",
                    "type": "view",
                    "collectionName": "repairrequestform",
                    "route": "repairrequestform/collection",
                    "$ref": "app/chungtu/repairrequestform/js/CollectionView",
                    "visible": function() {
                        return true

                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Biên bản kiểm tra</label>",
                    "type": "view",
                    "collectionName": "devicestatusverificationform",
                    "route": "devicestatusverificationform/collection",
                    "$ref": "app/chungtu/devicestatusverificationform/js/CollectionView",
                    "visible": function() {
                        return true

                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Phiếu kiểm định</label>",
                    "type": "view",
                    "collectionName": "certificateform",
                    "route": "certificateform/collection",
                    "$ref": "app/chungtu/certificateform/js/CollectionView",
                    "visible": function() {
                        return true
                    }
                },
            ]
        },



        // {
        // 	"text": "Danh mục",
        // 	"icon": "fa fa-home",
        // 	"type": "category",

        // 	// "visible": function(){
        // 	// 	//console.log(this.checkHasRole("Admin"));
        // 	// 	return this.checkHasRole("Admin") ;
        // 	// },
        // 	"entries": [
        // 		{
        // 			"text": "Quốc gia",
        // 			"icon": "far fa-clipboard",
        // 			"type": "view",
        // 			"collectionName": "nation",
        // 			"route": "nation/collection",
        // 			"$ref": "app/danhmuc/Nation/view/CollectionView",
        // 			// "visible": function(){
        // 			// 	//console.log(this.checkHasRole("Admin"));
        // 			// 	return this.checkHasRole("Admin") ;
        // 			// }
        // 		},
        // 		{
        // 			"type": "view",
        // 			"icon": "far fa-clipboard",
        // 			"collectionName": "nation",
        // 			"route": "nation/model(/:id)",
        // 			"$ref": "app/danhmuc/Nation/view/ModelView",
        // 			"visible": false
        // 		},
        // 		{
        // 			"text": "Tỉnh thành",
        // 			"icon": "far fa-clipboard",
        // 			"type": "view",
        // 			"collectionName": "province",
        // 			"route": "province/collection",
        // 			"$ref": "app/danhmuc/Province/view/CollectionView",
        // 			// "visible": function(){
        // 			// 	return this.checkHasRole("Admin") ;
        // 			// }
        // 		},
        // 		{
        // 			"type": "view",
        // 			"icon": "far fa-clipboard",
        // 			"collectionName": "province",
        // 			"route": "province/model(/:id)",
        // 			"$ref": "app/danhmuc/Province/view/ModelView",
        // 			"visible": false
        // 		},
        // 		{
        // 			"text": "Quận huyện",
        // 			"icon": "far fa-clipboard",
        // 			"type": "view",
        // 			"collectionName": "district",
        // 			"route": "district/collection",
        // 			"$ref": "app/danhmuc/District/view/CollectionView",
        // 			// "visible": function(){
        // 			// 	return this.checkHasRole("Admin") ;
        // 			// }
        // 		},
        // 		{
        // 			"type": "view",
        // 			"icon": "far fa-clipboard",
        // 			"collectionName": "district",
        // 			"route": "district/model(/:id)",
        // 			"$ref": "app/danhmuc/District/view/ModelView",
        // 			"visible": false
        // 		},
        // 		{
        // 			"text": "Xã phường",
        // 			"icon": "far fa-clipboard",
        // 			"type": "view",
        // 			"collectionName": "wards",
        // 			"route": "wards/collection",
        // 			"$ref": "app/danhmuc/Wards/view/CollectionView",
        // 			// "visible": function(){
        // 			// 	return this.checkHasRole("Admin") ;
        // 			// }
        // 		},
        // 		{
        // 			"type": "view",
        // 			"icon": "far fa-clipboard",
        // 			"collectionName": "wards",
        // 			"route": "wards/model(/:id)",
        // 			"$ref": "app/danhmuc/Wards/view/ModelView",
        // 			"visible": false
        // 		},
        // 	]
        // },
        {
            "text": "Quản lý kho",
            "icon": "fa fa-file-text-o",
            "type": "category",
            "entries": [{
                    "text": "<label class='m-0 ml-4'>Thiết bị và vật tư y tế</label>",
                    "type": "view",
                    "collectionName": "item",
                    "route": "item/collection",
                    "visible": function() {
                        return true
                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Nhập hàng</label>",
                    "type": "view",
                    "collectionName": "goodsreciept",
                    "route": "goodsreciept/collection",
                    "visible": function() {
                        return true
                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Xuất hàng</label>",
                    "type": "view",
                    "collectionName": "purchaseorder",
                    "route": "purchaseorder/collection",
                    "visible": function() {
                        return true
                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Thanh toán</label>",
                    "type": "view",
                    "collectionName": "payment",
                    "route": "payment/collection",
                    "visible": function() {
                        return true
                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Chuyển kho</label>",
                    "type": "view",
                    "collectionName": "movewarehouse",
                    "route": "movewarehouse/collection",
                    "visible": function() {
                        return true
                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Kho</label>",
                    "type": "view",
                    "collectionName": "warehouse",
                    "route": "warehouse/collection",
                    "visible": function() {
                        return true
                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Tiền tệ</label>",
                    "type": "view",
                    "collectionName": "currency",
                    "route": "currency/collection",
                    "visible": function() {
                        return true
                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Đơn vị tính</label>",
                    "type": "view",
                    "collectionName": "unit",
                    "route": "unit/collection",
                    "visible": function() {
                        return true
                    }
                },
                {
                    "text": "<label class='m-0 ml-4'>Danh sách đơn vị</label>",
                    "type": "view",
                    "collectionName": "organization",
                    "route": "organization/collection",
                    "visible": function() {
                        return true
                    }
                },
                // {
                //     "text": "<label class='m-0 ml-4'>Đơn vị mua hàng</label>",
                //     "type": "view",
                //     "collectionName": "workstation",
                //     "route": "workstation/collection",
                //     "visible": function() {
                //         return true
                //     }
                // },
            ]
        },
    ];

});