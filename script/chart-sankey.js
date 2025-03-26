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
  const { nodes, links } = window.sankeyDia({
    nodes: nodesData.map(d => ({ ...d })),
    links: linksData.map(d => ({ ...d }))
  });

  const svgWidth = 1620;
  // Flip x positions
  nodes.forEach(d => {
    const x0 = d.x0;
    const x1 = d.x1;
    d.x0 = svgWidth - x1;
    d.x1 = svgWidth - x0;
  });

  const width = 1600,
        radius = 10,
        format = d3.format(",.0f");
  const totalScore = d3.sum(
    links.filter(l => l.target.name === "grid status quo"),
    l => l.value
  );

  // Update links
  window.link = window.link.data(links, d =>
    removeBlanks(d.source.name) + "->" + removeBlanks(d.target.name)
  );
  window.link.transition()
    .delay(delay)
    .duration(transitionDuration)
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke-width", d => Math.max(1, d.width));

  // Update nodes
  window.rect = window.rect.data(nodes, d => d.name);
  window.rect.transition()
    .delay(delay)
    .duration(transitionDuration)
    .attr("x", d => d.x0 - radius)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0 + radius * 2);

  // Update labels with animated text transitions
  window.labels = window.labels.data(nodes, d => d.name);
  window.labels.transition()
    .delay(delay)
    .duration(transitionDuration)
    .attr("x", d => d.x0 < 50 ? d.x1 + 20 : d.x0 - 20)
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
          .attr("x", d.x0 < 50 ? d.x1 + 20 : d.x0 - 20)
          .attr("dy", "1.2em")
          .style("font-size", "1em");
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
      .attr("class", "node")
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
      .attr("x", d => d.x0 < 50 ? d.x1 + 20 : d.x0 - 20)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < 50 ? "start" : "end")
      .text(d => {
        if (d.name === "grid status quo") return d.name;
        const perc = (d.value / totalScore) * 100;
        const percText = perc < 0.01 ? "<0.1%" : `${perc.toFixed(1)}%`;
        return `${d.name} (${percText})`;
      })
      .style("font-size", fontsize)
      .style("fill", "#F1F3F4")
      .style("font-weight", d => d.name === "grid status quo" ? "bold" : "normal");

  // Append additional tspan for "grid status quo"
  window.labels.filter(d => d.name === "grid status quo")
    .append("tspan")
      .attr("x", d => d.x0 < 50 ? d.x1 + 20 : d.x0 - 20)
      .attr("dy", "1.2em")
      .attr("text-anchor", d => d.x0 < 50 ? "start" : "end")
      .text(d => format(d.value) + " Mt CO2-eq")
      .style("font-size", "1em")
      .style("fill", "#F1F3F4");

  // Ensure links stay beneath nodes
  window.link.lower();
  window.rect.raise();
}