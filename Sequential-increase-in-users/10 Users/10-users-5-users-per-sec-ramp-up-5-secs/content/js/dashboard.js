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

    var data = {"OkPercent": 55.95238095238095, "KoPercent": 44.04761904761905};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2619047619047619, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2222222222222222, 500, 1500, "myActionStatus"], "isController": false}, {"data": [0.25, 500, 1500, "getUserOrganisationList"], "isController": false}, {"data": [0.16666666666666666, 500, 1500, "updateProfile"], "isController": false}, {"data": [0.75, 500, 1500, "getUnreadNotificationCount"], "isController": false}, {"data": [0.5, 500, 1500, "getUser"], "isController": false}, {"data": [0.18181818181818182, 500, 1500, "me"], "isController": false}, {"data": [0.5, 500, 1500, "DASHBOARD_USER"], "isController": false}, {"data": [0.25, 500, 1500, "RTCycle"], "isController": false}, {"data": [0.35714285714285715, 500, 1500, "myActions"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "getUserData"], "isController": false}, {"data": [0.07692307692307693, 500, 1500, "RTPhases"], "isController": false}, {"data": [0.2, 500, 1500, "GET_SELF_ASSESSMENT"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 84, 37, 44.04761904761905, 6972.321428571429, 383, 37809, 1361.5, 20277.0, 22869.0, 37809.0, 1.2362030905077264, 111.85891797737307, 4.025291459713024], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["myActionStatus", 9, 5, 55.55555555555556, 8391.222222222223, 574, 19180, 11952.0, 19180.0, 19180.0, 19180.0, 0.2588066139468009, 30.927053378864127, 0.8181220794392524], "isController": false}, {"data": ["getUserOrganisationList", 4, 2, 50.0, 757.75, 730, 806, 747.5, 806.0, 806.0, 806.0, 0.17259978425026967, 0.2836771844660194, 0.5211704422869471], "isController": false}, {"data": ["updateProfile", 3, 2, 66.66666666666667, 7389.666666666667, 825, 14218, 7126.0, 14218.0, 14218.0, 14218.0, 0.10387451958034695, 14.80276149328278, 0.3461131453204529], "isController": false}, {"data": ["getUnreadNotificationCount", 4, 0, 0.0, 656.5, 383, 965, 639.0, 965.0, 965.0, 965.0, 0.1714310204431492, 0.13560461578022545, 0.5057549929284705], "isController": false}, {"data": ["getUser", 3, 0, 0.0, 864.3333333333334, 812, 966, 815.0, 966.0, 966.0, 966.0, 0.13274923669188904, 0.08724632450550909, 0.4039517788397717], "isController": false}, {"data": ["me", 11, 5, 45.45454545454545, 9679.454545454544, 933, 31123, 3917.0, 29232.800000000007, 31123.0, 31123.0, 0.18097165325831235, 18.60450933032262, 0.5934597769935672], "isController": false}, {"data": ["DASHBOARD_USER", 5, 0, 0.0, 811.4, 758, 939, 787.0, 939.0, 939.0, 939.0, 0.18634466308884914, 0.16891124636627908, 0.6784110390578414], "isController": false}, {"data": ["RTCycle", 12, 6, 50.0, 5749.916666666667, 499, 22893, 4319.5, 19567.50000000001, 22893.0, 22893.0, 0.18697122201274521, 20.1402454581574, 0.5654783931381562], "isController": false}, {"data": ["myActions", 7, 2, 28.571428571428573, 4448.714285714286, 506, 16603, 523.0, 16603.0, 16603.0, 16603.0, 0.20308692120227456, 12.408276562681326, 0.6221520232534524], "isController": false}, {"data": ["getUserData", 3, 0, 0.0, 1515.3333333333333, 780, 2850, 916.0, 2850.0, 2850.0, 2850.0, 0.16074586079408457, 0.19931021606922789, 0.6522451675775599], "isController": false}, {"data": ["RTPhases", 13, 9, 69.23076923076923, 13181.307692307691, 1162, 37809, 11870.0, 32642.599999999995, 37809.0, 37809.0, 0.1986765087952562, 29.342932369752262, 0.5832242045298244], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 10, 6, 60.0, 9316.099999999999, 635, 21367, 10568.0, 21082.100000000002, 21367.0, 21367.0, 0.1930725566667954, 25.228813605340388, 0.766822351527204], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 37, 100.0, 44.04761904761905], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 84, 37, "500/Internal Server Error", 37, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["myActionStatus", 9, 5, "500/Internal Server Error", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["getUserOrganisationList", 4, 2, "500/Internal Server Error", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["updateProfile", 3, 2, "500/Internal Server Error", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["me", 11, 5, "500/Internal Server Error", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTCycle", 12, 6, "500/Internal Server Error", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["myActions", 7, 2, "500/Internal Server Error", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTPhases", 13, 9, "500/Internal Server Error", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 10, 6, "500/Internal Server Error", 6, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
