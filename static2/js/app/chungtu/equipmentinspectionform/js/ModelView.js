define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    // Gonrin = require('../../certificateform/js/node_modules/gonrin');
    var template = require('text!app/chungtu/equipmentinspectionform/tpl/model.html'),
        schema = require('json!schema/EquipmentInspectionFormSchema.json');
    var KhoaSelectView = require('app/hethong/department/view/SelectView');
    var PhongSelectView = require('app/hethong/room/view/SelectView');

    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "equipmentinspectionform",
        bindings: "data-bind",
        state: null,
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                name: "back",
                type: "button",
                buttonClass: "btn-default btn-sm btn-secondary",
                label: "TRANSLATE:Quay lại",
                command: function () {
                    var self = this;
                    Backbone.history.history.back();
                }
            },
            // {
            // 	name: "save",
            // 	type: "button",
            // 	buttonClass: "btn-success btn-sm",
            // 	label: "TRANSLATE:Lưu",
            // 	command: function () {
            // 		var self = this;

            // 		self.model.save(null, {
            // 			success: function (model, respose, options) {
            // 				if (respose.status == "Có vấn đề") {
            // 					$.ajax({
            // 						method: "POST",
            // 						url: self.getApp().serviceURL + "/api/v1/notification",
            // 						data: JSON.stringify({
            // 							name: respose.name,
            // 							model_serial_number: respose.model_serial_number,
            // 							notification_type_id: respose.id,
            // 							notification_type: "Phiếu kiểm tra hàng ngày",
            // 							notification_type_code: "equipmentinspectionform",

            // 							status: "chuaxem",
            // 							notification_time: respose.created_at
            // 						}),
            // 						headers: {
            // 							'content-type': 'application/json'
            // 						},
            // 						dataType: 'json',
            // 						success: function (response) {
            // 							if (response) {
            // 								self.getApp().notify("Lưu thông tin thành công");
            // 								self.getApp().getRouter().navigate(self.collectionName + "/collection");
            // 							}
            // 						}, error: function (xhr, ere) {
            // 							self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });


            // 						}
            // 					})
            // 				} else {
            // 					self.getApp().notify("Lưu thông tin thành công");
            // 					self.getApp().getRouter().navigate(self.collectionName + "/collection");

            // 				}



            // 			},
            // 			error: function (xhr, status, error) {
            // 				try {
            // 					if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
            // 						self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
            // 						self.getApp().getRouter().navigate("login");
            // 					} else {
            // 						self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
            // 					}
            // 				}
            // 				catch (err) {
            // 					self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
            // 				}
            // 			}
            // 		});


            // 	}
            // },
            {
                name: "&nbsp; In &nbsp; ",
                type: "button",
                buttonClass: "btn-primary btn-sm",
                // label: "TRANSLATE:Xóa",
                visible: function () {
                    return this.getApp().getRouter().getParam("id") !== null;
                },
                command: function () {
                    var self = this;
                    // self.$el.find('#xxx').on('click', function () {
                    self.$el.find('#printJS-form').show();
                    self.$el.find('.bodynay').hide();

                    self.$el.find('#name').val(self.model.get('name'))
                    self.$el.find('#serial').val(self.model.get('model_serial_number'))
                    self.$el.find('#maqltb').val(self.model.get('management_code'))
                    self.$el.find('#ngaykiemtra').val(moment(self.model.get('date') * 1000).format("DD/MM/YYYY"))

                    self.$el.find('#department').val(self.model.get('department').name)
                    self.$el.find('#room').val(self.model.get('room').name)

                    self.$el.find('#status').val(self.model.get('status'))
                    self.$el.find('#checker').val(self.model.get('checker'))

                    var x = self.$el.find("#mota2")[0].scrollHeight;
                    // self.$el.find("#describe").style.height = x + 'px';
                    self.$el.find("#describe")[0].style.height = x + 'px';
                    self.$el.find('#describe').val(self.model.get('describe'))

                    self.$el.find('#imgin').attr('src', self.model.get('attachment'))

                    new printJS({ printable: 'printJS-form', font_size: '30px;', type: 'html', css: 'static/css/style.css' });
                    self.getApp().getRouter().refresh();

                    // })
                }
            },
            {
                name: "delete",
                type: "button",
                buttonClass: "btn-danger btn-sm",
                label: "TRANSLATE:Xóa",
                visible: function () {
                    return this.getApp().getRouter().getParam("id") !== null;
                },
                command: function () {
                    var self = this;
                    self.model.destroy({
                        success: function (model, response) {
                            self.getApp().notify('Xoá dữ liệu thành công');
                            self.getApp().getRouter().navigate(self.collectionName + "/collection");
                        },
                        error: function (xhr, status, error) {
                            try {
                                if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                    self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                    self.getApp().getRouter().navigate("login");
                                } else {
                                    self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                }
                            } catch (err) {
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
                    field: "status",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    dataSource: [
                        { "value": "Không vấn đề", "text": "Bình thường" },
                        { "value": "Có vấn đề", "text": "Không kình thường" },

                    ],
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
                {
                    field: "room",
                    uicontrol: "ref",
                    textField: "name",
                    foreignRemoteField: "id",
                    foreignField: "room_id",
                    dataSource: PhongSelectView
                },
                {
                    field: "department",
                    uicontrol: "ref",
                    textField: "name",
                    foreignRemoteField: "id",
                    foreignField: "department_id",
                    dataSource: KhoaSelectView
                },
            ]
        },

        render: function () {
            var self = this;
            var id;
            var viewdata = self.viewData;
            if (viewdata != undefined) {
                id = null
            } else {
                id = this.getApp().getRouter().getParam("id");
            }
            // if (id == null) {
            //     self.hienThiTaoMoi();
            // }

            if (id) {
                this.model.set('id', id);
                this.model.fetch({
                    success: function (data) {
                        self.hienThiThongTinThietBi();
                        self.$el.find("#img").attr("src", "." + self.model.get('attachment'))
                        self.applyBindings();
                        var filters = {
                            filters: {
                                "$and": [
                                    { "id": { "$eq": self.model.get('equipmentdetails_id') } }
                                ]
                            },
                            order_by: [{ "field": "created_at", "direction": "asc" }]
                        }
                        $.ajax({
                            type: "GET",
                            url: self.getApp().serviceURL + "/api/v1/equipmentdetails?results_per_page=100000&max_results_per_page=1000000",
                            data: "q=" + JSON.stringify(filters),
                            contentType: "application/json",
                            success: function (response) {
                                console.log(response.objects[0].item_id)
                                self.cacBuocKiemTra(response.objects[0].item_id)
                            },
                            error: function (xhr, status, error) {
                                self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                            },
                        })
                    },
                    error: function () {
                        self.getApp().notify("Get data Eror");
                    },
                });
            } else {
                console.log('_______________________', viewdata)
                self.model.set("name", viewdata.name)
                self.model.set("date", moment().unix())
                self.model.set("model_serial_number", viewdata.model_serial_number)
                self.model.set("department_id", viewdata.department_id)
                self.model.set("room_id", viewdata.room_id)
                self.model.set("management_code", viewdata.management_code)
                self.model.set("checker", self.getApp().currentUser.name)
                self.model.set("checker_id", self.getApp().currentUser.id)
                self.model.set("equipmentdetails_id", viewdata.id)
                self.applyBindings();
                // self.hienThiThongTinThietBi();

                var filters = {
                    filters: {
                        "$and": [
                            { "id": { "$eq": viewdata.id } }
                        ]
                    },
                    order_by: [{ "field": "created_at", "direction": "asc" }]
                }
                $.ajax({
                    type: "GET",
                    url: self.getApp().serviceURL + "/api/v1/equipmentdetails?results_per_page=100000&max_results_per_page=1000000",
                    data: "q=" + JSON.stringify(filters),
                    contentType: "application/json",
                    success: function (response) {
                        console.log(response.objects[0].item_id)
                        self.cacBuocKiemTra(response.objects[0].item_id)
                    },
                    error: function (xhr, status, error) {
                        self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                    },
                })
            }
        },
        hienThiThongTinThietBi() {
            var self = this;
            self.$el.find('.name').html("&nbsp;&nbsp;&nbsp;&nbsp;" + self.model.get('name') + " (Serial-number: " + self.model.get('model_serial_number') + ")")
            self.$el.find('.department').html("&nbsp;&nbsp;&nbsp;&nbsp;Khoa: " + self.model.get('department').name)
            self.$el.find('.room').html("&nbsp;&nbsp;&nbsp;&nbsp;Phòng: " + self.model.get('room').name)
            self.$el.find('.checker').html(self.model.get('checker'))
            self.$el.find('.ngaykiemtra').html(moment(self.model.get('date') * 1000).format("DD/MM/YYYY"))
        },
        hienThiTaoMoi() {
            var self = this;
            var TTB = sessionStorage.getItem('TenThietBi')
            var DATE = moment().unix()
            var SERI = sessionStorage.getItem('SerialThietBi')
            var IDKHOA = sessionStorage.getItem('Department')
            var IDPHONG = sessionStorage.getItem('Room')
            var MAQLTB = sessionStorage.getItem('MaQLTBThietBi')
            var NGUOIKT = self.getApp().currentUser.name
            var IDNGUOIKT = self.getApp().currentUser.id
            var CTTB_ID = sessionStorage.getItem('IDThietBi')
            var IDTB = sessionStorage.getItem('ThietBiID');
            //Lưu dữ liệu

            // HIỂN THỊ QUY TRÌNH KIỂM TRA
            if (IDTB !== null) {
                self.cacBuocKiemTra(IDTB);
            }
            // HIỂN THỊ TÊN THIẾT BỊ + SERIAL
            self.$el.find('.name').html("&nbsp;&nbsp;&nbsp;&nbsp;" + TTB + " (Serial-number: " + SERI + ")")
            // HIỂN THỊ TÊN KHOA
            var filters = {
                filters: {
                    "$and": [
                        { "id": { "$eq": IDKHOA } }
                    ]
                },
                order_by: [{ "field": "created_at", "direction": "asc" }]
            }

            $.ajax({
                type: "GET",
                url: self.getApp().serviceURL + "/api/v1/department?results_per_page=100000&max_results_per_page=1000000",
                data: "q=" + JSON.stringify(filters),
                contentType: "application/json",
                success: function (response) {
                    self.$el.find('.department').html("&nbsp;&nbsp;&nbsp;&nbsp;Department: " + response.objects[0].name)
                },
                error: function (xhr, status, error) {
                    self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                },
            })
            // HIỂN THỊ TÊN PHÒNG
            var filters2 = {
                filters: {
                    "$and": [
                        { "id": { "$eq": IDPHONG } }
                    ]
                },
                order_by: [{ "field": "created_at", "direction": "asc" }]
            }

            $.ajax({
                type: "GET",
                url: self.getApp().serviceURL + "/api/v1/room?results_per_page=100000&max_results_per_page=1000000",
                data: "q=" + JSON.stringify(filters2),
                contentType: "application/json",
                success: function (response) {
                    self.$el.find('.room').html("&nbsp;&nbsp;&nbsp;&nbsp;Phòng: " + response.objects[0].name)
                },
                error: function (xhr, status, error) {
                    self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                },
            })
            // HIỂN THỊ TÊN NGƯỜI KIỂM TRA
            self.$el.find('.checker').html(NGUOIKT)
            // HIỂN THỊ NGÀY KIỂM TRA
            self.$el.find('.ngaykiemtra').html(moment(moment().unix() * 1000).format("DD/MM/YYYY"))
            sessionStorage.clear();
        },
        bindEventSelect: function () {
            var self = this;
            self.$el.find(".upload_files").each(function (index, item) {
                $(item).on("change", function () {
                    var http = new XMLHttpRequest();
                    var fd = new FormData();

                    fd.append('file', this.files[0]);
                    http.open('POST', '/api/v1/upload/file');

                    http.upload.addEventListener('progress', function (evt) {
                        if (evt.lengthComputable) {
                            var percent = evt.loaded / evt.total;
                            percent = parseInt(percent * 100);
                        }
                    }, false);
                    http.addEventListener('error', function () { }, false);
                    http.onreadystatechange = function () {
                        if (http.status === 200) {
                            if (http.readyState === 4) {
                                var data_file = JSON.parse(http.responseText),
                                    link, p, t;
                                self.getApp().notify("Tải file thành công");
                                $(self.$el.find('.hinh')[index]).show()
                                $(self.$el.find('.hinah')[index]).show()
                                $(self.$el.find('.closexxx')[index]).show()
                                $(self.$el.find('.hinah')[index]).attr('src', "static/uploads/" + data_file.link.slice(16))
                                if (self.model.get('id') == null) {
                                    $(self.$el.find('.closexxx')[index]).unbind('click').bind('click', function () {
                                        $(self.$el.find('.hinah')[index]).attr('src', '#');
                                        $(self.$el.find('.hinh')[index]).hide();
                                        $(item).hide()
                                        $(self.$el.find('.btn_luu')[index]).unbind('click').bind('click', function () {
                                            $(self.$el.find('.hinah')[index]).hide();
                                            $(self.$el.find('.hinh')[index]).hide();
                                            $(self.$el.find('.btn-edit')[index]).show();
                                            $(self.$el.find('.btn-back')[index]).hide();
                                            $(self.$el.find('.closexxx')[index]).hide();
                                            $(self.$el.find('.time')[index]).html(moment(moment().unix() * 1000).format("HH:mm"));

                                            $(self.$el.find('.ghichuthemnay')[index]).hide();
                                            $(self.$el.find('.noidungghichu')[index]).html($(self.$el.find('.ghichuthem')[index]).val());
                                            $(self.$el.find('.noidungghichu')[index]).show();
                                            if (self.$el.find('.tot')[index].checked == true && self.$el.find('.kotot')[index].checked == false) {
                                                $(self.$el.find('.radioKoTot')[index]).hide()
                                            }
                                            if (self.$el.find('.tot')[index].checked == false && self.$el.find('.kotot')[index].checked == true) {
                                                $(self.$el.find('.radioTot')[index]).hide()
                                            }
                                            if ($(self.$el.find('.ghichuthem')[index]).val() == "") {
                                                $(self.$el.find('.noidungghichu')[index]).hide()
                                            }
                                            var status = null;
                                            if (self.$el.find('.tot')[index].checked == true && self.$el.find('.kotot')[index].checked == false) {
                                                status = "ondinh";
                                            }
                                            if (self.$el.find('.tot')[index].checked == false && self.$el.find('.kotot')[index].checked == true) {
                                                status = "khongondinh";
                                            }

                                            if (self.model.get('id') == null) {
                                                self.model.save(null, {
                                                    success: function (model, respose, options) {
                                                        $.ajax({
                                                            url: self.getApp().serviceURL + "/api/v1/luucacbuoc",
                                                            method: "POST",
                                                            data: JSON.stringify({
                                                                id: gonrin.uuid(),
                                                                note: $(self.$el.find('.ghichuthem')[index]).val(),
                                                                picture: "",
                                                                time: moment(moment().unix() * 1000).format("HH:mm"),
                                                                step: index + 1,
                                                                status: status,
                                                                equipmentinspectionform_id: self.model.get('id')
                                                            }),
                                                            contentType: "application/json",
                                                            success: function (data) {
                                                                self.getApp().notify({ message: "Lưu thành công" });
                                                                console.log('aaaaaaaaaaaaaaaa', data)
                                                            },
                                                            error: function (xhr, status, error) {
                                                                self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                                                            },


                                                        })
                                                    },
                                                    error: function (xhr, status, error) {
                                                        try {
                                                            if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                                                self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                                                self.getApp().getRouter().navigate("login");
                                                            } else {
                                                                self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                                            }
                                                        } catch (err) {
                                                            self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                                                        }
                                                    }
                                                });
                                            } else {
                                                $.ajax({
                                                    url: self.getApp().serviceURL + "/api/v1/luucacbuoc",
                                                    method: "POST",
                                                    data: JSON.stringify({
                                                        note: $(self.$el.find('.ghichuthem')[index]).val(),
                                                        picture: "",
                                                        time: moment(moment().unix() * 1000).format("HH:mm"),
                                                        step: index + 1,
                                                        status: status,
                                                        equipmentinspectionform_id: self.model.get('id')
                                                    }),
                                                    contentType: "application/json",
                                                    success: function (data) {
                                                        self.getApp().notify({ message: "Lưu thành công" });
                                                        console.log('aaaaaaaaaaaaaaaa', data)

                                                    },
                                                    error: function (xhr, status, error) {
                                                        self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                                                    },


                                                })
                                            }

                                            $(self.$el.find('.btn-edit')[index]).unbind("click").bind('click', function () {
                                                $(self.$el.find('.ghichuthemnay')[index]).toggle()
                                                $(self.$el.find('.ghichuthem')[index]).html(item.note)
                                                $(self.$el.find('.noidungghichu')[index]).hide();
                                                $(self.$el.find('.btn-edit')[index]).toggle()
                                                $(self.$el.find('.btn-back')[index]).toggle()
                                                $(self.$el.find('.hinah')[index]).hide();
                                                $(self.$el.find('.hinh')[index]).hide()
                                                $(self.$el.find('.closexxx')[index]).hide();

                                                $(self.$el.find('.radioKoTot')[index]).show();

                                                $(self.$el.find('.radioTot')[index]).show();
                                            })
                                            $(self.$el.find('.btn-back')[index]).unbind("click").bind('click', function () {
                                                $(self.$el.find('.noidungghichu')[index]).show();
                                                if ($(self.$el.find('.noidungghichu')[index]).text() == '' || $(self.$el.find('.noidungghichu')[index]).text() == null) {
                                                    $(self.$el.find('.noidungghichu')[index]).hide();

                                                }
                                                $(self.$el.find('.noidungghichu')[index]).html(item.note)
                                                $(self.$el.find('.ghichuthemnay')[index]).toggle()
                                                $(self.$el.find('.btn-edit')[index]).toggle()
                                                $(self.$el.find('.btn-back')[index]).toggle()
                                                $(self.$el.find('.closexxx')[index]).hide();

                                                $(self.$el.find('.hinah')[index]).hide();
                                                $(self.$el.find('.hinh')[index]).hide()
                                                if (item.status == "ondinh") {
                                                    $(self.$el.find('.radioKoTot')[index]).toggle();
                                                }
                                                if (item.status == "khongondinh") {
                                                    $(self.$el.find('.radioTot')[index]).toggle();
                                                }
                                            })
                                        })
                                    })
                                }



                                $(self.$el.find('.btn_luu')[index]).unbind('click').bind('click', function () {
                                    $(self.$el.find('.hinah')[index]).css({ "height": "auto", "width": "200px", "opacity": "1" });
                                    $(self.$el.find('.hinh')[index]).addClass("justify-content-center");
                                    $(self.$el.find('.btn-edit')[index]).show();
                                    $(self.$el.find('.btn-back')[index]).hide();
                                    $(self.$el.find('.closexxx')[index]).hide();
                                    $(self.$el.find('.time')[index]).html(moment(moment().unix() * 1000).format("HH:mm"));

                                    $(self.$el.find('.ghichuthemnay')[index]).hide();
                                    $(self.$el.find('.noidungghichu')[index]).html($(self.$el.find('.ghichuthem')[index]).val());
                                    $(self.$el.find('.noidungghichu')[index]).show();
                                    if (self.$el.find('.tot')[index].checked == true && self.$el.find('.kotot')[index].checked == false) {
                                        $(self.$el.find('.radioKoTot')[index]).hide()
                                    }
                                    if (self.$el.find('.tot')[index].checked == false && self.$el.find('.kotot')[index].checked == true) {
                                        $(self.$el.find('.radioTot')[index]).hide()
                                    }
                                    if ($(self.$el.find('.ghichuthem')[index]).val() == "") {
                                        $(self.$el.find('.noidungghichu')[index]).hide()
                                    }
                                    var status = null;
                                    if (self.$el.find('.tot')[index].checked == true && self.$el.find('.kotot')[index].checked == false) {
                                        status = "ondinh";
                                    }
                                    if (self.$el.find('.tot')[index].checked == false && self.$el.find('.kotot')[index].checked == true) {
                                        status = "khongondinh";
                                    }

                                    if (self.model.get('id') == null) {
                                        self.model.save(null, {
                                            success: function (model, respose, options) {
                                                $.ajax({
                                                    url: self.getApp().serviceURL + "/api/v1/luucacbuoc",
                                                    method: "POST",
                                                    data: JSON.stringify({
                                                        id: gonrin.uuid(),
                                                        note: $(self.$el.find('.ghichuthem')[index]).val(),
                                                        picture: data_file.link.slice(16),
                                                        time: moment(moment().unix() * 1000).format("HH:mm"),
                                                        step: index + 1,
                                                        status: status,
                                                        equipmentinspectionform_id: self.model.get('id')
                                                    }),
                                                    contentType: "application/json",
                                                    success: function (data) {
                                                        self.getApp().notify({ message: "Lưu thành công" });
                                                    },
                                                    error: function (xhr, status, error) {
                                                        self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                                                    },


                                                })
                                            },
                                            error: function (xhr, status, error) {
                                                try {
                                                    if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                                        self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                                        self.getApp().getRouter().navigate("login");
                                                    } else {
                                                        self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                                    }
                                                } catch (err) {
                                                    self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                                                }
                                            }
                                        });
                                    } else {
                                        $.ajax({
                                            url: self.getApp().serviceURL + "/api/v1/luucacbuoc",
                                            method: "POST",
                                            data: JSON.stringify({
                                                note: $(self.$el.find('.ghichuthem')[index]).val(),
                                                picture: data_file.link.slice(16),
                                                time: moment(moment().unix() * 1000).format("HH:mm"),
                                                step: index + 1,
                                                status: status,
                                                equipmentinspectionform_id: self.model.get('id')
                                            }),
                                            contentType: "application/json",
                                            success: function (data) {
                                                self.getApp().notify({ message: "Lưu thành công" });
                                                console.log('aaaaaaaaaaaaaaaa', data)

                                            },
                                            error: function (xhr, status, error) {
                                                self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                                            },


                                        })
                                    }

                                    $(self.$el.find('.btn-edit')[index]).unbind("click").bind('click', function () {
                                        $(self.$el.find('.ghichuthemnay')[index]).toggle()
                                        $(self.$el.find('.ghichuthem')[index]).html(item.note)
                                        $(self.$el.find('.noidungghichu')[index]).hide();
                                        $(self.$el.find('.btn-edit')[index]).toggle()
                                        $(self.$el.find('.btn-back')[index]).toggle()
                                        $(self.$el.find('.hinah')[index]).css({ "height": "auto", "width": "80px", "opacity": "0.6" });
                                        $(self.$el.find('.hinh')[index]).removeClass("justify-content-center")
                                        $(self.$el.find('.closexxx')[index]).show();

                                        $(self.$el.find('.radioKoTot')[index]).show();

                                        $(self.$el.find('.radioTot')[index]).show();
                                    })
                                    $(self.$el.find('.btn-back')[index]).unbind("click").bind('click', function () {
                                        $(self.$el.find('.noidungghichu')[index]).show();
                                        if ($(self.$el.find('.noidungghichu')[index]).text() == '' || $(self.$el.find('.noidungghichu')[index]).text() == null) {
                                            $(self.$el.find('.noidungghichu')[index]).hide();

                                        }
                                        $(self.$el.find('.noidungghichu')[index]).html(item.note)
                                        $(self.$el.find('.ghichuthemnay')[index]).toggle()
                                        $(self.$el.find('.btn-edit')[index]).toggle()
                                        $(self.$el.find('.btn-back')[index]).toggle()
                                        $(self.$el.find('.closexxx')[index]).hide();

                                        $(self.$el.find('.hinah')[index]).css({ "height": "auto", "width": "200px", "opacity": "1" });
                                        $(self.$el.find('.hinh')[index]).addClass("justify-content-center")
                                        if (item.status == "ondinh") {
                                            $(self.$el.find('.radioKoTot')[index]).toggle();
                                        }
                                        if (item.status == "khongondinh") {
                                            $(self.$el.find('.radioTot')[index]).toggle();
                                        }
                                    })
                                })
                            }
                        } else {
                            self.getApp().notify("Không thể tải tệp tin lên máy chủ");
                        }
                    };
                    http.send(fd);
                });
            })

        },
        cacBuocKiemTra: function (IDTB) {
            const self = this;
            if (IDTB != null || IDTB != undefined) {
                var filters = {
                    filters: {
                        "$and": [
                            { "item_id": { "$eq": IDTB } }
                        ]
                    },
                    order_by: [{ "field": "created_at", "direction": "asc" }]
                }
            }
            $.ajax({
                type: "GET",
                url: self.getApp().serviceURL + "/api/v1/equipmentinspectionprocedures?results_per_page=100000&max_results_per_page=1000000",
                data: "q=" + JSON.stringify(filters),
                contentType: "application/json",
                success: function (response) {
                    response.objects.forEach(function (item, index) {
                        self.$el.find('#equipmentinspectionprocedures').append(`
						<div style="position:relative">
									
									<label style="position: absolute;top: 0px;right: 20px" class='time'></label>
									<div class="buoc">
										<label class="text-dark font-weight-bold">Bước <label class='m-0 stt text-dark font-weight-bold'>01</label></label>
									</div>
									<div class="row col-md-12 huongdan" style="display:none">
										<div class="col-md-9 p-1"><textarea rows="8" type="text" class="form-control">${item.content}</textarea></div>
										<div class="col-md-3 d-flex align-items-center justify-content-center p-0"><img src='http://103.74.122.206:20808${item.picture}' height="170px" width="170px" style="border-radius: 6px;" class="p-0"></div>
									</div>


									<form>
									<div class ="mohienkiemtrathietbi">

									<div class="kiemtra row">
										<div class="input-group flex-nowrap col-md-6 col-6 radioTot" >
										<input type="text" class="form-control" value="Ổn định" aria-label="Username" aria-describedby="addon-wrapping">
											<div class="input-group-append">
												<span class="input-group-text bg-success text-success" id="addon-wrapping" style="border:#17c671">
												<input type="radio" name="totxau" class="tot" value="ondinh">
												</span>
											</div>
										</div>
										
										<div class="input-group flex-nowrap col-md-6 col-6 radioKoTot">
										<input type="text" class="form-control" value="Không ổn" aria-label="Username" aria-describedby="addon-wrapping">
											<div class="input-group-append">
												<span class="input-group-text bg-danger text-danger" id="addon-wrapping" style="border:#c4183c">
												<input type="radio" name="totxau" class="kotot" value="khongondinh">
												</span>
											</div>
										</div>
									</div>
									</form>
 
									<label>&nbsp;</label>

									<label class="form-control noidungghichu" style="display:none"></label>

											<div class="col-md-12 p-0 ghichuthemnay" style="position: relative">
												<textarea type="text" rows="1" class="form-control ghichuthem pl-4 pr-4" ></textarea>
											
												<div style="position: absolute;bottom: 7px;left: 7px;border:none" >
													<button style="position: relative;border:none;" type="button" class="p-0 btn bg-light">
													<img src="static/img/Camera.png" style="width:15px">
														<div style="position: absolute;top: 0px;left: -16px;width: 100%;">
															<div class="form-group col">
																<div id="upload-picture">
																	<div class="custom-file" style="width:44px">
																		<input type="file" data-attr="picture" class="upload_files" id="upload_files" lang="vi" style="width:100%;height:35px;opacity:0">
																	</div>
																</div>
															</div>
														</div>
													</button>
												</div>

												<div style="position: absolute;bottom: 7px;right: 7px;border:none">
													<button  class="btn btn_luu p-0" type="button">
													<img src="static/img/send.png" style="width:15px">
													</button>
												</div>
											</div>
										
											<div class="hinh d-flex" style="position:relative">
											<i class="fa fa-times-circle-o closexxx" aria-hidden="true" style="position: absolute;top: 3px;left: 68px;z-index:999;display:none;"></i>
											<img src="static/img/user.png" style="width:80px;height:80px;display:none;opacity:0.6"  class="hinah">
									</div>

									<i style="position: absolute;top: 3px;right: 0px;display:none;z-index:999" class="fa fa-pencil-square-o btn-edit" aria-hidden="true"></i>
									<i style="position: absolute;top: 3px;right: 0px;display:none;z-index:999" class="fa fa-reply-all btn-back" aria-hidden="true"></i>
						</div>
						</div>
						<label>&nbsp;</label>


					
						<hr class="m-0">`)
                    })
                    if (self.model.get('id') == null) {
                        self.$el.find('.hinh,.hinah,.btn-edit').each(function (index, item) {
                            $(item).hide();
                        })
                    }
                    self.bindEventSelect();
                    self.xoaHinhAnh(IDTB);
                    //Thay đổi chiều cao của ô ghi chú 

                    self.$el.find('.ghichuthem').each(function (indexcao, itemcao) {
                        var chieucao = itemcao.scrollHeight;
                        $(itemcao).keyup(function () {
                            if (itemcao.scrollHeight > chieucao) {
                                chieucao = itemcao.scrollHeight;
                                itemcao.style.height = chieucao + 'px';
                            }
                        })
                    })

                    //ẩn hiển hướng dẫn
                    self.$el.find('.buoc').click(function () {
                        $(".huongdan").toggle();
                        $(".mohienkiemtrathietbi").toggle();
                    });
                    //Hiển thị số thứ tự
                    self.$el.find('.stt').each(function (index, item) {
                        $(item).html(index + 1)
                    });
                    //Hien thi giá trị các bước
                    if (self.model.get('id') !== null) {
                        self.giaTriCacBuoc(self.model.get('id'));
                    }

                    //Lưu thông tin
                    self.$el.find('.btn_luu').each(function (index, item) {
                        $(item).unbind('click').bind('click', function () {
                            $(self.$el.find('.hinah')[index]).css({ "height": "auto", "width": "200px", "opacity": "1" });
                            $(self.$el.find('.hinh')[index]).addClass("justify-content-center");
                            $(self.$el.find('.btn-edit')[index]).show();
                            $(self.$el.find('.btn-back')[index]).hide();
                            $(self.$el.find('.closexxx')[index]).hide();
                            $(self.$el.find('.time')[index]).html(moment(moment().unix() * 1000).format("HH:mm"));
                            $(self.$el.find('.ghichuthemnay')[index]).hide();
                            $(self.$el.find('.noidungghichu')[index]).html($(self.$el.find('.ghichuthem')[index]).val());
                            $(self.$el.find('.noidungghichu')[index]).show();
                            if (self.$el.find('.tot')[index].checked == true && self.$el.find('.kotot')[index].checked == false) {
                                $(self.$el.find('.radioKoTot')[index]).hide()
                            }
                            if (self.$el.find('.tot')[index].checked == false && self.$el.find('.kotot')[index].checked == true) {
                                $(self.$el.find('.radioTot')[index]).hide()
                            }

                            if ($(self.$el.find('.ghichuthem')[index]).val() == "") {
                                $(self.$el.find('.noidungghichu')[index]).hide()

                            }
                            var status = null;
                            if (self.$el.find('.tot')[index].checked == true && self.$el.find('.kotot')[index].checked == false) {
                                status = "ondinh";
                            }
                            if (self.$el.find('.tot')[index].checked == false && self.$el.find('.kotot')[index].checked == true) {
                                status = "khongondinh";
                            }

                            if (self.model.get('id') == null) {
                                self.model.save(null, {
                                    success: function (model, respose, options) {
                                        var linkHinhAnh = "";
                                        if (self.model.get('list_of_steps').length !== 0) {

                                            self.model.get('list_of_steps').sort(function (a, b) {
                                                var thoigiantaoA = a.step
                                                var thoigiantaoB = b.step
                                                if (thoigiantaoA > thoigiantaoB) {
                                                    return 1;
                                                }
                                                if (thoigiantaoA < thoigiantaoB) {
                                                    return -1;
                                                }
                                                return 0;
                                            });

                                            linkHinhAnh = self.model.get('list_of_steps')[index].picture
                                        }
                                        $.ajax({
                                            url: self.getApp().serviceURL + "/api/v1/luucacbuoc",
                                            method: "POST",
                                            data: JSON.stringify({
                                                id: gonrin.uuid(),
                                                note: $(self.$el.find('.ghichuthem')[index]).val(),
                                                picture: linkHinhAnh.slice(16),
                                                time: moment(moment().unix() * 1000).format("HH:mm"),
                                                step: index + 1,
                                                status: status,
                                                equipmentinspectionform_id: self.model.get('id')
                                            }),
                                            contentType: "application/json",
                                            success: function (data) {
                                                self.getApp().notify({ message: "Lưu thành công" });
                                                console.log('aaaaaaaaaaaaaaaa', data)
                                            },
                                            error: function (xhr, status, error) {
                                                self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                                            },


                                        })
                                    },
                                    error: function (xhr, status, error) {
                                        try {
                                            if (($.parseJSON(error.xhr.responseText).error_code) === "SESSION_EXPIRED") {
                                                self.getApp().notify("Hết phiên làm việc, vui lòng đăng nhập lại!");
                                                self.getApp().getRouter().navigate("login");
                                            } else {
                                                self.getApp().notify({ message: $.parseJSON(error.xhr.responseText).error_message }, { type: "danger", delay: 1000 });
                                            }
                                        } catch (err) {
                                            self.getApp().notify({ message: "Lưu thông tin không thành công" }, { type: "danger", delay: 1000 });
                                        }
                                    }
                                });
                            } else {
                                var linkHinhAnh = "";
                                var filters = {
                                    filters: {
                                        "$and": [
                                            { "equipmentinspectionform_id": { "$eq": self.model.get('id') } },
                                            { "step": { "$eq": index + 1 } }

                                        ]
                                    },
                                    order_by: [{ "field": "step", "direction": "asc" }]
                                }

                                $.ajax({
                                    url: self.getApp().serviceURL + "/api/v1/step?results_per_page=100000&max_results_per_page=1000000",
                                    method: "GET",
                                    data: "q=" + JSON.stringify(filters),
                                    contentType: "application/json",
                                    success: function (data) {
                                        if (data.objects.length == 1) {
                                            linkHinhAnh = data.objects[0].picture
                                        }
                                        $.ajax({
                                            url: self.getApp().serviceURL + "/api/v1/luucacbuoc",
                                            method: "POST",
                                            data: JSON.stringify({
                                                note: $(self.$el.find('.ghichuthem')[index]).val(),
                                                picture: linkHinhAnh.slice(16),
                                                time: moment(moment().unix() * 1000).format("HH:mm"),
                                                step: index + 1,
                                                status: status,
                                                equipmentinspectionform_id: self.model.get('id')
                                            }),
                                            contentType: "application/json",
                                            success: function (data) {
                                                self.getApp().notify({ message: "Lưu thành công" });
                                                console.log('aaaaaaaaaaaaaaaa', data)

                                            },
                                            error: function (xhr, status, error) {
                                                self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                                            },
                                        })

                                    },
                                    error: function (xhr, status, error) {
                                        self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                                    },
                                })
                            }
                            $(self.$el.find('.btn-edit')[index]).unbind("click").bind('click', function () {
                                $(self.$el.find('.ghichuthemnay')[index]).toggle()
                                $(self.$el.find('.ghichuthem')[index]).html(item.note)
                                $(self.$el.find('.noidungghichu')[index]).hide();
                                $(self.$el.find('.btn-edit')[index]).toggle()
                                $(self.$el.find('.btn-back')[index]).toggle()
                                $(self.$el.find('.hinah')[index]).css({ "height": "auto", "width": "80px", "opacity": "0.6" });
                                $(self.$el.find('.hinh')[index]).removeClass("justify-content-center")
                                $(self.$el.find('.closexxx')[index]).show();
                                $(self.$el.find('.radioKoTot')[index]).show();

                                $(self.$el.find('.radioTot')[index]).show();
                            })
                            $(self.$el.find('.btn-back')[index]).unbind("click").bind('click', function () {
                                $(self.$el.find('.noidungghichu')[index]).show();
                                if ($(self.$el.find('.noidungghichu')[index]).text() == '' || $(self.$el.find('.noidungghichu')[index]).text() == null) {
                                    $(self.$el.find('.noidungghichu')[index]).hide();

                                }
                                $(self.$el.find('.noidungghichu')[index]).html(item.note)
                                $(self.$el.find('.ghichuthemnay')[index]).toggle()
                                $(self.$el.find('.btn-edit')[index]).toggle()
                                $(self.$el.find('.btn-back')[index]).toggle()
                                $(self.$el.find('.closexxx')[index]).hide();

                                $(self.$el.find('.hinah')[index]).css({ "height": "auto", "width": "200px", "opacity": "1" });
                                $(self.$el.find('.hinh')[index]).addClass("justify-content-center")
                                if (item.status == "ondinh") {
                                    $(self.$el.find('.radioKoTot')[index]).toggle();
                                }
                                if (item.status == "khongondinh") {
                                    $(self.$el.find('.radioTot')[index]).toggle();
                                }
                            })
                        })
                    });

                }
            });
        },

        giaTriCacBuoc: function (id) {
            var self = this;
            var filters = {
                filters: {
                    "$and": [
                        { "equipmentinspectionform_id": { "$eq": id } }
                    ]
                },
                order_by: [{ "field": "step", "direction": "asc" }]
            }
            $.ajax({
                url: self.getApp().serviceURL + "/api/v1/step?results_per_page=100000&max_results_per_page=1000000",
                method: "GET",
                data: "q=" + JSON.stringify(filters),
                contentType: "application/json",
                success: function (data) {
                    data.objects.forEach(function (item, index) {
                        //Hiên thị thời gian
                        $(self.$el.find('.time')[item.step - 1]).html(item.time)
                        // Hiển thị ghi chú
                        if (item.note !== "") {
                            $(self.$el.find('.noidungghichu')[item.step - 1]).show();
                            $(self.$el.find('.noidungghichu')[item.step - 1]).html(item.note)
                            $(self.$el.find('.ghichuthemnay')[item.step - 1]).hide()
                            $(self.$el.find('.btn-edit')[item.step - 1]).show()
                            $(self.$el.find('.btn-back')[item.step - 1]).hide()
                        }
                        if (item.note == "") {
                            $(self.$el.find('.ghichuthemnay')[item.step - 1]).hide()
                        }
                        // Hiển thị tinh trang
                        if (item.status == "ondinh") {
                            $(self.$el.find('.tot')[item.step - 1]).prop('checked', true);
                        }
                        if (item.status == "khongondinh") {
                            $(self.$el.find('.kotot')[item.step - 1]).attr('checked', 'checked');
                        }
                        // Hiện thị hình ảnh
                        if (item.picture !== "") {
                            $(self.$el.find('.hinah')[item.step - 1]).show();
                            $(self.$el.find('.hinah')[item.step - 1]).attr('src', "static/uploads/" + item.picture)
                            $(self.$el.find('.hinah')[item.step - 1]).css({ "height": "auto", "width": "200px", "opacity": "1" });
                            $(self.$el.find('.hinh')[item.step - 1]).addClass("justify-content-center")
                        }

                        if (item.step !== "") {

                            $(self.$el.find('.btn-edit')[item.step - 1]).show();

                        }



                        // Ẩn hình ảnh

                        //Sửa nội dung
                        $(self.$el.find('.btn-edit')[item.step - 1]).unbind("click").bind('click', function () {
                            $(self.$el.find('.ghichuthemnay')[item.step - 1]).toggle()
                            $(self.$el.find('.ghichuthem')[item.step - 1]).html(item.note)
                            $(self.$el.find('.noidungghichu')[item.step - 1]).hide();
                            $(self.$el.find('.btn-edit')[item.step - 1]).hide()
                            $(self.$el.find('.btn-back')[item.step - 1]).show()
                            if (item.picture == "") {
                                $(self.$el.find('.closexxx')[item.step - 1]).hide();
                            } else {
                                $(self.$el.find('.closexxx')[item.step - 1]).show();

                            }
                            $(self.$el.find('.hinah')[item.step - 1]).css({ "height": "auto", "width": "80px" });
                            $(self.$el.find('.hinh')[item.step - 1]).removeClass("justify-content-center")
                            $(self.$el.find('.radioKoTot')[item.step - 1]).show();
                            $(self.$el.find('.radioTot')[item.step - 1]).show();


                        })
                        $(self.$el.find('.btn-back')[item.step - 1]).unbind("click").bind('click', function () {
                            $(self.$el.find('.noidungghichu')[item.step - 1]).show();
                            $(self.$el.find('.noidungghichu')[item.step - 1]).html(item.note)
                            $(self.$el.find('.ghichuthemnay')[item.step - 1]).toggle()
                            $(self.$el.find('.btn-edit')[item.step - 1]).show()
                            $(self.$el.find('.btn-back')[item.step - 1]).hide()
                            $(self.$el.find('.closexxx')[item.step - 1]).hide();

                            $(self.$el.find('.hinah')[item.step - 1]).css({ "height": "auto", "width": "200px" });
                            $(self.$el.find('.hinh')[item.step - 1]).addClass("justify-content-center")
                            if (item.status == "ondinh") {
                                $(self.$el.find('.radioKoTot')[item.step - 1]).toggle();
                            }
                            if (item.status == "khongondinh") {
                                $(self.$el.find('.radioTot')[item.step - 1]).toggle();
                            }
                        })
                        if (item.status == "ondinh") {
                            $(self.$el.find('.radioKoTot')[item.step - 1]).hide();
                        }
                        if (item.status == "khongondinh") {
                            $(self.$el.find('.radioTot')[item.step - 1]).hide();
                        }
                    })
                },
                error: function (xhr, status, error) {
                    self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                },

            })
        },
        xoaHinhAnh: function (id) {
            var self = this;
            self.$el.find('.closexxx').each(function (index, item) {
                $(item).unbind('click').bind('click', function () {
                    $(self.$el.find('.hinah')[index]).attr('src', '#');
                    $(self.$el.find('.hinh')[index]).hide();
                    $(item).hide()
                    $(self.$el.find('.btn_luu')[index]).unbind('click').bind('click', function () {
                        $(self.$el.find('.hinah')[index]).hide();
                        $(self.$el.find('.hinh')[index]).hide();
                        $(self.$el.find('.btn-edit')[index]).show();
                        $(self.$el.find('.btn-back')[index]).hide();
                        $(self.$el.find('.closexxx')[index]).hide();
                        $(self.$el.find('.time')[index]).html(moment(moment().unix() * 1000).format("HH:mm"));

                        $(self.$el.find('.ghichuthemnay')[index]).hide();
                        $(self.$el.find('.noidungghichu')[index]).html($(self.$el.find('.ghichuthem')[index]).val());
                        $(self.$el.find('.noidungghichu')[index]).show();
                        if (self.$el.find('.tot')[index].checked == true && self.$el.find('.kotot')[index].checked == false) {
                            $(self.$el.find('.radioKoTot')[index]).hide()
                        }
                        if (self.$el.find('.tot')[index].checked == false && self.$el.find('.kotot')[index].checked == true) {
                            $(self.$el.find('.radioTot')[index]).hide()
                        }

                        if ($(self.$el.find('.ghichuthem')[index]).val() == "") {
                            $(self.$el.find('.noidungghichu')[index]).hide()

                        }
                        var status = null;
                        if (self.$el.find('.tot')[index].checked == true && self.$el.find('.kotot')[index].checked == false) {
                            status = "ondinh";
                        }
                        if (self.$el.find('.tot')[index].checked == false && self.$el.find('.kotot')[index].checked == true) {
                            status = "khongondinh";
                        }
                        $.ajax({
                            url: self.getApp().serviceURL + "/api/v1/luucacbuoc",
                            method: "POST",
                            data: JSON.stringify({
                                id: gonrin.uuid(),

                                note: $(self.$el.find('.ghichuthem')[index]).val(),
                                picture: "",
                                time: moment(moment().unix() * 1000).format("HH:mm"),
                                step: index + 1,
                                status: status,
                                equipmentinspectionform_id: self.model.get('id')
                            }),
                            contentType: "application/json",
                            success: function (data) {
                                self.getApp().notify({ message: "Lưu thành công" });

                            },
                            error: function (xhr, status, error) {
                                self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                            },
                        })
                        $(self.$el.find('.btn-edit')[index]).unbind("click").bind('click', function () {
                            $(self.$el.find('.ghichuthemnay')[index]).toggle()
                            $(self.$el.find('.ghichuthem')[index]).html(item.note)
                            $(self.$el.find('.noidungghichu')[index]).hide();
                            $(self.$el.find('.btn-edit')[index]).toggle()
                            $(self.$el.find('.btn-back')[index]).toggle()
                            $(self.$el.find('.hinah')[index]).css({ "height": "auto", "width": "80px", "opacity": "0.6" });
                            $(self.$el.find('.hinh')[index]).removeClass("justify-content-center")
                            if (item.picture == "") {
                                $(self.$el.find('.closexxx')[item.step - 1]).hide();
                            } else {
                                $(self.$el.find('.closexxx')[item.step - 1]).show();

                            }
                            $(self.$el.find('.radioKoTot')[index]).show();

                            $(self.$el.find('.radioTot')[index]).show();
                        })
                        $(self.$el.find('.btn-back')[index]).unbind("click").bind('click', function () {
                            $(self.$el.find('.noidungghichu')[index]).show();
                            if ($(self.$el.find('.noidungghichu')[index]).text() == '' || $(self.$el.find('.noidungghichu')[index]).text() == null) {
                                $(self.$el.find('.noidungghichu')[index]).hide();

                            }
                            $(self.$el.find('.noidungghichu')[index]).html(item.note)
                            $(self.$el.find('.ghichuthemnay')[index]).toggle()
                            $(self.$el.find('.btn-edit')[index]).toggle()
                            $(self.$el.find('.btn-back')[index]).toggle()
                            $(self.$el.find('.closexxx')[index]).hide();

                            $(self.$el.find('.hinah')[index]).css({ "height": "auto", "width": "200px", "opacity": "1" });
                            $(self.$el.find('.hinh')[index]).addClass("justify-content-center")
                            if (item.status == "ondinh") {
                                $(self.$el.find('.radioKoTot')[index]).toggle();
                            }
                            if (item.status == "khongondinh") {
                                $(self.$el.find('.radioTot')[index]).toggle();
                            }
                        })
                    })

                })
            })
        },
        dahoanthoanhkiemtra: function (id) {
            var self = this;
            var filters = {
                filters: {
                    "$and": [
                        { "equipmentinspectionform_id": { "$eq": id } }
                    ]
                },
                order_by: [{ "field": "step", "direction": "asc" }]
            }

            $.ajax({
                url: self.getApp().serviceURL + "/api/v1/step",
                method: "GET",
                data: "q=" + JSON.stringify(filters),
                contentType: "application/json",
                success: function (data) {
                    data.objects.forEach(function (item, index) {
                        $(self.$el.find('.fa-chevron-down')[item.step - 1]).css("color", "green")
                        $(self.$el.find('.stt')[item.step - 1]).css("color", "green")

                    })
                },
                error: function (xhr, status, error) {
                    self.getApp().notify({ message: "Lỗi không lấy được dữ liệu" }, { type: "danger", delay: 1000 });
                },

            })
        }
    });
});