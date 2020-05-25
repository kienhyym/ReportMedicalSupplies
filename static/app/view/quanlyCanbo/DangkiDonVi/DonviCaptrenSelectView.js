define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/view/quanlyCanbo/DangkiDonVi/tpl/selectDonVi.html'),
        schema = require('json!app/view/quanlyCanbo/DonViYTe/DonViYTeSchema.json');
    var CustomFilterView = require('app/base/view/CustomFilterView');
    return Gonrin.CollectionDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "donvi",
        textField: "name",
        valueField: "id",
        size:'large',
        query : null,
        tools: [{
            name: "defaultgr",
            type: "group",
            groupClass: "toolbar-group",
            buttons: [{
                name: "select",
                type: "button",
                buttonClass: "btn-success btn-sm",
                label: "TRANSLATE:SELECT",
                command: function() {
                    var self = this;
                    self.trigger("onSelected");
                    self.close();
                }
            }, ]
        }, ],
        uiControl: {
            fields: [
                { field: "name", label: "Tên", width: 350 },
            ],
            onRowClick: function(event) {
                this.uiControl.selectedItems = event.selectedItems;
                var self = this;
                self.trigger("onSelected");
                self.close();
            },
        },
        render: function() {
            var self = this;
            self.query == null;
            if (this.uiControl.selectedItems !== null) {
                this.uiControl.selectedItems = "";
            }
            
            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: self.collectionName + "_filter"
            });
            filter.render();
            self.$el.find("#grid_search input").val("");
            var filter_query = self.uiControl.filters;
            if (filter_query !== undefined && filter_query !== null && filter_query !== false) {
                self.query = filter_query;
            }
            filter.model.set("text", "");

            self.uiControl.orderBy = [{ "field": "name", "direction": "asc" }];
            if (!filter.isEmptyFilter()) {
                if (self.query !== null && self.query !== undefined) {
                    self.uiControl.filters = self.query;
                }
                // var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                // var filters = { "unsigned_name": { "$likeI": gonrinApp().convert_khongdau(text) } };
                // self.uiControl.filters = filters;
            }
            self.applyBindings();
            filter.on('filterChanged', function(evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        var filters = { "unsigned_name": { "$likeI": gonrinApp().convert_khongdau(text) } };
                        var filter_donvi;
                        if (self.query !== null && self.query !== undefined) {
                            filter_donvi = { "$and": [
                                filters, self.query
                            ]};
                        } else {
                            filter_donvi = filters;
                        }
                        $col.data('gonrin').filter(filter_donvi);
                    } else {
                        //						self.uiControl.filters = null;
                    }
                }
                // self.applyBindings();
            });
            return this;
        },

    });

});