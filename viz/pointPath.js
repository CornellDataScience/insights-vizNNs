var margin = {
  top: 20,
  right: 50,
  bottom: 50,
  left: 50
},
  width = 1000 - margin.left - margin.right,
  height = 900 - margin.top - margin.bottom;

var canvas = d3.select("body").append("svg").attr('width', width + margin.left + margin.right)
  .attr('height', height +
    margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

var defs = canvas.append("defs");

function setGradient(class_num, start_color, stop_color) {
  var gradient = defs.append("linearGradient")
    .attr("id", "svgGradient" + class_num)
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "100%");

  gradient.append("stop")
    .attr('class', 'start')
    .attr("offset", "0%")
    .attr("stop-color", start_color)
    .attr("stop-opacity", 0.5);

  gradient.append("stop")
    .attr('class', 'end')
    .attr("offset", "100%")
    .attr("stop-color", stop_color)
    .attr("stop-opacity", 0.5);
}


function colorLuminance(hex, lum) {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  lum = lum || 0;

  // convert to decimal and change luminosity
  var rgb = "#", c, i;
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
    rgb += ("00" + c).substr(c.length);
  }

  return rgb;
}

function plot_epoch(data, epoch_num, saturation_scale, x, y, color, circle) {
  var epoch_key = "epoch" + epoch_num
  var circle = canvas.selectAll('.dot' + epoch_num)
    .data(data)
    .enter()
    .append('circle')
    .data(data)
    .attr('class', 'dot' + epoch_num)
    .attr('r', 3)
    .attr('cx', function (d) {
      return x(d[epoch_key][0]);
    })
    .attr('cy', function (d) {
      return y(d[epoch_key][1]);
    })
    .attr('fill', function (d) {
      return colorLuminance(color(d["label"]), saturation_scale);
    })
    .style("opacity", 0.7)

  return circle;
}

function gen_path(data, index, line) {
  var points = [
    data["points"][index]["epoch0"],
    data["points"][index]["epoch1"],
    data["points"][index]["epoch2"],
    data["points"][index]["epoch3"],
    data["points"][index]["epoch4"]
  ];

  var label = data["points"][index]["label"];
  var pathdata = line(points);

  canvas.append("path")
    .attr('d', pathdata)
    .attr("stroke", "url(#svgGradient" + label + ")")
    .attr("stroke-width", 2)
    .attr("fill", "none");
}

d3.json('layer2_layout.json', function (data) {
  console.log(data);
  //var e0 = data["points"][0]["epoch0"];
  var e0_x = data["points"].map(function (i) { return i["epoch0"][0] });
  var e0_y = data["points"].map(function (i) { return i["epoch0"][1] });
  //console.log(e0_y);

  var x = d3.scaleLinear()
    .range([margin.left, width])
    .domain(d3.extent(e0_x));

  var y = d3.scaleLinear()
    .range([height, margin.bottom])
    .domain([d3.max(e0_y), d3.min(e0_y)]);

  var xAxis = d3.axisBottom(x);
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  //var circle_1 = plot_epoch(data["points"], 0, -0.4, x, y, color);
  //plot_epoch(data["points"], 0, -0.6, x, y, color);
  /*plot_epoch(data["points"], 1, -0.4, x, y, color);
  plot_epoch(data["points"], 2, -0.2, x, y, color);
  plot_epoch(data["points"], 3, 0, x, y, color);
  plot_epoch(data["points"], 4, 0.2, x, y, color); */

  /* var lines = canvas.selectAll("line")
    .data(data["points"])
    .enter()
    .append("line")
    .attr("x1", function (d) {
      //console.log(x(d["epoch0"][0]));
      return x(d["epoch0"][0]);
    })
    .attr("x2", function (d) {
      //console.log(x(d["epoch1"][0]));
      return x(d["epoch1"][0]);
    })
    .attr("y1", function (d) {
      //console.log(y(d["epoch0"][1]));
      return y(d["epoch0"][1]);
    })
    .attr("y2", function (d) {
      //console.log(y(d["epoch1"][1]));
      return y(d["epoch1"][1]);
    })
    .attr("stroke", "grey")
    .attr('stroke-width', '1px')
    .attr('opacity', 0.7); */

  var line = d3.line()
    .x(function (d) { return x(d[0]) })
    .y(function (d) { return y(d[1]) })
    .curve(d3.curveBundle);

  /* var point_0 = [
    data["points"][0]["epoch0"],
    data["points"][0]["epoch1"],
    data["points"][0]["epoch2"],
    data["points"][0]["epoch3"],
    data["points"][0]["epoch4"]
  ];

  //console.log(point_0);
  var pathdata = line(point_0);
  //console.log(pathdata); */

  //set gradient for lines with label i
  for (var i = 0; i < 10; i++) {
    setGradient(i, colorLuminance(color(i), -0.8), colorLuminance(color(i), 0.4));
  }

  for (var i = 0; i < 500; i++) {
    gen_path(data, i, line);
  }

  //setGradient(9, colorLuminance(color(0), -0.6), colorLuminance(color(0), 0.2));
  /* canvas.append("path")
    .attr('d', pathdata)
    .attr("stroke", "url(#svgGradient9)")
    .attr("stroke-width", 2)
    .attr("fill", "none"); */
});


