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

    var data = {"OkPercent": 50.81967213114754, "KoPercent": 49.18032786885246};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.22950819672131148, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2692307692307692, 500, 1500, "myActionStatus"], "isController": false}, {"data": [0.2857142857142857, 500, 1500, "getUserOrganisationList"], "isController": false}, {"data": [0.2, 500, 1500, "updateProfile"], "isController": false}, {"data": [1.0, 500, 1500, "getUnreadNotificationCount"], "isController": false}, {"data": [0.5, 500, 1500, "getUser"], "isController": false}, {"data": [0.15625, 500, 1500, "me"], "isController": false}, {"data": [0.3125, 500, 1500, "DASHBOARD_USER"], "isController": false}, {"data": [0.15625, 500, 1500, "RTCycle"], "isController": false}, {"data": [0.08333333333333333, 500, 1500, "myActions"], "isController": false}, {"data": [0.5, 500, 1500, "getUserData"], "isController": false}, {"data": [0.058823529411764705, 500, 1500, "RTPhases"], "isController": false}, {"data": [0.14285714285714285, 500, 1500, "GET_SELF_ASSESSMENT"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 122, 60, 49.18032786885246, 7533.34426229508, 365, 40775, 3163.5, 20033.700000000004, 27951.25, 39136.24999999997, 1.6600220429156518, 171.46250588916632, 5.377651294170874], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["myActionStatus", 13, 6, 46.15384615384615, 5311.846153846154, 582, 13546, 880.0, 13433.6, 13546.0, 13546.0, 0.36355500866938867, 36.09963045856871, 1.1492456670535265], "isController": false}, {"data": ["getUserOrganisationList", 7, 2, 28.571428571428573, 954.4285714285714, 701, 2071, 747.0, 2071.0, 2071.0, 2071.0, 0.38333059525765295, 0.80275886794261, 1.1574787114615848], "isController": false}, {"data": ["updateProfile", 5, 3, 60.0, 4439.8, 576, 8267, 4047.0, 8267.0, 8267.0, 8267.0, 0.37260600640882335, 47.81612126462478, 1.2415348572918996], "isController": false}, {"data": ["getUnreadNotificationCount", 6, 0, 0.0, 432.33333333333337, 365, 497, 433.0, 497.0, 497.0, 497.0, 0.33407572383073497, 0.2718171457405345, 0.9855886344654788], "isController": false}, {"data": ["getUser", 6, 0, 0.0, 825.1666666666667, 763, 898, 830.5, 898.0, 898.0, 898.0, 0.3278509371072619, 0.22763868777662424, 0.9976401562756134], "isController": false}, {"data": ["me", 16, 8, 50.0, 7905.437499999999, 880, 18626, 5823.0, 17531.9, 18626.0, 18626.0, 0.28595939376608526, 32.26073660235559, 0.9377457463540178], "isController": false}, {"data": ["DASHBOARD_USER", 8, 0, 0.0, 1182.75, 743, 1800, 879.0, 1800.0, 1800.0, 1800.0, 0.4359435453108822, 0.46537186324995916, 1.5871069696474307], "isController": false}, {"data": ["RTCycle", 16, 11, 68.75, 12772.875000000002, 520, 29253, 15145.0, 28160.300000000003, 29253.0, 29253.0, 0.28326605764464274, 41.737379445949294, 0.8567138481693931], "isController": false}, {"data": ["myActions", 12, 9, 75.0, 6606.249999999999, 558, 13513, 5873.0, 12958.000000000002, 13513.0, 13513.0, 0.4123427943096694, 66.17749504973885, 1.2632024860834308], "isController": false}, {"data": ["getUserData", 2, 0, 0.0, 888.5, 880, 897, 888.5, 897.0, 897.0, 897.0, 0.2895193977996526, 0.3141172372611465, 1.17475888462652], "isController": false}, {"data": ["RTPhases", 17, 13, 76.47058823529412, 16143.70588235294, 1202, 40775, 16288.0, 35074.99999999999, 40775.0, 40775.0, 0.25759917568263785, 42.260233884898625, 0.7561944551777434], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 14, 8, 57.142857142857146, 8412.785714285714, 570, 23714, 6129.0, 20215.0, 23714.0, 23714.0, 0.3664825528127536, 45.99396939870684, 1.4555513108295595], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 60, 100.0, 49.18032786885246], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 122, 60, "500/Internal Server Error", 60, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["myActionStatus", 13, 6, "500/Internal Server Error", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["getUserOrganisationList", 7, 2, "500/Internal Server Error", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["updateProfile", 5, 3, "500/Internal Server Error", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["me", 16, 8, "500/Internal Server Error", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTCycle", 16, 11, "500/Internal Server Error", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["myActions", 12, 9, "500/Internal Server Error", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTPhases", 17, 13, "500/Internal Server Error", 13, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 14, 8, "500/Internal Server Error", 8, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
