define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    return [
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