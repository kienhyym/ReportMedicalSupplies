define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');
	return [
		{
			"text":"Đăng kí đơn vị",
			"type":"view",
			"collectionName":"donvidangki",
			"route":"canbo/donvi/dangki",
			"$ref": "app/bases/RegisterView",
			"visible": function(){
				return true;
			}
		},
		{
			"text":"Đơn vị",
			"type":"view",
			"collectionName":"donvi",
			"route":"canbo/donvi/model",
			"$ref": "app/view/DonViYTe/ModelView",
			"visible": function(){
				return true;
			}
		},
		// {
		// 	"text":"Đơn vị",
		// 	"type":"view",
		// 	"collectionName":"donvi",
		// 	"route":"canbo/donvi/model",
		// 	"$ref": "app/view/DonViYTe/ModelView"
		// },
		{
			"text":"Danh sách đơn vị đăng kí",
			"type":"view",
			"collectionName":"donvidangki",
			"route":"canbo/donvidangki/collection",
			"$ref": "app/view/DangkiDonVi/CollectionView",
			"visible": function(){
				return true;
			}
		},
		{
			"text":"CHi tết đơn vị đăng kí",
			"type":"view",
			"collectionName":"donvidangki",
			"route":"canbo/donvidangki/model",
			"$ref": "app/view/DangkiDonVi/ModelView",
			"visible": function(){
				return true;
			}
		},
		{
			"text":"Tạo đơn vị",
			"type":"view",
			"collectionName":"donvi",
			"route":"canbo/donvi/create",
			"$ref": "app/view/DonViYTe/ModelViewCreateDonvi",
			"visible": function(){
				return false;
			}
		},
		{
			"text":"Dân Tộc",
			"type":"view",
			"collectionName":"dantoc",
			"route":"dantoc/collection",
			"$ref": "app/view/DanhMuc/DanToc/CollectionView",
			"visible": function(){
				return true;
			}
		},
		///them
		{
			"text":"Tuyến đơn vị",
			"type":"view",
			"collectionName":"tuyendonvi",
			"route":"tuyendonvi/collection",
			"$ref": "app/view/DanhMuc/TuyenDonVi/CollectionView",
			"visible": function(){
				// return this.userHasRole("admin");
				return true;
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
			"text":"Danh sách đơn vị trực thuộc",
			"type":"view",
			"collectionName":"donvidangki",
			"route":"canbo/donvi/collection",
			"$ref": "app/view/DonViYTe/CollectionView",
			"visible": function(){
				return true;
			}
		},
	
		{
			"text":"Danh sách người dùng trực thuộc",
			"type":"view",
			"collectionName":"user",
			"route":"user/collection",
			"$ref": "app/view/DonViYTe/UserDonVi/view/CollectionView"
		    //  "visible":true
		},
		{
		    "type":"view",
		    "collectionName":"user",
		    "route":"user/model",
		    "$ref": "app/view/UserDonVi/view/ModelView",
		    "visible": false
		},
		{
			"text":"Danh sách người dùng trực thuộc",
			"type":"view",
			"collectionName":"user",
			"route":"user/model",
			"$ref": "app/view/DonViYTe/UserDonVi/view/ModelDialogView",
			"visible":function() {
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
		    	// return false;
				return this.userHasRole("admin");
		    }
		},
		{
		    "type":"view",
		    "collectionName":"role",
		    "route":"role/model(/:id)",
		    "$ref": "app/view/HeThong/Role/ModelView",
		    "visible": false
		},

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
				return true;
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
				return true;
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
				return true
			}
		},
		{
			"type":"view",
			"collectionName":"xaphuong",
			"route":"xaphuong/model",
			"$ref": "app/view/DanhMuc/XaPhuong/ModelView",
			"visible":  false
		}
		// {
		//     "text":"Trình độ học vấn",
		//     "type":"view",
		//     "collectionName":"trinhdohocvan",
		//     "route":"trinhdohocvan/collection",
		//     "$ref": "app/view/DanhMuc/TrinhDoHocVan/CollectionView",
		//     "visible": function(){
		//     	return this.userHasRole("admin");
		//     }
		// },
		// {
		//     "type":"view",
		//     "collectionName":"trinhdohocvan",
		//     "route":"trinhdohocvan/model",
		//     "$ref": "app/view/DanhMuc/TrinhDoHocVan/ModelView",
		//     "visible":  false
		// },
		// {
		//     "text":"Nghề Nghiệp",
		//     "type":"view",
		//     "collectionName":"nghenghiep",
		//     "route":"nghenghiep/collection",
		//     "$ref": "app/view/DanhMuc/NgheNghiep/CollectionView",
		//     "visible": function(){
		//     	return this.userHasRole("admin");
		//     }
		// },
		// {
		//     "type":"view",
		//     "collectionName":"nghenghiep",
		//     "route":"nghenghiep/model",
		//     "$ref": "app/view/DanhMuc/NgheNghiep/ModelView",
		//     "visible":  false
		// },
	
	];

});


