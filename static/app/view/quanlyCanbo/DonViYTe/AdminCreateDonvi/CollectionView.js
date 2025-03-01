define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');
    
    var template 			= require('text!app/view/quanlyCanbo/DonViYTe/AdminCreateDonvi/tpl/collection.html'),
    	schema 				= require('json!app/view/quanlyCanbo/DonViYTe/DonViYTeSchema.json');
	var CustomFilterView      = require('app/base/view/CustomFilterView'),
		TinhThanhSelectView 	= require("app/view/DanhMuc/TinhThanh/SelectView"),
		QuanHuyenSelectView 	= require("app/view/DanhMuc/QuanHuyen/SelectView");
    return Gonrin.CollectionView.extend({
    	template : template,
    	modelSchema	: schema,
    	urlPrefix: "/api/v1/",
		collectionName: "donvi",
		tools: [
			{
				name: "create",
				type: "button",
				buttonClass: " btn-success btn-sm",
				label: "Tạo mới",
				command: function () {
					var self = this;
					self.getApp().getRouter().navigate("admin/DonViYTe/create");
				},
			},
		],
    	uiControl:{
    		fields: [
		     	{ field: "name", label: "Tên đơn vị"},
	           	{
	            	 field: "tinhthanh_id", 
	            	 label: "Tỉnh thành",
	            	 foreign: "tinhthanh",
	            	 foreignValueField: "id",
					 foreignTextField: "ten",
	           	 },
	           	{
	            	 field: "quanhuyen_id", 
	            	 label: "Quận/Huyện",
	            	 foreign: "quanhuyen",
	            	 foreignValueField: "id",
					 foreignTextField: "ten",
	           	 },
	           	{
	            	 field: "xaphuong_id", 
	            	 label: "Xã/Phường",
	            	 foreign: "xaphuong",
	            	 foreignValueField: "id",
					 foreignTextField: "ten",
				},
				{
					field: "tuyendonvi_id", 
					label: "Tuyến đơn vị",
					template: (rowData) => {
						if(rowData.tuyendonvi) {
							return `<div class="font-weight-bold">${rowData.tuyendonvi.ten}</div>`;
						}
						return '';
					}
			   	},
				{ 
					field: "active", 
					label: "Trạng thái",
					template: (rowData) => {
						if(rowData.active == false) {
							return '<div class="text-danger">Đang bị khóa</div>';
						}
						return '';
					}
				}
		    ],
		    pagination: {
	            	page: 1,
	            	pageSize: 20
	            },
		    onRowClick: function(event){
	    		if(event.rowId){
	    			this.getApp().getRouter().navigate("canbo/donvi/model?id="+ event.rowId);

	        	}
			},
			datatableClass:"table table-mobile",
			onRendered: function (e) {
		    	// gonrinApp().responsive_table();
			}
		    // onRendered: function (e) {
			// 	var self = this;
			// 	if (this.uiControl.dataSource == null || this.uiControl.dataSource.length<=0){
			// 		self.$el.find("#grid").hide();
			// 		self.getApp().getRouter().navigate("canbo/donvi/collection");
			// 	}
			// }
    	},
	    render: function () {
			var self = this;



			self.$el.find("#Tinhthanh").ref({
                textField: "ten",
                valueField: "id",
                dataSource: TinhThanhSelectView,
			});
			self.$el.find("#Quanhuyen").ref({
                textField: "ten",
                valueField: "id",
                dataSource: QuanHuyenSelectView,
			});

			var filter = new CustomFilterView({
    			el: self.$el.find("#grid_search"),
    			sessionKey: self.collectionName +"_filter"
			});
			var created_by = self.getApp().currentUser.id;
			filter.render();
			self.$el.find("#grid_search input").val('')

			self.$el.find(".button-filter").unbind("click").bind("click", function () {
				var tinhthanh_id = self.$el.find("#Tinhthanh").data("gonrin").getValue(),
					quanhuyen_id = self.$el.find("#Quanhuyen").data("gonrin").getValue(),
					text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
				var filters;
				if (quanhuyen_id !== null && quanhuyen_id !== undefined && quanhuyen_id !== "") {
					filters = {
						"$and": [
							{ "unsigned_name": { "$likeI": gonrinApp().convert_khongdau(text) } },
							{ "quanhuyen_id": { "$eq": quanhuyen_id } },
							{"type_donvi": {"$eq": "donvinhanuoc"  }}
						]
					};
				} else if (tinhthanh_id !== null && tinhthanh_id !== undefined && tinhthanh_id !== "") {
					filters = {
						"$and": [
							{ "unsigned_name": { "$likeI": gonrinApp().convert_khongdau(text) } },
							{ "tinhthanh_id": { "$eq": tinhthanh_id } },
							{"type_donvi": {"$eq": "donvinhanuoc"  }}
						]
					};
				} else {
					filters = {
						"$and": [
							{ "unsigned_name": { "$likeI": gonrinApp().convert_khongdau(text) } },
							{"type_donvi": {"$eq": "donvinhanuoc"  }}
						]
					};
				}
				var $col = self.getCollectionElement();
                $col.data('gonrin').filter(filters);
			});
    		if(!filter.isEmptyFilter()) {
    			var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
    			var filters = { "$and": [
					{"unsigned_name": {"$likeI":  gonrinApp().convert_khongdau(text) }},
					{"type_donvi": {"$eq": "donvinhanuoc" }}
				]};
				self.uiControl.filters = filters;
			}

			filter.model.set("text","");

			var filters_donvidangki = { "$and": [
				{"type_donvi": {"$eq": "donvinhanuoc"  }}
			]};
			self.uiControl.filters = filters_donvidangki;
    		self.applyBindings(); 		
    		filter.on('filterChanged', function(evt) {
    			var $col = self.getCollectionElement();
    			var text = !!evt.data.text ? evt.data.text.trim() : "";
				if ($col) {
					if (text !== null){
						var tinhthanh_id = self.$el.find("#Tinhthanh").data("gonrin").getValue(),
						quanhuyen_id = self.$el.find("#Quanhuyen").data("gonrin").getValue();
						var filters;
						if (quanhuyen_id !== null && quanhuyen_id !== undefined && quanhuyen_id !== "") {
							filters = {
								"$and": [
									{ "unsigned_name": { "$likeI": gonrinApp().convert_khongdau(text) } },
									{ "quanhuyen_id": { "$eq": quanhuyen_id } },
									{"type_donvi": {"$eq": "donvinhanuoc"  }}
								]
							};
						} else if (tinhthanh_id !== null && tinhthanh_id !== undefined && tinhthanh_id !== "") {
							filters = {
								"$and": [
									{ "unsigned_name": { "$likeI": gonrinApp().convert_khongdau(text) } },
									{ "tinhthanh_id": { "$eq": tinhthanh_id } },
									{"type_donvi": {"$eq": "donvinhanuoc"  }}
								]
							};
						} else {
							filters = {
								"$and": [
									{ "unsigned_name": { "$likeI": gonrinApp().convert_khongdau(text) } },
									{"type_donvi": {"$eq": "donvinhanuoc"  }}
								]
							};
						}
						$col.data('gonrin').filter(filters);
					}
				}
				self.applyBindings();
			});
			self.$el.find("table").addClass("table-hover");
			self.$el.find("table").removeClass("table-striped");
			self.applyBindings();

			//clear data filter
			self.$el.find(".button-clear").unbind("click").bind("click", function () {
				self.$el.find("#Quanhuyen").data("gonrin").setValue(null);
				self.$el.find("#Tinhthanh").data("gonrin").setValue(null);
				filter.model.set("text", "");
			});

			//import file
			self.$el.find(".toolbar-import .toolbar").append('<button style="margin-left:6px" type="text" class="btn btn-info btn-sm import-excel">Import excel</button>');
			self.$el.find(".import-excel").unbind("click").bind("click", function () {
				self.$el.find("#upload_files").click();
			})
			self.$el.find("#upload_files").on("change", function(e) {
                self.importExcelDonVi();
            });
			return this;
		},
    	importExcelDonVi: function () {
			var self = this;
			var file = self.$el.find("#upload_files")[0].files[0];
            self.getApp().showloading();
            if (!!file ) {
                self.function_upload_file(file);
            } else {
                self.getApp().hideloading();
                self.getApp().notify("Vui lòng chọn đúng định dạng tệp");
                return;
            }
		},
		function_upload_file: function(result) {
            var self = this;
            var http = new XMLHttpRequest();
            var fd = new FormData();
            fd.append('file', result, result.name);
            http.open('POST', gonrinApp().serviceURL + '/api/v1/donvi/import');
            var current_so = !!gonrinApp().data("current_so") ? gonrinApp().data("current_so").id : null;
            var token = !!gonrinApp().currentUser ? gonrinApp().currentUser.token : null;
            http.setRequestHeader("X-SO-CURRENT", current_so);
            http.setRequestHeader("X-USER-TOKEN", token);

            http.upload.addEventListener('progress', function(evt) {
                if (evt.lengthComputable) {
                    var percent = evt.loaded / evt.total;
                    percent = parseInt(percent * 100);

                }
            }, false);
            http.addEventListener('error', function() {
                self.getApp().hideloading();
                self.getApp().notify("Không tải được file lên hệ thống");
            }, false);
            http.onreadystatechange = function() {
                self.getApp().hideloading();
                if (http.status === 200) {
                    if (http.readyState === 4) {

                        var data_file = JSON.parse(http.responseText),
                            link, p, t;
						gonrinApp().notify("Tải dữ liệu thành công.");
						gonrinApp().getRouter().refresh();
                    }
                } else {
                    self.getApp().notify("Không thể file ảnh lên hệ thống");
                }
            };
            http.send(fd);
        },
    });

});