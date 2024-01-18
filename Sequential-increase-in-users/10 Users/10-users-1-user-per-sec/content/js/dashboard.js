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

    var data = {"OkPercent": 50.0, "KoPercent": 50.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.21323529411764705, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2777777777777778, 500, 1500, "myActionStatus"], "isController": false}, {"data": [0.25, 500, 1500, "getUserOrganisationList"], "isController": false}, {"data": [0.0, 500, 1500, "updateProfile"], "isController": false}, {"data": [1.0, 500, 1500, "getUnreadNotificationCount"], "isController": false}, {"data": [0.5, 500, 1500, "getUser"], "isController": false}, {"data": [0.15, 500, 1500, "me"], "isController": false}, {"data": [0.25, 500, 1500, "DASHBOARD_USER"], "isController": false}, {"data": [0.18181818181818182, 500, 1500, "RTCycle"], "isController": false}, {"data": [0.25, 500, 1500, "myActions"], "isController": false}, {"data": [0.25, 500, 1500, "getUserData"], "isController": false}, {"data": [0.041666666666666664, 500, 1500, "RTPhases"], "isController": false}, {"data": [0.25, 500, 1500, "GET_SELF_ASSESSMENT"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 68, 34, 50.0, 8623.823529411764, 381, 37204, 3760.5, 24086.4, 28845.899999999987, 37204.0, 1.0004708097928436, 108.42786311205272, 3.2632256631797314], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["myActionStatus", 9, 4, 44.44444444444444, 6425.666666666667, 540, 18944, 725.0, 18944.0, 18944.0, 18944.0, 0.294415911544375, 28.278271339019923, 0.9306877985050215], "isController": false}, {"data": ["getUserOrganisationList", 2, 0, 0.0, 1457.0, 730, 2184, 1457.0, 2184.0, 2184.0, 2184.0, 0.20671834625322996, 0.5559593023255813, 0.6241925064599483], "isController": false}, {"data": ["updateProfile", 2, 2, 100.0, 8934.5, 5850, 12019, 8934.5, 12019.0, 12019.0, 12019.0, 0.1345985597954102, 29.499430059223368, 0.4484866074433004], "isController": false}, {"data": ["getUnreadNotificationCount", 2, 0, 0.0, 384.5, 381, 388, 384.5, 388.0, 388.0, 388.0, 0.2144542140253056, 0.16963663414111085, 0.6326818169633283], "isController": false}, {"data": ["getUser", 2, 0, 0.0, 1019.0, 984, 1054, 1019.0, 1054.0, 1054.0, 1054.0, 0.20014009806864805, 0.14639153657560292, 0.6090200640448313], "isController": false}, {"data": ["me", 10, 6, 60.0, 10976.5, 1057, 19812, 14961.5, 19742.8, 19812.0, 19812.0, 0.26644640430577393, 35.4003711098825, 0.8737568609949109], "isController": false}, {"data": ["DASHBOARD_USER", 2, 0, 0.0, 1424.5, 1035, 1814, 1424.5, 1814.0, 1814.0, 1814.0, 0.21417862497322768, 0.28612925680017137, 0.779744056543157], "isController": false}, {"data": ["RTCycle", 11, 7, 63.63636363636363, 9587.181818181818, 570, 24117, 8595.0, 22942.000000000004, 24117.0, 24117.0, 0.19779192289711223, 26.92393383410652, 0.598204673058942], "isController": false}, {"data": ["myActions", 4, 2, 50.0, 6112.25, 583, 12425, 5720.5, 12425.0, 12425.0, 12425.0, 0.13821222487128984, 14.892029797691857, 0.4234099115441761], "isController": false}, {"data": ["getUserData", 2, 0, 0.0, 1607.0, 909, 2305, 1607.0, 2305.0, 2305.0, 2305.0, 0.38872691933916426, 0.42175352283770656, 1.577305029154519], "isController": false}, {"data": ["RTPhases", 12, 8, 66.66666666666667, 16264.333333333332, 1173, 37204, 12062.0, 35986.9, 37204.0, 37204.0, 0.18694500701043776, 26.519597581398973, 0.5487858311263437], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 10, 5, 50.0, 6409.1, 578, 24326, 3275.5, 23076.600000000006, 24326.0, 24326.0, 0.33424694164048396, 36.57820307799653, 1.3275217887225081], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 34, 100.0, 50.0], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 68, 34, "500/Internal Server Error", 34, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["myActionStatus", 9, 4, "500/Internal Server Error", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["updateProfile", 2, 2, "500/Internal Server Error", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["me", 10, 6, "500/Internal Server Error", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTCycle", 11, 7, "500/Internal Server Error", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["myActions", 4, 2, "500/Internal Server Error", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTPhases", 12, 8, "500/Internal Server Error", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 10, 5, "500/Internal Server Error", 5, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
