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

// generate the average points across the 2nd and 3rd epochs. 
// generate the average middle two points
// if clearly an outlier then don't use the average point
// TODO: might want to rewrite to be medians bc of possible outliers
function gen_averages(data) {
  var label_sum_1 = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
  var label_sum_2 = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
  var label_count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  data["points"].map(function (d) {
    label_count[d["label"]]++;

    label_sum_1[d["label"]][0] += d["epoch1"][0];
    label_sum_1[d["label"]][1] += d["epoch1"][1];

    label_sum_2[d["label"]][0] += d["epoch2"][0];
    label_sum_2[d["label"]][1] += d["epoch2"][1];
  });

  for (var i = 0; i < 10; i++) {
    label_sum_1[i][0] /= label_count[i];
    label_sum_1[i][1] /= label_count[i];

    label_sum_2[i][0] /= label_count[i];
    label_sum_2[i][1] /= label_count[i];
  }
  return [label_sum_1, label_sum_2];
}

/* determines if the anchor points are far off enough from average
  that should use the original point instead. 
  TODO: find average/median distance away from the avg 
*/
function check_outlier(orig_point, avg_point, max_dist) {
  //find the distance between original and average point
  var dist = Math.sqrt(
    (orig_point[0] - avg_point[0]) ** 2
    + (orig_point[1] - avg_point[1]) ** 2
  );
  return dist > max_dist ? orig_point : avg_point;

}

function gen_path(data, index, line, opts) {
  var label = data["points"][index]["label"];
  var points;

  if (opts["epoch1_list"] && opts["epoch2_list"]) {
    e1_point = check_outlier(data["points"][index]["epoch1"], opts["epoch1_list"][label], 0.011);
    e2_points = check_outlier(data["points"][index]["epoch2"], opts["epoch2_list"][label], 0.011);
    points = [
      data["points"][index]["epoch0"],
      e1_point,
      e2_points,
      data["points"][index]["epoch3"]
    ];
  }
  else {
    points = [
      data["points"][index]["epoch0"],
      data["points"][index]["epoch1"],
      data["points"][index]["epoch2"],
      //data["points"][index]["epoch3"]
      data["points"][index]["epoch4"]
    ];
  }

  var pathdata = line(points);

  canvas.append("path")
    .attr('d', pathdata)
    .attr('class', "path" + label)
    .attr("stroke", "url(#svgGradient" + label + ")")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr('stroke-dasharray', '385 385')
    .attr('stroke-dashoffset', 385)
    .transition()
    .duration(6000)
    .attr('stroke-dashoffset', 0);;
}

function gen_extent(data) {
  x = [];
  y = [];
  for (var i = 0; i < 500; i++) {
    x.push(data["points"][i]["epoch0"][0]);
    x.push(data["points"][i]["epoch1"][0]);
    x.push(data["points"][i]["epoch2"][0]);
    x.push(data["points"][i]["epoch3"][0]);
    x.push(data["points"][i]["epoch4"][0]);

    y.push(data["points"][i]["epoch0"][1]);
    y.push(data["points"][i]["epoch1"][1]);
    y.push(data["points"][i]["epoch2"][1]);
    y.push(data["points"][i]["epoch3"][1]);
    y.push(data["points"][i]["epoch4"][1]);
  }
  return [x, y];//[d3.max(x), d3.min(x), d3.max(y), d3.min(y)];
}

d3.json('layer2_layout.json', function (data) {
  console.log(data);

  var e0_x = data["points"].map(function (i) { return i["epoch0"][0] });
  var e0_y = data["points"].map(function (i) { return i["epoch0"][1] });

  var point_range = gen_extent(data);
  var y_min = d3.min(point_range[1]);
  var y_max = d3.max(point_range[1]);
  /* console.log(d3.extent(point_range[0]));
  console.log(d3.extent(e0_x));
  console.log("\n");

  console.log(d3.max(point_range[1]));
  console.log(d3.max(e0_y));
  console.log("\n");

  console.log(d3.min(point_range[1]));
  console.log(d3.min(e0_y)); */

  var x = d3.scaleLinear()
    .range([margin.left, width - margin.right])
    .domain(d3.extent(point_range[0]));

  var y = d3.scaleLinear()
    .range([height, margin.bottom])
    .domain([y_max, y_min]);

  var xAxis = d3.axisBottom(x);
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  var line = d3.line()
    .x(function (d) {
      return x(d[0]);
      //return typeof (d) == "undefined" ? "" : x(d[0]);
    })
    .y(function (d) {
      //console.log(y(d[1]));

      return y(d[1])
      //return typeof (d) == "undefined" ? "" : y(d[1]); 
    })
    .curve(d3.curveBundle.beta(0.5));

  //set gradient for lines with label i
  var l_color, r_color;
  for (var i = 0; i < 10; i++) {
    l_color = d3.rgb(color(i)).darker(10);
    r_color = d3.rgb(color(i)).brighter(1);
    console.log(d3.rgb(color(i)));
    console.log(d3.rgb(color(i)).darker(0.8));
    setGradient(i, l_color, r_color);
  }

  avgs = gen_averages(data);

  for (var i = 0; i < 500; i++) {
    gen_path(data, i, line, { "epoch1_list": avgs[0], "epoch2_list": avgs[1] });
    //gen_path(data, i, line, {});
  }

  var legend = canvas.selectAll('legend')
    .data(color.domain()).enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function (d, i) { return 'translate(0,' + i * 20 + ')'; });
  legend.append('rect')
    .attr('x', width)
    .attr('width', 14)
    .attr('height', 14)
    .attr('fill', color)
  //.attr('fill',function(d){return typeof(d)!='undefined' ? color: 'white';});
  legend.append('text')
    .attr('x', width - 6)
    .attr('y', 11)
    .attr('text-anchor', 'end')
    .text(function (d) { return d; })
    .attr('height, 7')
  legend
    .on("mouseover", function (d, i) {
      canvas.selectAll("path").attr('opacity', 0.1);
      canvas.selectAll(".path" + d).attr('opacity', 1);
    })
    .on("mouseout", function (d) {
      canvas.selectAll("path").attr("opacity", 1);
    });;
});

