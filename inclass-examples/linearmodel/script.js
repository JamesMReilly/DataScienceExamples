var svg = d3.select("#linear");

var width = svg.attr("width");
var height = svg.attr("height");

//paddings for minimized size of graph to fit labels/title
var xPadding = 80;
var yPadding = 80;
// Define variables outside the scope of the callback function.
var countryData = new Array();

var predictedVariable = "PISA";
var inputVariables = ["Income", "Inequality", "EduSpend", "HDI"];
var variableMean = {};
var variableStdDev = {};
var model = { intercept: 0.0 };;

inputVariables.forEach(function (variable) {
  model[variable] = 1;
});

d3.queue()
  .defer(d3.tsv, "pisa.txt")
  .defer(d3.tsv, "gdp.txt")
  .defer(d3.tsv, "education.txt")
  .defer(d3.tsv, "gini.txt")
  .defer(d3.tsv, "hdi.txt")
  .await(function (error, _pisa, _gdp, _education, _gini, _hdi) {
    gdp = d3.nest().key(function (d) { return d.Country; }).map(_gdp);
    education = d3.nest().key(function (d) { return d.Country; }).map(_education);
    gini = d3.nest().key(function (d) { return d.Country; }).map(_gini);
    hdi = d3.nest().key(function (d) { return d.Country; }).map(_hdi);

    _pisa.forEach(function (country) {
      var countryName = country.Country;
      try {
        country["PISA"] = country["PISA"];
        country["Income"] = gdp.get(countryName)[0]["GDP"];
        country["EduSpend"] = education.get(countryName)[0]["Education"];
        country["Inequality"] = gini.get(countryName.substr(1))[0]["WBGini"];
        country["HDI"] = hdi.get(countryName)[0]["HDI"];
        country.prediction = country["PISA"];
        country.error = 0;
        countryData.push(country);
      } catch (error) {
        console.log("problem with " + countryName);
        //console.log(error);
      }

    });
    console.log(countryData)
    model.intercept = d3.mean(countryData, function (d) { return d[predictedVariable]; });

    initializeSliders();
    update();
  });

function initializeSliders() {
  var slidersDiv = d3.select("#sliders")

  slidersDiv
    .append("div").text("Intercept")
    .append("div")
    .append("input").attr("type", "range").attr("class", "slider")
    .attr("min", model.intercept - 200)
    .attr("max", model.intercept + 200).attr("step", 2)
    .attr("value", model.intercept)
    .style("width", "60%")
    .on("input", function () {
      model.intercept = Number(this.value);
      update(svg);
    });

  inputVariables.forEach(function (variable) {
    variableMean[variable] = d3.mean(countryData, function (d) { return d[variable]; });
    variableStdDev[variable] = d3.deviation(countryData, function (d) { return d[variable]; });

    console.log(variable);
    var varMin = -50 / variableStdDev[variable];
    var varMax = 50 / variableStdDev[variable];
    var step = (varMax - varMin) / 100;
    slidersDiv
      .append("div").text(variable)
      .append("div")
      .append("input").attr("type", "range").attr("class", "slider")
      .attr("min", varMin).attr("max", varMax).attr("step", step).attr("value", model[variable])
      .style("width", "60%")
      .on("input", function () {
        model[variable] = Number(this.value);
        update();
      });
  });
}

function reevaluateModel() {
  countryData.forEach(function (country) {

    //Y = mx + B
    country.prediction = model.intercept;
    inputVariables.forEach(function (variable) {
      country.prediction += model[variable] * parseFloat(country[variable]);
    });
    //country.error = country[predictedVariable] - country["Prediction"];
  });
}

function update() {
  //remove all content from svg
  svg.selectAll("g > *").remove();
  svg.selectAll("text").remove();
  svg.selectAll("circle").remove();

  //console.log(countryData);
  reevaluateModel();

  pisaExtent = d3.extent(countryData, function (d) { return d["PISA"] })
  pisaRange = pisaExtent[1] - pisaExtent[0];

  scaleFactor = 0.05;

  xPisaScale = d3.scaleLinear()
    .domain([pisaExtent[0] - (pisaRange * scaleFactor), pisaRange * scaleFactor + parseFloat(pisaExtent[1])])
    .range([xPadding, width - xPadding])

  yPisaScale = d3.scaleLinear()
    .domain([pisaExtent[0] - (pisaRange * scaleFactor), pisaRange * scaleFactor + parseFloat(pisaExtent[1])])
    .range([height - yPadding, yPadding])

  plotPisaModel(svg, countryData, xPisaScale, yPisaScale);
}

function plotPisaModel(svg, countryData, xPisaScale, yPisaScale) {
  //console.log(model);
  //console.log(countryData)
  countryData.map(function (country) {
    svg.append("circle")
      .attr("cx", xPisaScale(country["PISA"]))
      .attr("cy", yPisaScale(country["prediction"]))
      .attr("r", 4)
  })

  //x-axis, current overall rating
  var bottomAxis = d3.axisBottom(xPisaScale)
  svg.append("g")
    .attr("transform", "translate(0," + (height - xPadding) + ")")
    .attr("class", "xaxis")
    .call(bottomAxis);

  //y-axis, growth in overall
  var leftAxis = d3.axisLeft(yPisaScale)
  svg.append("g")
    .attr("class", "yaxis")
    .attr("transform", "translate(" + yPadding + ", 0)")
    .call(leftAxis);

  //x-axis label
  svg.append("text")
    .attr("transform", "translate(" + (width / 2.3) + "," + (height - (xPadding / 2)) + ")")
    .text("Actual PISA");

  //y-axis label, rotated to be vertical text
  svg.append("text")
    .attr("transform", "translate(" + yPadding / 3 + "," + (height / 1.7) + ")rotate(270)")
    .text("Predicted PISA");
}