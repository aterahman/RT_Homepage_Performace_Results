/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 66.26506024096386, "KoPercent": 33.734939759036145};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3614457831325301, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3333333333333333, 500, 1500, "myActionStatus"], "isController": false}, {"data": [0.296875, 500, 1500, "getUserOrganisationList"], "isController": false}, {"data": [0.2413793103448276, 500, 1500, "updateProfile"], "isController": false}, {"data": [0.967741935483871, 500, 1500, "getUnreadNotificationCount"], "isController": false}, {"data": [0.5, 500, 1500, "getUser"], "isController": false}, {"data": [0.21052631578947367, 500, 1500, "me"], "isController": false}, {"data": [0.46875, 500, 1500, "DASHBOARD_USER"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "RTCycle"], "isController": false}, {"data": [0.2878787878787879, 500, 1500, "myActions"], "isController": false}, {"data": [0.46551724137931033, 500, 1500, "getUserData"], "isController": false}, {"data": [0.125, 500, 1500, "RTPhases"], "isController": false}, {"data": [0.2972972972972973, 500, 1500, "GET_SELF_ASSESSMENT"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 415, 140, 33.734939759036145, 3150.0506024096394, 312, 36681, 863.0, 10005.000000000011, 15316.399999999989, 27430.87999999999, 4.928858167652439, 334.4735029335614, 16.134970267256943], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["myActionStatus", 36, 17, 47.22222222222222, 4205.500000000001, 467, 31428, 1066.0, 15409.100000000004, 19903.699999999983, 31428.0, 0.6195147134744451, 62.446205875709865, 1.958368288590604], "isController": false}, {"data": ["getUserOrganisationList", 32, 11, 34.375, 851.96875, 624, 2541, 722.0, 1171.3, 2084.6999999999985, 2541.0, 0.7976469415225086, 1.574408230096216, 2.408519866394137], "isController": false}, {"data": ["updateProfile", 29, 17, 58.62068965517241, 3972.344827586207, 468, 15056, 1514.0, 12890.0, 14638.0, 15056.0, 0.777959599753199, 98.61523400823563, 2.592185697615151], "isController": false}, {"data": ["getUnreadNotificationCount", 31, 0, 0.0, 396.41935483870964, 312, 691, 386.0, 473.6, 593.1999999999998, 691.0, 0.8014063388656223, 0.6830534874101649, 2.3643052243291454], "isController": false}, {"data": ["getUser", 31, 0, 0.0, 849.5806451612904, 724, 1140, 830.0, 1035.6000000000001, 1084.8, 1140.0, 0.7932446264073695, 0.5659714447927329, 2.4138186092630503], "isController": false}, {"data": ["me", 38, 17, 44.73684210526316, 3641.1052631578946, 628, 18579, 1694.0, 10298.000000000002, 13111.749999999984, 18579.0, 0.5650221548160704, 57.724915176978314, 1.8528753865941059], "isController": false}, {"data": ["DASHBOARD_USER", 32, 0, 0.0, 998.3125000000003, 749, 3062, 866.0, 1480.0, 2058.399999999997, 3062.0, 0.7947940986538174, 0.8840046911479807, 2.8935472654115544], "isController": false}, {"data": ["RTCycle", 39, 18, 46.15384615384615, 4241.666666666666, 439, 27618, 796.0, 14287.0, 18339.0, 27618.0, 0.4906647878818378, 48.68695566875095, 1.48397348444341], "isController": false}, {"data": ["myActions", 33, 15, 45.45454545454545, 2726.3939393939395, 476, 16103, 854.0, 9061.800000000005, 15040.399999999996, 16103.0, 0.5837298568977412, 56.97007859347637, 1.7882427354377088], "isController": false}, {"data": ["getUserData", 29, 0, 0.0, 878.2068965517243, 685, 1889, 803.0, 1206.0, 1732.0, 1889.0, 0.775753684830003, 0.9535741095551453, 3.1477114848326777], "isController": false}, {"data": ["RTPhases", 48, 29, 60.416666666666664, 7695.020833333332, 1012, 36681, 4876.0, 21398.100000000006, 27327.35, 36681.0, 0.5735726405850441, 73.90748135142078, 1.6837493726549242], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 37, 16, 43.24324324324324, 4169.0, 498, 23379, 808.0, 18512.800000000007, 22878.600000000002, 23379.0, 0.5701781421438697, 54.18931647968933, 2.2645649454092958], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 140, 100.0, 33.734939759036145], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 415, 140, "500/Internal Server Error", 140, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["myActionStatus", 36, 17, "500/Internal Server Error", 17, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["getUserOrganisationList", 32, 11, "500/Internal Server Error", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["updateProfile", 29, 17, "500/Internal Server Error", 17, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["me", 38, 17, "500/Internal Server Error", 17, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTCycle", 39, 18, "500/Internal Server Error", 18, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["myActions", 33, 15, "500/Internal Server Error", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTPhases", 48, 29, "500/Internal Server Error", 29, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 37, 16, "500/Internal Server Error", 16, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
