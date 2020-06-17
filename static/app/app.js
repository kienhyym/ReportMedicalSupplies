define('jquery', [], function () {
	return jQuery;
});

require.config({
	baseUrl: static_url + '/js/lib',
	paths: {
		app: '../../app',
		tpl: '../tpl',
		vendor: '../../vendor',
		schema: '../../schema'
	},
	//	paths: {
	//		app: '../app',
	//		schema: '../schema',
	//		tpl: '../tpl',
	//		vendor: '../../vendor'
	//	},
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
window.clone = function (objectData) {
	return JSON.parse(JSON.stringify(objectData));
}
class Loader {
	show() {
		if (!$('.load-process').hasClass('active')) {
			$('.load-process').addClass('active');
		}
	}
	hide() {
		if ($('.load-process').hasClass('active')) {
			$('.load-process').removeClass('active');
		}
	}
}
var loader = new Loader();
require(['jquery',
	'gonrin',
	'app/router',
	'app/nav/NavbarView',
	'text!app/base/tpl/index.html',
	'i18n!app/nls/app',
	'vendor/lodash-4.17.10',
	'vendor/store'],
	function ($, Gonrin, Router, Nav, layout, lang, lodash, storejs) {
		$.ajaxSetup({
			headers: {
				'content-type': 'application/json'
			}
		});

		window.lodash = lodash;

		var app = new Gonrin.Application({
			serviceURL: location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : ''),
			router: new Router(),
			lang: lang,
			layout: layout,
			staticURL: static_url,
			initialize: function () {
				this.getRouter().registerAppRoute();
				this.getCurrentUser();
			},
			getCurrentUser: function () {
				var self = this;
				var token = storejs.get('X-USER-TOKEN');
                $.ajaxSetup({
                    headers: {
                        'X-USER-TOKEN': token
                    }
                });
				$.ajax({
					url: self.serviceURL + "/api/v1/current_user",
					dataType: "json",
					success: function (data) {
						$.ajaxSetup({
							headers: {
								'X-USER-TOKEN': data.token
							}
						});
						storejs.set('X-USER-TOKEN', data.token);
						gonrinApp().postLogin(data);
						// self.postLogin(data);
					},
					error: function (XMLHttpRequest, textStatus, errorThrown) {
						loader.hide();
						self.router.navigate("login");
					}
				});
			},
			postLogin: function (data) {
				var self = this;
				loader.show();
				self.currentTenant = data.current_tenant_id;
				self.currentUser = new Gonrin.User(data);
				self.chartCountNumberOfMonth();
				self.countNumberOfDay();
				self.chartCountNumberOfMonthCungUng();
				self.currentUser = new Gonrin.User(data);
				var tpl = gonrin.template(layout)({});
				$('.content-contain').html(tpl);
				this.$header = $('body').find(".main-sidebar");
				this.$content = $('body').find(".content-area");
				this.$navbar = $('body').find(".main-sidebar .nav-wrapper");

				this.nav = new Nav({ el: this.$navbar });
				self.nav.render();

				$("span#display_name").html(self.get_displayName(data));

				self.bind_event();
				$("#changepassword").on("click", function () {
					self.router.navigate("changepassword");
				});
				loader.hide();
			},
			chartCountNumberOfMonth: function () {
				var self = this;
				$.ajax({
					url: self.serviceURL + "/api/v1/count_of_month_csyte",
					method: "POST",
					data: JSON.stringify(
						{
							"nam": Number(moment().format('YYYY')),
						}
					),
					contentType: "application/json",
					success: function (data) {
						var ctx = document.getElementById('myChart');
						var myChart = new Chart(ctx, {
							type: 'line',
							data: {
								labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
								datasets: [
									{
										label: 'Số lượng nhập',
										data: data.quantity_import,
										backgroundColor: 'rgba(65, 183, 255, 1)',
										borderColor: 'rgba(65, 183, 255, 1)',
										borderWidth: 1,
										fill: false
									},
									{
										label: 'Số lượng sử dụng',
										data: data.quantity_export,
										backgroundColor: 'rgba(255, 144, 55, 1)',
										borderColor: 'rgba(255, 144, 55, 1)',
										borderWidth: 1,
										fill: false

									},
									{
										label: 'Số lượng tồn trong tháng',
										data: data.net_amount,
										backgroundColor: 'rgba(255, 33, 0, 1)',
										borderColor: 'rgba(255, 33, 0, 1)',
										borderWidth: 1,
										fill: false

									},
									{
										label: 'Số lượng tồn',
										data: data.estimates_net_amount,
										backgroundColor: 'rgba(114, 182, 17, 1)',
										borderColor: 'rgba(114, 182, 17, 1)',
										borderWidth: 1,
										fill: false
									},
								]
							},
							options: {
								responsive: true,
								title: {
									display: true,
									text: 'Biểu đồ thống kê vật tư PCD COVID-19 của cơ sở y tế'
								},
								legend: {
									fullWidth: 'true',
									labels: {
										padding: 20,
									},
									align:"start"
								}
							}
						});
					}
				})

				var kichthuocmanhinh = $(window).width();
				if(kichthuocmanhinh < 768){
					$('#myChart').attr('height','400')
				}
			},
			chartCountNumberOfMonthCungUng: function () {
				var self = this;
				$.ajax({
					url: self.serviceURL + "/api/v1/count_of_month_cungung",
					method: "POST",
					data: JSON.stringify(
						{
							"nam": Number(moment().format('YYYY')),
						}
					),
					contentType: "application/json",
					success: function (data) {
						var ctx = document.getElementById('myChart2');
						var myChart2 = new Chart(ctx, {
							type: 'line',
							data: {
								labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
								datasets: [
									{
										label: 'Khả năng cung ứng',
										data: data.supply_ability,
										backgroundColor: 'rgba(65, 183, 255, 1)',
										borderColor: 'rgba(65, 183, 255, 1)',
										borderWidth: 1,
										fill: false
									},
									{
										label: 'Số lượng bán thực tế',
										data: data.quantity,
										backgroundColor: 'rgba(255, 144, 55, 1)',
										borderColor: 'rgba(255, 144, 55, 1)',
										borderWidth: 1,
										fill: false

									},
									{
										label: 'Giá bán thực tế',
										data: data.price,
										backgroundColor: 'rgba(255, 33, 0, 1)',
										borderColor: 'rgba(255, 33, 0, 1)',
										borderWidth: 1,
										fill: false

									},
									{
										label: 'Tổng tiền bán thực tế',
										data: data.price_quantity,
										backgroundColor: 'rgba(114, 182, 17, 1)',
										borderColor: 'rgba(114, 182, 17, 1)',
										borderWidth: 1,
										fill: false
									},
								]
							},
							options: {
								responsive: true,
								title: {
									display: true,
									text: 'Biểu đồ thống kê vật tư PCD COVID-19 của đơn vị cung ứng'
								},
								legend: {
									fullWidth: 'true',
									labels: {
										padding: 20,
									},
									align:"start"
								}
							}
						});
					}
				})

				var kichthuocmanhinh = $(window).width();
				if(kichthuocmanhinh < 768){
					$('#myChart2').attr('height','400')
				}
			},
			countNumberOfDay: function () {
				var self = this;
				$.ajax({
					url: self.serviceURL + "/api/v1/count_of_day",
					method: "POST",
					data: JSON.stringify(moment().format('YYYY/MM/DD')),
					contentType: "application/json",
					success: function (data) {
						$('.value-slbaocao-csyte').text(data.sl_baocao_csyte)
						$('.value-slbaocao-cungung').text(data.sl_baocao_cungung)
					}
				})
			},
			bind_event: function () {
				var self = this;
				var currentUser = self.currentUser.id;
				$(".navbar-brand").bind('click', function () {
					self.router.navigate("index");

					location.reload()
				});

				$("#logout").unbind('click').bind('click', function () {
					self.router.navigate("logout");
				});
				$("#info_myself").unbind('click').bind('click', function () {
					// self.router.navigate("user/model?id=" + currentUser);
					if (gonrinApp().hasTypeDonvi("donvicungung")) {
						gonrinApp().getRouter().navigate("donvicungung/model");
					} else if (gonrinApp().hasTypeDonvi("donvinhanuoc")) {
						gonrinApp().getRouter().navigate("canbo/DonViYTe/model");
					}

				});

				$('#list_search').hide()
				$('#list_search_mobile').hide()

				$('#search_keyup').unbind('click').bind('click', function (params) {
					$('#list_search').show()
				})
				$('#search_keyup_mobile').unbind('click').bind('click', function (params) {
					$('#list_search_mobile').show()
				})

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
				$('.toggle-sidebar').unbind("click").bind('click', function (e) {
					$('.main-sidebar').toggleClass('open');
				});


			},
			get_displayName: function (data) {
				var displayName = "";
				if (!!data.name) {
					displayName = data.name;
				}
				if (displayName === null || displayName === "") {
					if (!!data.phone_number) {
						displayName = data.phone_number;
					} else if (!!data.email) {
						displayName = data.email;
					}

				}
				return displayName;
			},
			hasRole: function(role){
				return (gonrinApp().currentUser != null && gonrinApp().currentUser.roles!=null) && gonrinApp().currentUser.roles.indexOf(role)>=0;
			},
			hasTypeDonvi: function(type_donvi) {
				if (!gonrinApp().hasRole("admin") && !!gonrinApp().currentUser.Organization) {
					return (gonrinApp().currentUser.Organization != null && gonrinApp().currentUser.Organization.type_donvi!=null) && gonrinApp().currentUser.Organization.type_donvi.indexOf(type_donvi)>=0;
				}
				return false;
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
				// if(upper === true){
				// 	return str2.toUpperCase();
				// }
				return str2;
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
			saveLog: function (action, object_type, object_no, workstation_id, workstation_name, items, created_at) {
				var self = this;
				$.ajax({
					type: "POST",
					url: self.serviceURL + "/api/v1/activitylog/save",
					data: JSON.stringify({
						action: action,
						actor: self.currentUser.display_name,
						workstation_id: workstation_id,
						workstation_name: workstation_name,
						tenant_id: self.currentTenant,
						user_id: self.currentUser.id,
						items: items,
						object_no: object_no,
						object_type: object_type,
						created_at: created_at

					}), success: function (res) {
						// console.log("res", res);
					}, error: function (err) {
						// console.log("err", err);
					}
				})
			},
		});
		Backbone.history.start();

	});