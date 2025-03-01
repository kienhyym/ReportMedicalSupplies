define(function (require) {
	"use strict";
	var $ = require('jquery'),
		_ = require('underscore'),
		Gonrin = require('gonrin');

	var template = require('text!app/tonghopxuatkhovattu/tpl/model.html'),
		schema = require('json!schema/SyntheticReleaseSchema.json');

	return Gonrin.ModelView.extend({
		template: template,
		modelSchema: schema,
		urlPrefix: "/api/v1/",
		collectionName: "synthetic_release",
		bindings: "data-bind",
		listItemRemove: [],
		medicalSuppliesId: null,

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
							console.log(self.$el.find('.dropdown-medical-supplies input').attr('item-id'))
							if (self.$el.find('.dropdown-medical-supplies input').attr('item-id') == "null") {
								self.getApp().notify({ message: "Chưa chọn vật tư" }, { type: "danger", delay: 1000 });
							}
							else {
								self.model.save(null, {
									success: function (model, respose, options) {
										self.createItem(respose.id);
										self.updateItem();
										self.deleteItem();
										self.getApp().notify("Lưu thông tin thành công");

										if (self.getApp().getRouter().getParam("id") == null) {
											self.getApp().getRouter().navigate("/tonghopxuatkhovattu/collection");
										}
										else {
											self.getApp().getRouter().refresh();
										}
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
									self.getApp().getRouter().navigate("/tonghopxuatkhovattu/collection");
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
					{
						name: "export-excel",
						type: "button",
						buttonClass: "btn-primary btn-sm",
						label: "Xuất excel",
						command: function () {
							var self = this;
							if (self.medicalSuppliesId != null) {
								$.ajax({
									type: "POST",
									url: self.getApp().serviceURL + "/api/v1/export_SyntheticRelease",
									data: JSON.stringify({ "idx": self.model.get('id'), "vattu_id": self.medicalSuppliesId }),
									success: function (response) {
										window.location = String(self.getApp().serviceURL + response.message);
									}
								});
							}
							else {
								self.getApp().notify({ message: "Bạn chưa chọn vật tư" }, { type: "danger", delay: 1000 });

							}

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
		render: function () {
			var self = this;
			self.listItemRemove = [];
			self.medicalSuppliesId = null;
			var id = this.getApp().getRouter().getParam("id");
			self.model.set('date', moment().unix());
			self.searchItem();
			if (id) {
				this.model.set('id', id);
				this.model.fetch({
					success: function (data) {
						if (self.getApp().hasRole('admin') === true) {
							self.$el.find('[btn-name="save"]').hide()
							self.$el.find('[btn-name="delete"]').hide()
						}


						self.applyBindings();
						// self.showDetail();
						self.$el.find('.chu-y').show()
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
				self.$el.find('[btn-name="export-excel"]').hide()

			}

		},
		searchItem: function () {
			var self = this;
			var listDropDown = [
				{
					"class_name": "dropdown-medical-supplies",
					"url": self.getApp().serviceURL + "/api/v1/load_medical_supplies_dropdown",
					"type": "single"
				},
				{
					"class_name": "dropdown-organization-soyte",
					"url": self.getApp().serviceURL + "/api/v1/load_organization_dropdown_soyte",
					"type": "multiple"
				},
				{
					"class_name": "dropdown-organization-hospital",
					"url": self.getApp().serviceURL + "/api/v1/load_organization_dropdown_hospital",
					"type": "multiple"
				},
				{
					"class_name": "dropdown-organization-other",
					"url": self.getApp().serviceURL + "/api/v1/load_organization_dropdown_other",
					"type": "multiple"
				}

			]
			listDropDown.forEach(function (item, index) {
				self.$el.find('.' + item.class_name + ' input').keyup(function name() {
					self.loadItemDropDown($(this).val(), $(this).attr('class-name'), item.url, item.type)
				})
				self.$el.find('.' + item.class_name + ' input').unbind('click').bind('click', function () {
					if (item.class_name == "dropdown-medical-supplies") {
						if (self.$el.find('.dropdown-medical-supplies input').attr('item-id') != "null") {
							self.$el.find('.dialog-save-info').css('z-index', '999')
							self.$el.find('.dialog-save-info').css('opacity', '999')
							self.$el.find('.conntent').css('opacity', '0.3')
							self.$el.find('.dialog-save').unbind('click').bind('click', function () {
								self.model.save(null, {
									success: function (model, respose, options) {
										self.createItem(respose.id);
										self.updateItem();
										self.deleteItem();
										if (self.model.get('id') == null) {
											self.getApp().getRouter().navigate("/tonghopxuatkhovattu/collection");
										}
										else {
											self.getApp().getRouter().refresh();
										}
										self.$el.find('.dialog-save-info').css('z-index', '0')
										self.$el.find('.dialog-save-info').css('opacity', '0')
										self.$el.find('.conntent').css('opacity', '1')
										self.getApp().notify("Lưu thông tin thành công");

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
							})
							self.$el.find('.dialog-hide').unbind('click').bind('click', function () {
								self.$el.find('.dialog-save-info').css('z-index', '0')
								self.$el.find('.dialog-save-info').css('opacity', '0')
								self.$el.find('.conntent').css('opacity', '1')
								self.getApp().getRouter().refresh();
							})
							self.$el.find('.dialog-out').unbind('click').bind('click', function () {
								self.$el.find('.dialog-save-info').css('z-index', '0')
								self.$el.find('.dialog-save-info').css('opacity', '0')
								self.$el.find('.conntent').css('opacity', '1')
							})

						}
						else {
							self.loadItemDropDown($(this).val(), $(this).attr('class-name'), item.url, item.type)
						}
					}
					else {
						$(this).select();
						self.loadItemDropDown($(this).val(), $(this).attr('class-name'), item.url, item.type)

					}
				})
			})
		},
		loadItemDropDown: function (TEXT, CLASS, URL, TYPE) { // Đổ danh sách Item vào ô tìm kiếm
			var self = this;
			var param = TEXT;
			if (TYPE == "multiple") {
				var danhSachDaSearch = []
				self.$el.find('.data-row-old,.data-row-new').each(function (idnex, item) {
					danhSachDaSearch.push($(item).find('td [attr-type="ORGANIZATION"]').attr('organization-id'))
				})
				param = { "text": TEXT, "danhSachDaSearch": danhSachDaSearch }
			}
			
			$.ajax({
				type: "POST",
				url: URL,
				data: JSON.stringify(param),
				success: function (response) {
					self.$el.find('.' + CLASS + ' div .dropdown-menu .dropdown-item').remove();
					var count = response.length
					response.forEach(function (item, index) {
						var itemSTRING = JSON.stringify(item)
						self.$el.find('.' + CLASS + ' div .dropdown-menu').append(`
						<button item-info = '${itemSTRING}' out-side-${CLASS} class='dropdown-item' style='text-overflow: ellipsis;overflow: hidden;white-space: nowrap;font-size:13px'>${item.name}</button>`)
					})
					if (count == 0) {
						self.$el.find('.' + CLASS + ' div .dropdown-menu').hide()
					}
					if (count == 1) {
						self.$el.find('.' + CLASS + ' div .dropdown-menu').css("height", "45px")
						self.$el.find('.' + CLASS + ' div .dropdown-menu').show()
					}
					if (count == 2) {
						self.$el.find('.' + CLASS + ' div .dropdown-menu').css("height", "80px")
						self.$el.find('.' + CLASS + ' div .dropdown-menu').show()
					}
					if (count == 3) {
						self.$el.find('.' + CLASS + ' div .dropdown-menu').css("height", "110px")
						self.$el.find('.' + CLASS + ' div .dropdown-menu').show()
					}
					if (count == 4) {
						self.$el.find('.' + CLASS + ' div .dropdown-menu').css("height", "130px")
						self.$el.find('.' + CLASS + ' div .dropdown-menu').show()
					}
					if (count > 4) {
						self.$el.find('.' + CLASS + ' div .dropdown-menu').css("height", "160px")
						self.$el.find('.' + CLASS + ' div .dropdown-menu').show()
					}
					if (TYPE == "single") {
						self.chooseItemInListDropdown(CLASS);
					}
					else if (TYPE == "multiple") {
						self.appendItemInListDropdown(CLASS);
					}
				}
			});
		},
		chooseItemInListDropdown: function (CLASS) { //Chọn lẻ 1 item 
			var self = this;
			self.$el.find('.' + CLASS + ' div .dropdown-menu .dropdown-item').unbind('click').bind('click', function () {
				var dropdownItemClick = $(this);
				var itemJSON = JSON.parse(dropdownItemClick.attr('item-info'))
				self.$el.find('.' + CLASS + ' input').val(itemJSON.name);
				self.$el.find('.chu-y').text(itemJSON.name)
				self.$el.find('.chu-y').addClass("text-success")
				self.$el.find('.chu-y').removeClass("text-danger")


				self.$el.find('.' + CLASS + ' input').attr('item-id', itemJSON.id);
				self.medicalSuppliesId = itemJSON.id
				self.$el.find('.' + CLASS + ' div .dropdown-menu').hide();

				if (self.model.get('id') != null) {
					self.showDetail(itemJSON.id);
				}

			})
			self.$el.find('.out-click').unbind('click').bind('click', function (e) {
				if ($(e.target).attr('out-side-' + CLASS) == undefined) {
					self.$el.find('.' + CLASS + ' div .dropdown-menu').hide();
				}
			})

		},
		appendItemInListDropdown: function (CLASS) { //Chọn nhiều item 
			var self = this;
			self.$el.find('.' + CLASS + ' div .dropdown-menu .dropdown-item').unbind('click').bind('click', function () {
				var dropdownItemClick = $(this);
				var stt = self.$el.find('.class-' + CLASS + ' tr').length
				var itemJSON = JSON.parse(dropdownItemClick.attr('item-info'))
				self.$el.find('.class-' + CLASS).append(` 
				<tr id-row = "${itemJSON.id}" class = "data-row-new">
					<td><input id-row = "${itemJSON.id}" attr-type = "STT" value ="${stt}" class="form-control text-center" ></td>
					<td><input id-row = "${itemJSON.id}" attr-type = "ORGANIZATION" organization-id = "${itemJSON.id}" value="${itemJSON.name}" class="form-control" ></td>
					<td><input id-row = "${itemJSON.id}" attr-type = "DATE" id = "date-${itemJSON.id}" class="form-control text-center "></td>
					<td><input id-row = "${itemJSON.id}" attr-type = "QUANTITY" quantity = "0"  class="form-control text-center"></td>
					<td>
						<i id-row = "${itemJSON.id}" class="fa fa-trash" style="font-size: 17px"></i>
					</td>
				</tr>`)
				self.$el.find('#date-' + itemJSON.id).datetimepicker({
					textFormat: 'DD-MM-YYYY',
					extraFormats: ['DDMMYYYY'],
					parseInputDate: function (val) {
						return moment.unix(val)
					},
					parseOutputDate: function (date) {
						return date.unix()
					}
				});

				self.$el.find('.' + CLASS + ' div .dropdown-menu').hide();
				self.clickInput();
				self.$el.find('.data-row-new td .fa-trash').unbind('click').bind('click', function () {
					self.$el.find('.data-row-new[id-row="' + $(this).attr('id-row') + '"]').remove();
				})
			})
			$(document).unbind('click').bind('click', function (e) {
				if ($(e.target).attr('out-side-' + CLASS) == undefined) {
					self.$el.find('.' + CLASS + ' div .dropdown-menu').hide();
				}
			})
		},
		clickInput: function () {
			var self = this;
			// Click vào ô số tự đông thêm dấu chấm
			var listClick = [
				{ "attr_type": "QUANTITY", "attr": "quantity" }
			]
			self.$el.find('[attr-type="QUANTITY"]').keyup(function () {
				var num = $(this).attr("quantity")
				if (Number.isNaN(Number($(this).val())) === true) {
					console.log(String($(this).val()).slice(-1))
					$(this).val(num)
				}
				num = Number($(this).val())
			})
			listClick.forEach(function (item, index) {
				self.$el.find('[attr-type="' + item.attr_type + '"]').unbind('click').bind('click', function () {
					var clickThis = $(this);
					clickThis.val(clickThis.attr(item.attr))
				})
				self.$el.find('[attr-type="' + item.attr_type + '"]').focusout(function () {
					var clickThis = $(this);
					var clickThisValue = clickThis.val();
					if (clickThisValue == null || clickThisValue == '') {
						clickThis.val(0);
					}
					else {
						clickThis.attr(item.attr, clickThisValue)
						setTimeout(() => {
							var clickThisString = new Number(clickThisValue).toLocaleString("da-DK");
							console.log('clickThisString', clickThisString)

							clickThis.val(clickThisString)
						}, 200);
					}
				});
			})
		},
		showDetail: function (medical_supplies_id) {
			var self = this;
			var listClass = ["class-dropdown-organization-soyte", "class-dropdown-organization-hospital", "class-dropdown-organization-other"]
			listClass.forEach(function (item, index) {
				self.$el.find('.' + item + ' .data-row-old').remove()
				self.$el.find('.' + item + ' .data-row-new').remove()
			})

			$.ajax({
				type: "POST",
				url: self.getApp().serviceURL + "/api/v1/get_detail_SyntheticReleaseDetail",
				data: JSON.stringify(self.model.get('id')),
				success: function (response) {
					var responseSort = lodash.orderBy(response, ['created_at'], ['asc']);
					if (response.length > 0) {
						var demSoyte = 0;
						var demHospital = 0;
						var demOther = 0;
						responseSort.forEach(function (item, index) {
							var String_quantity = new Number(item.quantity).toLocaleString("da-DK");
							if (item.tuyendonvi_id == "6" && item.medical_supplies_id == medical_supplies_id) {
								var stt = self.$el.find('.class-dropdown-organization-soyte tr').length
								demSoyte = demSoyte + Number(item.quantity)
								self.$el.find('.class-dropdown-organization-soyte').append(` 
										<tr id-row = "${item.id}" class = "data-row-old" synthetic-release-detail-id = "${item.id}">
											<td><input id-row = "${item.id}" attr-type = "STT" value ="${stt}" class="form-control text-center" ></td>
											<td><input id-row = "${item.id}" attr-type = "ORGANIZATION" organization-id = "${item.organization_id}" value="${item.organization_name}" class="form-control" ></td>
											<td><input id-row = "${item.id}" attr-type = "DATE" id = "date-${item.id}" date-export ="${item.date_export}" class="form-control text-center "></td>
											<td><input id-row = "${item.id}" attr-type = "QUANTITY" quantity = "${item.quantity}" value = "${String_quantity}"  class="form-control text-center"></td>
											<td>
												<i id-row = "${item.id}" class="fa fa-trash" style="font-size: 17px"></i>
											</td>
										</tr>`)
								self.$el.find('#date-' + item.id).datetimepicker({
									textFormat: 'DD-MM-YYYY',
									extraFormats: ['DDMMYYYY'],
									parseInputDate: function (val) {
										return moment.unix(val)
									},
									parseOutputDate: function (date) {
										return date.unix()
									}
								});
								self.$el.find('[id-row = "' + item.id + '"] td .input-group .datetimepicker-input').val(moment(item.date_export * 1000).format('DD-MM-YYYY'))
								self.clickInput();
								self.$el.find('#date-' + item.id).data("gonrin").setValue(item.date_export);
							}
							else if ((item.tuyendonvi_id == "7" && item.medical_supplies_id == medical_supplies_id) || (item.tuyendonvi_id == "8" && item.medical_supplies_id == medical_supplies_id)) {
								var stt2 = self.$el.find('.class-dropdown-organization-hospital tr').length
								demHospital = demHospital + Number(item.quantity)
								self.$el.find('.class-dropdown-organization-hospital').append(` 
										<tr id-row = "${item.id}" class = "data-row-old" synthetic-release-detail-id = "${item.id}">
											<td><input id-row = "${item.id}" attr-type = "STT" value ="${stt2}" class="form-control text-center" ></td>
											<td><input id-row = "${item.id}" attr-type = "ORGANIZATION" organization-id = "${item.organization_id}" value="${item.organization_name}" class="form-control" ></td>
											<td><input id-row = "${item.id}" attr-type = "DATE" id = "date-${item.id}" date-export ="${item.date_export}" class="form-control text-center "></td>
											<td><input id-row = "${item.id}" attr-type = "QUANTITY" quantity = "${item.quantity}" value = "${String_quantity}"  class="form-control text-center"></td>
											<td>
												<i id-row = "${item.id}" class="fa fa-trash" style="font-size: 17px"></i>
											</td>
										</tr>`)
								self.$el.find('#date-' + item.id).datetimepicker({
									textFormat: 'DD-MM-YYYY',
									extraFormats: ['DDMMYYYY'],
									parseInputDate: function (val) {
										return moment.unix(val)
									},
									parseOutputDate: function (date) {
										return date.unix()
									}
								});
								self.$el.find('[id-row = "' + item.id + '"] td .input-group .datetimepicker-input').val(moment(item.date_export * 1000).format('DD-MM-YYYY'))
								self.clickInput();
								self.$el.find('#date-' + item.id).data("gonrin").setValue(item.date_export);

							}
							else if (item.medical_supplies_id == medical_supplies_id && item.tuyendonvi_id != "7" && item.tuyendonvi_id != "6" && item.tuyendonvi_id != "8") {
								var stt3 = self.$el.find('.class-dropdown-organization-other tr').length
								demOther = demOther + Number(item.quantity)
								self.$el.find('.class-dropdown-organization-other').append(` 
										<tr id-row = "${item.id}" class = "data-row-old" synthetic-release-detail-id = "${item.id}">
											<td><input id-row = "${item.id}" attr-type = "STT" value ="${stt3}" class="form-control text-center" ></td>
											<td><input id-row = "${item.id}" attr-type = "ORGANIZATION" organization-id = "${item.organization_id}" value="${item.organization_name}" class="form-control" ></td>
											<td><input id-row = "${item.id}" attr-type = "DATE" id = "date-${item.id}" date-export ="${item.date_export}" class="form-control text-center "></td>
											<td><input id-row = "${item.id}" attr-type = "QUANTITY" quantity = "${item.quantity}" value = "${String_quantity}"  class="form-control text-center"></td>
											<td>
												<i id-row = "${item.id}" class="fa fa-trash" style="font-size: 17px"></i>
											</td>
										</tr>`)
								self.$el.find('#date-' + item.id).datetimepicker({
									textFormat: 'DD-MM-YYYY',
									extraFormats: ['DDMMYYYY'],
									parseInputDate: function (val) {
										return moment.unix(val)
									},
									parseOutputDate: function (date) {
										return date.unix()
									}
								});
								self.$el.find('[id-row = "' + item.id + '"] td .input-group .datetimepicker-input').val(moment(item.date_export * 1000).format('DD-MM-YYYY'))
								self.clickInput();
								self.$el.find('#date-' + item.id).data("gonrin").setValue(item.date_export);

							}
						})
					}
					var demSoytestring = new Number(demSoyte).toLocaleString("da-DK");
					var demHospitalstring = new Number(demHospital).toLocaleString("da-DK");
					var demOthertring = new Number(demOther).toLocaleString("da-DK");
					var all = Number(demOther + demHospital + demSoyte)
					var allstring = new Number(all).toLocaleString("da-DK");


					self.$el.find('.count-soyte').val(demSoytestring)
					self.$el.find('.count-hospital').val(demHospitalstring)
					self.$el.find('.count-other').val(demOthertring)
					self.$el.find('.count-all').val(allstring)

					self.listItemsOldRemove();
				}
			});
		},
		createItem: function (synthetic_release_id) {
			var self = this;
			var arr = [];
			var listClass = ["class-dropdown-organization-soyte", "class-dropdown-organization-hospital", "class-dropdown-organization-other"]
			listClass.forEach(function (item, index) {
				self.$el.find('.' + item + ' .data-row-new').each(function (index2, item2) {
					var dateID = self.$el.find($(item2).find('td [attr-type = "DATE"]')).attr('id')
					var obj = {
						"synthetic_release_id": synthetic_release_id,
						"medical_supplies_id": self.$el.find('.dropdown-medical-supplies input').attr('item-id'),
						"date": self.model.get('date'),

						"organization_id": $(item2).find('td [attr-type = "ORGANIZATION"]').attr('organization-id'),
						"date_export": self.$el.find('#' + dateID).data("gonrin").getValue(),
						"quantity": Number($(item2).find('td [attr-type = "QUANTITY"]').attr('quantity')),
					}
					arr.push(obj)
				})
			})
			if (arr.length > 0) {
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/create_synthetic_release_detail",
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
			var listClass = ["class-dropdown-organization-soyte", "class-dropdown-organization-hospital", "class-dropdown-organization-other"]
			listClass.forEach(function (item, index) {
				self.$el.find('.' + item + ' .data-row-old').each(function (index2, item2) {

					var dateID = self.$el.find($(item2).find('td [attr-type = "DATE"]')).attr('id')
					var obj = {
						"id": $(item2).attr('synthetic-release-detail-id'),
						"date": self.model.get('date'),
						"date_export": self.$el.find('#' + dateID).data("gonrin").getValue(),
						"quantity": Number($(item2).find('td [attr-type = "QUANTITY"]').attr('quantity')),
					}
					arr.push(obj)
				})
			})
			if (arr.length > 0) {
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/update_synthetic_release_detail",
					data: JSON.stringify(arr),
					success: function (response) {
						console.log(response)

					}
				});
			}

		},
		listItemsOldRemove: function () {
			var self = this;
			self.$el.find('.data-row-old td .fa-trash').unbind('click').bind('click', function () {
				self.$el.find('.data-row-old[id-row="' + $(this).attr('id-row') + '"]').remove();
				self.listItemRemove.push($(this).attr('id-row'))
			})
		},
		deleteItem: function () {
			var self = this;
			var arrayItemRemove = self.listItemRemove.length;
			if (arrayItemRemove > 0) {
				$.ajax({
					type: "POST",
					url: self.getApp().serviceURL + "/api/v1/delete_synthetic_release_detail",
					data: JSON.stringify(self.listItemRemove),
					success: function (response) {
						self.listItemRemove.splice(0, arrayItemRemove);
						console.log(response)

					}
				});
			}
		},
	});

});