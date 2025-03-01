define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    return [
        {
            "collectionName": "user",
            "route": "user/collection",
            "$ref": "app/hethong/user/js/CollectionView",
        },
        {
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
            "type": "view",
            "collectionName": "dantoc",
            "route": "dantoc/model",
            "$ref": "app/view/DanhMuc/DanToc/ModelView",
            "visible": false
        },
        {
            "text": "Quốc Gia",
            "type": "view",
            "collectionName": "quocgia",
            "route": "quocgia/collection",
            "$ref": "app/view/DanhMuc/QuocGia/CollectionView",
        },
        {
            "type": "view",
            "collectionName": "quocgia",
            "route": "quocgia/model",
            "$ref": "app/view/DanhMuc/QuocGia/ModelView",
        },
        {
            "text": "Tỉnh Thành",
            "type": "view",
            "collectionName": "tinhthanh",
            "route": "tinhthanh/collection",
            "$ref": "app/view/DanhMuc/TinhThanh/CollectionView",
        },
        {
            "type": "view",
            "collectionName": "tinhthanh",
            "route": "tinhthanh/model",
            "$ref": "app/view/DanhMuc/TinhThanh/ModelView",
        },
        {
            "text": "Quận Huyện",
            "type": "view",
            "collectionName": "quanhuyen",
            "route": "quanhuyen/collection",
            "$ref": "app/view/DanhMuc/QuanHuyen/CollectionView",
        },
        {
            "type": "view",
            "collectionName": "quanhuyen",
            "route": "quanhuyen/model",
            "$ref": "app/view/DanhMuc/QuanHuyen/ModelView",
        },
        {
            "text": "Xã Phường",
            "type": "view",
            "collectionName": "xaphuong",
            "route": "xaphuong/collection",
            "$ref": "app/view/DanhMuc/XaPhuong/CollectionView",
        },
        {
            "type": "view",
            "collectionName": "xaphuong",
            "route": "xaphuong/model",
            "$ref": "app/view/DanhMuc/XaPhuong/ModelView",
        },
        {
            "collectionName": "donvi",
            "route": "admin/DonViYTe/create",
            "$ref": "app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/ModelView"
        },
        {
            "collectionName": "donvidangki",
            "route": "admin/donvi/collection",
            "$ref": "app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/CollectionView"
        },
        {
            "collectionName": "donvi",
            "route": "canbo/DonViYTe/model",
            "$ref": "app/view/quanlyCanbo/DonViYTe/ModelView"
        },
        {
            "collectionName": "donvidangki",
            "route": "canbo/donvi/model",
            "$ref": "app/view/quanlyCanbo/DonViYTe/ModelView"
        },
        {
            "collectionName": "user",
            "route": "canbo/user/collection",
            "$ref": "app/view/quanlyCanbo/DonViYTe/UserDonVi/view/CollectionView"
        },
        {
            "collectionName": "role",
            "route": "role/collection",
            "$ref": "app/view/HeThong/Role/CollectionView"
        },
        {
            "collectionName": "role",
            "route": "role/model(/:id)",
            "$ref": "app/view/HeThong/Role/ModelView"
        },

        {
            "collectionName": "medical_supplies",
            "route": "vattuyte/collection",
            "$ref": "app/vattuyte/view/CollectionView"
        },
        {
            "collectionName": "medical_supplies",
            "route": "vattuyte/model(/:id)",
            "$ref": "app/vattuyte/view/ModelView"
        },

        {
            "collectionName": "report_organization",
            "route": "baocaodonvi/collection",
            "$ref": "app/baocaodonvi/view/CollectionView"
        },
        {
            "collectionName": "report_organization",
            "route": "baocaodonvi/model(/:id)",
            "$ref": "app/baocaodonvi/view/ModelView"
        },

        {
            "collectionName": "donvi",
            "route": "donvicungung/collection",
            "$ref": "app/view/DonViCungUng/CollectionView"
        },
        {
            "collectionName": "donvi",
            "route": "donvicungung/model(/:id)",
            "$ref": "app/view/DonViCungUng/ModelView"
        },
        {
            "collectionName": "donvi",
            "route": "donvicungung/model/create",
            "$ref": "app/view/DonViCungUng/ModelViewCreateDonvi"
        },

	    {
            "collectionName":"donvidangki",
            "route":"canbo/donvi/collection",
            "$ref": "app/view/quanlyCanbo/DonViYTe/CollectionView"
        },
        {
			"collectionName":"donvi",
			"route":"canbo/DonViYTe/create",
			"$ref": "app/view/quanlyCanbo/DonViYTe/ModelViewCreateDonvi"
        },
        {
            // "collectionName":"donvidangki",
            "route":"thongkebaocao/search",
            "$ref": "app/thongkebaocao/view/View"
        },
        {
            // "collectionName":"donvidangki",
            "route":"thongkebaocao_cungung/search",
            "$ref": "app/thongkebaocao_cungung/view/View"
        },

        {
            "collectionName": "report_supply_organization",
            "route": "baocaodonvi_cungung/collection",
            "$ref": "app/baocaodonvi_cungung/view/CollectionView",
        },
        {
            "collectionName": "report_supply_organization",
            "route": "baocaodonvi_cungung/model(/:id)",
            "$ref": "app/baocaodonvi_cungung/view/ModelView",
        },

        {
            "collectionName": "synthetic_release",
            "route": "tonghopxuatkhovattu/collection",
            "$ref": "app/tonghopxuatkhovattu/view/CollectionView",
        },
        {
            "collectionName": "synthetic_release",
            "route": "tonghopxuatkhovattu/model(/:id)",
            "$ref": "app/tonghopxuatkhovattu/view/ModelView",
        },
        {   
            "text": "Mã Hiệu Vật Tư",
            "type": "view",
            "collectionName": "code_supplies",
            "route": "code_supplies/collection",
            "$ref": "app/view/DanhMuc/MaHieuVatTu/CollectionView",
        },
        {
            "collectionName": "code_supplies",
            "route": "code_supplies/model(/:id)",
            "$ref": "app/view/DanhMuc/MaHieuVatTu/ModelView",
        },
        {   
            "text": "Nhóm Vật Tư",
            "type": "view",
            "collectionName": "group_supplies",
            "route": "group_supplies/collection",
            "$ref": "app/view/DanhMuc/NhomVatTu/CollectionView",
        },
        {
            "collectionName": "group_supplies",
            "route": "group_supplies/model(/:id)",
            "$ref": "app/view/DanhMuc/NhomVatTu/ModelView",
        },
        {   
            "text": "Hãng Sản Xuất",
            "type": "view",
            "collectionName": "brands",
            "route": "brands/collection",
            "$ref": "app/view/DanhMuc/HangSanXuat/CollectionView",
        },
        {
            "collectionName": "brands",
            "route": "brands/model(/:id)",
            "$ref": "app/view/DanhMuc/HangSanXuat/ModelView",
        },
       
        
    ];

});