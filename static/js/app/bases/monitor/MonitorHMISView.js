define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        template                 = require('text!app/bases/monitor/monitor_hmis.html'),
        Gonrin				= require('gonrin');
    var TemplateHelper		= require('app/bases/TemplateHelper');
    var CustomFilterView      = require('app/bases/CustomFilterView');

    
    return Gonrin.View.extend({
    	template : template,
		render: function(){
			var self = this;
			var currUser = self.getApp().currentUser;
			
			if(self.getApp().hasRole('admin') === true){
			$.ajax({
       		    url:  self.getApp().serviceURL+'/api/monitor/xaphuong',
       		    type: 'GET',
       		    data: {},
       		    headers: {
       		    	'content-type': 'application/json'
       		    },
       		    dataType: 'json',
       		    success: function (data) {
       		    	if (!!data && data.error_code === 0){
       		    		self.$el.find("#total_record").val(data.data.total_record || 0);
       		    		self.$el.find("#count_user").val(data.data.count_user || 0);
       		    		var count_item = data.data.count_item;
       		    		var str_count = "{";
//       		    		for(var i=0; i< count_item.length; i++){
//       		    			var item = count_item[i];
//       		    			if (item.length>1){
//       		    				str_count = str_count +  item[0] +":"+item[1];
//       		    			}
//       		    			if (i !== count_item.length -1){
//       		    				str_count = str_count + ", ";
//       		    			}
//       		    		}
       		    		str_count = str_count+ "khamthai:"+(data.data.khamthai || 0)+",";
       		    		str_count = str_count+ "tiemchung:"+(data.data.tiemchung || 0)+",";
       		    		str_count = str_count+ "khamtheodoisuckhoetre:"+(data.data.khamtheodoisuckhoetre || 0)+",";
       		    		str_count = str_count+ "dinhduong:"+(data.data.dinhduong || 0)+",";
       		    		str_count = str_count+ "tiemuonvan:"+(data.data.tiemuonvan || 0)+",";
       		    		str_count = str_count+ "vacxin:"+(data.data.vacxin || 0)+",";
       		    		str_count = str_count+ "canboyte:"+(data.data.canboyte || 0);
       		    		str_count = str_count + "}";
       		    		self.$el.find("#count_record_detail").val(str_count);
       		    		self.$el.find("#khamthai").val(data.data.khamthai || 0);
       		    		self.$el.find("#tiemchung").val(data.data.tiemchung || 0);
       		    		self.$el.find("#khamtheodoisuckhoetre").val(data.data.khamtheodoisuckhoetre || 0);
       		    		self.$el.find("#dinhduong").val(data.data.dinhduong || 0);
       		    		self.$el.find("#tiemuonvan").val(data.data.tiemuonvan || 0);
       		    		self.$el.find("#vacxin").val(data.data.vacxin || 0);
       		    		self.$el.find("#canboyte").val(data.data.canboyte || 0);
       		    		self.$el.find("#tinhthanh").val(data.data.tinhthanh || 0);
       		    		self.$el.find("#quanhuyen").val(data.data.quanhuyen || 0);
       		    		self.$el.find("#xaphuong").val(data.data.xaphuong || 0);
       		    		self.$el.find("#thonxom").val(data.data.thonxom || 0);
       		    		var filter = new CustomFilterView({
       		    			el: self.$el.find("#search_user"),
       		    			sessionKey: "search_user_filter"
       		    		});
       		    		filter.render();
       		    		$("#grid").grid({
       	                	showSortingIndicator: true,
       	                	language:{
		                		no_records_found:" "
		                	},
		                	noResultsClass:"alert alert-default no-records-found",
		                	refresh:true,
//       	                	orderByMode: "client",
       	                	fields: [
       	                         {field: "src_id", label: "Mã người dùng BMTE",  width:"150px"},
       	                         {field: "dst_id", label: "Mã người dùng HMIS", width:"150px"},
       	                         {field: "src_hoten", label: "Tên người dùng HMIS", width:"200px"},
       	                         {field: "src_ngaysinh", label: "Ngày sinh", textFormat:"DD/MM/YYYY", width:"150px", template:function(rowData){
		       	     	    	    var template_helper = new TemplateHelper();
				       	     	    	if(parseInt(rowData.src_ngaysinh)>0){
				   	    	    		 var valid = new Date(rowData.src_ngaysinh*1000).getTime();
				   		    	    	 if (valid >0){
				   		    	    		 return template_helper.timestampFormat(valid, "DD/MM/YYYY");
				   		    	    	 }
				   	    	    	 }else if(rowData.src_ngaysinh !==null && rowData.src_ngaysinh!==""){
				   		    	    	 return template_helper.datetimeFormat(rowData.src_ngaysinh, "DD/MM/YYYY");
				   	    	    	 }
		       	 	    	    	return template_helper.datetimeFormat(rowData.src_ngaysinh, "DD/MM/YYYY");
		       	 	    	     }},
       	                         {field: "dst_tenxaphuong", label: "Xã/Phường", width:"150px"},
       	                         {field: "dst_tenquanhuyen", label: "Quận/Huyện", width:"150px"},
       	                         {field: "dst_tentinhthanh", label: "Tỉnh thành", width:"150px"},
       	                         {field: "updated_at", label: "Ngày đồng bộ", width:"150px", template:function(rowData){
       	                        	var template_helper = new TemplateHelper();
			       	     	    	if(parseInt(rowData.updated_at)>0){
				   	    	    		 var valid = new Date(rowData.updated_at*1000).getTime();
				   		    	    	 if (valid >0){
				   		    	    		 return template_helper.timestampFormat(valid, "DD/MM/YYYY HH:mm");
				   		    	    	 }
				   	    	    	 }else if(rowData.updated_at !==null && rowData.updated_at!==""){
				   		    	    	 return template_helper.datetimeFormat(rowData.updated_at, "DD/MM/YYYY HH:mm");
				   	    	    	 }
		       	 	    	    	return template_helper.datetimeFormat(rowData.updated_at, "DD/MM/YYYY HH:mm");

		       	 	    	     }},
//       	                         {
//	       	         	        	 field: "src_maxaphuong", 
//	       	         	        	 label: "Xã/Phường",
//	       	         	        	 foreign: "src_xaphuong",
//	       	         	        	 foreignValueField: "id",
//	       	         	        	 foreignTextField: "ten",
//	       	         	        	 width:200
//	       	         	         },
//       	                         {
//	       	         	        	 field: "src_maquanhuyen", 
//	       	         	        	 label: "Quận huyện",
//	       	         	        	 foreign: "src_quanhuyen",
//	       	         	        	 foreignValueField: "id",
//	       	         	        	 foreignTextField: "ten",
//	       	         	        	 width:200
//	       	         	         },
//	       	         	         {
//	       	         	        	 field: "src_matinhthanh", 
//	       	         	        	 label: "Tỉnh/TP",
//	       	         	        	 foreign: "src_matinhthanh",
//	       	         	        	 foreignValueField: "id",
//	       	         	        	 foreignTextField: "ten",
//	       	         	        	 width:200
//	       	         	         },
       	                     ],
       	                     dataSource: data.data.users,
       	                     primaryField:"id",
//       	                     selectionMode: "single",
       	                     pagination: {
       	                     	page: 1,
       	                     	pageSize: 20
       	                     },
       	                     onRendered: function(e){
       	                     }
       	                });
       		    		
       		    		filter.on('filterChanged', function(evt) {
       		    			var text = !!evt.data.text ? evt.data.text.trim() : "";
       		    			console.log("filterChanged===",text);
//       		    			var filters = { "$or": [
//    							{"src_hoten": {"$likeI": text }},
//    							{"src_ngaysinh": {"$likeI": text }},
//    							{"src_id": {"$likeI": text }}
//    							]};
//       		    			self.$el.find("#grid_users").data('gonrin').filter(filters);
//       		    			$("#grid").data('gonrin').filter({
//       		    				src_hoten: {$likeI: text}
//       		                });
       						var filterObj = gonrin.query(data.data.users, {src_hoten: {$likeI: text}});
       						$('#grid').data('gonrin').setDataSource(filterObj);
       		    			console.log(filterObj);
       					});
       		    		
       		    	}
       		    },
       		    error: function(XMLHttpRequest, textStatus, errorThrown) {
       		    	self.getApp().notify("Có lỗi xảy ra, vui lòng thử lại sau!");
       		    }
       		});
						
			} else {
	    		self.getApp().notify("Bạn không có quyền thực hiện tác vụ này!");
	    		self.getApp().getRouter().navigate('login');
			}
			
			return this;
		},
	    
	    
	});

});