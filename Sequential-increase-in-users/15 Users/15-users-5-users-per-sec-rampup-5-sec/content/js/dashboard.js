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

    var data = {"OkPercent": 60.689655172413794, "KoPercent": 39.310344827586206};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2689655172413793, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2692307692307692, 500, 1500, "myActionStatus"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "getUserOrganisationList"], "isController": false}, {"data": [0.25, 500, 1500, "updateProfile"], "isController": false}, {"data": [0.7777777777777778, 500, 1500, "getUnreadNotificationCount"], "isController": false}, {"data": [0.5, 500, 1500, "getUser"], "isController": false}, {"data": [0.20588235294117646, 500, 1500, "me"], "isController": false}, {"data": [0.4444444444444444, 500, 1500, "DASHBOARD_USER"], "isController": false}, {"data": [0.18421052631578946, 500, 1500, "RTCycle"], "isController": false}, {"data": [0.18181818181818182, 500, 1500, "myActions"], "isController": false}, {"data": [0.3, 500, 1500, "getUserData"], "isController": false}, {"data": [0.05, 500, 1500, "RTPhases"], "isController": false}, {"data": [0.21875, 500, 1500, "GET_SELF_ASSESSMENT"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 145, 57, 39.310344827586206, 5997.000000000002, 377, 28677, 1481.0, 17375.60000000001, 23842.1, 28244.139999999992, 2.0992283526124536, 173.41861429664993, 6.820131079618665], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["myActionStatus", 13, 4, 30.76923076923077, 5477.923076923077, 551, 23770, 1383.0, 20856.799999999996, 23770.0, 23770.0, 0.29236478128865395, 19.401956770774767, 0.9242039033509502], "isController": false}, {"data": ["getUserOrganisationList", 9, 2, 22.22222222222222, 962.5555555555555, 723, 2230, 767.0, 2230.0, 2230.0, 2230.0, 0.2429674423627234, 0.5412194687786837, 0.7336477849468171], "isController": false}, {"data": ["updateProfile", 8, 4, 50.0, 3758.875, 525, 8410, 3315.0, 8410.0, 8410.0, 8410.0, 0.19770171753367108, 21.309213981218335, 0.6587483010008649], "isController": false}, {"data": ["getUnreadNotificationCount", 9, 0, 0.0, 670.1111111111111, 377, 2404, 441.0, 2404.0, 2404.0, 2404.0, 0.251959686450168, 0.21830491496360582, 0.7433302859042553], "isController": false}, {"data": ["getUser", 9, 0, 0.0, 890.6666666666666, 746, 1179, 823.0, 1179.0, 1179.0, 1179.0, 0.24993057484032213, 0.17662736913357402, 0.7605309289086365], "isController": false}, {"data": ["me", 17, 7, 41.1764705882353, 6178.117647058823, 733, 28677, 2432.0, 20325.799999999992, 28677.0, 28677.0, 0.2851392150285139, 26.874174459074137, 0.9350561367829587], "isController": false}, {"data": ["DASHBOARD_USER", 9, 0, 0.0, 1039.4444444444443, 799, 1800, 871.0, 1800.0, 1800.0, 1800.0, 0.2426202992317024, 0.2276408124410298, 0.8832895268904165], "isController": false}, {"data": ["RTCycle", 19, 13, 68.42105263157895, 10086.157894736842, 484, 27736, 11240.0, 25140.0, 27736.0, 27736.0, 0.28268340945947956, 41.46943532129202, 0.8549516788046956], "isController": false}, {"data": ["myActions", 11, 7, 63.63636363636363, 8340.454545454546, 543, 20417, 8841.0, 19493.800000000003, 20417.0, 20417.0, 0.2398290672829547, 32.76289898835739, 0.7347107266275673], "isController": false}, {"data": ["getUserData", 5, 0, 0.0, 2266.4, 822, 6833, 1022.0, 6833.0, 6833.0, 6833.0, 0.16732481092296364, 0.19709686224148315, 0.6789400286962051], "isController": false}, {"data": ["RTPhases", 20, 13, 65.0, 11029.400000000001, 1222, 27242, 10172.5, 25543.100000000013, 27189.399999999998, 27242.0, 0.305101293629485, 42.42424549403527, 0.895639149072492], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 16, 7, 43.75, 7242.875, 581, 27642, 2270.0, 19147.500000000007, 27642.0, 27642.0, 0.27402421689016765, 26.23435666927846, 1.0883364161057734], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 57, 100.0, 39.310344827586206], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 145, 57, "500/Internal Server Error", 57, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["myActionStatus", 13, 4, "500/Internal Server Error", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["getUserOrganisationList", 9, 2, "500/Internal Server Error", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["updateProfile", 8, 4, "500/Internal Server Error", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["me", 17, 7, "500/Internal Server Error", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTCycle", 19, 13, "500/Internal Server Error", 13, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["myActions", 11, 7, "500/Internal Server Error", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTPhases", 20, 13, "500/Internal Server Error", 13, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 16, 7, "500/Internal Server Error", 7, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
