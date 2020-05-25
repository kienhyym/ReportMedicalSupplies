define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    return [
        {
            "text": "Quản lý đơn vị",
            "icon": "fa fa-user",
            "type": "category",
            "entries": [{
                    "text": "Tạo đơn vị Y Tế",
                    "type": "view",
                    "collectionName": "donvi",
                    "route": "admin/DonViYTe/create",
                    "$ref": "app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/ModelView",
                    "visible": function() {
                        return (this.userHasRole("admin"));
                    }
                },
                {
                    "text": "Danh sách đơn vị",
                    "type": "view",
                    "collectionName": "donvidangki",
                    "route": "admin/donvi/collection",
                    "$ref": "app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/CollectionView",
                    "visible": function() {
                        return (this.userHasRole("admin"));
                    }
                },
                {
                    "text": "Đơn vị Y Tế",
                    "type": "view",
                    "collectionName": "donvi",
                    "route": "canbo/DonViYTe/model",
                    "$ref": "app/view/quanlyCanbo/DonViYTe/ModelView",
                    "visible": function() {
                        return (this.userHasRole("admin_tyt") || this.userHasRole("canbo_tyt") || this.userHasRole("admin_benhvien") || this.userHasRole("canbo_banhvien"));
                    }
                },
                {
                    "text": "Danh sách người dùng trực thuộc",
                    "type": "view",
                    "collectionName": "user",
                    "route": "canbo/user/collection",
                    "$ref": "app/view/quanlyCanbo/DonViYTe/UserDonVi/view/CollectionView",
                    "visible": function() {
                        return (this.userHasRole("admin_benhvien") || this.userHasRole("admin_tyt"));
                    }
                },
            ]
        },
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
    ];

});