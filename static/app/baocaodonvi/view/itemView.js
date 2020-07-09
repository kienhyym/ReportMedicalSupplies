define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');
    var itemTemplate = require('text!app/baocaodonvi/tpl/item.html'),
        itemSchema = require('json!schema/ReportOrganizationDetailSchema.json');

    return Gonrin.ItemView.extend({
        bindings: "baocaodonvi-bind",
        template: itemTemplate,
        tagName: 'div',
        modelSchema: itemSchema,
        urlPrefix: "/api/v1/",
        collectionName: "report_organization_detail",
        foreignRemoteField: "id",
        foreignField: "report_organization_id",
        uiControl: {
            fields: [
                // {
                //     field: "sex",
                //     uicontrol: "radio",
                //     textField: "name",
                //     valueField: "id",
                //     cssClassField: "cssClass",
                //     dataSource: [
                //         { name: "nam", id: 'name' },
                //         { name: "nữ", id: 'nu' },
                //     ],
                // },
            ]
        },
        render: function () {
            var self = this;
            self.applyBindings();
            self.registerEvent();
        },
        registerEvent: function () {
            const self = this;

            var clas = ["begin-net-amount", "quantity-import", "quantity-export", "end-net-amount", "estimates-net-amount"]
            clas.forEach(function (item, idex) {
                self.$el.find('.' + item).unbind('click').bind('click', function () {
                    $(this).val($(this).attr(item))
                })
                var element = "";
                self.$el.find('.' + item).focusout(function () {
                    var that = $(this)
                    for (var i = 0; i < item.length; i++) {
                        if (item[i] === "-") {
                            element = element + "_"
                        }
                        else {
                            element = element + item[i]
                        }
                    }

                    setTimeout(() => {
                        var ValueString = new Number(that.val()).toLocaleString("da-DK");
                        that.attr(item, that.val())
                    }, 100);

                    setTimeout(() => {
                        var ValueString = new Number(that.val()).toLocaleString("da-DK");
                        that.val(ValueString);
                    }, 200);
                    element = "";
                })
                self.$el.find('.' + item).keyup(function () {
                    var num = $(this).attr(item)
                    if (Number.isNaN(Number($(this).val())) === true) {
                        String($(this).val()).slice(-1)
                        $(this).val(num)
                    }
                    num = Number($(this).val())
                })
            })


            self.model.on("change", () => {
                var endNetAmountValueString = new Number(self.model.get('begin_net_amount') + self.model.get('quantity_import') - self.model.get('quantity_export')).toLocaleString("da-DK");
                self.model.set('end_net_amount', self.model.get('begin_net_amount') + self.model.get('quantity_import') - self.model.get('quantity_export'))
                self.$el.find('.end-net-amount').val(endNetAmountValueString)
                self.$el.find('.end-net-amount', self.model.get('begin_net_amount') + self.model.get('quantity_import') - self.model.get('quantity_export'))
                self.trigger("change", self.model.toJSON());
            });
        }
    });
});