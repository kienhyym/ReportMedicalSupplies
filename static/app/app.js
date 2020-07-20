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
				$('.today').text(Number(new Date().getDate())+"/"+Number(new Date().getMonth()+1)+"/"+new Date().getFullYear())


				if (self.hasRole('admin') === false && gonrinApp().currentUser.Organization.tuyendonvi_id !== "1" ) {
					$('.dashboard-main').remove()
				}
				else {
					var medical_supplies_id = null;
					self.countNumberOfDay();
					self.chartCountNumberOfMonth();
					var start = 2010;
					var end = new Date().getFullYear();
					var options = "";
					for (var year = end; year >= start; year--) {
						options += "<option>" + year + "</option>";
					}
					$("#year1").append(options)
					$("#year2").append(options)
				}
				if(self.hasRole('admin') === true ){
					$('#info_myself').hide()
				}
			},
			chartCountNumberOfMonth: function () {
				var self = this;

				var data1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
				var data2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
				var data3 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
				var data4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

				var arrChart = []
				var chart = ["myChart1", "myChart2"]
				chart.forEach(function (item, idnex) {
					var myChart = new Chart($('#' + item), {
						type: 'line',
						data: {
							labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
							datasets: [
								{
									label: '',
									data: data1,
									backgroundColor: 'rgba(65, 183, 255, 1)',
									borderColor: 'rgba(65, 183, 255, 1)',
									borderWidth: 1,
									fill: false
								},
								{
									label: '',
									data: data2,
									backgroundColor: 'rgba(255, 144, 55, 1)',
									borderColor: 'rgba(255, 144, 55, 1)',
									borderWidth: 1,
									fill: false

								},
								{
									label: '',
									data: data3,
									backgroundColor: 'rgba(255, 33, 0, 1)',
									borderColor: 'rgba(255, 33, 0, 1)',
									borderWidth: 1,
									fill: false

								},
								{
									label: '',
									data: data4,
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
								text: 'Biểu đồ thống kê vật tư PCD COVID-19'
							},
							legend: {
								fullWidth: 'true',
								labels: {
									padding: 20,
								},
								align: "start"
							}
						}
					})
					arrChart.push(myChart)
				})

				$.ajax({
					url: self.serviceURL + "/api/v1/count_of_month_cungung",
					method: "POST",
					data: JSON.stringify(
						{
							"nam": new Date().getFullYear(),
							"medical_supplies_id": null,
						}
					),
					contentType: "application/json",
					success: function (response) {
						$('.seach-cung-ung input').val(response.medical_supplies_name)

						arrChart[1].data.datasets[0].data = response.supply_ability
						arrChart[1].data.datasets[1].data = response.quantity
						arrChart[1].data.datasets[2].data = response.price
						arrChart[1].data.datasets[3].data = response.price_quantity

						arrChart[1].data.datasets[0].label = "Khả năng cung ứng"
						arrChart[1].data.datasets[1].label = "Số lượng bán thực tế"
						arrChart[1].data.datasets[2].label = "Giá bán thực tế"
						arrChart[1].data.datasets[3].label = "Tổng tiền bán thực tế (/1000vnđ)"

						arrChart[1].options.title.text = 'Biểu đồ thống kê vật tư ' + response.medical_supplies_name + ' của đơn vị cung ứng năm ' + $('#year2').val();
						arrChart[1].update();
					}
				})

				$.ajax({
					url: self.serviceURL + "/api/v1/count_of_month_csyte",
					method: "POST",
					data: JSON.stringify(
						{
							"nam": new Date().getFullYear(),
							"medical_supplies_id": null,
						}
					),
					contentType: "application/json",
					success: function (response) {
						var date = new Date().getMonth();
						response.net_amount[0].forEach(function (item, index) {
							if (index > date) {
								response.net_amount[0].splice(index, 1, 0);
							}
						})

						$('.seach-yte input').val(response.medical_supplies_name[0])

						arrChart[0].data.datasets[0].data = response.quantity_import[0]
						arrChart[0].data.datasets[1].data = response.quantity_export[0]
						arrChart[0].data.datasets[2].data = response.net_amount[0]
						arrChart[0].data.datasets[3].data = response.estimates_net_amount

						arrChart[0].data.datasets[0].label = "Tổng số lượng nhập"
						arrChart[0].data.datasets[1].label = "Tổng số lượng sử dụng"
						arrChart[0].data.datasets[2].label = "Tổng số lượng tồn"
						arrChart[0].data.datasets[3].label = "Tổng dự kiến nhu cầu nhập"

						arrChart[0].options.title.text = 'Biểu đồ thống kê vật tư ' + $('.seach-yte input').val() + ' của cơ sở y tế năm ' + $('#year2').val();
						arrChart[0].update();
					}
				})

				self.searchItem(arrChart);
				self.changeYear(arrChart);



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
			changeYear: function (arrChart) {
				var self = this;
				var year = ['year1', 'year2']
				year.forEach(function (item, index) {
					$('#' + item).change(function () {
						if (item == "year1") {
							var medical_supplies_id = $('.seach-yte input').attr('item-id')
							var URL = self.serviceURL + "/api/v1/count_of_month_csyte";
							var nam = Number($(this).val());
						}
						if (item == "year2") {
							var medical_supplies_id = $('.seach-cung-ung input').attr('item-id')
							var URL = self.serviceURL + "/api/v1/count_of_month_cungung";
							var nam = Number($(this).val());
						}
						if (medical_supplies_id != undefined) {
							$.ajax({
								url: URL,
								method: "POST",
								data: JSON.stringify(
									{
										"nam": nam,
										"medical_supplies_id": medical_supplies_id
									}
								),
								contentType: "application/json",
								success: function (response) {
									if (item == "year1") {
										if (nam === new Date().getFullYear()) {
											var date = new Date().getMonth();
											response.net_amount[0].forEach(function (item, index) {
												if (index > date) {
													response.net_amount[0].splice(index, 1, 0);
												}
											})
										}

										arrChart[0].data.datasets[0].data = response.quantity_import[0]
										arrChart[0].data.datasets[1].data = response.quantity_export[0]
										arrChart[0].data.datasets[2].data = response.net_amount[0]
										arrChart[0].data.datasets[3].data = response.estimates_net_amount

										arrChart[0].data.datasets[0].label = "Tổng số lượng nhập"
										arrChart[0].data.datasets[1].label = "Tổng số lượng sử dụng"
										arrChart[0].data.datasets[2].label = "Tổng số lượng tồn"
										arrChart[0].data.datasets[3].label = "Tổng dự kiến nhu cầu nhập"

										arrChart[0].options.title.text = 'Biểu đồ thống kê vật tư ' + $('.seach-yte input').val() + ' của cơ sở y tế năm ' + $('#year2').val();
										arrChart[0].update();
									}
									if (item == "year2") {
										arrChart[1].data.datasets[0].data = response.supply_ability
										arrChart[1].data.datasets[1].data = response.quantity
										arrChart[1].data.datasets[2].data = response.price
										arrChart[1].data.datasets[3].data = response.price_quantity

										arrChart[1].data.datasets[0].label = "Khả năng cung ứng"
										arrChart[1].data.datasets[1].label = "Tổng số lượng bán thực tế"
										arrChart[1].data.datasets[2].label = "Giá bán thực tế"
										arrChart[1].data.datasets[3].label = "Tổng tiền bán thực tế (/1000vnđ)"

										arrChart[1].options.title.text = 'Biểu đồ thống kê vật tư ' + $('.seach-cung-ung input').val() + ' của đơn vị cung ứng năm ' + $('#year2').val();
										arrChart[1].update();
									}
								}
							})
						}
					})
				})

			},
			searchItem: function (arrChart) {
				var self = this;
				var listDropDown = [
					{
						"class_name": "seach-yte",
						"url": self.serviceURL + "/api/v1/load_medical_supplies_dropdown",
						"type": "single",
						"chart": arrChart[0]
					},
					{
						"class_name": "seach-cung-ung",
						"url": self.serviceURL + "/api/v1/load_medical_supplies_dropdown",
						"type": "single",
						"chart": arrChart[1]
					},

				]
				listDropDown.forEach(function (item, index) {
					$('.' + item.class_name + ' input').keyup(function name() {
						self.loadItemDropDown($(this).val(), $(this).attr('class-name'), item.url, item.type, item.chart)
					})
					$('.' + item.class_name + ' input').unbind('click').bind('click', function () {
						$(this).select();
						self.loadItemDropDown("", $(this).attr('class-name'), item.url, item.type, item.chart)
					})
				})
			},
			loadItemDropDown: function (TEXT, CLASS, URL, TYPE, myChart) { // Đổ danh sách Item vào ô tìm kiếm
				var self = this;
				$.ajax({
					type: "POST",
					url: URL,
					data: JSON.stringify(TEXT),
					success: function (response) {
						$('.' + CLASS + ' div .dropdown-menu .dropdown-item').remove();
						var count = response.length
						var arr = lodash.orderBy(response, ['name'], ['asc']);
						arr.forEach(function (item, index) {
							var itemSTRING = JSON.stringify(item)
							$('.' + CLASS + ' div .dropdown-menu').append(`
							<button item-info = '${itemSTRING}' out-side-${CLASS} class='dropdown-item' style='text-overflow: ellipsis;overflow: hidden;white-space: nowrap;font-size:13px'>${item.name}</button>`)
						})
						if (count == 0) {
							$('.' + CLASS + ' div .dropdown-menu').hide()
						}
						if (count == 1) {
							$('.' + CLASS + ' div .dropdown-menu').css("height", "45px")
							$('.' + CLASS + ' div .dropdown-menu').show()
						}
						if (count == 2) {
							$('.' + CLASS + ' div .dropdown-menu').css("height", "80px")
							$('.' + CLASS + ' div .dropdown-menu').show()
						}
						if (count > 2) {
							$('.' + CLASS + ' div .dropdown-menu').css("height", "110px")
							$('.' + CLASS + ' div .dropdown-menu').show()
						}
						self.chooseItemInListDropdown(CLASS, myChart);
					}
				});
			},
			chooseItemInListDropdown: function (CLASS, myChart) { //Chọn lẻ 1 item 
				var self = this;
				$('.' + CLASS + ' div .dropdown-menu .dropdown-item').unbind('click').bind('click', function () {
					var dropdownItemClick = $(this);
					var itemJSON = JSON.parse(dropdownItemClick.attr('item-info'))
					$('.' + CLASS + ' input').val(itemJSON.name);
					$('.' + CLASS + ' input').attr('item-id', itemJSON.id);
					self.medicalSuppliesId = itemJSON.id
					$('.' + CLASS + ' div .dropdown-menu').hide();
					if (CLASS == "seach-yte") {
						var URL = self.serviceURL + "/api/v1/count_of_month_csyte";
						var nam = Number($('#year1').val());
					}
					if (CLASS == "seach-cung-ung") {
						var URL = self.serviceURL + "/api/v1/count_of_month_cungung";
						var nam = Number($('#year2').val());

					}
					$.ajax({
						url: URL,
						method: "POST",
						data: JSON.stringify(
							{
								"nam": nam,
								"medical_supplies_id": itemJSON.id,
							}
						),
						contentType: "application/json",
						success: function (response) {
							if ($(myChart).attr('id') == 0) {
								if (nam === new Date().getFullYear()) {
									var date = new Date().getMonth();
									response.net_amount[0].forEach(function (item, index) {
										if (index > date) {
											response.net_amount[0].splice(index, 1, 0);
										}
									})
								}
								myChart.data.datasets[0].data = response.quantity_import[0]
								myChart.data.datasets[1].data = response.quantity_export[0]
								myChart.data.datasets[2].data = response.net_amount[0]
								myChart.data.datasets[3].data = response.estimates_net_amount

								myChart.data.datasets[0].label = "Tổng số lượng nhập"
								myChart.data.datasets[1].label = "Tổng số lượng sử dụng"
								myChart.data.datasets[2].label = "Tổng số lượng tồn"
								myChart.data.datasets[3].label = "Tổng dự kiến nhu cầu nhập"

								myChart.options.title.text = 'Biểu đồ thống kê vật tư ' + itemJSON.name + ' của cơ sở y tế năm ' + $('#year2').val();
								myChart.update();
							}
							if ($(myChart).attr('id') == 1) {
								myChart.data.datasets[0].data = response.supply_ability
								myChart.data.datasets[1].data = response.quantity
								myChart.data.datasets[2].data = response.price
								myChart.data.datasets[3].data = response.price_quantity

								myChart.data.datasets[0].label = "Khả năng cung ứng"
								myChart.data.datasets[1].label = "Số lượng bán thực tế"
								myChart.data.datasets[2].label = "Giá bán thực tế"
								myChart.data.datasets[3].label = "Tổng tiền bán thực tế (/1000vnđ)"

								myChart.options.title.text = 'Biểu đồ thống kê vật tư ' + itemJSON.name + ' của đơn vị cung ứng năm ' + $('#year2').val();
								myChart.update();
							}
						}
					})
				})

				$('.dashboard-main').unbind('click').bind('click', function (e) {
					if ($(e.target).attr('out-side-' + CLASS) == undefined) {
						$('.' + CLASS + ' div .dropdown-menu').hide();
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
			hasRole: function (role) {
				return (gonrinApp().currentUser != null && gonrinApp().currentUser.roles != null) && gonrinApp().currentUser.roles.indexOf(role) >= 0;
			},
			hasTypeDonvi: function (type_donvi) {
				if (!gonrinApp().hasRole("admin") && !!gonrinApp().currentUser.Organization) {
					return (gonrinApp().currentUser.Organization != null && gonrinApp().currentUser.Organization.type_donvi != null) && gonrinApp().currentUser.Organization.type_donvi.indexOf(type_donvi) >= 0;
				}
				return false;
			},
			convert_khongdau: function (strdata) {
				var kituA = ["á", "à", "ạ", "ã", "ả", "â", "ấ", "ầ", "ậ", "ẫ", "ă", "ằ", "ắ", "ẳ"],
					kituE = ["é", "è", "ẹ", "ẻ", "ẽ", "ê", "ế", "ề", "ệ", "ễ", "ể"],
					kituI = ["í", "ì", "ị", "ỉ", "ĩ"],
					kituO = ["ò", "ó", "ọ", "ỏ", "õ", "ô", "ồ", "ố", "ộ", "ổ", "ỗ", "ơ", "ờ", "ớ", "ợ", "ở", "ỡ"],
					kituU = ["ù", "ú", "ụ", "ủ", "ũ", "ư", "ừ", "ứ", "ự", "ử", "ữ"],
					kituY = ["ỳ", "ý", "ỵ", "ỷ", "ỹ"];

				var str2 = strdata.toLowerCase();
				for (var i = 0; i < kituA.length; i++) {
					str2 = str2.replace(kituA[i], "a");
				}
				for (var i = 0; i < kituE.length; i++) {
					str2 = str2.replace(kituE[i], "e");
				}
				for (var i = 0; i < kituI.length; i++) {
					str2 = str2.replace(kituI[i], "i");
				}
				for (var i = 0; i < kituO.length; i++) {
					str2 = str2.replace(kituO[i], "o");
				}
				for (var i = 0; i < kituU.length; i++) {
					str2 = str2.replace(kituU[i], "u");
				}
				for (var i = 0; i < kituY.length; i++) {
					str2 = str2.replace(kituY[i], "y");
				}
				str2 = str2.replace("đ", "d");
				// if(upper === true){
				// 	return str2.toUpperCase();
				// }
				return str2;
			},
			showloading: function (content = null) {
				//			$("#loading").removeClass("d-none");
				$('body .loader').addClass('active');
				if (content) {
					$('body .loader').find(".loader-content").html(content);
				}
			},
			hideloading: function () {
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
					}, error: function (err) {
					}
				})
			},
		});
		Backbone.history.start();

	});