// URL containing the temperature data
var URL_temperatureData = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

// Array of month names for labels
var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Colors used for temperature ranges
var colors = ["#5e4fa2", "#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"];

// Number of distinct color ranges
var buckets = colors.length;

// Chart margins
var margin = {
  top: 5,
  right: 0,
  bottom: 90,
  left: 100
};

// Calculate chart width and height based on margins
var width = 1200 - margin.left - margin.right;
var height = 550 - margin.top - margin.bottom;

// Width of each legend item
var legendElementWidth = 35;

// Axis label positions
var axisYLabelX = -65;
var axisYLabelY = height / 2;
var axisXLabelX = width / 2;
var axisXLabelY = height + 45;

// Fetch data from the URL
d3.json(URL_temperatureData, function(error, data) {
  if (error) throw error;

  // Base temperature and variance data
  var baseTemp = data.baseTemperature;
  var temperatureData = data.monthlyVariance;

  // Extract distinct years and variance data
  var yearData = [...new Set(temperatureData.map(obj => obj.year))];
  var varianceData = temperatureData.map(obj => obj.variance);

  // Calculate minimum and maximum values for variance and years
  var lowVariance = d3.min(varianceData);
  var highVariance = d3.max(varianceData);
  var lowYear = d3.min(yearData);
  var highYear = d3.max(yearData);

  // Define the minimum and maximum dates for x-axis scale
  var minDate = new Date(lowYear, 0);
  var maxDate = new Date(highYear, 0);

  // Calculate grid size
  var gridWidth = width / yearData.length;
  var gridHeight = height / month.length;

  // Color scale to determine rectangle colors based on temperature
  var colorScale = d3.scale.quantile()
    .domain([lowVariance + baseTemp, highVariance + baseTemp])
    .range(colors);

  // Create SVG container for the chart
  var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Tooltip to display information when hovering over a rectangle
  var div = d3.select("#chart").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Create month labels on the left side
  svg.selectAll(".monthLabel")
    .data(month)
    .enter().append("text")
    .text(d => d)
    .attr("x", 0)
    .attr("y", (d, i) => i * gridHeight)
    .style("text-anchor", "end")
    .attr("transform", "translate(-6," + gridHeight / 1.5 + ")")
    .attr("class", "monthLabel scales axis axis-months");

  // Define the x-axis scale and axis
  var xScale = d3.time.scale()
    .domain([minDate, maxDate])
    .range([0, width]);

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .ticks(d3.time.years, 10);

  // Append x-axis to the SVG
  svg.append("g")
    .attr("class", "axis axis-years")
    .attr("transform", "translate(0," + (height + 1) + ")")
    .call(xAxis);

  // Append y-axis label
  svg.append('g')
    .attr('transform', 'translate(' + axisYLabelX + ', ' + axisYLabelY + ')')
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .attr("class", "axislabel")
    .text('Months');

  // Append x-axis label
  svg.append('g')
    .attr('transform', 'translate(' + axisXLabelX + ', ' + axisXLabelY + ')')
    .append('text')
    .attr('text-anchor', 'middle')
    .attr("class", "axislabel")
    .text('Years');

  // Create rectangles for each data point in temperatureData
  svg.selectAll(".years")
    .data(temperatureData)
    .enter().append("rect")
    .attr("x", d => (d.year - lowYear) * gridWidth)
    .attr("y", d => (d.month - 1) * gridHeight)
    .attr("width", gridWidth)
    .attr("height", gridHeight)
    .style("fill", "white")
    .on("mouseover", function(d) {
      div.transition()
        .duration(100)
        .style("opacity", 0.8);
      div.html("<span class='year'>" + d.year + " - " + month[d.month - 1] + "</span><br>" +
          "<span class='temperature'>" + (Math.floor((d.variance + baseTemp) * 1000) / 1000) + " &#8451" + "</span><br>" +
          "<span class='variance'>" + d.variance + " &#8451" + "</span>")
        .style("left", (d3.event.pageX - ($('.tooltip').width()/2)) + "px")
        .style("top", (d3.event.pageY - 75) + "px");
    })
    .on("mouseout", function(d) {
      div.transition()
        .duration(200)
        .style("opacity", 0);
    })
    .transition().duration(1000)
    .style("fill", d => colorScale(d.variance + baseTemp));

  // Create a legend to display color ranges
  var legend = svg.selectAll(".legend")
    .data([0].concat(colorScale.quantiles()))
    .enter().append("g")
    .attr("class", "legend");

  legend.append("rect")
    .attr("x", (d, i) => legendElementWidth * i + (width - legendElementWidth * buckets))
    .attr("y", height + 50)
    .attr("width", legendElementWidth)
    .attr("height", 20)
    .style("fill", (d, i) => colors[i]);

  legend.append("text")
    .attr("class", "legendText")
    .text(d => Math.round(d * 10) / 10)
    .attr("x", (d, i) => legendElementWidth * i + (width - legendElementWidth * buckets))
    .attr("y", height + 80);
});
