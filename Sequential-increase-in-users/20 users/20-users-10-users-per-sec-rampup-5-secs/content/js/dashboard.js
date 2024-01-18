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

    var data = {"OkPercent": 44.71544715447155, "KoPercent": 55.28455284552845};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.18292682926829268, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.15, 500, 1500, "myActionStatus"], "isController": false}, {"data": [0.4, 500, 1500, "getUserOrganisationList"], "isController": false}, {"data": [0.1, 500, 1500, "updateProfile"], "isController": false}, {"data": [0.8, 500, 1500, "getUnreadNotificationCount"], "isController": false}, {"data": [0.5, 500, 1500, "getUser"], "isController": false}, {"data": [0.09523809523809523, 500, 1500, "me"], "isController": false}, {"data": [0.5, 500, 1500, "DASHBOARD_USER"], "isController": false}, {"data": [0.09523809523809523, 500, 1500, "RTCycle"], "isController": false}, {"data": [0.5, 500, 1500, "myActions"], "isController": false}, {"data": [0.5, 500, 1500, "getUserData"], "isController": false}, {"data": [0.021739130434782608, 500, 1500, "RTPhases"], "isController": false}, {"data": [0.06666666666666667, 500, 1500, "GET_SELF_ASSESSMENT"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 123, 68, 55.28455284552845, 9193.121951219511, 428, 39019, 6398.0, 23349.800000000003, 28225.799999999996, 37858.60000000003, 1.8494015757502857, 218.14207853754436, 5.991745706343599], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["myActionStatus", 10, 7, 70.0, 6972.0, 597, 14051, 7448.0, 13970.6, 14051.0, 14051.0, 0.290065264684554, 43.64051735859318, 0.9169348259608412], "isController": false}, {"data": ["getUserOrganisationList", 5, 1, 20.0, 798.4, 717, 1051, 737.0, 1051.0, 1051.0, 1051.0, 0.23183567487364956, 0.5267469542588213, 0.7000350651458246], "isController": false}, {"data": ["updateProfile", 5, 4, 80.0, 10419.6, 828, 16976, 10628.0, 16976.0, 16976.0, 16976.0, 0.15679879578524836, 27.339554407222153, 0.5224584875188159], "isController": false}, {"data": ["getUnreadNotificationCount", 5, 0, 0.0, 677.0, 428, 1035, 452.0, 1035.0, 1035.0, 1035.0, 0.23199703043801037, 0.21500506043522644, 0.6844365517121381], "isController": false}, {"data": ["getUser", 5, 0, 0.0, 818.0, 744, 897, 784.0, 897.0, 897.0, 897.0, 0.22700444928720603, 0.1508781525242895, 0.6907674452919277], "isController": false}, {"data": ["me", 21, 12, 57.142857142857146, 10179.666666666668, 908, 24718, 6681.0, 23028.2, 24570.8, 24718.0, 0.34475399340042356, 43.80698765554972, 1.1305506932017797], "isController": false}, {"data": ["DASHBOARD_USER", 5, 0, 0.0, 891.8, 740, 1214, 827.0, 1214.0, 1214.0, 1214.0, 0.23045722713864306, 0.20889687327157078, 0.8390083425516224], "isController": false}, {"data": ["RTCycle", 21, 16, 76.19047619047619, 14104.333333333334, 591, 34184, 10091.0, 30670.800000000003, 33887.6, 34184.0, 0.3948852952237683, 64.2402938722264, 1.194296639949229], "isController": false}, {"data": ["myActions", 5, 0, 0.0, 599.2, 531, 725, 579.0, 725.0, 725.0, 725.0, 0.23273133494693726, 0.18477595245298825, 0.7129669899692794], "isController": false}, {"data": ["getUserData", 3, 0, 0.0, 1015.3333333333334, 767, 1268, 1011.0, 1268.0, 1268.0, 1268.0, 0.30577922739781876, 0.3791383714707981, 1.2407350486698603], "isController": false}, {"data": ["RTPhases", 23, 17, 73.91304347826087, 13643.260869565218, 1491, 39019, 9527.0, 30944.600000000006, 37715.39999999998, 39019.0, 0.3464064100247003, 54.524004175703354, 1.0168922544279775], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 15, 11, 73.33333333333333, 10880.599999999999, 692, 23419, 12437.0, 21145.0, 23419.0, 23419.0, 0.2522237729313447, 40.27936475866389, 1.001752035656034], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 68, 100.0, 55.28455284552845], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 123, 68, "500/Internal Server Error", 68, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["myActionStatus", 10, 7, "500/Internal Server Error", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["getUserOrganisationList", 5, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["updateProfile", 5, 4, "500/Internal Server Error", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["me", 21, 12, "500/Internal Server Error", 12, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTCycle", 21, 16, "500/Internal Server Error", 16, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["RTPhases", 23, 17, "500/Internal Server Error", 17, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 15, 11, "500/Internal Server Error", 11, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
