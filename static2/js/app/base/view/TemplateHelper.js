// define(function(require) {
// 	"use strict";
	
// 	var currencyFormat = {
// 		symbol : "VNĐ",		// default currency symbol is '$'
// 		format : "%v %s",	// controls output: %s = symbol, %v = value (can be object, see docs)
// 		decimal : ",",		// decimal point separator
// 		thousand : ".",		// thousands separator
// 		precision : 0,		// decimal places
// 		grouping : 3		// digit grouping (not implemented yet)
// 	};

// 	return Backbone.View.extend({
		
// 		/**
// 		 * Render template of active status 
// 		 */
// 		statusRender: function(status) {
// 			if (!status) {
// 				return "<div class='text-center'><span class='glyphicon glyphicon-remove'></span></div>";
// 			}
// 			return "<div class='text-center' style='color: blue;'><span class='glyphicon glyphicon-ok'></span></div>";
// 		},

// 		/**
// 		 * Format datetime
// 		 */
// 		datetimeFormat: function(datetime, formatString, align=null) {
// 			var format = (formatString != null) ? formatString : "DD-MM-YYYY HH:mm:ss";
// //			console.log(moment(datetime, ["MM-DD-YYYY", "YYYY-MM-DD"]).format(format),"======");
// 			if (align == null) {
// 				return moment(datetime, ["MM-DD-YYYY", "YYYY-MM-DD"]).isValid() ? moment(datetime, ["MM-DD-YYYY", "YYYY-MM-DD"]).format(format) : "";
// 			}
// 			return moment(datetime).isValid() ? `<div style="text-align: ${align}">${moment(datetime).format(format)}</div>` : "";
			
// 		},
// 		/**
// 		 * Format currency number
// 		 */
// 		currencyFormat: function(amount, alignRight = false, symbol = "VNĐ") {
// 			if (typeof amount !== "number") {
// 				return "Argument 1 must be a number";
// 			}
			
// 			var result = accounting.formatMoney(amount,
// 				 		 symbol,
// 						 currencyFormat.precision,
// 						 currencyFormat.thousand,
// 						 currencyFormat.decimal,
// 						 currencyFormat.format);
			
// 			if (alignRight === true) {
// 				return `<div class='text-right'>${result}</div>`;
// 			}
// 			return result;
// 		}
		
		
// 	});
// });


define(function (require) {
    "use strict";

    var currencyFormat = {
        symbol: "VNĐ",		// default currency symbol is '$'
        format: "%v %s",	// controls output: %s = symbol, %v = value (can be object, see docs)
        decimal: ",",		// decimal point separator
        thousand: ".",		// thousands separator
        precision: 0,		// decimal places
        grouping: 3		// digit grouping (not implemented yet)
    };

    return class TemplateHelper {

        constructor() {
            return;
        }

        static currencyFormat(amount, alignRight = false, symbol = "VNĐ") {
            amount = parseFloat(amount);
            if (typeof amount !== "number") {
                return "Argument 1 must be a number";
            }

            var result = accounting.formatMoney(amount,
                symbol,
                currencyFormat.precision,
                currencyFormat.thousand,
                currencyFormat.decimal,
                currencyFormat.format);

            if (alignRight === true) {
                return `<div class='text-right'>${result}</div>`;
            }
            return result;
        };

        static statusRender(status, options = {}) {
            var color = "";
            if (options && options.color) {
                color = options.color;
            }
            if (!status) {
                return `<div class='text-center' style="color: ${color}"><span class='fa fa-times'></span></div>`;
            }
            color = color ? color : "blue";
            return `<div class='text-center' style='color: ${color};'><span class='fa fa-check'></span></div>`;
        };

        static paymentStatus(status, options = {}) {
            var color = "";
            if (options && options.color) {
                color = options.color;
            }
            if (!status) {
                return `<div class='text-center' style="color: ${color}"><i class="icon-circle-cross"></i></div>`;
            }
            color = color ? color : "blue";
            return `<div class='text-center' style='color: ${color};'><i class="icon-circle-check"></i></div>`;
        };

        static insertString(str = "", index, sub) {
            if (index > 0) {
                return String(str).substring(0, index) + sub + String(str).substring(index, str.length);
            } else {
                return sub + str;
            }
        }

        static phoneFormat(phone) {
            var result = this.insertString(this.insertString(phone, 3, " "), 7, " ")
            return `<span id="${phone}">${result}</span>`;
        }

        static lockStatus(locked) {
            if (locked === true) {
                return "<div class='text-center'><span class='fa fa-lock'></span></div>";
            }
            return "<div class='text-center''><span class='fa fa-unlock'></span></div>";
        }
    }
});