define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        template                 = require('text!tpl/base/HeaderAction.html'),
        //template = _.template(tpl),
        Gonrin				= require('gonrin');
//    var QrScanResultView 	= require("app/view/SoChamSoc/qrscan_result");
    var objectDatas	=	{};
    var isRunningTimeout = false;
    return Gonrin.View.extend({
    	template : template,
		render: function(){
			var self = this;
			var currUser = self.getApp().currentUser;
			/*if(self.getApp().hasRole('admin') === true || self.getApp().hasRole('canbo') === true) {
				this.renderSearchBox();
			} else */if(self.getApp().hasRole('citizen') === true){
				self.renderSoCombobox();
			} else{
				self.$el.find("#danhsachso").hide();
			}
			
			return this;
		},
		getDataSearch:function(self, response){
			var inputSearch = self.$el.find("#danhsachso");
			$.ajax({
       		    url: (self.getApp().serviceURL || "") + '/api/timkiemso?query='+inputSearch.val(),
       		    type: 'get',
       		    headers: {
       		    	'content-type': 'application/json'
       		    },
       		    dataType: 'json',
       		    success: function (data) {
       		    	
       		    	objectDatas = data;
       		    	if(objectDatas.length <= 0){
       		    		if(isRunningTimeout === false){
       		    			isRunningTimeout = true;
//       		    			self.getApp().notify("Không tìm thấy kết quả!");
       		    		}else{
       		    			setTimeout(function(){
       		    				isRunningTimeout = false;
       		    			}, 3000);
       		    		}
       		    		
       		    	}
       		    	return response(data);
       		    },
       		 error: function(xhr, status, error){
       			if(isRunningTimeout === false){
		    			isRunningTimeout = true;
//		    			self.getApp().notify("Có lỗi xảy ra, vui lòng thử lại sau!");
		    		}else{
		    			setTimeout(function(){
		    				isRunningTimeout = false;
		    			}, 3000);
		    		}
       		 }
            });
		},
		renderSearchBox: function(){
			var self = this;
			var btn_search = $("<a>").attr({"id":"btn_search","href":"javascript:void(0);", "class":"btn btn-primary btn-sm"}).html("Tìm kiếm");
			self.$el.find("#header_action").append(btn_search);
			var inputSearch = self.$el.find("#danhsachso");
			inputSearch.attr({"placeholder":"Nhập thông tin sổ"});
			inputSearch.keypress(function(e) {
			    if(e.which == 13) {
			    	var value = inputSearch.val();
					if (value === undefined || value===''){
						self.getApp().notify("Vui lòng nhập mã sổ / mã công dân / số điện thoại");
					} else {
						self.processSearchSo(value);
					}
			    }
			});
			
			return this;
		},
		processSearchSo:function(value){
			self.getApp().showloading();
			$.ajax({
       		    url: (self.getApp().serviceURL || "") + '/api/v1/sochamsoc/check/'+value,
       		    type: 'POST',
       		    headers: {
       		    	'content-type': 'application/json'
       		    },
       		    dataType: 'json',
       		    success: function (data) {
       		    	self.getApp().hideloading();
       		    	if (data["write"] === true || data["read"] == true){
       		    		var path = 'sochamsoc/model?id='+data.id;
	    				self.getApp().getRouter().navigate(path);
       		    	}else{
       		    		self.getApp().notify("Bạn không có quyền truy cập sổ chăm sóc này");
       		    	}
    				inputSearch.val('');
       		    },
	       		 error: function(xhr, status, error){
	       			self.getApp().hideloading();
       		    	try {
       		    		self.getApp().notify($.parseJSON(xhr.responseText).error_message);
       		    		}				  	  				    	
       		    	catch(err) {
       		    		self.getApp().notify("có lỗi xảy ra, vui lòng thử lại sau ");
       		    		}
	       			
	       		 }
            });
		},
		resetCurrentSo: function(){
			var curSo = this.getApp().data("current_so");
			var socombobox = this.$el.find('#danhsachso').data('gonrin');
			if(curSo != null ){
				if(!!socombobox){
					var curVal = socombobox.getValue();
					if (curSo.id != curVal){
						socombobox.setValue(curSo.id);
					}
				}
			}
		},
		renderSoCombobox: function(){
			var self = this;
			var socombobox = this.$el.find('#danhsachso');
			var url = '/api/v1/sochamsoc';
			var currentUser = self.getApp().currentUser;
			if (!!currentUser && !!currentUser.id){
				$.ajax({
	 				url: (self.getApp().serviceURL || "") + '/api/v1/sochamsoc',
	 				dataType: "json",
	 				contentType: "application/json",
	 				success: function(data) {
	 					var currentSo = self.getApp().data("current_so");
	 					var curSoId = null;
	 					var dataSource = new Array();
	 					var checkCurrentSo = false;
	 					if(!!currentSo){
	 						curSoId = currentSo.id;
	 					} else {
	 					    checkCurrentSo = true;
	 					}
	 					self.getApp().data("danhsachso",data.objects);
 						for(var i = 0; i < data.objects.length; i++){
	 						if((i === data.objects.length-1) && checkCurrentSo){
	 							curSoId = data.objects[i].id;
//	 							currentSo = data.objects[i];
	 						}
	 						var so = data.objects[i];
	 						if(!!so && !!so.id){
	 						    if(so.hoten !== null && so.hoten !== undefined && so.hoten !==''){
	 						        so.display = so.hoten + ' - '+ so.id;
	 						    }else{
	 						        so.display = so.id;
	 						    }
	 						    dataSource.push(so);
	 						}

	 					}
	 					
	 					socombobox.combobox({
	 						textField: "display",
	                        valueField: "id",
	                        dataSource: dataSource,
	                        refresh:true,
//	                        template: '{{ma}} - {{con.hoten}}',
	                        groupSize: "sm",
	                        value: !!curSoId ? curSoId: null
	                    });
	 					
	 					socombobox.unbind('change.gonrin').on('change.gonrin', function(e){
	 						var selectedValue = socombobox.data('gonrin').getValue();
	 		            	var path = 'sochamsoc/model?id='+selectedValue;
	 		            	$('.main-sidebar').toggleClass('open');
	 						self.getApp().getRouter().navigate(path);
	 		            });
//	 					if (currentSo !== null){
//                        	self.getApp().data("current_so", currentSo);
//                        }
	 					if(curSoId !== null){
							var currentRoute = self.getApp().getRouter().currentRoute().fragment;
							if(currentRoute.indexOf('sochamsoc/model')<0){
								var path = 'sochamsoc/model?id='+curSoId;
		 						self.getApp().getRouter().navigate(path);
							}
	 						
	 					} else{
	 						//create new So
	 						var path = 'sochamsoc/model?id=current';
	 						self.getApp().getRouter().navigate(path);
	 					}
	 					
	 				},
	 				error:function(xhr,status,error){
	 					self.getApp().notify("Không lấy được danh sách sổ chăm sóc.");
					},
				});
			}
			
		},
	    
	    
	});

});