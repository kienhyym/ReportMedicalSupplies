define(function(require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

    var template = require('text!app/donvicungung/tpl/select.html'),
        schema = require('json!schema/OrganizationSchema.json');
    var CustomFilterView = require('app/base/view/CustomFilterView');

    return Gonrin.CollectionDialogView.extend({
        template: template,
        modelSchema: schema,
        urlPrefix: "/api/v1/",
        collectionName: "donvi",
        textField: "name",
        valueField: "id",
        size: 'large',
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
            if (this.uiControl.selectedItems !== null) {
                this.uiControl.selectedItems = "";
            }

            var filter = new CustomFilterView({
                el: self.$el.find("#grid_search"),
                sessionKey: self.collectionName + "_filter"
            });
            filter.render();
            self.$el.find("#grid_search input").val("");
            // filter.model.set("text", "");

            self.uiControl.orderBy = [{ "field": "name", "direction": "asc" }];
            if (!filter.isEmptyFilter()) {
                var text = !!filter.model.get("text") ? filter.model.get("text").trim() : "";
                var filters = { "name": { "$likeI": text } };
                self.uiControl.filters = filters;
            }
            self.applyBindings();
            filter.on('filterChanged', function(evt) {
                var $col = self.getCollectionElement();
                var text = !!evt.data.text ? evt.data.text.trim() : "";
                if ($col) {
                    if (text !== null) {
                        var filters = { "name": { "$likeI": text } };
                        $col.data('gonrin').filter(filters);
                        //self.uiControl.filters = filters;
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