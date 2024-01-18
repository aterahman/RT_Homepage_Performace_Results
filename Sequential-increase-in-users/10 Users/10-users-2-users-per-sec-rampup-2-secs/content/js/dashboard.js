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

    var data = {"OkPercent": 56.98924731182796, "KoPercent": 43.01075268817204};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2849462365591398, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.25, 500, 1500, "myActionStatus"], "isController": false}, {"data": [0.2, 500, 1500, "getUserOrganisationList"], "isController": false}, {"data": [0.375, 500, 1500, "updateProfile"], "isController": false}, {"data": [1.0, 500, 1500, "getUnreadNotificationCount"], "isController": false}, {"data": [0.5, 500, 1500, "getUser"], "isController": false}, {"data": [0.15384615384615385, 500, 1500, "me"], "isController": false}, {"data": [0.5, 500, 1500, "DASHBOARD_USER"], "isController": false}, {"data": [0.23076923076923078, 500, 1500, "RTCycle"], "isController": false}, {"data": [0.1875, 500, 1500, "myActions"], "isController": false}, {"data": [0.5, 500, 1500, "getUserData"], "isController": false}, {"data": [0.15384615384615385, 500, 1500, "RTPhases"], "isController": false}, {"data": [0.18181818181818182, 500, 1500, "GET_SELF_ASSESSMENT"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 93, 40, 43.01075268817204, 6607.247311827955, 349, 45683, 1321.0, 18619.800000000017, 26910.399999999987, 45683.0, 1.3178591166092761, 116.57906678658476, 4.284647384120506], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["myActionStatus", 8, 4, 50.0, 9240.25, 584, 24191, 3829.0, 24191.0, 24191.0, 24191.0, 0.19326939337569154, 20.862525064624453, 0.6109502210518687], "isController": false}, {"data": ["getUserOrganisationList", 5, 2, 40.0, 1051.4, 699, 2074, 747.0, 2074.0, 2074.0, 2074.0, 0.13767657020128315, 0.25526634392984004, 0.41571870611559325], "isController": false}, {"data": ["updateProfile", 4, 1, 25.0, 2234.75, 503, 7357, 539.5, 7357.0, 7357.0, 7357.0, 0.11523060524875407, 6.366687867297554, 0.38395197764526257], "isController": false}, {"data": ["getUnreadNotificationCount", 5, 0, 0.0, 398.2, 349, 478, 394.0, 478.0, 478.0, 478.0, 0.14434596841710212, 0.11809868392563294, 0.42584879940240766], "isController": false}, {"data": ["getUser", 5, 0, 0.0, 861.8, 742, 946, 888.0, 946.0, 946.0, 946.0, 0.14249886000911993, 0.10105729701037391, 0.43361957791837663], "isController": false}, {"data": ["me", 13, 8, 61.53846153846154, 9475.615384615387, 770, 23682, 12919.0, 20858.799999999996, 23682.0, 23682.0, 0.23678985810823117, 32.000836591091236, 0.7765042417260158], "isController": false}, {"data": ["DASHBOARD_USER", 5, 0, 0.0, 987.6, 808, 1322, 965.0, 1322.0, 1322.0, 1322.0, 0.13667176907937895, 0.16301845581401705, 0.49757065930461397], "isController": false}, {"data": ["RTCycle", 13, 7, 53.84615384615385, 8556.615384615383, 525, 45683, 2095.0, 34379.399999999994, 45683.0, 45683.0, 0.22982815925323527, 26.400542969026237, 0.6950955168039743], "isController": false}, {"data": ["myActions", 8, 5, 62.5, 5993.75, 513, 14008, 5643.0, 14008.0, 14008.0, 14008.0, 0.19136009185284408, 25.52916951962637, 0.5862271563890351], "isController": false}, {"data": ["getUserData", 3, 0, 0.0, 913.0, 772, 987, 980.0, 987.0, 987.0, 987.0, 0.12833675564681726, 0.15912587964151265, 0.5207414255005133], "isController": false}, {"data": ["RTPhases", 13, 6, 46.15384615384615, 13107.692307692309, 1269, 39199, 4117.0, 38486.6, 39199.0, 39199.0, 0.22069433834139718, 21.874966842797726, 0.6478585752482812], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 11, 7, 63.63636363636363, 5419.090909090909, 546, 10637, 6482.0, 10566.0, 10637.0, 10637.0, 0.23026040358368918, 31.602034304875243, 0.9145205677488906], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 40, 100.0, 43.01075268817204], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 93, 40, "500/Internal Server Error", 40, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["myActionStatus", 8, 4, "500/Internal Server Error", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["getUserOrganisationList", 5, 2, "500/Internal Server Error", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["updateProfile", 4, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["me", 13, 8, "500/Internal Server Error", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTCycle", 13, 7, "500/Internal Server Error", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["myActions", 8, 5, "500/Internal Server Error", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTPhases", 13, 6, "500/Internal Server Error", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 11, 7, "500/Internal Server Error", 7, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
