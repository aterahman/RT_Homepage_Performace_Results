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

    var data = {"OkPercent": 40.38461538461539, "KoPercent": 59.61538461538461};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.14423076923076922, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3333333333333333, 500, 1500, "myActionStatus"], "isController": false}, {"data": [0.0, 500, 1500, "getUserOrganisationList"], "isController": false}, {"data": [0.0, 500, 1500, "updateProfile"], "isController": false}, {"data": [0.75, 500, 1500, "getUnreadNotificationCount"], "isController": false}, {"data": [0.5, 500, 1500, "getUser"], "isController": false}, {"data": [0.0, 500, 1500, "me"], "isController": false}, {"data": [0.5, 500, 1500, "DASHBOARD_USER"], "isController": false}, {"data": [0.125, 500, 1500, "RTCycle"], "isController": false}, {"data": [0.5, 500, 1500, "myActions"], "isController": false}, {"data": [0.0, 500, 1500, "RTPhases"], "isController": false}, {"data": [0.125, 500, 1500, "GET_SELF_ASSESSMENT"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 52, 31, 59.61538461538461, 12140.557692307691, 407, 69355, 5031.0, 30242.900000000005, 46976.79999999981, 69355.0, 0.7179048223875858, 86.34599981620946, 2.2561124375284742], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["myActionStatus", 3, 1, 33.333333333333336, 8218.0, 558, 23430, 666.0, 23430.0, 23430.0, 23430.0, 0.12804097311139565, 9.38158544067435, 0.404754521446863], "isController": false}, {"data": ["getUserOrganisationList", 2, 2, 100.0, 785.0, 760, 810, 785.0, 810.0, 810.0, 810.0, 0.7293946024799417, 0.43379034463894967, 2.202429795769511], "isController": false}, {"data": ["updateProfile", 1, 1, 100.0, 19212.0, 19212, 19212, 19212.0, 19212.0, 19212.0, 19212.0, 0.05205080158234437, 11.412443232094525, 0.17343489745992088], "isController": false}, {"data": ["getUnreadNotificationCount", 2, 0, 0.0, 855.0, 407, 1303, 855.0, 1303.0, 1303.0, 1303.0, 0.8550662676357417, 0.6763707781103035, 2.522612494655836], "isController": false}, {"data": ["getUser", 2, 0, 0.0, 991.5, 970, 1013, 991.5, 1013.0, 1013.0, 1013.0, 0.975609756097561, 0.7136051829268293, 2.9687500000000004], "isController": false}, {"data": ["me", 7, 5, 71.42857142857143, 11487.57142857143, 1626, 24478, 14238.0, 24478.0, 24478.0, 24478.0, 0.1873260543780775, 29.281874280801755, 0.6142977447281096], "isController": false}, {"data": ["DASHBOARD_USER", 2, 0, 0.0, 896.0, 864, 928, 896.0, 928.0, 928.0, 928.0, 0.6872852233676976, 0.6721837414089347, 2.502147766323024], "isController": false}, {"data": ["RTCycle", 12, 9, 75.0, 16199.583333333332, 504, 69355, 10195.0, 58620.40000000004, 69355.0, 69355.0, 0.1695178629448078, 27.209189678127956, 0.5126922085352243], "isController": false}, {"data": ["myActions", 2, 0, 0.0, 1053.5, 607, 1500, 1053.5, 1500.0, 1500.0, 1500.0, 0.7535795026375283, 0.5983009137151469, 2.3085731443104747], "isController": false}, {"data": ["RTPhases", 15, 11, 73.33333333333333, 18491.333333333336, 1637, 69004, 20199.0, 48671.20000000001, 69004.0, 69004.0, 0.2173692523946846, 34.110669932035876, 0.6380976295883026], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 4, 2, 50.0, 6525.75, 731, 12376, 6498.0, 12376.0, 12376.0, 12376.0, 0.18927743339800313, 20.501758949273647, 0.7517493375289831], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 31, 100.0, 59.61538461538461], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 52, 31, "500/Internal Server Error", 31, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["myActionStatus", 3, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["getUserOrganisationList", 2, 2, "500/Internal Server Error", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["updateProfile", 1, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["me", 7, 5, "500/Internal Server Error", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTCycle", 12, 9, "500/Internal Server Error", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTPhases", 15, 11, "500/Internal Server Error", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 4, 2, "500/Internal Server Error", 2, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
