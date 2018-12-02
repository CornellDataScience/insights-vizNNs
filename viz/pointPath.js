var margin = {
  top: 20,
  right: 20,
  bottom: 50,
  left: 20
},
  width = 900 - margin.left - margin.right,
  height = 900 - margin.top - margin.bottom;

var canvas = d3.select("body").append("svg").attr('width', width + margin.left + margin.right)
  .attr('height', height +
    margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

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

d3.json('layer2_layout.json', function (data) {
  console.log(data);
  //var e0 = data["points"][0]["epoch0"];
  var e0_x = data["points"].map(function (i) { return i["epoch0"][0] });
  var e0_y = data["points"].map(function (i) { return i["epoch0"][1] });
  //console.log(e0_y);

  var x = d3.scaleLinear()
    .range([0, width])
    .domain(d3.extent(e0_x));

  var y = d3.scaleLinear()
    .range([height, 0])
    .domain([d3.max(e0_y), d3.min(e0_y)]);

  var xAxis = d3.axisBottom(x);
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  //var circle_1 = plot_epoch(data["points"], 0, -0.4, x, y, color);
  plot_epoch(data["points"], 0, -0.6, x, y, color);
  plot_epoch(data["points"], 1, -0.4, x, y, color);
  plot_epoch(data["points"], 2, -0.2, x, y, color);
  plot_epoch(data["points"], 3, 0, x, y, color);
  plot_epoch(data["points"], 4, 0.2, x, y, color);

});


