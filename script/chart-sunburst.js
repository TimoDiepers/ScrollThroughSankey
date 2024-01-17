d3.json("data/data_grid.json").then((data) => {
  let darkmode = true;
  // Specify the chart’s dimensions.
  const width = 1600;
  const height = 1400;
  const radius = 320;
  //const fontFamily = "Arial"
  //const fontFamily = "Courier New, monospace"; //"Courier New, monospace"
  //const fontFamily = "Verdana, sans-serif"; //"Courier New, monospace"
  //const fontFamily = "Tahoma, sans-serif"; //"Courier New, monospace"
  const fontFamily = "Helvetica Neue, Helvetica, Arial, sans-serif";

  // Create the color scale.
  //const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
  const color = d3.scaleOrdinal(d3.schemeTableau10);

  // Compute the layout.
  const hierarchy = d3
    .hierarchy(data)
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value);
  const root = d3.partition().size([2 * Math.PI, hierarchy.height + 1])(
    hierarchy
  );
  root.each((d) => (d.current = d));

  let currentFocusDepth = 0;
  const total = hierarchy.value; // This represents the sum of all values.

  // Create the arc generator.
  const arc = d3
    .arc()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 5)
    .innerRadius((d) => d.y0 * radius)
    .outerRadius((d) => Math.max(d.y0 * radius, d.y1 * radius - 1) - 4)
    .cornerRadius(radius / 15);

  const offset = 150;
  // Create the SVG container.
  const svg = d3
    .select("#chart-sunburst")
    .attr("viewBox", [-width / 2, -height / 2 - offset, width, height + offset]) //Added  offset from middle
    .style("font-size", "2rem")
    .style("font-family", fontFamily)
    //.style("font-stretch", "condensed")
    //.style("letter-spacing", "-0.1rem")
    .style("fill", (d) => (darkmode ? "#F1F3F4" : "#262626"));

  // Append the arcs.
  const path = svg
    .append("g")
    .selectAll("path")
    .data(root.descendants().slice(1))
    .join("path")
    .attr("fill", (d) => {
      while (d.depth > 1) d = d.parent;
      return color(d.data.name);
    })
    .attr("fill-opacity", (d) => {
      if (arcVisible(d.current)) {
        if (!d.children) {
          return 0.4;
        } else if (d.depth === currentFocusDepth + 2) {
          // Node is in the outer layer of the current focus
          return 0.4; // Reduced opacity for outer layer
        } else {
          return 0.6;
        }
      } else {
        // Node is not visible
        return 0;
      }
    })
    .attr("pointer-events", (d) => (arcVisible(d.current) ? "auto" : "none"))
    .attr("d", (d) => arc(d.current));

  // Make them clickable if they have children.
  path
    .filter((d) => d.children)
    .style("cursor", "pointer")
    .on("click", clicked);

  const format = d3.format(",d");
  //path.append("title")
  //.text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

  const label = svg
    .append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .style("user-select", "none")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .join("text")
    .attr("dy", "0.35em")
    .attr("fill-opacity", (d) => +labelVisible(d.current))
    .attr("transform", (d) => labelTransform(d.current))
    .text((d) => d.data.name);

  const parent = svg
    .append("circle")
    .datum(root)
    .attr("r", radius)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .style("cursor", (d) => (currentFocusDepth === 0 ? "default" : "pointer"))
    .on("click", clicked);

  // Append a text element for the counter
  const counter = svg
    .append("text")
    .attr("class", "counter")
    .attr("x", 0) // X position
    .attr("y", -height / 2 + 70 - offset) // Y position
    .style("font-family", fontFamily)
    .style("font-size", "5rem")
    .style("font-weight", "bold")
    .style("fill", darkmode ? "#F1F3F4" : "#262626")
    .style("text-anchor", "middle")
    .text("0 kt CO2-eq"); // Initial text, update it as needed

  // Append a text element for the textBox
  const textBox = svg
    .append("text")
    .attr("class", "text-box")
    .attr("x", 0) // X position
    .attr("y", -height / 2 + 120 - offset) // Y position, adjust as needed
    .style("font-family", fontFamily)
    .style("font-size", "2.5rem")
    .style("fill", darkmode ? "#F1F3F4" : "#262626")
    .style("text-anchor", "middle")
    .text("Initial Text"); // Initial text, update it as needed

  // Handle zoom on click.
  let isTransitioning = false; // Flag to indicate if a transition is in progress

  const zoomTransitionDuration = 750;

  // Settings for mouseover effect
  const normalOpacity = 1; // Normal opacity for elements
  const fadedOpacity = 0.3; // Reduced opacity for non-hovered elements
  const fadeDuration = 150; // Duration of fade in milliseconds

  function clicked(event, p) {
    isTransitioning = true;
    currentFocusDepth = p.depth;

    tooltip
      .transition()
      .duration(100) // You can adjust the duration as needed
      .style("opacity", 0);

    parent.datum(p.parent || root);

    root.each(
      (d) =>
        (d.target = {
          x0:
            Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          x1:
            Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) *
            2 *
            Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth),
        })
    );

    const t = svg.transition().duration(zoomTransitionDuration);

    // Transition the data on all arcs, even the ones that aren’t visible,
    // so that if this transition is interrupted, entering arcs will start
    // the next transition from the desired position.
    path
      .transition(t)
      .tween("data", (d) => {
        const i = d3.interpolate(d.current, d.target);
        return (t) => (d.current = i(t));
      })
      .filter(function (d) {
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
      })
      //.attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
      .attr("fill-opacity", (d) => {
        if (arcVisible(d.target)) {
          if (!d.children) {
            return 0.4;
          } else if (d.depth === currentFocusDepth + 2) {
            // Node is in the outer layer of the current focus
            return 0.4; // Reduced opacity for outer layer
          } else {
            return 0.6;
          }
        } else {
          // Node is not visible
          return 0;
        }
      })
      .attr("pointer-events", (d) => (arcVisible(d.target) ? "auto" : "none"))
      .attrTween("d", (d) => () => arc(d.current))
      .on("end", function () {
        // Re-enable pointer events for each element after its transition ends
        d3.select(this).style("pointer-events", "auto");
        isTransitioning = false;
      })
      .style("opacity", normalOpacity);

    path
      .filter((d) => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

    parent.style("cursor", (d) =>
      currentFocusDepth === 0 ? "default" : "pointer"
    );

    label
      .filter(function (d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
      })
      .transition(t)
      .attr("fill-opacity", (d) => +labelVisible(d.target))
      .attrTween("transform", (d) => () => labelTransform(d.current));

    textBox
      .style("opacity", 0)
      //.text(`${p.data.name}\n${Math.round(p.value/1000000)} kt CO2-eq`)
      .text(p.data.name)
      .transition()
      .duration(750)
      .style("opacity", 1);

    updateCounter(p.value);
  }

  function arcVisible(d) {
    return d.y1 <= 2 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d) {
    //return false
    return d.y1 <= 2 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d) {
    const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
    const y = ((d.y0 + d.y1) / 2) * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }

  // Step 1: Create a tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("text-align", "left")
    .style("padding", "6px")
    .style("background", "#F1F3F4")
    .style("border", "0px")
    .style("border-radius", "6px")
    .style("pointer-events", "none")
    .style("font-size", "0.7rem")
    .style("font-family", fontFamily);

  function buildAncestorString(ancestors) {
    let result = "";
    for (let i = 0; i < ancestors.length; i++) {
      if (i > 0) {
        result += "<br>" + "&nbsp;".repeat(i * 2) + "→ ";
      }
      result += ancestors[i];
    }
    return result;
  }

  function buildAncestorStringTextbox(ancestors) {
    let result = "";
    for (let i = 1; i < ancestors.length; i++) {
      if (i > 1) {
        result += "<br>→ ";
      }
      result += ancestors[i];
    }
    return result;
  }

  function updateCounter(value, duration = zoomTransitionDuration) {
    let newVal = Math.round(value / 1000000);
    counter
      .transition()
      .duration(duration)
      .tween("text", function () {
        const that = d3.select(this);
        const i = d3.interpolateNumber(
          +that.text().replace(/ kt CO2-eq/, ""),
          newVal
        );
        return function (t) {
          that.text(Math.round(i(t)) + " kt CO2-eq");
        };
      });
  }

  function fadeOthers(element) {
    // Smoothly fade all elements
    svg
      .selectAll("path")
      .transition()
      .duration(fadeDuration)
      .style("opacity", fadedOpacity);

    // Highlight the current element
    d3.select(element)
      .transition()
      .duration(fadeDuration)
      .style("opacity", normalOpacity);
  }

  // Step 2: Show tooltip and fade other elements smoothly on mouseover
  path
    .on("mouseover", function (event, d) {
      if (isTransitioning) return;
      // Smoothly fade all elements
      fadeOthers(this);

      // Show tooltip
      tooltip.transition().duration(fadeDuration).style("opacity", 0.9);
      tooltip
        .html(
          `<span style="font-size: larger;"><b>${(
            (d.value / total) *
            100
          ).toFixed(2)} %</b> → ${Math.round(
            d.value / 1000000
          )} kt CO2-eq</span><br>${buildAncestorString(
            d.ancestors().map((d) => d.data.name)
          )}`
        )

        .style("left", event.pageX + 4 + "px")
        .style("top", event.pageY - 50 + "px");
    })
    .on("mousemove", function (event, d) {
      tooltip
        .style("left", event.pageX + 4 + "px")
        .style("top", event.pageY - 50 + "px");
    });

  // Step 3: Hide tooltip and smoothly restore element opacities on mouseout
  path.on("mouseout", function (d) {
    if (isTransitioning) return;
    // Smoothly restore opacity for all elements
    svg
      .selectAll("path")
      .transition()
      .duration(fadeDuration)
      .style("opacity", normalOpacity);

    // Hide tooltip
    tooltip.transition().duration(fadeDuration).style("opacity", 0);
  });

  textBox.text(root.data.name);

  counter.text(Math.round(root.value / 1000000) + " kt CO2-eq");
  //.text(`${root.data.name}\n ${Math.round(root.value/1000000)} kt CO2-eq`);

  window.root = root;
  window.returnToRoot = function () {
    clicked(null, root);
  };

  return svg.node();
});
