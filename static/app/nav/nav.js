define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    return [
        {
            "text": "Quản lý đơn vị",
            "icon": "fa fa-user",
            "type": "category",
            "visible": function () {
                return (this.userHasRole("admin") || (this.userHasRole("admin_donvi") && gonrinApp().hasTypeDonvi("donvinhanuoc") && !this.checkTuyenDonVi("16") && !this.checkTuyenDonVi("17")));
            },
            "entries": [
                {
                    "text": "Danh sách đơn vị trực thuộc",
                    "type": "view",
                    "collectionName": "donvidangki",
                    "route": "admin/donvi/collection",
                    "$ref": "app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/CollectionView",
                    "visible": function () {
                        return (this.userHasRole("admin"));
                    }
                },
                // {
                //     "text":"Đơn vị Y Tế",
                //     "type":"view",
                //     "collectionName":"donvi",
                //     "route":"canbo/DonViYTe/model",
                //     "$ref": "app/view/quanlyCanbo/DonViYTe/ModelView",
                //     "visible": function(){
                //         return (this.userHasRole("admin_donvi") || this.userHasRole("canbo") ) ;
                //     }
                // },
                {
                    "text": "Danh sách đơn vị trực thuộc",
                    "type": "view",
                    "collectionName": "donvidangki",
                    "route": "canbo/donvi/collection",
                    "$ref": "app/view/quanlyCanbo/DonViYTe/CollectionView",
                    "visible": function () {
                        return ((this.userHasRole("admin_donvi") && (this.checkTuyenDonVi("16") == false)) && gonrinApp().hasTypeDonvi("donvinhanuoc"));
                    }
                },
                {
                    "text": "Danh sách đơn vị cung ứng",
                    "type": "view",
                    "collectionName": "donvi",
                    "route": "donvicungung/collection",
                    "$ref": "app/donvicungung/view/CollectionView",
                    "visible": function () {
                        return (this.userHasRole("admin") || gonrinApp().hasTypeDonvi("donvicungung"));
                    }
                },
            ]
        },
        {
            "text": "Danh mục",
            "icon": "fa fa-list-ul",
            "type": "category",
            "visible": function () {
                return this.userHasRole("admin");
            },
            "entries": [{
                "text": "Dân Tộc",
                "type": "view",
                "collectionName": "dantoc",
                "route": "dantoc/collection",
                "$ref": "app/view/DanhMuc/DanToc/CollectionView",
                "visible": function () {
                    return this.userHasRole("admin");
                }
            },
            {
                "text": "Quốc Gia",
                "type": "view",
                "collectionName": "quocgia",
                "route": "quocgia/collection",
                "$ref": "app/view/DanhMuc/QuocGia/CollectionView",
                "visible": function () {
                    return this.userHasRole("admin");
                }
            },
            {
                "text": "Tỉnh Thành",
                "type": "view",
                "collectionName": "tinhthanh",
                "route": "tinhthanh/collection",
                "$ref": "app/view/DanhMuc/TinhThanh/CollectionView",
                "visible": function () {
                    return this.userHasRole("admin");
                }
            },
            {
                "text": "Quận Huyện",
                "type": "view",
                "collectionName": "quanhuyen",
                "route": "quanhuyen/collection",
                "$ref": "app/view/DanhMuc/QuanHuyen/CollectionView",
                "visible": function () {
                    return this.userHasRole("admin");
                }
            },
            {
                "text": "Xã Phường",
                "type": "view",
                "collectionName": "xaphuong",
                "route": "xaphuong/collection",
                "$ref": "app/view/DanhMuc/XaPhuong/CollectionView",
                "visible": function () {
                    return this.userHasRole("admin");
                }
            },
            ]
        },
        {
            "text": "Danh sách trang thiết bị y tế",
            // "icon": "fa fa-pump-medical",
            "type": "view",
            "collectionName": "medical_supplies",
            "route": "vattuyte/collection",
            "$ref": "app/vattuyte/view/CollectionView",
            "visible": function () {
                return true
            }
        },

        // {
        //     "text":"Danh sách đơn vị sản xuất",
        //     "type":"view",
        //     "collectionName":"donvi",
        //     "route":"donvicungung/collection",
        //     "$ref": "app/donvicungung/view/CollectionView",
        //     "visible": function(){
        //         return (this.userHasRole("admin") || gonrinApp().hasTypeDonvi("donvicungung"));
        //     }
        // },
        {
            "text": "Báo cáo trang thiết bị",
            "type": "view",
            "collectionName": "report_organization",
            "route": "baocaodonvi/collection",
            "$ref": "app/baocaodonvi/view/CollectionView",
            "visible": function () {
                return (!this.checkDonViCungUng("donvicungung"));

            }
        },
        {
            "text": "Báo báo cung ứng trang thiết bị",
            "type": "view",
            "collectionName": "report_supply_organization",
            "route": "baocaocungungtrangthietbi/collection",
            "$ref": "app/baocaodonvi_cungung/view/CollectionView",
            "visible": function () {
                return (this.userHasRole("admin") || this.checkDonViCungUng("donvicungung"))
            }
        },
        {
            "text": "Báo cáo vật tư PCD ĐV cung ứng",
            "type": "view",
            "route": "thongkebaocaodonvicungung/collection",
            "$ref": "app/baocaodonvi_cungung/view/CollectionView",
            "visible": function () {
                return (this.userHasRole("admin") || this.requireTuyenDonVi(["13", "9", "5", "6", "1"]));
                // return this.requireTuyenDonVi(["13", "9", "5", "6", "1"]);
            }
        },
        {
            "text": "Thống kê",
            "icon": "fa fa-list-ul",
            // "text": "Thống kê báo cáo đơn vị",
            "type": "category",
            // "collectionName": "report_organization",
            "visible": function () {
                return (this.userHasRole("admin") || this.requireTuyenDonVi(["13", "9", "5", "6", "1"]));
            },
            "entries": [
                
                {
                    "text": "Vật tư PCD Cơ sở y tế",
                    "type": "view",
                    "route": "thongkebaocao/search",
                    "$ref": "app/thongkebaocao/view/View",
                    "visible": function () {
                        return (this.userHasRole("admin") || this.requireTuyenDonVi(["13", "9", "5", "6", "1"]));
                        // return this.requireTuyenDonVi(["13", "9", "5", "6", "1"]);
                    }
                },
              
                {
                    "text": "Tổng hợp xuất kho vật tư PCD",
                    "type": "view",
                    "route": "tonghopxuatkhovattu/collection",
                    "$ref": "app/tonghopxuatkhovattu/view/CollectionView",
                    "visible": function () {
                        return (this.userHasRole("admin") || this.requireTuyenDonVi(["13", "9", "5", "6", "1"]));
                        // return this.requireTuyenDonVi(["13", "9", "5", "6", "1"]);
                    }
                },
            ]
        },
    ];

});