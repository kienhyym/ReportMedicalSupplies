define(function (require) {
    "use strict";
    var $ = require('jquery'),
        _ = require('underscore'),
        Gonrin = require('gonrin');

        //Gonrin = require('../../EthnicGroup/view/node_modules/gonrin');
    var itemTemplate = require('text!app/danhmuc/medicalequipment/tpl/equipmentinspectionprocedures.html'),
        itemSchema = require('json!schema/EquipmentInspectionProceduresSchema.json');

    return Gonrin.ItemView.extend({
        bindings: "equipmentinspectionprocedures-bind",
        template: itemTemplate,
        tagName: 'div',
        modelSchema: itemSchema,
        urlPrefix: "/api/v1/",
        collectionName: "equipmentinspectionprocedures",
        foreignRemoteField: "id",
        foreignField: "equipmentinspectionform_id",
        uiControl: {
            fields: [

				// {
				// 	field: "tranghthai",
				// 	uicontrol: "combobox",
				// 	textField: "text",
				// 	valueField: "value",
				// 	dataSource: [
				// 		{ "value": "Không vấn đề", "text": "Bình thường" },
				// 		{ "value": "Có vấn đề", "text": "Không bình thường" },

				// 	],
                // },
            ]
        },
        render: function () {
			var self = this;

			if (self.model.get("id") == null){
				self.model.set("id", gonrin.uuid());
			}
						
			self.model.on("change", function () {

				self.trigger("change", {
					"oldData": self.model.previousAttributes(),
					"data": self.model.toJSON()
				});
			});
			self.applyBindings();
        },
        
    });
});