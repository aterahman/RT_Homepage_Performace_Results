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

    var data = {"OkPercent": 62.006079027355625, "KoPercent": 37.993920972644375};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.32066869300911854, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.23214285714285715, 500, 1500, "myActionStatus"], "isController": false}, {"data": [0.2708333333333333, 500, 1500, "getUserOrganisationList"], "isController": false}, {"data": [0.29545454545454547, 500, 1500, "updateProfile"], "isController": false}, {"data": [0.9347826086956522, 500, 1500, "getUnreadNotificationCount"], "isController": false}, {"data": [0.4782608695652174, 500, 1500, "getUser"], "isController": false}, {"data": [0.10606060606060606, 500, 1500, "me"], "isController": false}, {"data": [0.48, 500, 1500, "DASHBOARD_USER"], "isController": false}, {"data": [0.3055555555555556, 500, 1500, "RTCycle"], "isController": false}, {"data": [0.25925925925925924, 500, 1500, "myActions"], "isController": false}, {"data": [0.47368421052631576, 500, 1500, "getUserData"], "isController": false}, {"data": [0.09210526315789473, 500, 1500, "RTPhases"], "isController": false}, {"data": [0.24193548387096775, 500, 1500, "GET_SELF_ASSESSMENT"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 329, 125, 37.993920972644375, 3966.896656534958, 318, 36343, 956.0, 13488.0, 16762.0, 29846.69999999998, 3.8905444397142994, 292.8494801274774, 12.708962479601249], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["myActionStatus", 28, 14, 50.0, 4600.607142857143, 501, 16146, 1660.5, 13565.1, 15118.649999999994, 16146.0, 0.400354599788384, 42.8881261349338, 1.2655740620263662], "isController": false}, {"data": ["getUserOrganisationList", 24, 11, 45.833333333333336, 799.1666666666666, 627, 1480, 712.0, 1228.0, 1451.75, 1480.0, 0.36663611365719523, 0.6351385865413994, 1.1070692025664528], "isController": false}, {"data": ["updateProfile", 22, 11, 50.0, 3142.5000000000005, 455, 13784, 1364.0, 8586.699999999997, 13144.849999999991, 13784.0, 0.3382273810438927, 36.466866087900684, 1.1269842032439081], "isController": false}, {"data": ["getUnreadNotificationCount", 23, 0, 0.0, 418.7826086956522, 318, 690, 416.0, 509.4, 654.1999999999995, 690.0, 0.3538733748749904, 0.30706989479959995, 1.0439955717747518], "isController": false}, {"data": ["getUser", 23, 0, 0.0, 927.0434782608697, 725, 1697, 815.0, 1437.2, 1652.3999999999994, 1697.0, 0.3520048974594429, 0.2370263955846342, 1.071139902816039], "isController": false}, {"data": ["me", 33, 21, 63.63636363636363, 7044.848484848484, 761, 23146, 5261.0, 17451.800000000003, 20950.799999999992, 23146.0, 0.434381992891931, 60.90564634888772, 1.4244675118467816], "isController": false}, {"data": ["DASHBOARD_USER", 25, 0, 0.0, 933.36, 765, 1805, 867.0, 1155.0000000000002, 1634.2999999999997, 1805.0, 0.37882805752125226, 0.4518560443910718, 1.3791708969133092], "isController": false}, {"data": ["RTCycle", 36, 17, 47.22222222222222, 4178.611111111111, 444, 23325, 1374.5, 15075.200000000006, 23253.6, 23325.0, 0.46113053836990353, 46.76819844464512, 1.394649684894132], "isController": false}, {"data": ["myActions", 27, 12, 44.44444444444444, 3580.9629629629635, 510, 16029, 798.0, 11900.799999999997, 15167.799999999996, 16029.0, 0.4108275893550007, 39.375301344889756, 1.258560691217419], "isController": false}, {"data": ["getUserData", 19, 0, 0.0, 961.7894736842105, 731, 1633, 884.0, 1450.0, 1633.0, 1633.0, 0.30980449705685725, 0.37402332603662214, 1.2570680520226973], "isController": false}, {"data": ["RTPhases", 38, 23, 60.526315789473685, 10617.552631578947, 1068, 36343, 7114.0, 28778.100000000002, 32235.199999999986, 36343.0, 0.4493637954685209, 58.075581992632806, 1.3191284855257557], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 31, 16, 51.61290322580645, 4269.419354838709, 556, 16986, 1803.0, 12115.2, 15973.199999999997, 16986.0, 0.42905386702098214, 48.25071883823286, 1.704064528490561], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 125, 100.0, 37.993920972644375], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 329, 125, "500/Internal Server Error", 125, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["myActionStatus", 28, 14, "500/Internal Server Error", 14, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["getUserOrganisationList", 24, 11, "500/Internal Server Error", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["updateProfile", 22, 11, "500/Internal Server Error", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["me", 33, 21, "500/Internal Server Error", 21, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTCycle", 36, 17, "500/Internal Server Error", 17, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["myActions", 27, 12, "500/Internal Server Error", 12, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["RTPhases", 38, 23, "500/Internal Server Error", 23, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET_SELF_ASSESSMENT", 31, 16, "500/Internal Server Error", 16, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
