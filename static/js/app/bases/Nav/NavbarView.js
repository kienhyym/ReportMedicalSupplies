define(function (require) {
    "use strict";
    var $                   = require('jquery'),
        _                   = require('underscore'),
        Gonrin				= require('gonrin');

    var template = '<ul id="menu-first" class="nav flex-column">'+
    '</ul>';
//	var template = '<div id="leftmenu" class="form-group"> <ul  class="page-navbar-menu scroll-nav clearfix" data-keep-expanded="false" data-auto-scroll="true" data-slide-speed="200">'
//		+ '<li class="navbar-toggler-wrapper"><div class="navbar-toggler"></div></li></ul></div>';
	var navdata = require('app/bases/Nav/nav');
	var category_data = require('app/bases/Nav/category');
	var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || $( window ).width() <= 767;
    return Gonrin.View.extend({
    	//data: navdata,
    	currentSo:function(month, category){ 
    		var so = this.getApp().data("current_so");
    		if(!!so && !!so.con && !!so.con.ngaysinh){
    			var currentMonth = this.getMonthChild(so.con.ngaysinh);
    			var isLoadmore = this.getApp().data("loadmore_"+category) || false;
    			if(isLoadmore || month === -100){
    				return true;
    			}
    			if(!!currentMonth && (currentMonth >= 24) && (currentMonth < 60)){
    				return month === 24;
    			}
    			if(!!currentMonth && (currentMonth >= 60) && (currentMonth < 73)){
    				return month === 60;
    			}
    			return currentMonth ===  month ? true:false;
    		}
    		return false;
    	},
    	getCurrentSo:function(){
    		var so = this.getApp().data("current_so");

    		if(!!so){
    			return "?id="+so.id;
    		}
    		return "";
    	},
    	hasCurrentSo: function(){
    		var currentSo = this.getApp().data("current_so");
    		if(!!currentSo){
    			return true;
    		}
    		return false;
    	},
    	checkUser: function(){
    		return (gonrinApp().currentUser != null && gonrinApp().currentUser.roles!=null) && gonrinApp().currentUser.roles.indexOf('citizen')>=0;
    	},
    	checkDev: function(){
    		return (gonrinApp().currentUser != null && gonrinApp().currentUser.id ==='AC00124828');
    	},
    	userHasRole: function(role){
    		return (gonrinApp().currentUser != null && gonrinApp().currentUser.roles!=null) && gonrinApp().currentUser.roles.indexOf(role)>=0;
    			
    		
    	},
    	loadEntries: function($el, entries, is_root){
			var self = this;
			if(entries && (entries.length > 0)){
				_.each(entries, function(entry, index){
					var entry_type = _.result(entry, 'type');
					var entry_collectionName = _.result(entry, 'collectionName');
					var entry_ref = _.result(entry, '$ref');
					var entry_text = _.result(entry, 'text');
					var entry_icon = _.result(entry, 'icon');
					var entry_entries = _.result(entry, 'entries');
					var entry_viewData = _.result(entry, 'viewData');
					var entry_name = _.result(entry, 'name');
					var entry_loadmore = _.result(entry, 'loadmore');
					var _html = '';
					if(entry_type === "category"  && entry_text !== undefined){
						var title_category = "";
						if(!!entry_viewData && !!entry_viewData.text){
							title_category = entry_viewData.text;
						}
						_html = _html + '<a class="nav-link" href="javascript:void(0);" title="'+title_category+'">';
						if(entry_icon){
							_html = _html + '<i class="' + entry_icon + '" aria-hidden="true"></i>';
//							_html = _html + '<img class="nav-menu-icon" src="' + entry_icon + '"/>'; //change icon
						}
						
						_html = _html + '<span>'+ entry_text +'</span>';
						
						if(!!entry_loadmore && !! entry_name){
							var more = self.getApp().data("loadmore_"+entry_name) || false;
							var moretxt = "";
							if(!!more){
								moretxt = "Xem rút gọn";
							}else{
								moretxt = "Xem tất cả";
							}
							_html = _html + '<span class="pull-right-container">'+
				              '<i class="fa fa-angle-left pull-right"></i>'+
				              '<button id="btn-loadmore_'+entry_name+'" style="float:right; font-size: 12px;" class="btn btn-success btn-xs">' + moretxt + '</button>'+
				            '</span>';
//							_html = _html + '<span class="arrow" style="float:right"></span>';
//							_html = _html + '<button id="btn-loadmore_'+entry_name+'" style="float:right; font-size: 12px;" class="btn btn-success btn-xs">' + moretxt + '</button>';
						}else{
							_html = _html + '<span class="pull-right-container">'+
				              '<i class="fa fa-angle-left pull-right"></i>'+
				            '</span>';
//							_html = _html + '<span class="arrow"></span>';
						}
//						_html = _html + '<span class="pull-right-container">'+
//			              '<i class="fa fa-angle-left pull-right"></i>'+
//			            '</span>';	
						_html = _html + '</a>';
					}
					
					if(entry_type === "link"  && entry_text !== undefined){
						_html = _html + '<a class="nav-link" href="'+ entry_ref +'">';
						if(entry_icon){
							_html = _html + '<i class="' + entry_icon + '"></i>'; //change icon
						}
						_html = _html + '<span >'+ entry_text +'</span>';
						_html = _html + '</a>';
					}
					
					if(entry_type === "view" && entry_text !== undefined){
						_html = _html + '<a class="nav-link" href="javascript:;">';
//						if(entry_icon){
//							_html = _html + '<img class="nav-menu-icon" src="' + entry_icon + '"/>'; //change icon
//						}
						if(entry_icon){
							_html = _html + '<i class="' + entry_icon + '"></i>'; //change icon
						}
						_html = _html + '<span>'+ entry_text +'</span>';
						_html = _html + '</a>';
					}
					
					var $entry = $('<li>').addClass("nav-item").html(_html);
					if(entry_type === "category"){
						$entry.addClass("treeview")
					}
					
					//loadmore click
					if(!!entry_loadmore){
						var $btnloadmore = $entry.find('#btn-loadmore_'+entry_name);
						$btnloadmore.unbind("click").bind('click', {obj:entry_name}, function(event){
							event.stopPropagation();
							var data_name = event.data.obj;
							var more = self.getApp().data("loadmore_"+ data_name) || false;
							self.getApp().data("loadmore_"+ data_name,!more);
							self.render();
							$('#btn-loadmore_'+entry_name).parents('span').parents('a.nav-link').click();
						});
					}
//					var current_category = self.getApp().data("current_category") || "";
//					if(!!current_category && current_category !== ""){
//						if (current_category === entry_name){
//							$entry.addClass("open");
//							$entry.find('span.arrow').addClass("open");
//							$entry.children('a').append($('<span>').addClass("selected"));
//						}
//					} else if((index === 0)&&(is_root === true)){
//						$entry.addClass("open");
//						$entry.find('span.arrow').addClass("open");
//						$entry.children('a').append($('<span>').addClass("selected"));
//					}
					if($el){
						$el.append($entry);
					}
					index ++;
					if (entry_entries) {
						var _nav_list = $('<ul>').addClass("nav flex-column submenu").appendTo($entry);
						self.loadEntries(_nav_list, entry_entries, false);
					}
//					self.loadView(entry);
					var month = 0;
					if(!!entry_viewData && entry_viewData.month>0){
						month = entry_viewData.month;
					}
					
					if(self.isEntryVisible(entry)){
						self.handleEntryClick($entry, entry);
					} else {
//						self.handleEntryClick($entry, entry);
						$entry.hide();
					}
					
				});// end _.each
			};
			return this;
		},

		isEntryVisible : function(entry) {
			var self = this;
	        var visible = "visible";
	        return !entry.hasOwnProperty(visible) || (entry.hasOwnProperty(visible) && (_.isFunction(entry[visible]) ? entry[visible].call(self) : (entry[visible] === true)) );
			
	    },
	    getMonthChild: function(day){
    		if(!!day){
    			var ngaysinh= null;
    			if ($.isNumeric(day) && parseInt(day)>0){
					ngaysinh = new Date(day*1000);
				} else if(typeof day === "string"){
					ngaysinh = new Date(day);
				}
    			var now = moment();
    			var ngaysinhday = ngaysinh.getDate();//Number(ngaysinh.format("DD"))
    			var ngaysinhmonths = ngaysinh.getMonth();//Number(ngaysinh.format("MM"));
    			var ngaysinhyears = ngaysinh.getFullYear();//Number(ngaysinh.format("YYYY"));
    			var nowmonths = Number(now.format("MM"));
    			var nowyears = Number(now.format("YYYY"));
    			var nowDay = Number(now.format("DD"));
    			var diff =  (nowmonths + (nowyears * 12)) - (ngaysinhmonths + (ngaysinhyears * 12));
    			if(diff ==0 && (nowDay-ngaysinhday>0)){
    				return 1;
    			}
    			return diff;
    		}
    		return 0;
    	},
    	renderPostCategory(entries){
    		var self = this;
    		if(entries != null){
    			this.loadEntries(nav_list, entries, false);
    		}
    	},
		render: function(entries){
			this.$el.empty();
			entries = entries || navdata;
			var self = this;

			this.$el.empty();
			this.$el.html(template);
			var nav_list = this.$el.find('ul#menu-first');
			
			

			if(category_data[0].isloaded){
           	 	self.loadEntries(nav_list, category_data, true);
           	 	self.loadEntries(nav_list, navdata, true);
           	    $('ul').parents('li').children("ul").hide();
            } else {
				self.loadEntries(nav_list, navdata, true);
    			$('ul').parents('li').children("ul").hide();
//            	 	$.ajax({
// 	 				url: (self.getApp().serviceURL || "") + '/api/v1/category',
// 	 				dataType: "json",
// 	 				contentType: "application/json",
// 	 				success: function(data) {
// 	 					if(data.objects.length>0){
// 	 						for(var i = 0; i < data.objects.length; i++){
// 	 							var cat = data.objects[i];
// 	 							var catentry = {
// 	 									"text":cat.name,
// //	 									"icon":"fa fa-newspaper-o",
// 	 									"type":"view",
// 	 									"collectionName":"post",
// 	 									"route":"post/collection?id=" + cat.id,
// 	 									"$ref": "app/view/CategoryPost/CategoryView",	
// 	 							}
//     	 						category_data[0]["entries"].push(catentry);
// 	 						}
// 	 					}
// 	 					//self.categoryData = category_data;
// 	 					category_data[0].isloaded = true;
// 	 					self.loadEntries(nav_list, category_data, true);
// 	 				},
// 	 				error:function(xhr,status,error){
    					
//     				},
//     				complete:function(){
						
//     					self.loadEntries(nav_list, navdata, true);
//     					$('ul').parents('li').children("ul").hide();
//     				}
//     			});
            }
			
			return this;
		},
		handleEntryClick : function ($entry, entry) {
			var self = this;
	       
			if(entry.type === "category"){
				var $a = $entry.children('a');
				if($a === undefined){
					return this;
				}
				var entry_name = _.result(entry, 'name');
				$a.unbind("click").bind("click", {obj:entry_name}, function(e){
					self.getApp().data("current_category", e.data.obj);
					var hasOpen = $(this).parents('li').hasClass('menu-open');
	        		self.$el.find("#menu-first").children("li").children("a").removeClass("active");
	        		self.$el.find("#menu-first").children("li").removeClass("menu-open");
	        		self.$el.find("#menu-first").children("li").children("ul").hide();

		        	if(!hasOpen){
		        		$(this).parents('li').addClass('menu-open');
		        		$(this).parents('li').children("ul").show();
		        	}else{
		        		$(this).parents('li').removeClass('menu-open');
		        		$(this).parents('li').children("ul").hide();
		        	}
					
//					$(".nav-wrapper").children("a").removeClass("active");
		        	$(this).addClass("active");
		        	
		        	
//		        	var hasSubMenu = $(this).next().hasClass('sub-menu');
//		            if ($(this).next().hasClass('sub-menu always-open')) {
//		                return;
//		            }
//		            
//		            var parent = $entry.parent().parent();
//		            
//		            var menu = self.$el.find('.page-navbar-menu');
//		            var sub = $(this).next();
//
//		            var autoScroll = menu.data("auto-scroll");
//		            var slideSpeed = parseInt(menu.data("slide-speed"));
//		            var keepExpand = menu.data("keep-expanded");
//
//		            if (keepExpand !== true) {
//		                parent.children('li.open').children('a').children('.arrow').removeClass('open');
//		                parent.children('li.open').removeClass('open');
//		            }
//		         
//		            if (sub.is(':visible')) {
//		                $('.arrow', $(this)).removeClass("open");
//		                $(this).parent().removeClass("open");
//		          
//		            } else if (hasSubMenu) {
//		                $('.arrow', $(this)).addClass("open");
//		                $(this).parent().addClass("open");
//		         
//		            };
		            //e.preventDefault();
		        });
			};
			if(entry.type === "view"){
				var $a = $entry.children('a');
				if($a === undefined){
					return this;
				}
				$a.unbind("click").bind("click", function(e){
					e.preventDefault();
					$("#menu-first").children("li").children("a").removeClass("active");
					self.$el.find("#menu-first").children("li").children("a").removeClass("active");
					self.$el.find("#menu-first").children("li").removeClass("menu-open");
					self.$el.find("#menu-first").children("li").children("ul").hide();
					
					var menu_child = $(this).parents('li').children("ul");
					if(menu_child.length){
						menu_child.show();
						menu_child.parents('li').addClass('menu-open');
						menu_child.children("li").children("a").removeClass("active");

					}
					$(this).addClass('active');
		            $('.main-sidebar').toggleClass('open');
		            self.getApp().getRouter().navigate(entry.route);
//		            var url = $entry.attr("href");
//		            var menuContainer = self.$el.find('ul');
//		            
//		            menuContainer.children('li.active').removeClass('active');
//		            menuContainer.children('li.open').removeClass('open');
//		            menuContainer.find('span.arrow').removeClass('open');
//		            menuContainer.find('span.selected').remove();
//
//		            $(this).parents('li').each(function (){
//		            	$(this).addClass('active open');
//		            	$(this).children('div').children('span.arrow').addClass("open");
//		            	$(this).children('div').append($('<span>').addClass("selected"));
//		            });
//		            $(this).parents('li').addClass('active');
//		            if(entry.collectionName){
//		            	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
//		            		 $('.menu-toggler').trigger("click");
//		            	}
//		            	self.getApp().getRouter().navigate(entry.route, {trigger:true});
//		            	
//		            }
				});
			};
	        return this;
	        
		},
		toggleNav : function(){
			var self = this;
			var body = $('body');
        	var _navMenu = $('.page-navbar-menu');
        	var _navbar = self.$el;
        	var _navMenu = self.$el.find('.page-navbar-menu');
            //$(".sidebar-search", sidebar).removeClass("open");
        	
            if (body.hasClass("page-navbar-closed")) {
                body.removeClass("page-navbar-closed");
                _navMenu.removeClass("page-navbar-menu-closed");
                /*if ($.cookie) {
                    $.cookie('navbar_closed', '0');
                }*/
            } else {
                body.addClass("page-navbar-closed");
                _navMenu.addClass("page-navbar-menu-closed");
                if (body.hasClass("page-navbar-fixed")) {
                	_navMenu.trigger("mouseleave");
                }
                /*if ($.cookie) {
                    $.cookie('navbar_closed', '1');
                }*/
            }
            //$('.page-navbar').collapse();
            $(window).trigger('resize');
			
		},
		// Hanles sidebar toggler
	    handleToggler : function () {
	        /*if ($.cookie && $.cookie('sidebar_closed') === '1' && Metronic.getViewPort().width >= resBreakpointMd) {
	            $('body').addClass('page-navbar-closed');
	            $('.page-navbar-menu').addClass('page-navbar-menu-closed');
	        }*/

	        // handle sidebar show/hide
	        var self = this;
	        var navtoggler = this.$el.find(".navbar-toggler");
	        
	        navtoggler.unbind('click').bind('click', function(e){
	        	/*var body = $('body');
	        	var _navMenu = $('.page-navbar-menu');
	        	var _navbar = _self.$el;
	        	var _navMenu = _self.$el.find('.page-navbar-menu');
	            //$(".sidebar-search", sidebar).removeClass("open");
	        	
	            if (body.hasClass("page-navbar-closed")) {
	                body.removeClass("page-navbar-closed");
	                _navMenu.removeClass("page-navbar-menu-closed");
	                
	            } else {
	                body.addClass("page-navbar-closed");
	                _navMenu.addClass("page-navbar-menu-closed");
	                if (body.hasClass("page-navbar-fixed")) {
	                	_navMenu.trigger("mouseleave");
	                }
	            }
	            $(window).trigger('resize');*/
	        	self.toggleNav();
	        });
	        return this;
	    },
	    
	    
	    //move from router
	    loadView: function(entry){
			var self = this;
			var router = this.getApp().getRouter();
            if(entry && entry.collectionName && (entry.type === "view") && (entry['$ref'])){
            	var entry_path = this.buildPath(entry);
            	router.route(entry_path, entry.collectionName, function(){
    				require([ entry['$ref'] ], function ( View) {
    					var view = new View({el: self.getApp().$content, viewData:entry.viewData});
    					view.render();
    				});
    			});
            };
            return this;
        },
        buildPath:function(entry){
        	var entry_path;
        	if(entry.type === "view"){
        		entry_path = _.result(entry,'route');
        	}
			return entry_path;
		},
	    
	});

});