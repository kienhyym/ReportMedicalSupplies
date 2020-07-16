define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/baocaodonvi_cungung/tpl/model.html'),
		schema = require('json!schema/ReportSupplyOrganizationSchema.json');
	// var OrganizationView = require('app/donvicungung/view/SelectView');
	var itemView = require('app/baocaodonvi_cungung/view/itemView');

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "report_supply_organization",
		bindings: "data-bind",
		listItemView: [],
		listItemRemove: [],
		tools: [
			{
				name: "defaultgr",
				type: "group",
				groupClass: "toolbar-group",
				buttons: [
					{
						name: "back",
						type: "button",
						buttonClass: "btn-default btn-sm btn-secondary",
						label: "TRANSLATE:BACK",
						command: function () {
							var self = this;
							Backbone.history.history.back();
						}
					},
					{
						name: "save",
						type: "button",
						buttonClass: "btn-success btn-sm",
						label: "TRANSLATE:SAVE",
						command: function () {
							var self = this;
							self.model.save(null, {
								success: function (model, respose, options) {
									self.getApp().notify("Lưu thông tin thành công");
									self.listItemView.forEach((item, index) => {
										if (self.listItemRemove.indexOf(item.id) != -1) {
											item.remove(true);
										}
										else {
											item.model.set('date', self.model.get('date'))
											if (item.model.get('report_supply_organization_id') == null) {
												item.model.set('report_supply_organization_id', respose.id)
											}
											item.model.save(null, {
												success: function (model, respose, options) {

												},
												error: function (xhr, status, error) {
													// HANDLE ERROR
												}
											});
										}

									})
									self.getApp().getRouter().navigate("baocaodonvi_cungung/collection");
								},
								error: function (xhr, status, error) {
									try {
										if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
											self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
											self.getApp().getRouter().navigate("login");
										} else {
											self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
										}
									}
									catch (err) {
										self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
									}
								}
							});

						}
					},
					{
						name: "delete",
						type: "button",
						buttonClass: "btn-danger btn-sm",
						label: "TRANSLATE:DELETE",
						visible: function () {
							return this.getApp().getRouter().getParam("id") !== null;
						},
						command: function () {
							var self = this;
							self.model.destroy({
								success: function (model, response) {
									self.getApp().notify('Xoá dữ liệu thành công');
									self.getApp().getRouter().navigate("baocaodonvi_cungung/collection");
								},
								error: function (xhr, status, error) {
									try {
										if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
											self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
											self.getApp().getRouter().navigate("login");
										} else {
											self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
										}
									}
									catch (err) {
										self.getApp().notify({ message: "Xóa dữ liệu không thành công" }, { type: "danger", delay: 1000 });
									}
								}
							});
						}
					},
				],
			}],
		uiControl: {
			fields: [
				{
					field: "date",
					uicontrol: "datetimepicker",
					textFormat: "DD/MM/YYYY",
					extraFormats: ["DDMMYYYY"],
					parseInputDate: function (val) {
						return moment.unix(val)
					},
					parseOutputDate: function (date) {
						return date.unix()
					}
				},
			]
		},
		initialize: function () {
			var self = this;
			self.listItemView = [];
			self.listItemRemove = [];
		},
		render: function () {
			var self = this;
			self.$el.find('#organization').val(gonrinApp().currentUser.Organization.name)
			self.model.set('date', moment().unix());
			var id = this.getApp().getRouter().getParam("id");
			self.clickOrKeyupSeachItem();
			self.outClick();
			
			if (id) {
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.showDetail();
						self.listRemove();
						self.sellOrSponsorOnchange();
					},
					error: function (xhr, status, error) {
						try {
							if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
								self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
								self.getApp().getRouter().navigate("login");
							} else {
								self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
							}
						}
						catch (err) {
							self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
						}
					}
				});
			} else {
				self.applyBindings();
				var currentUser = gonrinApp().currentUser;
				self.model.set("organization", currentUser.Organization);
				self.sellOrSponsorOnchange();
			}

		},
		clickOrKeyupSeachItem: function () { // click vào ô tìm kiếm hay là keyup ô tìm kiếm
			var self = this;
			self.$el.find('#search-item').unbind('click').bind('click', function () {
				var text = $(this).val()
				var selectedList = [];
				self.listItemView.forEach(function (item, index) {
					var dem = 0;
					self.listItemView.forEach(function (item2, index2) {
						if(item.model.get('medical_supplies_id') == item2.model.get('medical_supplies_id') ){
							dem++;
						}
					})
					if(dem > 1){
						if(selectedList.indexOf(item.model.get('medical_supplies_id')) == -1){
							selectedList.push(item.model.get('medical_supplies_id'))
						}
					}
				})
				self.loadItemDropdown(text, selectedList)
			})

			self.$el.find('#search-item').keyup(function name() {
				var selectedList = [];
				self.listItemView.forEach(function (item, index) {
					var dem = 0;
					self.listItemView.forEach(function (item2, index2) {
						if(item.model.get('medical_supplies_id') == item2.model.get('medical_supplies_id') ){
							dem++;
						}
					})
					if(dem > 1){
						if(selectedList.indexOf(item.model.get('medical_supplies_id')) == -1){
							selectedList.push(item.model.get('medical_supplies_id'))
						}
					}
				})
				var text = $(this).val()
				self.$el.find('.search-show-dropdown .dropdown-item').remove();
				self.loadItemDropdown(text, selectedList)
			})
		},
		loadItemDropdown: function (text, selectedList) { // Đổ danh sách Item vào ô tìm kiếm
			var self = this;
			$.ajax({
				type: "POST",
				url: self.getApp().serviceURL + "/api/v1/seach_medical_supplies_supply_organization",
				data: JSON.stringify({ "text": text, "selectedList": selectedList }),
				success: function (response) {
					self.$el.find('.search-show-dropdown .dropdown-item').remove();
					var count = response.length
					response.forEach(function (item, index) {
						self.$el.find('.search-show-dropdown').append(`
						<button medical-supplies = '${JSON.stringify(item)}' class="dropdown-item" style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;font-size:13px">${item.name}</button>
						`)
					})
					if (count == 0) {
						self.$el.find('.search-show-dropdown').hide()
					}
					if (count == 1) {
						self.$el.find('.search-show-dropdown').css("height", "45px")
						self.$el.find('.search-show-dropdown').show()
					}
					if (count == 2) {
						self.$el.find('.search-show-dropdown').css("height", "80px")
						self.$el.find('.search-show-dropdown').show()
					}
					if (count == 3) {
						self.$el.find('.search-show-dropdown').css("height", "110px")
						self.$el.find('.search-show-dropdown').show()
					}
					if (count == 4) {
						self.$el.find('.search-show-dropdown').css("height", "130px")
						self.$el.find('.search-show-dropdown').show()
					}
					if (count > 4) {
						self.$el.find('.search-show-dropdown').css("height", "160px")
						self.$el.find('.search-show-dropdown').show()
					}
					self.chooseItemInListDropdownItem();

				}
			});
		},
		chooseItemInListDropdownItem: function () {// chọn giá trị tìm kiếm
			var self = this;
			self.$el.find('.search-show-dropdown .dropdown-item').unbind('click').bind('click', function () {
				var stt = self.$el.find('.stt').length;
				var medicalSupplies = JSON.parse($(this).attr('medical-supplies'))
				var uid = gonrin.uuid()
				var view = new itemView({ 'id': uid })
				view.render();
				$(view.el).hide().appendTo(self.$el.find('#list-item')).fadeIn();
				self.listItemView.push(view)
				view.$el.find('.stt').val(stt+1)
				view.$el.find('.medical-supplies-name').val(medicalSupplies.name)

				var heightMax = view.$el.find('.medical-supplies-name')[0].scrollHeight
				if (heightMax < view.$el.find('.health-facilities-id')[0].scrollHeight) {
					heightMax = view.$el.find('.health-facilities-id')[0].scrollHeight
				}

				view.$el.find('.medical-supplies-name')[0].style.height = heightMax + "px"
				view.$el.find('.health-facilities-id')[0].style.height = heightMax + "px"
				view.$el.find('.stt,.unit,.supply-ability,.type-sell-sponsor,.quantity,.price,.upload-file,.file,.tailieu').css('height', heightMax + "px")
				view.$el.find('.unit').val(medicalSupplies.unit)
				view.$el.find('.fa-trash').attr('remove-id-new', uid)

				view.model.set('medical_supplies_id', medicalSupplies.id)
				view.model.set('organization_id', gonrinApp().currentUser.Organization.id)
				self.$el.find('.search-show-dropdown').hide()

				self.$el.find('[remove-id-new]').unbind('click').bind('click', function () {
					self.listItemView.forEach((element, index) => {
						if (element.id == $(this).attr('remove-id-new')) {
							self.listItemView.splice(index, 1)
							element.remove(true);
							return
						}
					})
					self.$el.find('.stt').each(function (index, item) {
						$(item).val(index + 1)
					})
				})
				self.sellOrSponsor(medicalSupplies.id);

			})

		},
		showDetail: function () {// chọn giá trị tìm kiếm
			var self = this;
			var arr = lodash.orderBy(self.model.get('details'), ['created_at'], ['asc']);
			arr.forEach((element, index) => {
				var view = new itemView({ 'id': element.id })
				view.render();
				$(view.el).hide().appendTo(self.$el.find('#list-item')).fadeIn();
				view.model.set(element)
				self.listItemView.push(view)
				view.$el.find('.stt').val(index + 1)
				view.$el.find('.medical-supplies-name').val(element.medical_supplies_name)
				view.$el.find('.unit').val(element.medical_supplies_unit)
				view.$el.find('.supply-ability').attr('supply-ability', element.supply_ability)
				view.$el.find('.quantity').attr('quantity', element.quantity)
				view.$el.find('.price').attr('price', element.price)
				view.$el.find('.health-facilities-id').val(element.health_facilities_name)
				view.$el.find('.fa-trash').attr('remove-id-old', element.id)

				if (element.file != null) {
					view.$el.find('.file').attr('href', element.file)
					view.$el.find('.fa-eye').addClass('text-primary')
				}
				if (element.type_sell_sponsor == "sell") {
					view.$el.find('.dropdown-type-sell-sponsor button').text('Bán')
				}
				if (element.type_sell_sponsor == "sponsor") {
					view.$el.find('.dropdown-type-sell-sponsor button').text('Tài trợ')
				}

				var supplyAbilityValueString = new Number(element.supply_ability).toLocaleString("da-DK");
				var quantityValueString = new Number(element.quantity).toLocaleString("da-DK");
				var priceValueString = new Number(element.price).toLocaleString("da-DK");

				view.$el.find('.supply-ability').val(supplyAbilityValueString)
				view.$el.find('.quantity').val(quantityValueString)
				view.$el.find('.price').val(priceValueString)

				var heightMax = view.$el.find('.medical-supplies-name')[0].scrollHeight
				if (heightMax < view.$el.find('.health-facilities-id')[0].scrollHeight) {
					heightMax = view.$el.find('.health-facilities-id')[0].scrollHeight
				}

				view.$el.find('.medical-supplies-name')[0].style.height = heightMax + "px"
				view.$el.find('.health-facilities-id')[0].style.height = heightMax + "px"
				view.$el.find('.stt,.unit,.supply-ability,.type-sell-sponsor,.quantity,.price,.upload-file,.file,.tailieu').css('height', heightMax + "px")
			})
		},
		listRemove: function () {
			var self = this;
			self.$el.find('[remove-id-old]').unbind('click').bind('click', function () {
				self.$el.find('[id="' + $(this).attr('remove-id-old') + '"]').remove();
				self.listItemRemove.push($(this).attr('remove-id-old'))
				self.$el.find('.stt').each(function (index, item) {
					$(item).val(index + 1)
				})
			})
		},
		outClick: function () {
			var self = this;
			self.$el.find('.out-click').unbind('click').bind('click', function (e) {
				if ($(e.target).attr('seach-donvi-giaomua-out') == undefined) {
					self.$el.find('.seach-donvi-giaomua').hide()
				}
				if ($(e.target).attr('seach-medical_supplies-out') == undefined) {
					self.$el.find('.search-show-dropdown').hide()
				}
			})
		},
		sellOrSponsor: function (medicalSupplies_id) {
			var self = this;
			for (var i = 0; i < self.listItemView.length - 1; i++) {
				if (self.listItemView[i].model.get('medical_supplies_id') == medicalSupplies_id) {
					if (self.listItemView[i].model.get('type_sell_sponsor') == "sponsor") {
						self.listItemView[self.listItemView.length - 1].model.set('type_sell_sponsor', 'sell')
						self.listItemView[self.listItemView.length - 1].$el.find('.dropdown-type-sell-sponsor button').text('Bán')
					}
					else {
						self.listItemView[self.listItemView.length - 1].model.set('type_sell_sponsor', 'sponsor')
						self.listItemView[self.listItemView.length - 1].$el.find('.dropdown-type-sell-sponsor button').text('Tài trợ')
					}
				}
			}
			self.sellOrSponsorOnchange();
		},
		sellOrSponsorOnchange: function(){
			var self = this;
			self.listItemView.forEach((element,index)=> {
				element.model.on("change:type_sell_sponsor",function(){
					self.listItemView.forEach((item,idx)=> {
						if(index != idx && element.model.get('medical_supplies_id') == item.model.get('medical_supplies_id') && element.model.get('type_sell_sponsor') == "sell"){
							item.model.set('type_sell_sponsor', 'sponsor')
							item.$el.find('.dropdown-type-sell-sponsor button').text('Tài trợ')
						}
						if(index != idx && element.model.get('medical_supplies_id') == item.model.get('medical_supplies_id') && element.model.get('type_sell_sponsor') == "sponsor"){
							item.model.set('type_sell_sponsor', 'sell')
							item.$el.find('.dropdown-type-sell-sponsor button').text('Bán')
						}
					})

				})
			})
			
		}
	});

});