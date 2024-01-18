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

    var data = {"OkPercent": 59.2, "KoPercent": 40.8};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.256, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.36363636363636365, 500, 1500, "myActionStatus"], "isController": false}, {"data": [0.1875, 500, 1500, "getUserOrganisationList"], "isController": false}, {"data": [0.07142857142857142, 500, 1500, "updateProfile"], "isController": false}, {"data": [0.6875, 500, 1500, "getUnreadNotificationCount"], "isController": false}, {"data": [0.5, 500, 1500, "getUser"], "isController": false}, {"data": [0.14285714285714285, 500, 1500, "me"], "isController": false}, {"data": [0.4375, 500, 1500, "DASHBOARD_USER"], "isController": false}, {"data": [0.14705882352941177, 500, 1500, "RTCycle"], "isController": false}, {"data": [0.2, 500, 1500, "myActions"], "isController": false}, {"data": [0.5, 500, 1500, "getUserData"], "isController": false}, {"data": [0.05555555555555555, 500, 1500, "RTPhases"], "isController": false}, {"data": [0.2916666666666667, 500, 1500, "GET_SELF_ASSESSMENT"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 125, 51, 40.8, 6655.528000000002, 377, 33054, 1387.0, 20023.8, 22990.19999999999, 32502.279999999988, 1.8392360549122315, 154.18265556718362, 5.944612095919839], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["myActionStatus", 11, 3, 27.272727272727273, 3969.4545454545455, 566, 17175, 830.0, 16577.800000000003, 17175.0, 17175.0, 0.18159606431802422, 10.723196008188332, 0.5740492775365669], "isController": false}, {"data": ["getUserOrganisationList", 8, 3, 37.5, 1595.375, 693, 5042, 975.5, 5042.0, 5042.0, 5042.0, 0.28128406174185155, 0.5363350884286769, 0.8493460145564502], "isController": false}, {"data": ["updateProfile", 7, 6, 85.71428571428571, 10112.857142857143, 587, 14753, 11024.0, 14753.0, 14753.0, 14753.0, 0.2098950524737631, 39.27634815404797, 0.6993768740629684], "isController": false}, {"data": ["getUnreadNotificationCount", 8, 0, 0.0, 641.625, 377, 1538, 467.5, 1538.0, 1538.0, 1538.0, 0.32075698648811196, 0.2646088518904615, 0.9462957579888537], "isController": false}, {"data": ["getUser", 8, 0, 0.0, 930.2500000000001, 770, 1048, 941.5, 1048.0, 1048.0, 1048.0, 0.3148862473431473, 0.22155814571361096, 0.9581890104699677], "isController": false}, {"data": ["me", 14, 6, 42.857142857142854, 8580.142857142857, 873, 30932, 3163.5, 27101.5, 30932.0, 30932.0, 0.22744996100857812, 22.540709989114895, 0.7458759463543021], "isController": false}, {"data": ["DASHBOARD_USER", 8, 0, 0.0, 1026.625, 801, 1901, 875.5, 1901.0, 1901.0, 1901.0, 0.28432313324092834, 0.2780757987703024, 1.0351139069552546], "isController": false}, {"data": ["RTCycle", 17, 12, 70.58823529411765, 12654.941176470587, 536, 26600, 17067.0, 23187.999999999996, 26600.0, 26600.0, 0.27819598088629965, 42.141033856041766, 0.8413798367235059], "isController": false}, {"data": ["myActions", 10, 6, 60.0, 8083.7, 569, 19832, 8646.5, 19366.0, 19832.0, 19832.0, 0.19347224640625302, 24.866020469363672, 0.592697692359781], "isController": false}, {"data": ["getUserData", 4, 0, 0.0, 811.75, 725, 873, 824.5, 873.0, 873.0, 873.0, 0.30250321409664976, 0.2578958065491946, 1.2274422407925583], "isController": false}, {"data": ["RTPhases", 18, 11, 61.111111111111114, 11609.055555555557, 1224, 33054, 7141.0, 29561.100000000006, 33054.0, 33054.0, 0.26484999190736136, 34.520650252711036, 0.77747956608743], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 12, 4, 33.333333333333336, 4636.083333333333, 589, 19373, 866.5, 18801.800000000003, 19373.0, 19373.0, 0.25508035031034776, 18.84680100012754, 1.0130974460079927], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 51, 100.0, 40.8], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 125, 51, "500/Internal Server Error", 51, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["myActionStatus", 11, 3, "500/Internal Server Error", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["getUserOrganisationList", 8, 3, "500/Internal Server Error", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["updateProfile", 7, 6, "500/Internal Server Error", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["me", 14, 6, "500/Internal Server Error", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTCycle", 17, 12, "500/Internal Server Error", 12, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["myActions", 10, 6, "500/Internal Server Error", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTPhases", 18, 11, "500/Internal Server Error", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 12, 4, "500/Internal Server Error", 4, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
