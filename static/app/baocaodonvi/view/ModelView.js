define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/baocaodonvi/tpl/model.html'),
		schema = require('json!schema/ReportOrganizationSchema.json');
	var itemView = require('app/baocaodonvi/view/itemView');

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "report_organization",
		bindings: "data-bind",
		listItemView: [],
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
										item.model.set('date', self.model.get('date'))
										if (item.model.get('report_organization_id') == null){
											item.model.set('report_organization_id', respose.id)
										}
										item.model.save(null, {
											success: function (model, respose, options) {
											},
											error: function (xhr, status, error) {
												// HANDLE ERROR
											}
										});
									})
									self.getApp().getRouter().navigate("/baocaodonvi/collection");

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
									self.getApp().getRouter().navigate("/baocaodonvi/collection");
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
            self.listItemView = [];
        },
		render: function () {
			var self = this;
			self.$el.find('#organization').val(gonrinApp().currentUser.Organization.name)
			var id = this.getApp().getRouter().getParam("id");
			self.model.set('date', moment().unix());
			self.changeTime();

			if (id) {
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.showDeltail();
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
				self.showlistMedicalSupplies();
			}

		},
		showlistMedicalSupplies: function () {
			var self = this;
			$.ajax({
				url: self.getApp().serviceURL + "/api/v1/get_all_medical_supplies_and_date_init",
				method: "POST",
				data:JSON.stringify({"organization_id":gonrinApp().currentUser.Organization.id,"date":self.model.get('date')}),
				contentType: "application/json",
				success: function (data) {
					self.listItemView = [];
					var arr = lodash.orderBy(data.medicalSupplies, ['name'], ['asc']);
					arr.forEach((element, index) => {
						var view = new itemView()
						view.render();
						$(view.el).hide().appendTo(self.$el.find('#list-item')).fadeIn();
						view.model.set('medical_supplies_id', element.id)
						view.model.set('organization_id', gonrinApp().currentUser.Organization.id)
						self.listItemView.push(view)
						if (data.date_init == null || data.date_init == self.model.get('date')){
							view.$el.find('.begin-net-amount').removeAttr('readonly')
						}
						view.$el.find('.begin-net-amount').attr('begin-net-amount',element.begin_net_amount)
						var beginNetAmountValueString = new Number(element.begin_net_amount).toLocaleString("da-DK");
						view.$el.find('.begin-net-amount').val(beginNetAmountValueString)

						view.$el.find('.stt').val(index + 1)
						view.$el.find('.medical-supplies-name').val(element.name)
						view.$el.find('.begin-net-amount').val(element.begin_net_amount)
						view.$el.find('.end-net-amount').val(element.begin_net_amount)

						view.$el.find('.unit').val(element.unit)
						view.$el.find('.medical-supplies-name')[0].style.height = view.$el.find('.medical-supplies-name')[0].scrollHeight + "px"
						view.$el.find('.stt,.unit,.begin-net-amount,.quantity-import,.quantity-export,.end-net-amount,.estimates-net-amount').css('height', view.$el.find('.medical-supplies-name')[0].scrollHeight + "px")
					})
				}
			})
		},
		showDeltail: function () {
			var self = this;
			self.listItemView = [];
			var arr = lodash.orderBy(self.model.get('details'), ['medical_supplies_name'], ['asc']);
			arr.forEach((element, index) => {
				var view = new itemView()
				view.render();
				$(view.el).hide().appendTo(self.$el.find('#list-item')).fadeIn();
				view.model.set(element)
				self.listItemView.push(view)
				if (self.model.get('date_init') == null || element.date == self.model.get('date_init')){
					view.$el.find('.begin-net-amount').removeAttr('readonly')
				}
				view.$el.find('.stt').val(index + 1)
				view.$el.find('.medical-supplies-name').val(element.medical_supplies_name)
				view.$el.find('.unit').val(element.medical_supplies_unit)

				view.$el.find('.begin-net-amount').attr('begin-net-amount',element.begin_net_amount)
				view.$el.find('.quantity-import').attr('quantity-import',element.quantity_import)
				view.$el.find('.quantity-export').attr('quantity-export',element.quantity_export)
				view.$el.find('.end-net-amount').attr('end-net-amount',element.end_net_amount)
				view.$el.find('.estimates-net-amount').attr('estimates-net-amount',element.estimates_net_amount)

				var beginNetAmountValueString = new Number(element.begin_net_amount).toLocaleString("da-DK");
				var quantityImportValueString = new Number(element.quantity_import).toLocaleString("da-DK");
				var quantityExportValueString = new Number(element.quantity_export).toLocaleString("da-DK");
				var endNetAmountValueString = new Number(element.end_net_amount).toLocaleString("da-DK");
				var estimatesNetAmountValueString = new Number(element.estimates_net_amount).toLocaleString("da-DK");

				view.$el.find('.begin-net-amount').val(beginNetAmountValueString)
				view.$el.find('.quantity-import').val(quantityImportValueString)
				view.$el.find('.quantity-export').val(quantityExportValueString)
				view.$el.find('.end-net-amount').val(endNetAmountValueString)
				view.$el.find('.estimates-net-amount').val(estimatesNetAmountValueString)

				view.$el.find('.medical-supplies-name')[0].style.height = view.$el.find('.medical-supplies-name')[0].scrollHeight + "px"
				view.$el.find('.stt,.unit,.begin-net-amount,.quantity-import,.quantity-export,.end-net-amount,.estimates-net-amount').css('height', view.$el.find('.medical-supplies-name')[0].scrollHeight + "px")
				delete element.medical_supplies_unit
				delete element.medical_supplies_name
			})
		},
		changeTime : function(){
			var self = this;
			// self.$el.find('#day-create').on('change.gonrin', function(e){
			// 	console.log(self.$el.find('#day-create').data('gonrin').getValue());
			// });
			self.model.on('change:date',function(){
				self.$el.find('.begin-net-amount').each((index,element,)=>{
					console.log($(element).attr('begin-net-amount'))
				})
			})
		}
	});

});