// Load google charts
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);
var chartData = arrayFromTemplate;
// Draw the chart and set the chart values
function drawChart(chartDataArray) {
    console.log(chartDataArray);
    var data = google.visualization.arrayToDataTable(
        chartData
    );
    var options = {
    title: 'Voting result shown in bar chart',
    chartArea: {width: '50%'},
    hAxis: {
        title: '# of votes',
        minValue: 0
    },
    vAxis: {
        title: 'Choices'
    }
    };

    var chart = new google.visualization.BarChart(document.getElementById('result-barchart'));

    chart.draw(data, options);
    console.log();
}