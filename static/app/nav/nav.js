define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    return [
        {
            "text":"Quản lý đơn vị",
            "icon":"fa fa-user",
            "type":"category",
            "visible": function(){
                return (this.userHasRole("admin")||((this.userHasRole("admin_donvi") || this.userHasRole("canbo") )&& gonrinApp().hasTypeDonvi("donvinhanuoc")));
            },
            "entries":[
                // {
                //     "text":"Tạo đơn vị Y Tế",
                //     "type":"view",
                //     "collectionName":"donvi",
                //     "route":"admin/DonViYTe/create",
                //     "$ref": "app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/ModelView",
                //     "visible": function(){
                //         return (this.userHasRole("admin")) ;
                //     }
                // },
                {
                    "text":"Danh sách đơn vị trực thuộc",
                    "type":"view",
                    "collectionName":"donvidangki",
                    "route":"admin/donvi/collection",
                    "$ref": "app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/CollectionView",
                    "visible": function(){
                        return (this.userHasRole("admin"));
                    }
                },
                {
                    "text":"Đơn vị Y Tế",
                    "type":"view",
                    "collectionName":"donvi",
                    "route":"canbo/DonViYTe/model",
                    "$ref": "app/view/quanlyCanbo/DonViYTe/ModelView",
                    "visible": function(){
                        return (this.userHasRole("admin_donvi") || this.userHasRole("canbo") ) ;
                    }
                },
                // {
                //     "text":"Danh sách đơn vị đăng kí",
                //     "type":"view",
                //     "collectionName":"donvidangki",
                //     "route":"canbo/donvidangki/collection",
                //     "$ref": "app/view/quanlyCanbo/DangkiDonVi/CollectionView",
                //     "visible": function(){
                //         return (this.userHasRole("admin_donvi") && (this.checkTuyenDonVi("10") == false));
                //     }
                // },
                {
                    "text":"Danh sách đơn vị trực thuộc",
                    "type":"view",
                    "collectionName":"donvidangki",
                    "route":"canbo/donvi/collection",
                    "$ref": "app/view/quanlyCanbo/DonViYTe/CollectionView",
                    "visible": function(){
                        return (this.userHasRole("admin_donvi") && (this.checkTuyenDonVi("5") == false));
                    }
                },
                // {
                //     "text":"Danh sách người dùng trực thuộc",
                //     "type":"view",
                //     "collectionName":"user",
                //     "route":"canbo/user/collection",
                //     "$ref": "app/view/quanlyCanbo/DonViYTe/UserDonVi/view/CollectionView",
                //     "visible":function() {
                //         return (this.userHasRole("admin_donvi"));
                //     }
                // },

        ]},
        {
            "text": "Danh mục",
            "icon": "fa fa-list-ul",
            "type": "category",
            "visible": function() {
                return this.userHasRole("admin");
            },
            "entries": [{
                "text": "Dân Tộc",
                "type": "view",
                "collectionName": "dantoc",
                "route": "dantoc/collection",
                "$ref": "app/view/DanhMuc/DanToc/CollectionView",
                "visible": function() {
                    return this.userHasRole("admin");
                }
            },
            {
                "text": "Quốc Gia",
                "type": "view",
                "collectionName": "quocgia",
                "route": "quocgia/collection",
                "$ref": "app/view/DanhMuc/QuocGia/CollectionView",
                "visible": function() {
                    return this.userHasRole("admin");
                }
            },
            {
                "text": "Tỉnh Thành",
                "type": "view",
                "collectionName": "tinhthanh",
                "route": "tinhthanh/collection",
                "$ref": "app/view/DanhMuc/TinhThanh/CollectionView",
                "visible": function() {
                    return this.userHasRole("admin");
                }
            },
            {
                "text": "Quận Huyện",
                "type": "view",
                "collectionName": "quanhuyen",
                "route": "quanhuyen/collection",
                "$ref": "app/view/DanhMuc/QuanHuyen/CollectionView",
                "visible": function() {
                    return this.userHasRole("admin");
                }
            },
            {
                "text": "Xã Phường",
                "type": "view",
                "collectionName": "xaphuong",
                "route": "xaphuong/collection",
                "$ref": "app/view/DanhMuc/XaPhuong/CollectionView",
                "visible": function() {
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
            "visible": function() {
                return true
            }
        },
        {
            "text":"Danh sách đơn vị sản xuất",
            "type":"view",
            "collectionName":"donvi",
            "route":"donvicungung/collection",
            "$ref": "app/donvicungung/view/CollectionView",
            "visible": function(){
                return (this.userHasRole("admin") || gonrinApp().hasTypeDonvi("donvicungung"));
            }
        },
        {
            "text": "Báo cáo trang thiết bị",
            "type": "view",
            "collectionName": "report_organization",
            "route": "baocaodonvi/collection",
            "$ref": "app/baocaodonvi/view/CollectionView",
            // "visible": function() {
            //     return this.userHasRole("admin");
            // }
        },
        {
            "text": "Thống kê báo cáo đơn vị",
            "type": "view",
            // "collectionName": "report_organization",
            "route": "thongkebaocao/collection",
            "$ref": "app/thongkebaocao/view/View",
            // "visible": function() {
            //     return this.userHasRole("admin");
            // }
        },
    ];

});