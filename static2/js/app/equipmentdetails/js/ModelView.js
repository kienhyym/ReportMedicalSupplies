define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    var template = require('text!app/equipmentdetails/tpl/model.html'),
        schema = require('json!schema/EquipmentDetailsSchema.json');

    var NhaCungCapSelectView = require('app/quanlykho/organization/view/SelectView');
    var NoisanXuatCapSelectView = require('app/danhmuc/Nation/view/SelectView');
    var KhoaSelectView = require('app/hethong/department/view/SelectView');
    var PhongSelectView = require('app/hethong/room/view/SelectView');
    var HangSanXuatSelectView = require('app/danhmuc/manufacturer/view/SelectView');

    var EquipmentInspectionFormView = require('app/chungtu/equipmentinspectionform/js/ModelView');




    return Gonrin.ModelView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "equipmentdetails",
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
                    command: function() {
                        var self = this;
                        Backbone.history.history.back();
                    }
                },
                {
                    name: "save",
                    type: "button",
                    buttonClass: "btn-success btn-sm",
                    label: "TRANSLATE:Lưu",
                    command: function() {
                        var self = this;

                        if (self.model.get("department_id") == null) {
                            self.getApp().notify({ message: "Bạn chưa cập nhật vị trí khoa của thiết bị " }, { type: "danger", delay: 1000 });
                            return false;
                        }
                        if (self.model.get("room_id") == null) {
                            self.getApp().notify({ message: "Bạn chưa cập nhật vị trí phòng của thiết bị " }, { type: "danger", delay: 1000 });
                            return false;
                        }
                        if (self.model.get("status") == null) {
                            self.getApp().notify({ message: "Bạn chưa cập nhật trạng thái thiết bị" }, { type: "danger", delay: 1000 });
                            return false;
                        }
                        if (self.model.get("model_serial_number") == null) {
                            self.getApp().notify({ message: "Bạn chưa cập nhật số serial cho thiết bị" }, { type: "danger", delay: 1000 });
                            return false;
                        } else {
                            self.model.save(null, {
                                success: function(model, respose, options) {

                                    self.getApp().notify("Lưu thông tin thành công");
                                    self.getApp().getRouter().navigate(self.collectionName + "/collection");
                                },
                                error: function(xhr, status, error) {
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
                        }



                    }
                },
                {
                    name: "delete",
                    type: "button",
                    buttonClass: "btn-danger btn-sm",
                    label: "TRANSLATE:Xóa",
                    visible: function() {
                        return this.getApp().getRouter().getParam("id") !== null;
                    },
                    command: function() {
                        var self = this;
                        self.model.destroy({
                            success: function(model, response) {
                                self.getApp().notify('Xoá dữ liệu thành công');
                                self.getApp().getRouter().navigate(self.collectionName + "/collection");
                            },
                            error: function(xhr, status, error) {
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
                    field: "classify",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    dataSource: [
                        { "value": "A", "text": "Loại A (mức độ rủi ro thấp.)" },
                        { "value": "B", "text": "Loại B (mức độ rủi ro trung bình thấp.)" },
                        { "value": "C", "text": "Loại C (mức độ rủi ro trung bình cao.)" },
                        { "value": "D", "text": "Loại D (mức độ rủi ro cao.)" },
                    ],
                },
                {
                    field: "status",
                    uicontrol: "combobox",
                    textField: "text",
                    valueField: "value",
                    dataSource: [
                        { "value": "dangyeucaukiemtrathietbi", "text": "Đang yêu cầu kiểm tra" },
                        { "value": "dangyeucausuachua", "text": "Đang yêu cầu sửa chữa" },
                        { "value": "dangchokiemdinh", "text": "Đang chờ kiểm định" },
                        { "value": "dakiemduyet", "text": "Đã kiểm duyệt" },
                        { "value": "luukho", "text": "Lưu kho chưa vận hành" },
                    ],
                },

                {
                    field: "time_of_purchase",
                    uicontrol: "datetimepicker",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function(val) {
                        return moment.unix(val)
                    },
                    parseOutputDate: function(date) {
                        return date.unix()
                    }
                },
                {
                    field: "warranty_starttime",
                    uicontrol: "datetimepicker",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function(val) {
                        return moment.unix(val)
                    },
                    parseOutputDate: function(date) {
                        return date.unix()
                    }
                },
                {
                    field: "warranty_endtime",
                    uicontrol: "datetimepicker",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function(val) {
                        return moment.unix(val)
                    },
                    parseOutputDate: function(date) {
                        return date.unix()
                    }
                },
                {
                    field: "date_of_entering_device",
                    uicontrol: "datetimepicker",
                    textFormat: "DD/MM/YYYY",
                    extraFormats: ["DDMMYYYY"],
                    parseInputDate: function(val) {
                        return moment.unix(val)
                    },
                    parseOutputDate: function(date) {
                        return date.unix()
                    }
                },
                {
                    field: "supplier",
                    uicontrol: "ref",
                    textField: "name",
                    foreignRemoteField: "id",
                    foreignField: "supplier_id",
                    dataSource: NhaCungCapSelectView
                },
                {
                    field: "manufacturer",
                    uicontrol: "ref",
                    textField: "name",
                    foreignRemoteField: "id",
                    foreignField: "manufacturer_id",
                    dataSource: HangSanXuatSelectView
                },
                {
                    field: "nation",
                    uicontrol: "ref",
                    textField: "name",
                    foreignRemoteField: "id",
                    foreignField: "nation_id",
                    dataSource: NoisanXuatCapSelectView
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
                {
                    field: "device_status_when_making_a_purchase",
                    uicontrol: "radio",
                    textField: "text",
                    valueField: "value",
                    cssClassField: "cssClass",
                    dataSource: [
                        { text: "-Mới 100%", value: "moi" },
                        { text: "- Thiết bị cũ:", value: "cu" },
                    ],
                },
                {
                    field: "maintenance_requirements",
                    uicontrol: "radio",
                    textField: "text",
                    valueField: "value",
                    cssClassField: "cssClass",
                    dataSource: [
                        { text: "- Không cần bảo dưỡng:", value: "Không cần bảo dưỡng" },
                        { text: "- Bảo dưỡng, chu kỳ:", value: "Bảo dưỡng" },
                    ],
                },
                {
                    field: "Warranty_expired",

                    uicontrol: "checkbox",
                    checkedField: "key",
                    valueField: "value",
                    dataSource: [{
                            "value": "Warranty_expired",
                            "key": true
                        },
                        {
                            "value": null,
                            "key": false
                        },
                    ],
                },
            ]
        },

        render: function() {
            var self = this;
            self.$el.find('.dialogView').hide();

            self.$el.find(".tensp").html("Thiết bị: " + sessionStorage.getItem('TenSanPham'))
            self.model.set("item_id", sessionStorage.getItem('IDSanPham'))
                // self.model.set("medicalequipment_id", sessionStorage.getItem('IDThietBiNay'))
            self.model.set("name", sessionStorage.getItem('TenSanPham'))
                // self.model.set("types_of_equipment", sessionStorage.getItem('ChungLoai'))

            sessionStorage.clear();
            var id = this.getApp().getRouter().getParam("id");
            if (id) {
                self.$el.find('.have-id').show();
                this.model.set('id', id);
                this.model.fetch({
                    
                    // http://0.0.0.0:20808/#equipmentdetails/model?id=26204cbe-8744-4eec-b912-6a4f452c37ce
                    success: function(data) {
                        var id = self.model.get("id")

                        var qrcode = new QRCode("id_qrcodeMini", {
                            text: self.model.get("id"),
                            width: 40,
                            height: 40,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                        var qrcode = new QRCode("id_qrcodeBigSize", {
                            text: self.model.get("id"),
                            width: 220,
                            height: 220,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                        self.$el.find('#id_qrcodeMini').on('click', function() {
                            self.$el.find('.dialogView').show()
                            self.$el.find('.bodychitiet').css("opacity", "0.3");
                        })
                        self.$el.find(".close").on('click', function() {
                            self.$el.find('.dialogView').hide()
                            self.$el.find('.bodychitiet').css("opacity", "1");
                        })


                        self.$el.find(".btn-taophieuyeucausuachua").unbind("click").bind("click", function() {
                            location.href = self.getApp().serviceURL + "/?#repairrequestform/model";
                            sessionStorage.setItem('TenThietBi', self.model.get("name"));
                            sessionStorage.setItem('IDThietBi', self.model.get("id"));
                            sessionStorage.setItem('SerialThietBi', self.model.get("model_serial_number"));
                            sessionStorage.setItem('MaQLTBThietBi', self.model.get("management_code"));
                        })
                        self.$el.find(".btn-taobienbankiemtra").unbind("click").bind("click", function() {
                            location.href = self.getApp().serviceURL + "/?#devicestatusverificationform/model";
                            sessionStorage.setItem('TenThietBi', self.model.get("name"));
                            sessionStorage.setItem('IDThietBi', self.model.get("id"));
                            sessionStorage.setItem('SerialThietBi', self.model.get("model_serial_number"));
                            sessionStorage.setItem('MaQLTBThietBi', self.model.get("management_code"));
                        })
                        window.history.pushState( {} , 'bar', '/' );
                        console.log(self.getApp().getRouter().getParam("id"))
                        self.$el.find(".btn-taokiemtrahangngay").unbind("click").bind("click", function() {
                            // // location.href = self.getApp().serviceURL + "/?#equipmentinspectionform/model";
                            // sessionStorage.setItem('TenThietBi', self.model.get("name"));
                            // sessionStorage.setItem('IDThietBi', self.model.get("id"));
                            // sessionStorage.setItem('SerialThietBi', self.model.get("model_serial_number"));
                            // sessionStorage.setItem('MaQLTBThietBi', self.model.get("management_code"));
                            // sessionStorage.setItem('Department', self.model.get("department_id"));
                            // sessionStorage.setItem('Khoa2', self.model.get("department"));
                            // sessionStorage.setItem('Room', self.model.get("room_id"));
                            // sessionStorage.setItem('ThietBiID', self.model.get("item_id"));

                            var newview = new EquipmentInspectionFormView({"el":self.getApp().$content,"viewData":self.model.toJSON()});
                            newview.render();
                        })

                        self.$el.find(".btn-taokiemdinh").unbind("click").bind("click", function() {
                            // location.href = self.getApp().serviceURL + "/?#certificateform/model";
                            // sessionStorage.setItem('TenThietBi', self.model.get("name"));
                            // sessionStorage.setItem('IDThietBi', self.model.get("id"));
                            // sessionStorage.setItem('SerialThietBi', self.model.get("model_serial_number"));
                            // sessionStorage.setItem('MaQLTBThietBi', self.model.get("management_code"));
                        })


                        self.$el.find(".btn-dsphieuyeucausuachua").unbind("click").bind("click", function() {
                            location.href = self.getApp().serviceURL + "/?#repairrequestform/collection";
                            sessionStorage.setItem('IDThietBi', self.model.get("id"));
                        })
                        self.$el.find(".btn-dsbienbankiemtra").unbind("click").bind("click", function() {
                            location.href = self.getApp().serviceURL + "/?#devicestatusverificationform/collection";
                            sessionStorage.setItem('IDThietBi', self.model.get("id"));
                        })
                        
                        self.$el.find(".btn-dskiemtrahangngay").unbind("click").bind("click", function() {
                            self.getApp().getRouter().navigate("equipmentinspectionform/collection?type=getbyID&value="+ id);
                        })

                        self.$el.find(".btn-dskiemdinh").unbind("click").bind("click", function() {
                            location.href = self.getApp().serviceURL + "/?#certificateform/collection";
                            sessionStorage.setItem('IDThietBi', self.model.get("id"));

                        })
                        self.applyBindings();

                    },
                    error: function() {
                        self.getApp().notify("Get data Eror");
                    },

                });
            } else {
                self.applyBindings();
            }
        },



    });
});