define(function (require) {
	"use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    return [
            {
        		"text":"Quản lý đơn vị",
        		"icon":"fa fa-book",
        		"type":"category",
        		"visible": function(){
			    	return true;
			    },
        		"entries":[
					{
        			    "text":"Đơn vị Y tế",
        			    "type":"view",
        			    "collectionName":"donvi",
        			    "route":"canbo/donvi/model",
        			    "$ref": "app/view/DonViYTe/ModelView",
        			    "visible": function(){
							return true;
        			    	// return this.userHasRole("admin");
        			    }
        			},
					{
        			    "text":"Danh sách đơn vị đăng kí",
        			    "type":"view",
        			    "collectionName":"donvidangki",
        			    "route":"canbo/donvidangki/collection",
        			    "$ref": "app/view/DangkiDonVi/CollectionView",
        			    "visible": function(){
        			    	return this.userHasRole("admin_donvi");;
        			    }
					},
					{
        			    "text":"Danh sách đơn vị trực thuộc",
        			    "type":"view",
        			    "collectionName":"donvidangki",
        			    "route":"canbo/donvi/collection",
        			    "$ref": "app/view/DonViYTe/CollectionView",
        			    "visible": function(){
        			    	return this.userHasRole("admin_donvi");
        			    }
					},
        			{
        			    "text":"Tuyến đơn vị",
        			    "type":"view",
        			    "collectionName":"tuyendonvi",
        			    "route":"tuyendonvi/collection",
        			    "$ref": "app/view/DanhMuc/TuyenDonVi/CollectionView",
        			    "visible": function(){
							return false;
        			    }
        			},
        			{
        			    "type":"view",
        			    "collectionName":"tuyendonvi",
        			    "route":"tuyendonvi/model",
        			    "$ref": "app/view/DanhMuc/TuyenDonVi/ModelView",
        			    "visible":  false
					},
					{
						"text":"Danh sách người dùng trực thuộc",
						"type":"view",
						"collectionName":"user",
						"route":"user/collection",
						"$ref": "app/view/DonViYTe/UserDonVi/view/CollectionView",
						"visible":function() {
							// return true;
							return this.userHasRole("admin_donvi");
						}
					},
					{
						"text":"Danh sách người dùng trực thuộc",
						"type":"view",
						"collectionName":"user",
						"route":"user/model",
						"$ref": "app/view/DonViYTe/UserDonVi/view/ModelDialogView",
						"visible":function() {
							return false;
						}
				   	},
				   	{
					   "type":"view",
					   "collectionName":"user",
					   "route":"user/model",
					   "$ref": "app/view/UserDonVi/view/ModelView",
					   "visible": false
				   	},
					{
        			    "text":"Dân Tộc",
        			    "type":"view",
        			    "collectionName":"dantoc",
        			    "route":"dantoc/collection",
        			    "$ref": "app/view/DanhMuc/DanToc/CollectionView",
        			    "visible": function(){
							return false;
        			    	// return this.userHasRole("admin");
        			    }
					},
        			{
        			    "text":"Quản trị vai trò",
        			    "type":"view",
        			    "collectionName":"role",
        			    "route":"role/collection",
        			    "$ref": "app/view/HeThong/Role/CollectionView",
        			    "visible": function(){
        			    	return false;
       			    	// return this.userHasRole("admin");
        			    }
        			},
        			{
        			    "type":"view",
        			    "collectionName":"role",
        			    "route":"role/model(/:id)",
        			    "$ref": "app/view/HeThong/Role/ModelView",
        			    "visible": false
        			},
        		]
            },
            {
        		"text":"Danh Mục",
        		"icon":"fa fa-book",
        		"type":"category",
        		"visible": function(){
					// return this.userHasRole("admin");
					return false;
			    },
        		"entries":[
        			{
        			    "text":"Dân Tộc",
        			    "type":"view",
        			    "collectionName":"dantoc",
        			    "route":"dantoc/collection",
        			    "$ref": "app/view/DanhMuc/DanToc/CollectionView",
        			    "visible": function(){
        			    	return this.userHasRole("admin");
        			    }
        			},
        			{
        			    "type":"view",
        			    "collectionName":"dantoc",
        			    "route":"dantoc/model",
        			    "$ref": "app/view/DanhMuc/DanToc/ModelView",
        			    "visible":  false
        			},
        			{
        			    "text":"Quốc Gia",
        			    "type":"view",
        			    "collectionName":"quocgia",
        			    "route":"quocgia/collection",
        			    "$ref": "app/view/DanhMuc/QuocGia/CollectionView",
        			    "visible": function(){
        			    	return this.userHasRole("admin");
        			    }
        			},
        			{
        			    "type":"view",
        			    "collectionName":"quocgia",
        			    "route":"quocgia/model",
        			    "$ref": "app/view/DanhMuc/QuocGia/ModelView",
        			    "visible":  false
        			},
        			{
        			    "text":"Tỉnh Thành",
        			    "type":"view",
        			    "collectionName":"tinhthanh",
        			    "route":"tinhthanh/collection",
        			    "$ref": "app/view/DanhMuc/TinhThanh/CollectionView",
        			    "visible": function(){
        			    	return this.userHasRole("admin");
        			    }
        			},
        			{
        			    "type":"view",
        			    "collectionName":"tinhthanh",
        			    "route":"tinhthanh/model",
        			    "$ref": "app/view/DanhMuc/TinhThanh/ModelView",
        			    "visible":  false
        			},
        			{
        			    "text":"Quận Huyện",
        			    "type":"view",
        			    "collectionName":"quanhuyen",
        			    "route":"quanhuyen/collection",
        			    "$ref": "app/view/DanhMuc/QuanHuyen/CollectionView",
        			    "visible": function(){
							// return this.userHasRole("admin");
							return this.userHasRole("admin");
        			    }
        			},
        			{
        			    "type":"view",
        			    "collectionName":"quanhuyen",
        			    "route":"quanhuyen/model",
        			    "$ref": "app/view/DanhMuc/QuanHuyen/ModelView",
        			    "visible":  false
        			},
        			{
        			    "text":"Xã Phường",
        			    "type":"view",
        			    "collectionName":"xaphuong",
        			    "route":"xaphuong/collection",
        			    "$ref": "app/view/DanhMuc/XaPhuong/CollectionView",
        			    "visible": function(){
        			    	return this.userHasRole("admin");
        			    }
        			},
        			{
        			    "type":"view",
        			    "collectionName":"xaphuong",
        			    "route":"xaphuong/model",
        			    "$ref": "app/view/DanhMuc/XaPhuong/ModelView",
        			    "visible":  false
        			}
        		]
            },
        ];

});


