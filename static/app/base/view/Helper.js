define(function (require) {
    "use strict";

    return class Helper {

        constructor() {
            return;
        }

        static toInt(i) {
            return parseInt(i) ? parseInt(i) : 0;
        }

        static toFloat(i) {
            return parseFloat(i) ? parseFloat(i) : 0;
        }

        static parseToString(i) {
            return i ? i.toString : "";
        }

        static setDatetime(datetime, options = {}) {
            datetime = datetime ? datetime : new Date();
            if (!options || !options.hasOwnProperty("format") || options.format == null) {
                options.format = "DD-MM-YYYY HH:mm:ss"
            }
            if (options && options.inputFormat) {

            }
            if (moment(datetime).isValid() || ((options && options.inputFormat) ? moment(datetime, options.inputFormat).isValid() : false)) {
                var d = (options && options.inputFormat) ? moment(datetime, options.inputFormat) : moment(datetime);
                if (options && options.hasOwnProperty("years") && options.years != null) {
                    d.years(options.years);
                }
                if (options && options.hasOwnProperty("months") && options.months != null) {
                    d.months(options.months - 1);
                }
                if (options && options.hasOwnProperty("dates") && options.dates != null) {
                    d.dates(options.dates);
                }
                if (options && options.hasOwnProperty("hours") && options.hours != null) {
                    d.hours(options.hours);
                }
                if (options && options.hasOwnProperty("minutes") && options.minutes != null) {
                    d.minutes(options.minutes);
                }
                if (options && options.hasOwnProperty("seconds") && options.seconds != null) {
                    d.seconds(options.seconds);
                }
                if (options && options.hasOwnProperty("milliseconds") && options.milliseconds != null) {
                    d.milliseconds(options.milliseconds);
                }

                return d.local().format(options.format);
            }

            return "Invalid datetime";
        };

        static now() {
            return moment(new Date()).local();
        }

        static utcNow() {
            return moment(new Date()).utc();
        }

        static datetime(inputTime, inputFormat = null, outputFormat = null) {
            if (inputFormat) {
                if (outputFormat) {
                    return moment(inputTime, inputFormat).format(outputFormat);
                }
                return moment(inputTime, inputFormat);
            } else {
                if (outputFormat) {
                    return moment(inputTime).format(outputFormat);
                }
                return moment(inputTime);
            }
        }

        /**
         * @param {*} format
         */
        static utcNowString(format = "YYYY-MM-DD HH:mm:ss") {
            return moment(new Date()).utc().format(format);
        }

        static localNowString(format = "YYYY-MM-DD HH:mm:ss") {
            return moment(new Date()).local().format(format);
        }

        static utcToLocal(utcTime, format = "YYYY-MM-DD HH:mm:ss") {
            return moment(utcTime).local().format(format);
        }

        static localToUtc(localTime, options = {}) {
            if (!options || !options.format) {
                options.format = "YYYY-MM-DD HH:mm:ss";
            }
            return moment(localTime).utc().format(options.format);
        }

        /**
         *
         * @param {*} utcTime
         * @return miliseconds
         */
        static utcToUtcTimestamp(inputTime, options = {}) {
            var now = moment(new Date()).utc();
            if (inputTime) {
                now = moment(inputTime).utc();
            }
            return now.unix();
        }

        /**
         * convert local time to utc timestamp
         * @param {*} localTime
         * @param {*} options
         */

        static localToUtcTimestamp(localTime, options = {}) {
            let localMomentTime = this.now();
            if (localTime) {
                if (options && options.inputFormat) {
                    localMomentTime = moment(localTime, options.inputFormat);
                } else {
                    localMomentTime = moment(localTime);
                }
            }
            const result = localMomentTime.utc().unix() + localMomentTime.millisecond();
            return result;
        }

        /**
         * milisecond
         */
        static utcTimestampNow(inputTime = null) {
            var now = moment(new Date()).utc();
            if (inputTime) {
                now = moment(inputTime).utc();
            }
            // return now.unix() * 1000 + now.millisecond();
            return now.unix() + now.millisecond();
        }

        static datetimeToObject(datetime, isUtc = false) {
            try {
                if (!datetime) {
                    datetime = new Date();
                }
                if (moment.isMoment(datetime)) {
                    if (isUtc) {
                        return datetime.local().toObject();
                    } else {
                        return datetime.toObject();
                    }
                } else {
                    if (isUtc) {
                        return moment(datetime).local().toObject();
                    } else {
                        return moment(datetime).toObject();
                    }
                }
            } catch {
                return null;
            }
        }

        static getWeekDayString(idx) {
            var i = parseInt(idx);
            if (i == null) {
                return "";
            }
            switch (i) {
                case 0:
                    return "Chủ nhật";
                case 1:
                    return "Thứ 2";
                case 2:
                    return "Thứ 3";
                case 3:
                    return "Thứ 4";
                case 4:
                    return "Thứ 5";
                case 5:
                    return "Thứ 6";
                case 6:
                    return "Thứ 7";
            }
        }

        static getStartDayTime(inputTime) {
            var t = moment(inputTime);
            t.set('hour', 0);
            t.set('minute', 0);
            t.set('second', 0);
            t.set('millisecond', 0);
            return t.local().format("YYYY-MM-DD HH:mm:ss");
        }

        static getEndDayTime(inputTime) {
            var t = moment(inputTime);
            t.set('hour', 23);
            t.set('minute', 59);
            t.set('second', 59);
            t.set('millisecond', 999);
            return t.local().format("YYYY-MM-DD HH:mm:ss");
        }

        static getStartDayOfWeek(currentDay) {
            var first = currentDay.getDate() - currentDay.getDay() + 1; // First day is the day of the month - the day of the week
            var firstday = new Date(currentDay.setDate(first)).toUTCString();
            return firstday;
        }


        static getLastDayOfWeek(currentDay, idx) {
            var first = currentDay.getDate() - currentDay.getDay() + 1;
            var last = first + idx; // last day is the first day + 6
            var lastday = new Date(currentDay.setDate(last)).toUTCString();
            return lastday;
        }

        static setDate(y = null, m = null, d = null) {
            var today = new Date();
            if (y == null) {
                y = today.getFullYear();
            }
            if (m == null) {
                m = today.getMonth();
            } else {
                m = m - 1;
            }
            if (d == null) {
                d = today.getDate()
            }
            today.setFullYear(y, m, d);
            return today;
        }

        /**
         * FILE EXPORT AS EXCEL
         * @param {*} title
         * @param {*} dataSource
         * @param {*} fields
         */
        static exportToFile(title = null, dataSource, fields) {
            // try {
            const self = this;
            if (!title) {
                title = self.localNowString("YYYY-MM-DD-HH-mm-ss");
            } else {
                title += "-" + self.localNowString("YYYY-MM-DD-HH-mm-ss");
            }

            var report = gonrin.spreadsheet({
                name: title,
                fields: fields,
                dataSource: dataSource,
                excel: {
                    file_name: title + ".xlsx"
                }
            }).save_excel();
        }

        static exportTableToExcel(tableID, filename = '') {
            var downloadLink;
            var dataType = 'application/vnd.ms-excel';
            var tableSelect = document.getElementById(tableID);
            var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

            // Specify file name
            filename = filename ? filename + '.xls' : 'excel_data.xls';

            // Create download link element
            downloadLink = document.createElement("a");

            document.body.appendChild(downloadLink);

            if (navigator.msSaveOrOpenBlob) {
                var blob = new Blob(['\ufeff', tableHTML], {
                    type: dataType
                });
                navigator.msSaveOrOpenBlob(blob, filename);
            } else {
                // Create a link to the file
                downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

                // Setting the file name
                downloadLink.download = filename;

                //triggering the function
                downloadLink.click();
            }
        }

        static makeNoDelivery(length, result = "PX-") {
            var characters = '0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        static makeNoGoods(length, result = "PN-") {
            var characters = '0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        static bill(length, result = "TT-") {
            var characters = '0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

    }

});
