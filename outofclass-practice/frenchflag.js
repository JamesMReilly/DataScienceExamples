//a combo of Dr. Guha's "make the italian flag" comment
//and a Dashing D3 walkthrough on making rectangles

var bluestripe = { "x_axis": 10, "y_axis": 10, "height": 90, "width": 40, "color": "blue" }
var whitestripe = { "x_axis": 50, "y_axis": 10, "height": 90, "width": 40, "color": "white" }
var redstripe = { "x_axis": 90, "y_axis": 10, "height": 90, "width": 40, "color": "red" }

var flag = [bluestripe, whitestripe, redstripe];

var max_x = 0;
var max_y = 0;

for (var i = 0; i < flag.length; i++) {
  var temp_x = flag[i].x_axis + flag[i].width;
  var temp_y = flag[i].y_axis + flag[i].height;

  if (temp_x > max_x) max_x = temp_x;
  if (temp_y > max_y) max_y = temp_y;
}

var svg = d3.select("body").append("svg")
  .attr("width", max_x + 10)
  .attr("height", max_y + 10)

var rectangles = svg.selectAll("rect")
  .data(flag)
  .enter()
  .append("rect")

var rectAttr = rectangles
  .attr("x", function (d) { return d.x_axis; })
  .attr("y", function (d) { return d.y_axis; })
  .attr("height", function (d) { return d.height; })
  .attr("width", function (d) { return d.width; })
  .attr("fill", function (d) { return d.color; })

function toggleNationality() {
  var color = d3.select("rect").style("fill")
  if (color == "blue") {
    makeGreen();
  }
  else makeBlue();
}

function makeGreen() {
  d3.select("rect")
    .style("fill", "green");

  console.log("i tried to make it green");
}

function makeBlue() {
  d3.select("rect")
    .style("fill", "blue");

  console.log("this time i tried blue")
}