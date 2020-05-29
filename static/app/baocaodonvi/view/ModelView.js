define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/baocaodonvi/tpl/model.html'),
		schema = require('json!schema/ReportOrganizationSchema.json');
	var OrganizationView = require('app/donvicungung/view/SelectView');

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "report_organization",
		bindings: "data-bind",
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
									self.createItem(respose.id)
									self.updateItem();
									self.deleteItem();
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
					field: "organization",
					uicontrol: "ref",
					textField: "name",
					foreignRemoteField: "id",
					foreignField: "organization_id",
					dataSource: OrganizationView
				},
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
		render: function () {
			var self = this;
			var id = this.getApp().getRouter().getParam("id");
			console.log(moment(moment().unix()).format('DD MM YYYY'))
			self.model.set('date',moment().unix())
			if (id) {
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						self.applyBindings();
						self.loadItemDropdown();
						self.showDetail();
						self.listItemsOldRemove();
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
				self.loadItemDropdown();
				var currentUser = gonrinApp().currentUser;
				self.model.set("organization", currentUser.Organization);
				// self.$el.find("#organization").prop("")

			}

		},
		// CHỨC NĂNG CHỌN ITEM.
		chooseItemInListDropdownItem: function () {
			var self = this;
			self.$el.find('.dropdown-item').unbind('click').bind('click', function () {
				var stt = self.$el.find('[col-type="STT"]').length + 1;
				var dropdownItemClick = $(this);
				var beginNetAmount = new Number(dropdownItemClick.attr('begin_net_amount')).toLocaleString("da-DK");

				var itemID = dropdownItemClick.attr('item-id')
				self.$el.find('#list-item').before(`
                <div style="width: 1000px;height: 50px;" selected-item-id = "${itemID}" class = "selected-item-new selected-item-general" 
                item_id = "${dropdownItemClick.attr('item-id')}" item-id = "${dropdownItemClick.attr('item-id')}">
                    <div style="width: 28px; display: inline-block;text-align: center;padding: 1px;">
                        <input selected-item-id = "${itemID}" col-type="STT" class="form-control text-center p-1" value="${stt}" style="font-size:14px">
                    </div>
                    <div style="width: 248px;display: inline-block;padding: 1px;">
                        <input selected-item-id = "${itemID}" col-type="NAME" class="form-control p-1" value="${dropdownItemClick.attr('title')}" readonly style="font-size:14px">
					</div>
					<div style="width: 148px;display: inline-block;text-align: center;padding: 1px;">
                        <input selected-item-id = "${itemID}"  class="form-control text-center p-1" readonly value="${dropdownItemClick.attr('unit')}" style="font-size:14px">
					</div>
					<div style="width: 106px;display: inline-block;text-align: center;padding: 1px;">
                        <input selected-item-id = "${itemID}" col-type="BEGIN_NET_AMOUNT"  readonly begin_net_amount="${dropdownItemClick.attr('begin_net_amount')}" class="form-control text-center p-1" value="${beginNetAmount}" style="font-size:14px">
                    </div>
                    <div style="width: 106px;display: inline-block;text-align: center;padding: 1px;">
                        <input selected-item-id = "${itemID}" col-type="QUANTITY_IMPORT" type="number" quantity_import="0" class="form-control text-center p-1" value="0" style="font-size:14px">
                    </div>
                    <div style="width: 106px; display: inline-block; text-align:center;padding: 1px;">
                        <input selected-item-id = "${itemID}" col-type="QUANTITY_EXPORT" type="number" quantity_export="0" class="form-control text-center p-1" value = "0" style="font-size:14px">
                    </div>
                    <div style="width: 106px;display: inline-block;text-align: center;padding: 1px;">
                        <input selected-item-id = "${itemID}" col-type="END_NET_AMOUNT"  end_net_amount = "0" value="0" class="form-control text-center p-1" readonly style="font-size:14px">
					</div>
					<div style="width: 106px;display: inline-block;text-align: center;padding: 1px;">
                        <input selected-item-id = "${itemID}" col-type="ESTIMATES_NET_AMOUNT" type="number" estimates_net_amount="0" value="0" class="form-control text-center p-1"  style="font-size:14px">
                    </div>
                    <div style="width: 14px;display: inline-block;text-align: center;padding: 1px;">
                            <i selected-item-id = "${itemID}" class="fa fa-trash" style="font-size: 17px"></i>
                        </div>
                </div>
                `)
				self.$el.find('.dropdown-menu-item').hide()
				self.$el.find('.search-item').val('')
				self.clickImportExport();
				self.$el.find('.selected-item-new div .fa-trash').unbind('click').bind('click', function () {
					self.$el.find('.selected-item-new[selected-item-id="' + $(this).attr('selected-item-id') + '"]').remove();
				})
			})

		},
		clickImportExport: function () {
			var self = this;
			self.$el.find('selected-item')
			//Out Click QUANTITY_IMPORT
			self.$el.find('[col-type="QUANTITY_IMPORT"]').unbind('click').bind('click', function () {
				var pointerOutQuantityImport = $(this);
				pointerOutQuantityImport.val(pointerOutQuantityImport.attr("quantity_import"))
			})
			self.$el.find('[col-type="QUANTITY_IMPORT"]').focusout(function () {
				var pointerOutQuantityImport = $(this);
				var pointerOutQuantityImportValue = pointerOutQuantityImport.val();
				var pointerOutQuantityImportValueString = new Number(pointerOutQuantityImportValue).toLocaleString("da-DK");

				if (pointerOutQuantityImportValue == null || pointerOutQuantityImportValue == '') {
					pointerOutQuantityImport.val(0);
				}
				else {
					pointerOutQuantityImport.attr("quantity_import", pointerOutQuantityImportValue)
					pointerOutQuantityImport.val(pointerOutQuantityImportValueString)
				}

				var selectedItemId = pointerOutQuantityImport.attr('selected-item-id');
				var pointerOutQuantityBeginNetAmount = self.$el.find('[col-type="BEGIN_NET_AMOUNT"][selected-item-id = ' + selectedItemId + ']').attr('begin_net_amount');

				var pointerOutQuantityExport = self.$el.find('[col-type="QUANTITY_EXPORT"][selected-item-id = ' + selectedItemId + ']').attr('quantity_export');

				var resultNetAmount = Number(pointerOutQuantityBeginNetAmount) + Number(pointerOutQuantityImport.attr('quantity_import')) - Number(pointerOutQuantityExport);
				var resultNetAmountString = new Number(resultNetAmount).toLocaleString("da-DK");

				self.$el.find('[col-type="END_NET_AMOUNT"][selected-item-id = ' + selectedItemId + ']').val(resultNetAmountString);
			});
			//Out Click QUANTITY_EXPORT
			self.$el.find('[col-type="QUANTITY_EXPORT"]').unbind('click').bind('click', function () {
				var pointerOutQuantityExport = $(this);
				pointerOutQuantityExport.val(pointerOutQuantityExport.attr("quantity_export"))
			})
			self.$el.find('[col-type="QUANTITY_EXPORT"]').focusout(function () {
				var pointerOutQuantityExport = $(this);
				var pointerOutQuantityExportValue = pointerOutQuantityExport.val();
				var pointerOutQuantityExportValueString = new Number(pointerOutQuantityExportValue).toLocaleString("da-DK");

				if (pointerOutQuantityExportValue == null || pointerOutQuantityExportValue == '') {
					pointerOutQuantityExport.val(0);
				}
				else {
					pointerOutQuantityExport.attr("quantity_export", pointerOutQuantityExportValue)
					pointerOutQuantityExport.val(pointerOutQuantityExportValueString)
				}

				var selectedItemId = pointerOutQuantityExport.attr('selected-item-id');
				var pointerOutQuantityBeginNetAmount = self.$el.find('[col-type="BEGIN_NET_AMOUNT"][selected-item-id = ' + selectedItemId + ']').attr('begin_net_amount');
				var pointerOutQuantityImport = self.$el.find('[col-type="QUANTITY_IMPORT"][selected-item-id = ' + selectedItemId + ']').attr('quantity_import');
				var resultNetAmount = Number(pointerOutQuantityBeginNetAmount) + Number(pointerOutQuantityImport) - Number(pointerOutQuantityExport.attr('quantity_export'))

				var resultNetAmountString = new Number(resultNetAmount).toLocaleString("da-DK");
				self.$el.find('[col-type="END_NET_AMOUNT"][selected-item-id = ' + selectedItemId + ']').val(resultNetAmountString);
			});

			//Out Click QUANTITY_EXPORT
			self.$el.find('[col-type="ESTIMATES_NET_AMOUNT"]').unbind('click').bind('click', function () {
				var pointerOutEstimatesNetAmount = $(this);
				pointerOutEstimatesNetAmount.val(pointerOutEstimatesNetAmount.attr("estimates_net_amount"))
			})
			self.$el.find('[col-type="ESTIMATES_NET_AMOUNT"]').focusout(function () {
				var pointerOutEstimatesNetAmount = $(this);
				var pointerOutEstimatesNetAmountValue = pointerOutEstimatesNetAmount.val();
				var pointerOutEstimatesNetAmountValueString = new Number(pointerOutEstimatesNetAmountValue).toLocaleString("da-DK");

				if (pointerOutEstimatesNetAmountValue == null || pointerOutEstimatesNetAmountValue == '') {
					pointerOutEstimatesNetAmount.val(0);
				}
				else {
					pointerOutEstimatesNetAmount.attr("estimates_net_amount", pointerOutEstimatesNetAmountValue)
					pointerOutEstimatesNetAmount.val(pointerOutEstimatesNetAmountValueString)
				}
			});
		},
		loadItemDropdown: function () { // Đổ danh sách Item vào ô tìm kiếm
			var self = this;
			self.$el.find('.search-item').unbind('click').bind('click', function () {
				var text = $(this).val()
				var selectedList = [];
				self.$el.find('.selected-item-general').each(function (index, item) {
					selectedList.push($(item).attr('item_id'))
				})
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/load_item_dropdown",
					data: JSON.stringify({ "text": text, "date": self.model.get('date'), "organization_id": self.model.get('organization_id'), "selectedList": selectedList }),
					success: function (response) {
						self.$el.find('.dropdown-item').remove();
						var count = response.length

						response.forEach(function (item, index) {
							self.$el.find('.dropdown-menu-item').append(`
                            <button
                            item-id = "${item.id}" 
							title="${item.name}"
							unit="${item.unit}"
							begin_net_amount="${item.begin_net_amount}"
                            class="dropdown-item" style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;font-size:13px">${item.name}</button>
                            `)
						})
						if (count == 0) {
							self.$el.find('.dropdown-menu-item').hide()
						}
						if (count == 1) {
							self.$el.find('.dropdown-menu-item').css("height", "45px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count == 2) {
							self.$el.find('.dropdown-menu-item').css("height", "80px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count == 3) {
							self.$el.find('.dropdown-menu-item').css("height", "110px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count == 4) {
							self.$el.find('.dropdown-menu-item').css("height", "130px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count > 4) {
							self.$el.find('.dropdown-menu-item').css("height", "160px")
							self.$el.find('.dropdown-menu-item').show()
						}
						self.chooseItemInListDropdownItem();

					}
				});
			})
			self.$el.find('.search-item').keyup(function name() {

				var selectedList = [];
				self.$el.find('.selected-item-general').each(function (index, item) {
					selectedList.push($(item).attr('item_id'))
				})
				var text = $(this).val()
				self.$el.find('.dropdown-item').remove();
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/load_item_dropdown",
					data: JSON.stringify({ "text": text, "date": self.model.get('date'), "organization_id": self.model.get('organization_id'), "selectedList": selectedList }),
					success: function (response) {
						self.$el.find('.dropdown-item').remove();
						var count = response.length
						

						response.forEach(function (item, index) {
							self.$el.find('.dropdown-menu-item').append(`
                            <button
                            item-id = "${item.id}" 
							title="${item.name}"
							unit="${item.unit}"
							begin_net_amount="${item.begin_net_amount}"
                            class="dropdown-item" style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;font-size:13px">${item.name}</button>
                            `)
						})
						if (count == 0) {
							self.$el.find('.dropdown-menu-item').hide()
						}
						if (count == 1) {
							self.$el.find('.dropdown-menu-item').css("height", "45px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count == 2) {
							self.$el.find('.dropdown-menu-item').css("height", "80px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count == 3) {
							self.$el.find('.dropdown-menu-item').css("height", "110px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count == 4) {
							self.$el.find('.dropdown-menu-item').css("height", "130px")
							self.$el.find('.dropdown-menu-item').show()
						}
						if (count > 4) {
							self.$el.find('.dropdown-menu-item').css("height", "160px")
							self.$el.find('.dropdown-menu-item').show()
						}
						self.chooseItemInListDropdownItem();

					}
				});
			})
			self.$el.find('.out-click').bind('click', function () {
				self.$el.find('.dropdown-menu-item').hide()
			})

		},
		showDetail: function () {
			var self = this;
			if (self.model.get('details').length > 0) {
				self.model.get('details').forEach(function (item, index) {
					var quantityImportToLocaleString = new Number(item.quantity_import).toLocaleString("da-DK");
					var quantityExportToLocaleString = new Number(item.quantity_export).toLocaleString("da-DK");
					var beginNetAmountToLocaleString = new Number(item.begin_net_amount).toLocaleString("da-DK");
					var estimatesNetAmountToLocaleString = new Number(item.estimates_net_amount).toLocaleString("da-DK");
					var endNetAmountToLocaleString = new Number(item.begin_net_amount + item.quantity_import - item.quantity_export).toLocaleString("da-DK");

					var netAmountToLocaleString = new Number(item.quantity_import - item.quantity_export).toLocaleString("da-DK");

					self.$el.find('#list-item').before(`
                    <div style="width: 1000px;height: 50px;" selected-item-id = "${item.id}" class = "selected-item-old selected-item-general" item_id = ${item.medical_supplies_id} >
                        <div style="width: 28px; display: inline-block;text-align: center;padding: 1px;">
                            <input selected-item-id = "${item.id}" col-type="STT" class="form-control text-center p-1" value="${index + 1}" style="font-size:14px">
                        </div>
                        <div style="width: 248px;display: inline-block;padding: 1px;">
                            <input selected-item-id = "${item.id}" col-type="NAME" class="form-control p-1" value="${item.medical_supplies_name}" readonly style="font-size:14px">
						</div>
						<div style="width: 148px;display: inline-block;text-align: center;padding: 1px;">
							<input selected-item-id = "${item.id}"  class="form-control text-center p-1" readonly value="${item.medical_supplies_unit}" style="font-size:14px">
						</div>
						<div style="width: 106px;display: inline-block;text-align: center;padding: 1px;">
                            <input selected-item-id = "${item.id}" col-type="BEGIN_NET_AMOUNT" class="form-control text-center p-1" begin_net_amount="${item.begin_net_amount}" value="${beginNetAmountToLocaleString}" readonly style="font-size:14px">
                        </div>
                        <div style="width: 106px;display: inline-block;text-align: center;padding: 1px;">
                            <input selected-item-id = "${item.id}" col-type="QUANTITY_IMPORT" type="number" class="form-control text-center p-1" quantity_import="${item.quantity_import}" value="${quantityImportToLocaleString}" style="font-size:14px">
                        </div>
                        <div style="width: 106px; display: inline-block; text-align:center;padding: 1px;">
                            <input selected-item-id = "${item.id}" col-type="QUANTITY_EXPORT" type="number" class="form-control text-center p-1" quantity_export="${item.quantity_export}" value = "${quantityExportToLocaleString}" style="font-size:14px">
                        </div>
                        <div style="width: 106px;display: inline-block;text-align: center;padding: 1px;">
                            <input selected-item-id = "${item.id}" col-type="END_NET_AMOUNT" class="form-control text-center p-1" value="${endNetAmountToLocaleString}" end_net_amount="${item.begin_net_amount + item.quantity_import - item.quantity_export}" readonly style="font-size:14px">
						</div>
						<div style="width: 106px;display: inline-block;text-align: center;padding: 1px;">
                            <input selected-item-id = "${item.id}" col-type="ESTIMATES_NET_AMOUNT" class="form-control text-center p-1" estimates_net_amount = "0" value="${estimatesNetAmountToLocaleString}"  style="font-size:14px">
						</div>
                        <div style="width: 14px;display: inline-block;text-align: center;padding: 1px;">
                            <i selected-item-id = "${item.id}" class="fa fa-trash" style="font-size: 17px"></i>
                        </div>
                    </div>
                    `)
				})
				self.clickImportExport();

			}


		},
		createItem: function (report_organization_id) {
			var self = this;
			var arr = [];
			self.$el.find('.selected-item-new').each(function (index, item) {
				var obj = {
					"report_organization_id": report_organization_id,
					"organization_id": self.model.get('organization_id'),
					"medical_supplies_id": $(item).attr('item-id'),
					// "begin_net_amount": $(item).find('[col-type="BEGIN_NET_AMOUNT"]').attr('begin_net_amount'),
					"quantity_export": $(item).find('[col-type="QUANTITY_EXPORT"]').attr('quantity_export'),
					"quantity_import": $(item).find('[col-type="QUANTITY_IMPORT"]').attr('quantity_import'),
					// "end_net_amount": $(item).find('[col-type="END_NET_AMOUNT"]').attr('end_net_amount'),
					"estimates_net_amount": $(item).find('[col-type="ESTIMATES_NET_AMOUNT"]').attr('estimates_net_amount'),
					"date": self.model.get('date')
				}
				arr.push(obj)
			})
			if (arr.length > 0) {
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/create_report_organization_detail",
					data: JSON.stringify(arr),
					success: function (response) {
						console.log(response)
					}
				});
			}

		},
		updateItem: function () {
			var self = this;
			var arr = [];
			self.$el.find('.selected-item-old').each(function (index, item) {
				var obj = {
					"id": $(item).attr('selected-item-id'),
					"organization_id": self.model.get('organization_id'),
					"quantity_export": $(item).find('[col-type="QUANTITY_EXPORT"]').attr('quantity_export'),
					"quantity_import": $(item).find('[col-type="QUANTITY_IMPORT"]').attr('quantity_import'),
					"estimates_net_amount": $(item).find('[col-type="ESTIMATES_NET_AMOUNT"]').attr('estimates_net_amount'),
					"date": self.model.get('date')
				}
				arr.push(obj)
			})
			if (arr.length > 0) {
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/update_report_organization_detail",
					data: JSON.stringify(arr),
					success: function (response) {
						console.log(response)
					}
				});
			}
		},
		listItemsOldRemove: function () {
			var self = this;
			self.$el.find('.selected-item-old div .fa-trash').unbind('click').bind('click', function () {
				self.$el.find('.selected-item-old[selected-item-id="' + $(this).attr('selected-item-id') + '"]').remove();
				self.listItemRemove.push($(this).attr('selected-item-id'))
			})
		},
		deleteItem: function () {
			var self = this;
			var arrayItemRemove = self.listItemRemove.length;
			if (arrayItemRemove > 0) {
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/delete_report_organization_detail",
					data: JSON.stringify(self.listItemRemove),
					success: function (response) {
						self.listItemRemove.splice(0, arrayItemRemove);
						console.log(response)
					}
				});
			}
		},


		// HẾT CHỨC NĂNG CHỌN ITEM XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
		// XXXXXXXXXXXXXXXXXXXXXXXXXXXX
	});

});