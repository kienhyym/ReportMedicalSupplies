define(function (require) {
	"use strict";
	var $                   = require('jquery'),
	_                   = require('underscore'),
	Gonrin				= require('gonrin');

	var template 			= require('text!tpl/DonVi/collectiontree.html'),
	schema 				= require('json!app/view/HeThong/DonVi/Schema.json');
	
//	var LienHeModelView 	= require("app/view/HeThong/DonVi/LienHeModelView");
	
	var QuocGiaSelectView 	= require("app/view/DanhMuc/QuocGia/SelectView");
    var TinhThanhSelectView 	= require("app/view/DanhMuc/TinhThanh/SelectView");
    var QuanHuyenSelectView 	= require("app/view/DanhMuc/QuanHuyen/SelectView");
    var XaPhuongSelectView 	= require("app/view/DanhMuc/XaPhuong/SelectView");
    
	var DonViSelectView = require('app/view/HeThong/DonVi/SelectView');
	var AddUserDialogView = require('app/view/HeThong/DonVi/AddUserDialog');

	var templatemodel = require('text!tpl/DonVi/model.html');

//	var TuyenDonViEnum = require('json!app/enum/TuyenDonViEnum.json');
    var TuyenDonViSelectView = require('app/view/DanhMuc/TuyenDonVi/SelectView');

	var DonViModelView = Gonrin.ModelView.extend({
		template : templatemodel,
		modelSchema	: schema,
		urlPrefix: "/api/v1/",
		collectionName: "donvi",
		tools : [
		         {
		        	 name: "defaultgr",
		        	 type: "group",
		        	 groupClass: "toolbar-group",
		        	 buttons: [
		        	           {
		        	        	   name: "save",
		        	        	   type: "button",
		        	        	   buttonClass: "btn-success btn-sm",
		        	        	   label: "Lưu đơn vị",
		        	        	   command: function(){
		        	        		   var self = this;
		        	        		   self.getApp().showloading();
		        	        		   self.model.save(null,{
		        	        			   success: function (model, respose, options) {
		        	        				  
		        	        				   self.getApp().notify("Lưu đơn vị thành công!");
		        	        			   },
		        	        			   error: function (model, xhr, options) {
		        	        				   console.log($.parseJSON(xhr.responseText).message);
		        	        				   self.getApp().notify("Lưu đơn vị không thành công!");
		        	        			   },
		        	        			   complete:function(){
		        	        				   self.getApp().hideloading();
		        	        			   }
		        	        		   });
		        	        	   }
		        	           },
		        	           {
		        	        	   name: "delete",
		        	        	   type: "button",
		        	        	   buttonClass: "btn-danger btn-sm",
		        	        	   label: "Xoá đơn vị",
		        	        	   visible: function(){
		        	        		   if(this.getApp().currentUser !== null){
		        	        			   return this.getApp().currentUser.donvi_id == 1;
		        	        		   }
		        	        		   return false;
		        	        	   },
		        	        	   command: function(){
		        	        		   var self = this;
		        	        		   self.getApp().showloading();
		        	        		   self.model.destroy({
		        	        			   success: function(model, response) {
		        	        				   self.getApp().hideloading();
		        	        				   var tree = _.result(self.viewData, 'treeView');
		        	        				   if(tree){
		        	        					   tree.refresh();
		        	        				   }
		        	        			   },
		        	        			   error: function (model, xhr, options) {
		        	        				   self.getApp().notify($.parseJSON(xhr.responseText).message);
		        	        				   self.getApp().hideloading();
		        	        			   }
		        	        		   });
		        	        	   }
		        	           },
		        	           ]
		         },
		         ],
		         uiControl: {
		        	 fields:
		        		 [
		                  { field: "id",label:"ID",width:250,readonly: true},
		                  { field: "ten", label: "Tên", width:250 },
		                  { field: "ma", label: "Mã", width:250},
		                  {
		    				field:"tuyendonvi",
		    				uicontrol: "ref",
		  	  				textField: "ten",
		  					foreignRemoteField: "id",
		  					foreignField: "tuyendonvi_id",
		  					dataSource: TuyenDonViSelectView
		      			 },
//		                  {
//		                	  field:"tuyendonvi",
//		                	  uicontrol: "combobox",
//		                	  textField: "text",
//		                	  valueField: "value",
//		                	  dataSource: TuyenDonViEnum,
//		                  },
		                  {
		    				  field:"captren",
		    				  uicontrol: "ref",
		    				  textField: "ten",
		    				  foreignRemoteField: "id",
		    				  foreignField: "parent_id",
		    				  dataSource: DonViSelectView,
		    			},
		    			{
		    				field:"quocgia",
		    				uicontrol:"ref",
		    				textField: "ten",
		    				foreignRemoteField: "id",
		    				foreignField: "quocgia_id",
		    				dataSource: QuocGiaSelectView
		    			},
		        		{
		    				field:"tinhthanh",
		    				uicontrol:"ref",
		    				textField: "ten",
		    				foreignRemoteField: "id",
		    				foreignField: "tinhthanh_id",
		    				dataSource: TinhThanhSelectView
		    			},
		    			{
		    				field:"quanhuyen",
		    				uicontrol:"ref",
		    				textField: "ten",
		    				foreignRemoteField: "id",
		    				foreignField: "quanhuyen_id",
		    				dataSource: QuanHuyenSelectView
		    			},
		    			{
		    				field:"xaphuong",
		    				uicontrol:"ref",
		    				textField: "ten",
		    				foreignRemoteField: "id",
		    				foreignField: "xaphuong_id",
		    				dataSource: XaPhuongSelectView
		    			},
		    			//danh sach thanh vien
		    			{
		    				field: "users",
		    				uicontrol: "grid",
		    				refresh: true,
		    				primaryField: "uid",
		    				fields:[
		    				          {field:"uid", label:"ID"},
		    				          {field:"donvi_id", visible:false},
		                	          {field:"ten", label:"Tên"},
		                	          {field:"macongdan", label: "Mã công dân"},
		                	          
		                	        ],
		                	tools:[
	            	                 {
	            	                	 name: "create",
	            	                	 buttonClass:"btn-success",
	            	                	 label: "Thêm người dùng",
	            	                	 command: function(){
	            	                		 this.addUser();
	            	                	 }
	            	                 }
              	                 ],
		                	onRowClick: function(event){
		                	    		if(event.rowId){
		                	        		var path = 'user/model?id='+ event.rowId;
		                	        		this.getApp().getRouter().navigate(path);
		                	        	}
		                	    	}
		    				},
		                  ]},
		                  render:function(){
		                	  var self = this;
		                	  var id = _.result(this.viewData, 'id');
		                	  if(id){
		                		  this.model.set('id',id);
		                		  this.model.fetch({
		                			  success: function(data){
		                				  self.applyBindings();
		                			  },
		                			  error:function(){
		                				  self.getApp().notify("Lỗi xem chi tiết đơn vị");
		                			  },
		                		  });
		                	  }
		                  },
			              	addUser : function(){
			              		var self = this;
			              		var donvi_id = _.result(self.viewData, 'id');
			              		var view = new AddUserDialogView({
//									el: self.$el.find("#donvi-chitiet"),
									viewData : {donvi_id:donvi_id }
								}).dialog();
			              		view.on("loaduser", function($event) {
			              			self.getApp().getRouter().refresh();
//			              			var view = new DonViModelView({
//			            				el: self.$el.find("#donvi-chitiet"),
//			            				viewData : {id:donvi_id, treeView: self }
//			            			}).render();
			            		});
			              	}
	});

	return Gonrin.CollectionView.extend({
		template : template,
		//modelSchema	: schema,
		//tools:[],
		urlPrefix: "/api/v1/",
		collectionName: "donvi",
		
		render:function(){
			var self = this;
			var url = "/api/v1/donvitree";
			$.ajax({
				url: url,
				dataType: "json",
				contentType: "application/json",
				success: function(data) {
//					if(!response || response.length ===0){
//						return;
//					}
//					var data = response[0];
					data.state = {selected: true};
					var tree = self.$el.find("#donvi-tree");
					datatree = []
					if (!!data && data.length>0 && data[0].length >0){
						datatree = [data];
					}
					tree.treeview({
						data: datatree,
						textField: "ten",
						onNodeSelected: $.proxy(self.onItemClick, self)
					});
					
					var selectedNodes = tree.treeview('getSelected');
					if(selectedNodes && (selectedNodes.length > 0)){
						var node = selectedNodes[0];
						var view = new DonViModelView({
							el: self.$el.find("#donvi-chitiet"),
							viewData : {id:node.id, treeView: self }
						}).render();
					}
				},
			});
			return this;
		},
		refresh: function(){
			this.$el.find("#donvi-chitiet").empty();
			this.$el.find("#donvi-tree").empty();
			this.render();
		},
		onItemClick: function(event, node){
			var self = this;
			var view = new DonViModelView({
				el: self.$el.find("#donvi-chitiet"),
				viewData : {id:node.id, treeView: self }
			}).render();
		},
	});

});