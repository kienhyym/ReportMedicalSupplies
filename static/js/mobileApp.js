define('jquery', [], function() {
    return jQuery;
});

require.config({
    baseUrl: 'static/js/lib',
    paths: {
        app: '../app',
        tpl: '../tpl',
        vendor: '../../vendor',
        schema: '../schema',
    },
    /*map: {
        '*': {
            'app/models/employee': 'app/models/memory/employee'
        }
    },*/
    shim: {
    	'gonrin': {
            deps: ['underscore', 'jquery', 'backbone'],
            exports: 'Gonrin'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        }
    }
});



var cordovaApp = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
//        document.addEventListener('touchmove', this.preventDefault, {passive: false});
//        document.addEventListener('touchforcechange', this.preventDefault, {passive: false});
    },
    onDeviceReady: function() {
        
    	
    	require(['jquery', 'gonrin', 'app/router', 
    		'app/bases/Nav/NavbarView','app/bases/HeaderAction',
    		'app/bases/Admin', 'app/bases/CallCenterView', 
    		'app/view/SoChamSoc/qrscan_result',
    		'app/notify/NotifyView',
    		'app/view/SoChamSoc/RequirePermissionDialogView',
    		'text!tpl/base/newlayout.html', 'i18n!app/nls/app', 'vendor/store'], 
    		function ($, Gonrin, Router, Nav,HeaderAction, Admin, 
    				CallCenterView, QrScanResultView, NotifyView,RequirePermissionDialogView, layout, lang, storejs) {
        	$.ajaxSetup({
           	    headers: {
           	        'content-type':'application/json'
           	    }
           	});
        	var mobileapp = new Gonrin.Application({
        		serviceURL: 'https://somevabe.com',
//        		serviceURL: location.protocol+'//'+location.hostname+(location.port ? ':'+location.port : ''),
        		router: new Router(),
        		lang: lang,
//        		version: 2.8,
//        		platform:'IOS',
        		version: 3.1,
        		platform:'Android',
        		//layout: layout,
        		initialize: function(){
//                   FastClick.attach(document.body);
                                            
                                
        			this.getRouter().registerAppRoute();
        			this.nav = new Nav();
        			this.nav.render();
//        			this.initSDKFacebook();
        			this.getCurrentUser();
        		},
        		initSDKFacebook: function(){
        			try{
        				//AccountKit_OnInteractive = function(){
        				AccountKit.init(
        				  {
        				    appId:"1068347219932027", 
        				    state:"somevabe121212112312", 
        				    version:"v1.3",
        				    fbAppEventsEnabled:true,
        				   	debug:true,
        				   	display:"modal",
        				    redirect:"https://www.somevabe.com"
        				  }
        				);
        				 
        				//};
        				
        				  

        				(function(d, s, id) {
        				  var js, fjs = d.getElementsByTagName(s)[0];
        				  if (d.getElementById(id)) return;
        				  js = d.createElement(s); js.id = id;
        				  js.src = 'https://connect.facebook.net/vi_VN/sdk/xfbml.customerchat.js';
        				  fjs.parentNode.insertBefore(js, fjs);
        				}(document, 'script', 'facebook-jssdk'));
        				
        			}catch(ex){
        				console.log(ex);
        			}
        		},
        		parseDate:function(val){
        			var result = null;
        			if(val=== null || val === undefined || val === "" || val === 0 ){
//        				return moment.utc();
        				result = null;
        			} else {
        				var date = null;
        				if ($.isNumeric(val) && parseInt(val)>0){
        					date = new Date(val*1000);
        				} else if(typeof val === "string"){
        					date = new Date(val);
        				} else {
        					result = moment.utc();
        				}
        				if (date !=null && date instanceof Date){
        					result = moment.utc([date.getFullYear(),date.getMonth(),date.getDate()]);
        				}
//        				return moment.utc();
//        				console.log("app.parseDate====",result);
        				return result;
        			}
        		},
        		loginCallbackAccountKit: function(response) {
        			var self = gonrinApp();
        		    if (response !== null && response.token!==null) {
        		      var token = response.token;
        		      var accountId = response.accountId;
        		      var applicationId = response.applicationId
        		      var params = JSON.stringify({
        		    	  token: token,
        		    	  accountId: accountId,
        		    	  applicationId:applicationId
            		    });
  	       		    	self.showloading();
        		      $.ajax({
        					url: self.serviceURL + '/api/facebook/set-token',
        	       		    dataType:"json",
        	       		    type:"POST",
        	       		    data:params,
        	       		    headers: {
        	       		    	'content-type': 'application/json'
        	       		    },
        	       		    success: function (data) {
        	       		    	$.ajaxSetup({
        	       		    	    headers: {
        	       		    	    	'X-USER-TOKEN': data.token
        	       		    	    }
        	       		    	});
        	       		    	storejs.set('X-USER-TOKEN', data.token);
        	       		    	self.postLogin(data);
        	       		    },
        	       		    error: function(XMLHttpRequest, textStatus, errorThrown) {
        	       		    	self.hideloading();
        	       		    	self.notify("Có lỗi xảy ra, vui lòng thử lại sau");
        	       		    }
        	       		});
        		      // Send code to server to exchange for access token
        		    } else if (response.status === "NOT_AUTHENTICATED") {
        		    	self.notify("Không xác thực được số điện thoại của bạn, vui lòng kiểm tra lại");
        		      // handle authentication failure
        		    } else if (response.status === "BAD_PARAMS") {
        		    	self.notify("Không xác thực được số điện thoại của bạn, vui lòng kiểm tra lại");
        		      // handle bad parameters
        		    }
        		  },
        		getParameterUrl: function(parameter, url){
        			if (!url) url = window.location.href;
        			var reg = new RegExp( '[?&]' + parameter + '=([^&#]*)', 'i' );
        		    var string = reg.exec(url);
        		    return string ? string[1] : undefined;
        		},
        		showloading:function(content=null){
//        			$("#loading").removeClass("d-none");
        			$('body .loader').addClass('active');
        	        if (content) {
        	            $('body .loader').find(".loader-content").html(content);
        	        }
        		},
        		hideloading:function(){
//        			$("#loading").addClass("d-none");
        			$('body .loader').removeClass('active');
        	        $('body .loader').find(".loader-content").empty();
        		},
        		hasRole: function(role){
            		return (gonrinApp().currentUser != null && gonrinApp().currentUser.roles!=null) && gonrinApp().currentUser.roles.indexOf(role)>=0;
            	},
        		getCurrentUser : function(){
        			var self = this;
                    if(this.platform === "IOS"){
                       var fastClick = new FastClick(document.body);
                    }
        			token = storejs.get('X-USER-TOKEN');
        			$.ajaxSetup({
        		    	    headers: {
        		    	    	'X-USER-TOKEN': token
        		    	    }
        		    	});
        			self.showloading();
        			$.ajax({
        				url: self.serviceURL + '/current_user',
               		    dataType:"json",
               		    success: function (data) {
               		    	self.postLogin(data);
               		    },
               		    error: function(XMLHttpRequest, textStatus, errorThrown) {
               		    	self.hideloading();
//               		    	var qrcode = self.router.getParam("qr");
               		    	var qrcode = self.getParameterUrl("qr", window.location.href);
               	            if(qrcode !== undefined && qrcode !==null && qrcode !==""){
               	            	self.router.navigate("login?qr="+qrcode);
               	            }else{
               	            	self.router.navigate("login");
               	            }
               		    }
               		});
        		},
        		hasRole: function(role){
            		return (gonrinApp().currentUser != null && gonrinApp().currentUser.roles!=null) && gonrinApp().currentUser.roles.indexOf(role)>=0;
            	},
        		updateCurrentUser : function(hoten){
        			var self = this;
        			var currUser = self.currentUser;
        			if(!!hoten && hoten!== ""){
        				currUser.hoten = hoten;
        				$("span.username").html(currUser.hoten);
        			}
        		},
        		datetimeFormat: function(datetime, formatString, align=null) {
        			var format = (formatString != null) ? formatString : "DD-MM-YYYY HH:mm:ss";
        			if (align == null) {
        				return moment(datetime, ["MM-DD-YYYY", "YYYY-MM-DD"]).isValid() ? moment(datetime, ["MM-DD-YYYY", "YYYY-MM-DD"]).format(format) : "";
        			}
        			return moment(datetime).isValid() ? '<div style="text-align: ${align}">${moment(datetime).format(format)}</div>' : '';
        			
        		},
        		timestampFormat: function(utcTime, format = "YYYY-MM-DD HH:mm:ss") {
                    return moment(utcTime).local().format(format);
                },
        		scanQRCode: function(){
        			cordova.plugins.barcodeScanner.scan(
  	                      function (result) {
  	                            var viewDialog = new QrScanResultView();
  	                            var url_get = gonrinApp().serviceURL;
  	                            if (result.text.startsWith("http") || result.text.startsWith("https")){
  	                            	url_get = result.text + '/inapp';
  	                            }else{
  	                            	url_get = gonrinApp().serviceURL + result.text + '/inapp'
  	                            }
  	                            gonrinApp().showloading();
  	                           	$.ajax({
  		                 				url: url_get,
  		                 				type: "GET",
  		                 				data: {},
  		                 				headers: {
  		                        		    	'content-type': 'application/json'
  		                        		    },
  		                        		    dataType:"json",
  		                        		    success: function (data) {
  		                        		    	gonrinApp().hideloading();
  		                        		    	if(data.status==="notfound"){
  		                        		    		gonrinApp().notify("Không tìm thấy sổ trong hệ thống");
  		                        		    	}else if(data.status==="new"){
  		                        		    		gonrinApp().notify("Mã QRCode chưa được gắn với sổ chăm sóc");
  		                        		    	}else if(data.status==="full"){
  		                        		    		gonrinApp().getRouter().navigate("sochamsoc/model?id="+data.id);
  		                        		    	}else if(data.status==="not_allow"){
  		                        		    		if(gonrinApp().hasRole('canbo')=== true){
  		                        		    			var requireDialogView = new RequirePermissionDialogView({viewData:{"sochamsoc_id":data.id}});
  			                        		    		requireDialogView.dialog();
  		                        		    		}else{
  		                        		    			gonrinApp().notify("Không có quyền truy cập sổ chăm sóc");
  		                        		    		}
  		                        		    	}else if(data.status==="public"){
  		                        		    		if(gonrinApp().hasRole('canbo')=== true){
  		                        		    			if (data.user_permission.grant === true || 
  		                        		    						data.user_permission.write === true || 
  		                        		    						data.user_permission.read === true){
  		                        		    				gonrinApp().getRouter().navigate("sochamsoc/model?id="+data.id);
  		                        		    			}else{
  		                        		    				var requireDialogView = new RequirePermissionDialogView({viewData:{"sochamsoc_id":data.id}});
  	  			                        		    		requireDialogView.dialog();
  		                        		    			}
  		                        		    		}else{
  		                        		    			if (!!data.con){
  	  														if (data.con.gioitinh == 1){
  	  															data.con.gioitinh = "Nam";
  	  														}else{
  	  															data.con.gioitinh = "Nữ";
  	  														}
  	  														if (!!data.con.ngaysinh){
  	  															data.con.ngaysinh = gonrinApp().timestampFormat(data.con.ngaysinh, "DD/MM/YYYY");
  	  														}
  	  													}
  	  		                        		    		viewDialog.dialog();
  	  		                                           	var html_public = '<div class="row">'+
  	  		                                           		'<h2 class="title text-center px-2">Thông tin sổ chăm sóc Mẹ và Bé</h2>'+
  	  															'</div>'+
  	  														'<div id="thongtinso" class="row px-2">'+
  	  															'<h4 class="d-none col-md-10 col-md-offset-1 control-label">Thông tin Chung:</h4> '+
  	  																	'<div class="col-12">'+
  	  																		'<div class="form-group margin-top-20">'+
  	  																			'<label>Họ tên Mẹ:</label> '+
  	  																			'<input readonly value="'+(data.me.hoten || '')+'" class="form-control">'+
  	  																		'</div>'+
  	  																		'<div class="form-group">'+
  	  																			'<label>Họ tên Bố:</label> '+
  	  																			'<input readonly value="'+(data.bo.hoten || '')+'"	class="form-control">'+
  	  																		'</div>'+
  	  																		'<div class="form-group">'+
  	  																			'<label>Địa chỉ:</label>'+
  	  																			'<textarea readonly class="form-control" rows="3">'+(data.me.diachi || '')+'</textarea>'+
  	  																		'</div>'+
  	  																	'</div>'+
  	  															'</div>'+
  	  															'<hr>'+
  	  															'<div id="thongtincon" class="row px-2" >'+
  	  																'<h4 class="col-12 control-label">Thông tin của Con</h4>'+
  	  																'<div class="col-12">'+
  	  																	'<div class="row margin-top-20 px-2">'+
  	  																		'<div class="col-md-6">'+
  	  																			'<div class="form-group">'+
  	  																				'<label>Họ và tên</label>'+
  	  																				'<input readonly value="'+(data.con.hoten || '')+'" class="form-control" >'+
  	  																			'</div>'+
  	  																			'<div class="form-group">'+
  	  																				'<label>Giới tính:</label>'+
  	  																				'<input readonly value="'+ data.con.gioitinh +'" class="form-control" >'+
  	  																			'</div>'+
  	  																		'</div>'+
  	  																		'<div class="col-md-6">'+
  	  																			'<div class="form-group">'+
  	  																				'<label>Ngày sinh:</label>'+
  	  																				'<input readonly type="text" class="input-sm form-control"  value="' + data.con.ngaysinh +'">'+
  	  																			'</div>'+
  	  																			'<div class="form-group">'+
  	  																				'<label>Nơi sinh:</label>'+
  	  																				'<input readonly value="'+(data.con.noisinh || '')+'" class="form-control">'+
  	  																			'</div>'+
  	  																		'</div>'+
  	  																	'</div>'+
  	  																'</div>'+
  	  															'</div>';
  	  		                                           	$("#tpl_qrcode").empty();
  	  		                                           	$("#tpl_qrcode").html(html_public);
  	  		                                           	$(".modal-dialog").attr("style","overflow-y: initial !important");
  	  		                                           	$(".modal-body").attr("style","max-height: calc(100vh - 20px); overflow-y: auto;");
  	  		                                           	$("#tpl_qrcode").attr("style","margin: 50px 0px;");
  	  		                                           	$("#tpl_qrcode").show();
  		                        		    		}
  													
  		                        		    	}else{
  		                        		    		gonrinApp().notify("Có lỗi xảy ra, vui lòng thử lại sau");
  		                        		    	}
  		                        		    	gonrinApp().hideloading();
  		                        		    },
  		                        		    error: function(XMLHttpRequest, textStatus, errorThrown) {
  		                        		    	gonrinApp().hideloading();
  		                        		    	gonrinApp().notify("Không tìm thấy sổ chăm sóc!");
  		                        		    }
  		                 			});
  	                           	
  	                      },
  	                      function (error) {
//  	                          gonrinApp().notify("Có lỗi xảy ra, vui lòng thực hiện lại sau, \n " + error);
  	                      },{
  	                    	  prompt : "Di chuyển camera đến vùng chứa mã QR để quét",
  	                      }
  	                 );
        		},
        		postLogin: function(data){
        			var self = this;
        			
//        			$('section.content').html(layout);
        			$('div.content-contain').html(layout);
        			self.showloading();
        			self.currentUser = new Gonrin.User(data);
//        			this.$header = $('body').find(".page-header");
//        			this.$content = $('body').find(".content-area");
//        			this.$navbar = $('body').find(".page-navbar");
        			this.$header = $('body').find(".main-sidebar");
        			this.$content = $('body').find(".content-area");
        			this.$navbar = $('body').find(".main-sidebar .nav-wrapper");
        			
        		    if(!data.hoten || data.hoten === ""){
        		    	data.hoten = data.id;
        		    }
        		    $("span.username").html(data.hoten);
        		    
        		    if (this.hasRole('admin')){
        				this.admin = new Admin({el: this.$content});
        				self.admin.render();
        				self.hideloading();
//        				self.router.navigate('index');
        				
        			} else {
//        				this.$toolbox = $('body').find(".tools-area");
//        				this.headerAction = new HeaderAction({el: this.$toolbox});
//        				self.headerAction.render();
        				if($(window).width() > 768){
        					this.headerAction = new HeaderAction({el: $("#grid_search")});
        					self.headerAction.render();
        				}else{
        					this.headerAction = new HeaderAction({el: $("#grid_search_mobile")});
        					self.headerAction.render();
        				}
        			}
        		    if(self.hasRole('canbo')){
        				self.router.navigate('admin/DonViYTe/model');
        				$("#userprofile").hide();
        				$(".main-sidebar__search").hide();
        				$(".user-avatar").attr({"src":"static/images/icon_canbo_48x48.png"});
        			}else if (self.hasRole("citizen")){
        				var current_params = self.router.currentRoute();
//        				if (current_params["fragment"] === "sochamsoc" || (current_params["fragment"] === "sochamsoc/model")){
//        					self.router.refresh();
//        				}else{
//        					self.router.navigate('sochamsoc/model?id=current');
//        				}
        				self.router.navigate('sochamsoc/model?id=current');
        			}
        			$("#scanqrcode").show();
        			$("#scanqrcode").unbind("click").bind("click", function(){
        				 gonrinApp().scanQRCode();
        				
        			});
        			this.nav = new Nav({el: this.$navbar});
        			self.nav.render();
        			self.hideloading();
        			
//        			$("#detail_warning").unbind('click').bind('click', function(){
//        				var callcenter = new CallCenterView();
//        				callcenter.dialog();
//        			});
        			$("#logo").unbind('click').bind('click', function(){
        				var path_home = "/"
        				if(self.hasRole('citizen')){
        					var currentSo = self.data("current_so");
        					path_home = "sochamsoc/model";
        					if(!!currentSo){
        						path_home += "?id="+currentSo.id;
        					}
        				}
        				
        				self.router.navigate(path_home);
                    });
        	    	$("#logout").bind('click', function(){
        	    		window.FirebasePlugin.unregister();
        	    		if(self.router.currentRoute().route ==="login"){
        	    			self.router.refresh();
        	    		}else{
        	    			self.router.navigate("login");
        	    		}
        	    	    
        	    	});
        	    	$("#userprofile").bind('click', function() {
        				self.router.navigate("user/profile");
        			});
        			
	    			$.extend($.easing, {
	  				  easeOutSine: function easeOutSine(x, t, b, c, d) {
	  				    return c * Math.sin(t / d * (Math.PI / 2)) + b;
	  				  }
	  				});

	      			  var slideConfig = {
	      			    duration: 270,
	      			    easing: 'easeOutSine'
	      			  };
	
	      			  // Add dropdown animations when toggled.
	      			  $(':not(.main-sidebar--icons-only) .dropdown').on('show.bs.dropdown', function () {
	      			    $(this).find('.dropdown-menu').first().stop(true, true).slideDown(slideConfig);
	      			  });
	
	      			  $(':not(.main-sidebar--icons-only) .dropdown').on('hide.bs.dropdown', function () {
	      			    $(this).find('.dropdown-menu').first().stop(true, true).slideUp(slideConfig);
	      			  });
	
	      			  /**
	      			   * Sidebar toggles
	      			   */
	      			  $('.toggle-sidebar').unbind("click").bind('click',function (e) {
	      				  $('.main-sidebar').toggleClass('open');
	      			  });
	      			  $('.notifications').on('show.bs.dropdown', function(){
	      				  gonrinApp().get_list_notify();
	      			  });
        			
        	    	var _iOSDevice = !!navigator.platform.match(/iPhone|iPod|iPad/i);
        	    	
        			if(self.platform === "IOS"){
        				
        				self.initNotify();
        				$('body').addClass("ios");
        				$('.page-header.navbar').attr({"style":"height:60px; padding-top:15px"});
        				var version_ios = data.version.apple_version;
        				if(version_android!==undefined &&  self.version !== version_ios){
        					self.router.navigate("notify_ios");
//        					alert('Phiên bản của bạn đã có bản cập nhật \nVui lòng cập nhật bản mới nhất <a href="'+url_android+'">tại đây</a> để sử dụng đầy đủ chức năng của ứng dụng.');
        				}
        			} else if(self.platform === "Android"){
        				self.initNotify();
        				$('body').addClass("android");
        				var version_android = data.version.google_version;
        				if( version_android!==undefined && self.version !== version_android){
        					self.router.navigate("notify_android");
//        					alert('Phiên bản của bạn đã có bản cập nhật \nVui lòng cập nhật bản mới nhất <a href="'+url_apple+'">tại đây</a> để sử dụng đầy đủ chức năng của ứng dụng.');
        				}
        			}
        			
        			
        		},
        		initNotify:function(){
        			var self = this;
    				window.FirebasePlugin.setUserId(self.currentUser.id);
    				window.FirebasePlugin.hasPermission(function(data){
    				    if (data.isEnabled !== true && gonrinApp().platform === "IOS"){
    				    	window.FirebasePlugin.grantPermission();
    				    }
                    });
    				window.FirebasePlugin.getToken(function(token) {
    		    	    // save this server-side and use it to push notifications to this device
    				    console.log("FirebasePlugin.getToken==",token);
    					 gonrinApp().set_token_firebase_to_server(token); 
    		    	}, function(error) {
    		    	    console.error(error);
    		    	});	
//    				window.FirebasePlugin.onTokenRefresh(function(token) {
//    				    console.log("FirebasePlugin.onTokenRefresh==",token);
//    				    gonrinApp().set_token_firebase_to_server(token);
//    				}, function(error) {
//    				    console.error(error);
//    				});
//        				{"id":"f0bbe501-dde0-4445-8db2-5c667ddfd5de","created_at":"1557849532","from":"637676599535","notification":{"body":"Đăng ký khám mới","e":"1","sound2":"bell","sound":"default"},"title":"Đăng ký khám mới","action":"{\"datkham_id\":\"100000144\"}","deleted":"false","collapse_key":"com.sosuckhoe.datkham","type":"text","updated_at":"1557849532","url":"https://somevabe.com/datkham/#dangkykham/model?id=100000144","content":"Yêu cầu đặt khám mới từ Nguyen Van B với mã số là 100000144"}
    				window.FirebasePlugin.onNotificationOpen(function(notification) {
    					var check_url = notification.url;
    					if (check_url.indexOf("somevabe.com")>=0 && (notification.tap === true || notification.tap === 1)){
    						if (check_url.indexOf("#")>=0){
    							var navigate_url = check_url.split("#")[1];
    							gonrinApp().getRouter().navigate(navigate_url);
    						}else{
    							window.open(check_url,"_self");
    						}
    					}else{
    						var notifyView = new NotifyView({viewData:notification});
        					notifyView.dialog();
        					setTimeout(() => {
        						notifyView.close();
    						}, 5000);
    					}
//    					gonrinApp().check_notify();
    					
//    					gonrinApp().notify({"message":notification.content,"url":notification.url,"title":notification.title},{ type: "info", delay: 3000 },{"url_target":"_self"});
    				}, function(error) {
    				    console.error(error);
    				});

        		},
        		set_token_firebase_to_server: function(currentToken){
        			if (currentToken) {
        				  var params = JSON.stringify({
        			    	  data: currentToken
        	     		    });
        			      $.ajax({
        						url: gonrinApp().serviceURL + '/api/v1/set_notify_token',
        		       		    dataType:"json",
        		       		    type:"POST",
        		       		    data:params,
        		       		    headers: {
        		       		    	'content-type': 'application/json'
        		       		    },
        		       		    success: function (data) {
        		       		    	console.log("set token firebase success!!!");
        		       		    },
        		       		    error: function(XMLHttpRequest, textStatus, errorThrown) {
        		       		    	console.log("set notify firebase failed");
        		       		    }
        		       		});
        				  
        				  
        			  } else {
        			    console.log('No Instance ID token available. Request permission to generate one.');
        			  }
        		},
        		get_list_notify:function(){
        			var self = this;
        			$.ajax({
        				url: self.serviceURL + '/api/v1/notify/read',
               		    dataType:"json",
               		    type:"POST",
//               		    data: {"q": JSON.stringify({"order_by":[{"field": "updated_at", "direction": "desc"}], "limit":100})},
               		    headers: {
               		    	'content-type': 'application/json'
               		    },
               		    success: function (data) {
               		    	$(".badge-pill").addClass("d-none").html("");
               		    	self.render_notify(data.objects);
               		    	
               		    },
               		    error: function(XMLHttpRequest, textStatus, errorThrown) {
               		    	console.log("set notify firebase failed");
               		    }
               		});
        		},
        		check_notify:function(){
        			var self = this;
        			// $.ajax({
        			// 	url: self.serviceURL + '/api/v1/notify/check',
               		//     dataType:"json",
               		//     type:"GET",
               		//     headers: {
               		//     	'content-type': 'application/json'
               		//     },
               		//     success: function (data) {
               		//     	if (data!==null && data.data>0){
               		//     		$(".badge-pill").removeClass("d-none").html(data.data);
               		//     	}else{
               		//     		$(".badge-pill").addClass("d-none");
               		//     	}
               		//     },
               		//     error: function(XMLHttpRequest, textStatus, errorThrown) {
               		//     	console.log("check_notify error====",XMLHttpRequest);
               		//     }
               		// });
        		},
        		render_notify:function(data){
        			var self = this;
        			var html_menu = $("#menu_notify").html("");
        			
        			if(data.length===0){
        				html_menu.append(`<a class="dropdown-item" href="javascript:;">
        	                      <div class="notification__icon-wrapper">
        	                        <div class="notification__icon">
        	                          <i class="material-icons"></i>
        	                        </div>
        	                      </div>
        	                      <div class="notification__content">
        	                        <span class="notification__category">Không có thông báo mới</span>
        	                      </div>
        	                    </a>`);
        			}else{
        				for(var i=0; i<data.length; i++){
        					if (i<=10){
        						var class_unread = "";
        						if(data[i].read_at === null || data[i].read_at<=0){
        							class_unread = "unread";
        						}
        						var url  = data[i].url;
        						if(url!== null && url!=="" && url.split('#').length>0){
        							url = url.split('#')[1];
        						}
        						html_menu.append(`<a class="dropdown-item `+class_unread+`" href="javascript:;" onClick="gonrinApp().getRouter().navigate(\'`+url+`\',{trigger: true});">
        			                      <div class="notification__icon-wrapper">
        			                        <div class="notification__icon">
        			                          <i class="material-icons"></i>
        			                        </div>
        			                      </div>
        			                      <div class="notification__content">
        			                        <span class="notification__category">`+(data[i].title || "")+`</span>
        			                        <p>`+(data[i].content || "")+`</p>
        			                      </div>
        			                    </a>`);
        					}
        				}
        			}
        			var window_h = "max-height:"+($(window ).height()-110)+"px";
        			$("#menu_notify").attr({"style":window_h});
        		},
        		responsive_table: function(){
    			   // inspired by http://jsfiddle.net/arunpjohny/564Lxosz/1/
    				if ($(window).width() < 768) {
    					$('.table-mobile').find("td").each(function (i) {
     					   if($(this).text() === " " || $(this).text() === "" || $(this).text() === null || $(this).text() === undefined || $(this).text()==='none'){
     						  $(this).hide();
     					   }
    					});
    				   $('.table-mobile').find("th").each(function (i) {
    					   var el = $('.table-mobile td:nth-child(' + (i + 1) + ')');
    					   if($(this).text() === " " || $(this).text() === "" || $(this).text() === null || $(this).text() === undefined || $(this).text()==='none'){
//    						   el.prepend('<span class="table-thead"></span> ');
    					   }else{
    						   el.prepend('<span class="table-thead">'+ $(this).text() + ':</span> ');
    					   }
    					   
    				       $('.table-thead').hide();
    				   });
    					$('.table-mobile').each(function() {
    					  var thCount = $(this).find("th").length; 
    					   var rowGrow = 100 / thCount + '%';
    					   //console.log(rowGrow);
    					   $(this).find("th, td").css('flex-basis', rowGrow);   
    					   $(this).find("tr").addClass("shadow-sm p-2 mb-1 bg-white rounded");

    					});
    					function flexTable(){
    		//			   if ($(window).width() < 768) {
    						   $(".table-mobile").each(function (i) {
    							   $(this).find('.table-thead').show();
    						      $(this).find('thead').hide();
    						   });
    					   // window is less than 768px   
    		//			   } else {
    		//				   $(".table").each(function (i) {
    		//					   $(this).find('.table-thead').hide();
    		//				      $(this).find('thead').show();
    		//				   });
    		//			   }
    					}      
    					flexTable();
//    					window.onresize = function(event) {
//    					    flexTable();
//    					};
    				} 
    			},
        		process_notify:function(self, map_warning_notify, extended_fields){
    				if(!!self.uiControl && self.uiControl.fields.length>0){
    	    			for (var i = 0; i < self.uiControl.fields.length; i++) {
    	    				
    						var field = self.uiControl.fields[i];
    						var textValue = "";
    						if(!!field && field.uicontrol === "radio" && !extended_fields.includes(field.field)){
    							if (field.value > 0){
    								for (var j=0; j<field.dataSource.length; j++){
    									if(field.dataSource[j].value === field.value){
    										textValue = field.dataSource[j].text;
    										break;
    									}
    								}
    								var key = self.getApp().router.currentRoute()+"#"+field.field;
    								var value = {
    										"route":self.getApp().router.currentRoute()+"", 
    										"field":field.field,
    										"label":field.label || "",
    										"value":field.value,
    										"textvalue": textValue
    										}
    								map_warning_notify.set(key, value);
    							}
    							self.model.on("change:"+field.field, function(model, value, options){
    								var item_change = model.changed;
    								var key_attrs = Object.getOwnPropertyNames(item_change);
    								var attribute = key_attrs[key_attrs.length-1];
    								var key = self.getApp().router.currentRoute()+"#"+attribute;
    								if (!!value && value > 0){
    									var options = self.getFieldElement(attribute).data("gonrin").options()
    									var textValue = "";//self.getFieldElement(attribute).data("gonrin").getText() || "";
    									for (var j=0; j<options.dataSource.length; j++){
    										if(options.dataSource[j].value === value){
    											textValue = options.dataSource[j].text;
    											break;
    										}
    									}
    									var label = self.getFieldElement(attribute).data("gonrin").options().label || "";
    									var value = {
    											"route":self.getApp().router.currentRoute()+"", 
    											"field":attribute,
    											"label":label || "",
    											"value":value,
    											"textvalue": textValue
    											}
    									
    									map_warning_notify.set(key, value);
    								}else{
    									if(map_warning_notify.has(key)){
    										map_warning_notify.delete(key);
    									}
    								}
    								
    								if (map_warning_notify.size>0){
    				    				var footer = $(".myAlert-bottom");
    				    				footer.show();
    				    				footer.find("#detail_warning").unbind('click').bind('click',function(){
    				    					var iterator = map_warning_notify.values();
    				    					var callcenter = new CallCenterView({viewData:iterator});
    				    					callcenter.dialog();
    				    				});
//    				    				var iterator = map_warning_notify.values();
//    				    				var iter1 = iterator.next().value;
//    				    				footer.find("#detail_explain").html('<a href="'+iter1.route+'">'+iter1.label+'( '+iter1.textvalue+' )</a>');
    				    			}else{
    				    				$(".myAlert-bottom").hide();
    				    			}
    							});
    						}
    					}
    	    			if (map_warning_notify.size>0){
    	    				var footer = $(".myAlert-bottom");
    	    				footer.show();
    	    				footer.find("#detail_warning").unbind('click').bind('click',function(){
		    					var iterator = map_warning_notify.values();
		    					var callcenter = new CallCenterView({viewData:iterator});
		    					callcenter.dialog();
		    				});
//    	    				var iterator = map_warning_notify.values();
//    	    				var iter1 = iterator.next().value;
//    	    				footer.find("#detail_explain").html('<a href="'+iter1.route+'">'+iter1.label+'( '+iter1.textvalue+' )</a>');
    	    			}else{
    	    				$(".myAlert-bottom").hide();
    	    			}
    	    		}
    		}
        	});
        	mobileapp.isMobile = true;
        	mobileapp.registerScrollToolbar = function(view){
        		if(!!mobileapp.isMobile){
        			Backbone.off("window:scroll").on("window:scroll", function(evt){
        				var toolwrap = view.$el.find(".toolbar-wraper");
        				if(evt.direction === "up"){
        					if($(window).scrollTop() > 30){
        						toolwrap.addClass("autofix fix");
        					}else{
        						toolwrap.removeClass("autofix fix");
        					}
        				}
        				else if(evt.direction === "down"){
        					toolwrap.removeClass("autofix fix");
        				}
        			});
        		}
        		
        	};
            Backbone.history.start();
            var iScrollPos = 0;
            $(window).scroll(function() {
            	var iCurScrollPos = $(this).scrollTop();
                if (iCurScrollPos > (iScrollPos + 30)) {
                	iScrollPos = iCurScrollPos;
                	Backbone.trigger('window:scroll', {direction: "down"});
                	
                } else if (iCurScrollPos < (iScrollPos - 30)){
                	iScrollPos = iCurScrollPos;
                	Backbone.trigger('window:scroll', {direction: "up"});
                }
                
            });
            
        });
    },
    receivedEvent: function() {
    	var self = this;
        // OneSignal Initialization
        // Enable to debug issues.
        // window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
  
        // Set your iOS Settings
//        var iosSettings = {};
//        iosSettings["kOSSettingsKeyAutoPrompt"] = false;
//        iosSettings["kOSSettingsKeyInAppLaunchURL"] = true;
    	var appkey_onesignal = '267683b8-4b18-4d0c-b1c3-c2a4fe416aed'
    	if(self.platform === "IOS"){
    		appkey_onesignal = '2cbdb907-ec2b-428c-8bd6-5cca37836a85';
    		
    	}
    	//window.plugins.OneSignal.setLogLevel({logLevel: 6, visualLevel: 4});
        window.plugins.OneSignal
          .startInit(appkey_onesignal)
          .handleNotificationReceived(function(jsonData) {
            alert("Notification received: \n" + JSON.stringify(jsonData));
          })
          .handleNotificationOpened(function(jsonData) {
            alert("Notification opened: \n" + JSON.stringify(jsonData));
            console.log('didOpenRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
          })
          .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.InAppAlert)
//          .iOSSettings(iosSettings)
          .endInit();

//        if (addedObservers == false) {
//            addedObservers = true;

//            window.plugins.OneSignal.addEmailSubscriptionObserver(function(stateChanges) {
//                console.log("Email subscription state changed: \n" + JSON.stringify(stateChanges, null, 2));
//            });

            window.plugins.OneSignal.addSubscriptionObserver(function(stateChanges) {
                console.log("Push subscription state changed: " + JSON.stringify(stateChanges, null, 2));
            });

            window.plugins.OneSignal.addPermissionObserver(function(stateChanges) {
                console.log("Push permission state changed: " + JSON.stringify(stateChanges, null, 2));
            });
//        }
        //Call syncHashedEmail anywhere in your app if you have the user's email.
        //This improves the effectiveness of OneSignal's "best-time" notification scheduling feature.
        //window.plugins.OneSignal.syncHashedEmail(userEmail);
    }

};

cordovaApp.initialize();
