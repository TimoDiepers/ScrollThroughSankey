import { getColor } from "./colors.js";

function generateUID(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
}

function removeBlanks(str) {
  return str.replace(/[\s()]/g, '');
}

function processLinks(links, yearIndex) {
  return links.map(link => ({
    source: window.sankeyData.nodes[link.source].name,
    target: window.sankeyData.nodes[link.target].name,
    value: link.values[yearIndex]
  }));
}

export function updateSankey(nodesData, linksData, delay = 0, transitionDuration = 600) {
  // Fade out and remove other bar elements
  d3.selectAll(".bar2030, .bar2035, .bar2040, .bar2045, .year-label, .y-axis")
    .transition().duration(transitionDuration).style("opacity", 0).remove();

    
  const { nodes, links } = window.sankeyDia({
    nodes: nodesData.map(d => ({ ...d })),
    links: linksData.map(d => ({ ...d }))
  });

  const svgWidth = 1620;
  nodes.forEach(d => {
    const x0 = d.x0;
    const x1 = d.x1;
    d.x0 = svgWidth - x1;
    d.x1 = svgWidth - x0;
  });

  // Animate rect.node.component back to Sankey layout
  d3.selectAll("rect.node.component")
    .transition()
    .duration(transitionDuration)
    .attr("x", d => {
      const node = nodes.find(n => n.name === d.name);
      return node ? node.x0 - 10 : d.x;
    })
    .attr("y", d => {
      const node = nodes.find(n => n.name === d.name);
      return node ? node.y0 : d.y;
    })
    .attr("width", d => {
      const node = nodes.find(n => n.name === d.name);
      return node ? node.x1 - node.x0 + 20 : d.width;
    })
    .attr("height", d => {
      const node = nodes.find(n => n.name === d.name);
      return node ? node.y1 - node.y0 : d.height;
    });
    
  const width = 1600,
        radius = 10,
        format = d3.format(",.0f");
  const totalScore = d3.sum(
    links.filter(l => l.target.name === "grid status quo"),
    l => l.value
  );

  window.link = window.link.data(links, d =>
    removeBlanks(d.source.name) + "->" + removeBlanks(d.target.name)
  );
  window.link.transition()
    .delay(delay)
    .duration(transitionDuration)
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke-width", d => Math.max(1, d.width));

  window.rect = window.rect.data(nodes, d => d.name);
  window.rect.transition()
    .delay(delay)
    .duration(transitionDuration)
    .attr("x", d => d.x0 - radius)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0 + radius * 2);

  window.labels = window.labels.data(nodes, d => d.name);
  window.labels.transition()
    .delay(delay)
    .duration(transitionDuration)
    .attr("x", d => d.x0 < 50 ? d.x1 + 25 : d.x0 - 25)
    .attr("y", d => (d.y1 + d.y0) / 2)
    .tween("text", function(d) {
      const sel = d3.select(this);
      sel.text("").append("tspan").text(d.name);
      const prev = +this.getAttribute("data-prev") || 0;
      let next, interpolate, tspan;

      if (d.name === "grid status quo") {
        next = d.value;
        interpolate = d3.interpolateNumber(prev, next);
        this.setAttribute("data-prev", next);
        tspan = sel.append("tspan")
          .attr("x", d.x0 < 50 ? d.x1 + 25 : d.x0 - 25)
          .attr("dy", "1.2em")
          .style("font-size", "`calc(${fontsize} * 1.3)`");
        return t => {
          tspan.text(format(interpolate(t)) + " Mt CO2-eq");
        };
      } else {
        next = (d.value / totalScore) * 100;
        interpolate = d3.interpolateNumber(prev, next);
        this.setAttribute("data-prev", next);
        tspan = sel.append("tspan").attr("class", "percent");
        return t => {
          const val = interpolate(t);
          const formatted = val < 0.1 ? "<0.1%" : `${val.toFixed(1)}%`;
          tspan.text(` (${formatted})`);
        };
      }
    })
    .style("fill", "#F1F3F4");
}


export function renderSankey(nodesData, linksData) {
  d3.select("#chart-sankey").selectAll("*").remove();
  drawSankey(nodesData, linksData);
}

function drawSankey(nodesData, linksData) {
  const fontsize = "32px",
        fontsizeTitle = "38px",
        width = 1600,
        height = 1200,
        radius = 10,
        format = d3.format(",.0f"),
        verticalOffset = 50,
        verticalOffsetTitles = 20;
  const titlePositions = [
    { x: 360, y: -verticalOffsetTitles },
    { x: 940, y: -verticalOffsetTitles },
    { x: 1330, y: -verticalOffsetTitles }
  ];
  // Create SVG container
  const svg = d3.select("#chart-sankey")
    .attr("width", width + radius * 2)
    .attr("height", height)
    .attr("viewBox", [0, -verticalOffset, width, height + verticalOffset])
    .attr("style", "max-width: 100%; height: auto; font: 1rem sans-serif;");

  // Configure Sankey generator
  const sankeyDia = d3.sankey()
    .nodeId(d => d.name)
    .nodeAlign(d3.sankeyJustify)
    .nodeWidth(30)
    .nodePadding(30)
    .extent([[1, 5], [width - 1, height - 5]])
    .nodeSort((a, b) => {
      const isOtherA = a.name.toLowerCase().includes("other");
      const isOtherB = b.name.toLowerCase().includes("other");
      if (isOtherA && !isOtherB) return 1;
      if (!isOtherA && isOtherB) return -1;
      return b.value - a.value;
    });

  window.sankeyDia = sankeyDia;

  // Apply the generator
  const { nodes, links } = sankeyDia({
    nodes: nodesData.map(d => ({ ...d })),
    links: linksData.map(d => ({ ...d }))
  });

  const svgWidth = width + 2 * radius;
  // Flip x positions
  nodes.forEach(d => {
    const x0 = d.x0;
    const x1 = d.x1;
    d.x0 = svgWidth - x1;
    d.x1 = svgWidth - x0;
  });

  const totalScore = d3.sum(
    links.filter(l => l.target.name === "grid status quo"),
    l => l.value
  );

  const componentNames = links
    .filter(l => l.target.name === "grid status quo")
    .map(l => l.source.name);

  // Tooltip setup
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("padding", "6px")
    .style("background", "#F1F3F4")
    .style("border", "0px")
    .style("border-radius", "6px")
    .style("pointer-events", "none")
    .style("font-size", "0.7rem")
    .style("font-family", "sans-serif")
    .style("color", "black")
    .style("z-index", 1000);

  const normalOpacity = 1,
        fadedOpacity = 0.3,
        fadeDuration = 400;

  // Create gradients for link coloring
  svg.append("defs").selectAll("linearGradient")
    .data(links)
    .join("linearGradient")
      .attr("id", d => removeBlanks(d.source.name) + "->" + removeBlanks(d.target.name))
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", d => d.source.x1)
      .attr("x2", d => d.target.x0)
    .call(grad => {
      grad.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d => getColor(d.source));
      grad.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d => getColor(d.target));
    });

  // Fade non-hovered links
  const fadeOtherLinks = element => {
    svg.selectAll("path")
      .transition().duration(fadeDuration)
      .style("opacity", fadedOpacity);
    d3.select(element)
      .transition().duration(fadeDuration)
      .style("opacity", normalOpacity);
  };

  // Draw links
  window.link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke-opacity", 0.4)
    .selectAll("path.link")
    .data(links, d => removeBlanks(d.source.name) + "->" + removeBlanks(d.target.name))
    .join("path")
      .attr("class", "link")
      .attr("id", d => removeBlanks(d.source.name) + "->" + removeBlanks(d.target.name))
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke", d =>
        `url(#${removeBlanks(d.source.name) + "->" + removeBlanks(d.target.name)})`
      )
      .attr("stroke-width", d => Math.max(1, d.width))
      .style("mix-blend-mode", "normal")
      .on("mouseover", function (event, d) {
        fadeOtherLinks(this);
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`${d.source.name} → ${d.target.name}<br/>${format(d.value)} Mt CO2-eq`)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", `${event.pageX + 4}px`)
          .style("top", `${event.pageY - 50}px`);
      })
      .on("mouseout", () => {
        svg.selectAll("path").transition().duration(fadeDuration).style("opacity", normalOpacity);
        tooltip.transition().duration(500).style("opacity", 0);
      });

  // Draw nodes
  window.rect = svg.append("g")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 0)
    .selectAll("rect.node")
    .data(nodes, d => d.name)
    .join("rect")      
      .attr("class", d => componentNames.includes(d.name) ? "node component" : "node other")
      .attr("x", d => d.x0 - radius)
      .attr("y", d => d.y0)
      .attr("rx", radius)
      .attr("ry", radius)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0 + radius * 2)
      .attr("fill", d => getColor(d))
      .style("z-index", 1000)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`${d.name}<br/>${format(d.value)} Mt CO2-eq`)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", `${event.pageX + 4}px`)
          .style("top", `${event.pageY - 50}px`);
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });

  // Add titles for groups
  const titles = ["components", "materials", "direct emissions"];
  const titleGroup = svg.append("g");
  titles.forEach((title, i) => {
    titleGroup.append("text")
      .attr("x", titlePositions[i].x)
      .attr("y", titlePositions[i].y)
      .text(title)
      .style("font-size", fontsizeTitle)
      .style("fill", "#F1F3F4")
      .style("font-weight", "bold")
      .attr("class", "title");
  });

  // Add labels
  window.labels = svg.append("g")
    .selectAll("text.label")
    .data(nodes, d => d.name)
    .join("text")
      .attr("class", "label")
      .attr("x", d => d.x0 < 50 ? d.x1 + 25 : d.x0 - 25)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < 50 ? "start" : "end")
      .text(d => {
        if (d.name === "grid status quo") return d.name;
        const perc = (d.value / totalScore) * 100;
        const percText = perc < 0.01 ? "<0.1%" : `${perc.toFixed(1)}%`;
        return `${d.name} (${percText})`;
      })
      .style("font-size", d => d.name === "grid status quo" ? `calc(${fontsize} * 1.3)` : fontsize)
      .style("fill", "#F1F3F4")
      .style("font-weight", d => d.name === "grid status quo" ? "bold" : "normal");

  // Append additional tspan for "grid status quo"
  window.labels.filter(d => d.name === "grid status quo")
    .append("tspan")
      .attr("x", d => d.x0 < 50 ? d.x1 + 25 : d.x0 - 25)
      .attr("dy", "1.2em")
      .attr("text-anchor", d => d.x0 < 50 ? "start" : "end")
      .text(d => format(d.value) + " Mt CO2-eq")
      .style("font-size", "1em")
      .style("fill", "#F1F3F4");

  // Ensure links stay beneath nodes
  window.link.lower();
  window.rect.raise();
}

export function transformIntoBars({ allData, years, containerSelector = "#chart-sankey" }) {
  const svg = d3.select(containerSelector);
  const margin = { top: 20, right: 20, bottom: 60, left: 40 };
  const width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;
  const chart = svg.select("g").size() ? svg.select("g") : svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const radius = 10;

  const tooltip = d3.select(".tooltip").size()
    ? d3.select(".tooltip")
    : d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("padding", "6px")
        .style("background", "#F1F3F4")
        .style("border", "0px")
        .style("border-radius", "6px")
        .style("pointer-events", "none")
        .style("font-size", "0.7rem")
        .style("font-family", "sans-serif")
        .style("color", "black")
        .style("z-index", 1000);

  const barX = d3.scaleBand()
    .domain(years)
    .range([width*0.15, width])
    .padding(0.3);

  const barY = d3.scaleLinear()
    .domain([0, 100])
    .range([height*0.9, height*0.1]);

  const firstYear = years[0];

  const componentOrder = allData
    .filter(d => d.year === firstYear)
    .sort((a, b) => a.value - b.value)
    .map(d => d.component);

  const barGroups = {};
  years.forEach(year => {
    let yOffset = 0;
    barGroups[year] = {};
    componentOrder.forEach(component => {
      const d = allData.find(e => e.year === year && e.component === component);
      if (d) {
        const heightVal = barY(yOffset) - barY(yOffset + d.value);
        barGroups[year][component] = {
          x: barX(year),
          y: barY(yOffset + d.value),
          width: barX.bandwidth(),
          height: heightVal,
          value: d.value
        };
        yOffset += d.value;
      }
    });
  });

  d3.selectAll("rect.node.other")
    .transition()
    .duration(800)
    .style("opacity", 0)
    .on("end", function() {
      d3.select(this)
        .style("pointer-events", "none")
        .style("visibility", "hidden");
    });
  d3.selectAll("text.label")
    .transition()
    .duration(800)
    .style("opacity", 0)    
    .on("end", function() {
      d3.select(this)
        .style("pointer-events", "none")
        .style("visibility", "hidden");
    });
  d3.selectAll("text.title")
    .transition()
    .duration(800)
    .style("opacity", 0)
    .on("end", function() {
      d3.select(this)
        .style("pointer-events", "none")
        .style("visibility", "hidden");
    });
  d3.selectAll(".link")
    .transition()
    .duration(800)
    .style("opacity", 0)
    .on("end", function() {
      d3.select(this)
        .style("pointer-events", "none")
        .style("visibility", "hidden");
    });
  d3.selectAll("rect.node.component")
    .transition()
    .duration(1000)
    .attr("x", d => barGroups[firstYear][d.name]?.x ?? d.x0)
    .attr("y", d => barGroups[firstYear][d.name]?.y ?? d.y0)
    .attr("width", d => barGroups[firstYear][d.name]?.width ?? d.x1 - d.x0)
    .attr("height", d => barGroups[firstYear][d.name]?.height ?? d.y1 - d.y0)
    .on("start", function(event, d) {
      const val = barGroups[firstYear][d.name]?.value;
      if (val !== undefined) {
        d3.select(this)
          .on("mouseover", function (event) {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`${d.name}<br/>${val} Mt CO2-eq`)
              .style("left", `${event.pageX}px`)
              .style("top", `${event.pageY - 28}px`);
          })
          .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 4}px`)
              .style("top", `${event.pageY - 50}px`);
          })
          .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
          });
      }
    });

  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${barX(firstYear) - 80},0)`)
    .attr("opacity", 0)
    .call(d3.axisLeft(barY).ticks(6))
    .call(g => {
      g.selectAll("text")
        .style("fill", "#F1F3F4")
        .style("font-size", "40px");

      g.selectAll("path, line")
        .style("stroke", "#F1F3F4")
        .style("stroke-width", 3);

      g.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`)
        .attr("x", -height / 2)
        .attr("y", -100)
        .style("fill", "#F1F3F4")
        .style("font-size", "40px")
        .text("Global Warming Impact [Mt CO₂-eq]");
    })
    .transition()
    .delay(400)
    .duration(800)
    .attr("opacity", 1);

  chart.append("text")
    .attr("class", "year-label")
    .attr("x", barX(firstYear) + barX.bandwidth() / 2)
    .attr("y", height*0.95)
    .attr("text-anchor", "middle")
    .text(firstYear)
    .style("fill", "#F1F3F4")
    .style("font-size", "40px")
    .style("opacity", 0)
    .transition()
    .delay(400)
    .duration(400)
    .style("opacity", 1);

  setTimeout(() => {
    years.slice(1).forEach((year, i) => {
      setTimeout(() => {
        chart.append("g")
          .selectAll(`.bar${year}`)
          .data(componentOrder)
          .enter()
          .append("rect")
          .attr("class", `bar${year}`)
          .attr("x", d => barGroups[year][d].x)
          .attr("y", d => barGroups[year][d].y + barGroups[year][d].height)
          .attr("rx", radius)
          .attr("ry", radius)
          .attr("width", d => barGroups[year][d].width)
          .attr("height", 0)
          .attr("fill", d => getColor({ name: d }))
          .attr("opacity", 0)
          .on("mouseover", function (event, d) {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`${d}<br/>${barGroups[year][d].value} Mt CO2-eq`)
              .style("left", `${event.pageX}px`)
              .style("top", `${event.pageY - 28}px`);
          })
          .on("mousemove", (event) => {
            tooltip.style("left", `${event.pageX + 4}px`)
              .style("top", `${event.pageY - 50}px`);
          })
          .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
          })
          .transition()
          .duration(1000)
          .attr("opacity", 1)
          .attr("y", d => barGroups[year][d].y)
          .attr("height", d => barGroups[year][d].height);

        chart.append("text")
          .attr("class", "year-label")
          .attr("x", barX(year) + barX.bandwidth() / 2)
          .attr("y", height*0.95)
          .attr("text-anchor", "middle")
          .text(year)
          .style("fill", "#F1F3F4")
          .style("font-size", "40px")
          .style("opacity", 0)
          .transition()
          .duration(1000)
          .style("opacity", 1);
      }, i * 200);
    });
  }, 500);
}