define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = '<ul id="menu-first" class="nav flex-column">' +
		'</ul>';

	var navdata = require('app/nav/nav');

	//var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || $( window ).width() <= 767;


	return Gonrin.View.extend({
		checkUser: function () {
			var isUser = gonrinApp().currentUser != null ? gonrinApp().currentUser.hasRole('User') : false;
			return isUser;
		},
		checkVaitro: function (checkVaitroValue) {
			var currentUser = gonrinApp().currentUser;
			if (currentUser !== null && currentUser !== undefined) {
				return (checkVaitroValue.indexOf(currentUser.rank) > -1);
			}
			return false;
		},
		userHasRole: function(role) {
            return (gonrinApp().currentUser != null && gonrinApp().currentUser.roles != null) && gonrinApp().currentUser.roles.indexOf(role) >= 0;
        },
        checkTuyenDonVi: function(tuyendonvi_id) {
            return (gonrinApp().currentUser != null && currentUser.Organization != null) && (gonrinApp().currentUser.Organization.tuyendonvi_id == tuyendonvi_id);
        },
		requireRole: function (role) {
			var user = gonrinApp().currentUser;
			// console.log("user.role====", user.role);
			if (!!user && user.role === role) {
				return true;
			}
			return false;
		},
		requireTuyenDonVi: function (listTuyenDonVi) {
			var currentUser = gonrinApp().currentUser;
			if (currentUser !== null && currentUser !== undefined && currentUser.Organization != null && currentUser.Organization.tuyendonvi_id!=null && listTuyenDonVi instanceof Array) {
				for (var i = 0; i < listTuyenDonVi.length; i++) {
					if(currentUser.Organization.tuyendonvi_id == listTuyenDonVi[i]) {
						return true;
					}
				}
			}
			return false;
		},
		requirePointRole: function (point_name, role) {
			var user = gonrinApp().currentUser;
			if (!!user) {
				for (var i = 0; i < user.points.length; i++) {
					var point = user.points[i];
					if ((point_name === point.point_name) && (role === point.role)) {
						return true;
					}
				}
			}
			return false;
		},
		loadEntries: function ($el, entries, is_root) {
			var self = this;
			var check_first = false;
			if (entries && (entries.length > 0)) {
				_.each(entries, function (entry, index) {
					var entry_type = _.result(entry, 'type');
					var entry_ref = _.result(entry, '$ref');
					var entry_text = _.result(entry, 'text');
					var entry_icon = _.result(entry, 'icon');
					var entry_entries = _.result(entry, 'entries');
					var entry_viewData = _.result(entry, 'viewData');
					var _html = '';
					if (entry_type === "category" && entry_text !== undefined) {
						_html = _html + '<a  class="nav-link pl-2" href=" javascript:void(0);">';
						if (entry_icon) {
							_html = _html + '<i class="' + entry_icon + '" aria-hidden="true"></i>';
						}
						_html = _html + '<span >' + entry_text + '</span>';
						_html = _html + '<span class="pull-right-container">' +
							'<i class="fa fa-angle-down pull-right"></i>' +
							'</span>';
						_html = _html + '</a>';
					}

					if (entry_type === "view" && entry_text !== undefined) {
						_html = _html + '<a class="nav-link pl-2 navMenu" href="javascript:;">';
						if (entry_icon) {
							_html = _html + '<i class="' + entry_icon + '"></i>'; //change icon
						}
						_html = _html + entry_text;
						_html = _html + '</a>';
					}
					var $entry = $('<li>').addClass("nav-item").html(_html);
					if (entry_type === "category") {
						$entry.addClass("treeview")
					}

					if ($el) {
						$el.append($entry);
					}

					if (entry_entries) {
						var _nav_list = $('<ul>').addClass("nav flex-column").appendTo($entry);
						self.loadEntries(_nav_list, entry_entries, false);
					}
					//self.loadView(entry);
					if (self.isEntryVisible(entry)) {
						self.handleEntryClick($entry, entry);
					} else {
						$entry.hide();
					}
				});
			};
			return this;
		},

		isEntryVisible: function (entry) {
			var self = this;
			var visible = "visible";
			return !entry.hasOwnProperty(visible) || (entry.hasOwnProperty(visible) && (_.isFunction(entry[visible]) ? entry[visible].call(self) : (entry[visible] === true)));
		},
		render: function () {
			var self = this;
			this.$el.empty();
			this.$el.html(template);
			var nav_list = this.$el.find('ul#menu-first');
			this.loadEntries(nav_list, navdata, true);
			$('ul').parents('li').children("ul").attr("style", "display:none");
			return this;
		},
		handleEntryClick: function ($entry, entry) {
			var self = this;
			if (entry.type === "category") {
				var $a = $entry.children('a');
				if ($a === undefined) {
					return this;
				}
				$a.unbind("click").bind("click", function (e) {
					// $(this).addClass("active");
					var hasOpen = $(this).parents('li').hasClass('menu-open');
					if (!hasOpen) {
						$(this).parents('li').addClass('menu-open');
						$(this).parents('li').children("ul").removeAttr("style");
					} else {
						$(this).parents('li').removeClass('menu-open');
						$(this).parents('li').children("ul").attr("style", "display:none");
					}
				});
			};
			if (entry.type === "view") {
				var $a = $entry.children('a');
				if ($a === undefined) {
					return this;
				}
				$a.unbind("click").bind("click", function (e) {
					e.preventDefault();
					// $(this).addClass("active");
					self.$el.find(".active").removeClass("active");
					// $(this).addClass('active');
					$('.main-sidebar').toggleClass('open');
					self.getApp().getRouter().navigate(entry.route);
					$(this).addClass("active");
				});
				
			};
			return this;

		},

	});

});