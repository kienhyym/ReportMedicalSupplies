define('jquery', [], function() {
    return jQuery;
});

require.config({
    baseUrl: '/static/js/lib',
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

window.fbAsyncInit = function() {
    FB.init({
      xfbml            : true,
      version          : 'v3.2'
    });
  };

require(['jquery', 'gonrin', 'app/router',
	'app/bases/Nav/NavbarView',
	'app/bases/HeaderAction',
	'app/bases/Admin', 
	'app/bases/CallCenterView', 
	'text!tpl/base/newlayout.html', 
	'i18n!app/nls/app', 
	'vendor/store'], 
	function ($, Gonrin, Router, Nav,HeaderAction, Admin,CallCenterView, layout, lang, storejs) {
	$.ajaxSetup({
   	    headers: {
   	        'content-type':'application/json'
   	    }
   	});
	
	var app = new Gonrin.Application({
//		serviceURL: 'https://somevabe.com',
		serviceURL: location.protocol+'//'+location.hostname+(location.port ? ':'+location.port : ''),
		staticURL: location.protocol+'//'+location.hostname+(location.port ? ':'+location.port : '')+'/static/',
		router: new Router(),
		lang: lang,
		//layout: layout,
		initialize: function(){
			this.getRouter().registerAppRoute();
			this.nav = new Nav();
			this.nav.render();
			this.initSDKFacebook();
			this.getCurrentUser();
			this.postLogin();
		},
		initSDKFacebook: function(){
			try{
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
//				return moment.utc();
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
//				return moment.utc();
//				console.log("app.parseDate====",result);
				return result;
			}
		},
		loginCallbackAccountKit: function(response) {
			 var self = gonrinApp();
		    if (response.status === "PARTIALLY_AUTHENTICATED") {
		      var code = response.code;
		      var csrf = response.state;
		      var params = JSON.stringify({
		    	  code: code,
		    	  state: csrf
    		    });
		      self.showloading();
		      $.ajax({
					url: self.serviceURL + '/api/facebook/get-token',
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
//			$("#loading").removeClass("d-none");
			$('body .loader').addClass('active');
	        if (content) {
	            $('body .loader').find(".loader-content").html(content);
	        }
		},
		hideloading:function(){
//			$("#loading").addClass("d-none");
			$('body .loader').removeClass('active');
	        $('body .loader').find(".loader-content").empty();
		},
		getCurrentUser : function(){
			var self = this;
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
					   return data;
       		    },
       		    error: function(XMLHttpRequest, textStatus, errorThrown) {
       		    	self.hideloading();
//       		    	var qrcode = self.router.getParam("qr");
       		    	var qrcode = self.getParameterUrl("qr", window.location.href);
       	            if(qrcode !== undefined && qrcode !==null && qrcode !==""){
       	            	self.router.navigate("login?qr="+qrcode);
       	            }else{
						// self.router.navigate("login");
						self.router.navigate("dangky");
       	            }
       		    }
       		});
		},
		hasRole: function(role){
			// console.log(gonrinApp().currentUser.roles) ;
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
		postLogin: function(data){
			var self = this;
			$('div.content-contain').html(layout);
			self.showloading();
			self.currentUser = new Gonrin.User(data);
			this.$header = $('body').find(".main-sidebar");
			this.$content = $('body').find(".content-area");
			this.$navbar = $('body').find(".main-sidebar .nav-wrapper");
			// if(!data.hoten || data.hoten === ""){
		    // 	data.hoten = self.currentUser.fullname;
		    // }
		    $("span.username").html(self.currentUser.fullname);
			if (this.hasRole('admin')){
				// this.admin = new Admin({el: this.$content});
				// self.admin.render();
				// self.hideloading();
//				self.router.navigate('index');
				
			} else {
				if($(window).width() > 768){
					this.headerAction = new HeaderAction({el: $("#grid_search")});
					self.headerAction.render();
				}else{
					this.headerAction = new HeaderAction({el: $("#grid_search_mobile")});
					self.headerAction.render();
				}
			}
			self.router.navigate('canbo/donvi/model');
			$("#userprofile").hide();
			$(".user-avatar").attr({"src":"static/images/icon_canbo_48x48.png"});
			
			$("#scanqrcode").hide();
			this.nav = new Nav({el: this.$navbar});
			self.nav.render();
			self.hideloading();
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
			  setInterval(function(){ gonrinApp().check_notify(); }, 3*60000);
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
						var url  = data[i].url;
						if(url!== null && url!=="" && url.split('#').length>0){
							url = url.split('#')[1];
						}
						var class_unread = "";
						if(data.read_at === null || data.read_at<=0){
							class_unread = "unread";
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
			$("#menu_notify").attr({"style":"max-height:400px"});
		},
		convert_khongdau: function (strdata) {
			var kituA=["á","à","ạ","ã","ả","â","ấ","ầ","ậ","ẫ","ă","ằ","ắ","ẳ"],
				kituE=["é","è","ẹ","ẻ","ẽ","ê","ế","ề","ệ","ễ","ể"],
				kituI=["í","ì","ị","ỉ","ĩ"],
				kituO=["ò","ó","ọ","ỏ","õ","ô","ồ","ố","ộ","ổ","ỗ","ơ","ờ","ớ","ợ","ở","ỡ"],
				kituU=["ù","ú","ụ","ủ","ũ","ư","ừ","ứ","ự","ử","ữ"],
				kituY=["ỳ","ý","ỵ","ỷ","ỹ"];

			var str2=strdata.toLowerCase();
			for(var i=0;i<kituA.length;i++){
				str2=str2.replace(kituA[i],"a");
			}
			for(var i=0;i<kituE.length;i++){
				str2=str2.replace(kituE[i],"e");
			}
			for(var i=0;i<kituI.length;i++){
				str2=str2.replace(kituI[i],"i");
			}
			for(var i=0;i<kituO.length;i++){
				str2=str2.replace(kituO[i],"o");
			}
			for(var i=0;i<kituU.length;i++){
				str2=str2.replace(kituU[i],"u");
			}
			for(var i=0;i<kituY.length;i++){
				str2=str2.replace(kituY[i],"y");
			}
			str2=str2.replace("đ","d");
			return str2;
		},
		get_list_notify:function(){
			var self = this;
    		
			$.ajax({
				url: self.serviceURL + '/api/v1/notify/read',
       		    dataType:"json",
       		    type:"POST",
       		    headers: {
       		    	'content-type': 'application/json'
       		    },
       		    success: function (data) {
       		    	$(".badge-pill").addClass("d-none").html("");
       		    	self.render_notify(data.objects);
       		    	
       		    },
       		    error: function(XMLHttpRequest, textStatus, errorThrown) {
       		    	console.log("get_list_notify failed",XMLHttpRequest);
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
       		//     }
       		// });
		},
		responsive_table: function(){
				if ($(window).width() < 768) {
				   $('.table-mobile').find("th").each(function (i) {
						var el = $('.table td:nth-child(' + (i + 1) + ')');
						if($(this).text() === " " || $(this).text() === ""){
							el.prepend('<span class="table-thead"></span> ');
						} else {
							el.prepend('<span class="table-thead">'+ $(this).text() + '  :  </span> ');
						}
						
						$('.table-thead').hide();
				   	});
					$( '.table-mobile' ).each(function() {
					  	var thCount = $(this).find("th").length; 
						var rowGrow = 100 / thCount + '%';
						$(this).find("th, td").css('flex-basis', rowGrow);
						$(this).find("th, td").css('display','flex');
						$(this).find("tr").addClass("shadow-sm p-2 mb-1 bg-white rounded");
					});
					function flexTable(){
						$(".table-mobile").each(function (i) {
							$(this).find('.table-thead').show();
							$(this).find('.table-thead').addClass("pr-2");
							$(this).find('thead').hide();
						});
					}      
					flexTable();
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
									if(field.dataSource[j].value === field.value && field.dataSource[j].cssClass ==="yeallow"){
										textValue = field.dataSource[j].text;
										break;
									}
								}
								if(textValue!==null && textValue !== ""){
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
										if(options.dataSource[j].value === value && options.dataSource[j].cssClass ==="yeallow"){
											textValue = options.dataSource[j].text;
											break;
										}
									}
									if(textValue!==null && textValue !== ""){
										var label = self.getFieldElement(attribute).data("gonrin").options().label || "";
										var value = {
												"route":self.getApp().router.currentRoute()+"", 
												"field":attribute,
												"label":label || "",
												"value":value,
												"textvalue": textValue
												}
										
										map_warning_notify.set(key, value);
									}
									
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
//				    				var iterator = map_warning_notify.values();
//				    				var iter1 = iterator.next().value;
//				    				footer.find("#detail_explain").html('<a href="'+iter1.route+'">'+iter1.label+'( '+iter1.textvalue+' )</a>');
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
//	    				var iterator = map_warning_notify.values();
//	    				var iter1 = iterator.next().value;
//	    				footer.find("#detail_explain").html('<a href="'+iter1.route+'">'+iter1.label+'( '+iter1.textvalue+' )</a>');
	    			}else{
	    				$(".myAlert-bottom").hide();
	    			}
	    		}
		}
		
	});
	app.isMobile = false;
	app.registerScrollToolbar = function(view){
		if(!!app.isMobile){
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
    
//    $(window).scroll(function() {
//    	var iCurScrollPos = $(this).scrollTop();
//        if (iCurScrollPos > (iScrollPos + 30)) {
//        	iScrollPos = iCurScrollPos;
//        	Backbone.trigger('window:scroll', {direction: "down"});
//        	
//        } else if (iCurScrollPos < (iScrollPos - 30)){
//        	iScrollPos = iCurScrollPos;
//        	Backbone.trigger('window:scroll', {direction: "up"});
//        }
//        
//    });
    
});
