import { getColor } from "./colors.js";

export const generateUID = prefix =>
  `${prefix}-${Math.random().toString(36).slice(2, 11)}`;

export const removeBlanks = str =>
  str.replace(/[\s()]/g, '');

export const processLinks = (links, yearIndex) =>
  links.map(link => ({
    source: window.sankeyData.nodes[link.source].name,
    target: window.sankeyData.nodes[link.target].name,
    value: link.values[yearIndex]
  }));

// --- Utility Functions ---

const flipNodes = (nodes, svgWidth) => {
  nodes.forEach(d => {
    const { x0, x1 } = d;
    d.x0 = svgWidth - x1;
    d.x1 = svgWidth - x0;
  });
};

const setupSVG = (width, height, radius, verticalOffset) =>
  d3.select("#chart-sankey")
    .attr("width", width + 2 * radius)
    .attr("height", height)
    .attr("viewBox", [0, -verticalOffset, width, height + verticalOffset])
    .attr("style", "max-width: 100%; height: auto; font: 1rem sans-serif;");

const createSankeyLayout = (width, height) =>
  d3.sankey()
    .nodeId(d => d.name)
    .nodeAlign(d3.sankeyJustify)
    .nodeWidth(30)
    .nodePadding(30)
    .extent([[1, 5], [width - 1, height - 5]])
    .nodeSort((a, b) => {
      const isOtherA = a.name.toLowerCase().includes("other"),
            isOtherB = b.name.toLowerCase().includes("other");
      return isOtherA !== isOtherB ? (isOtherA ? 1 : -1) : b.value - a.value;
    });

const drawGradients = (svg, links) => {
  svg.append("defs").selectAll("linearGradient")
    .data(links)
    .join("linearGradient")
      .attr("id", d => removeBlanks(d.source.name) + "->" + removeBlanks(d.target.name))
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", d => d.source.x1)
      .attr("x2", d => d.target.x0)
    .call(grad => {
      grad.append("stop").attr("offset", "0%").attr("stop-color", d => getColor(d.source));
      grad.append("stop").attr("offset", "100%").attr("stop-color", d => getColor(d.target));
    });
};

const createTooltip = () =>
  d3.select("body").append("div")
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

// --- Drawing Helpers ---

const drawLinks = (svg, links, fadeDuration, normalOpacity, fadedOpacity, format, tooltip) =>
  svg.append("g")
    .attr("fill", "none")
    .attr("stroke-opacity", 0.4)
    .selectAll("path.link")
    .data(links, d => removeBlanks(d.source.name) + "->" + removeBlanks(d.target.name))
    .join("path")
      .attr("class", "link")
      .attr("id", d => removeBlanks(d.source.name) + "->" + removeBlanks(d.target.name))
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke", d => `url(#${removeBlanks(d.source.name) + "->" + removeBlanks(d.target.name)})`)
      .attr("stroke-width", d => Math.max(1, d.width))
      .style("mix-blend-mode", "normal")
      .on("mouseover", function (event, d) {
        svg.selectAll("path").transition().duration(fadeDuration).style("opacity", fadedOpacity);
        d3.select(this).transition().duration(fadeDuration).style("opacity", normalOpacity);
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`${d.source.name} → ${d.target.name}<br/>${format(d.value)} Mt CO2-eq`)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mousemove", event =>
        tooltip.style("left", `${event.pageX + 4}px`)
               .style("top", `${event.pageY - 50}px`)
      )
      .on("mouseout", () => {
        svg.selectAll("path").transition().duration(fadeDuration).style("opacity", normalOpacity);
        tooltip.transition().duration(500).style("opacity", 0);
      });

const drawNodes = (svg, nodes, radius, getColor, format, tooltip) =>
  svg.append("g")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 0)
    .selectAll("rect.node")
    .data(nodes, d => d.name)
    .join("rect")
      .attr("class", d => d.className || "node")
      .attr("x", d => d.x0 - radius)
      .attr("y", d => d.y0)
      .attr("rx", radius)
      .attr("ry", radius)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0 + 2 * radius)
      .attr("fill", d => getColor(d))
      .style("z-index", 1000)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`${d.name}<br/>${format(d.value)} Mt CO2-eq`)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mousemove", event =>
        tooltip.style("left", `${event.pageX + 4}px`)
               .style("top", `${event.pageY - 50}px`)
      )
      .on("mouseout", () =>
        tooltip.transition().duration(500).style("opacity", 0)
      );

const drawTitles = (svg, titlePositions, titles, fontsizeTitle) => {
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
};

const drawLabels = (svg, nodes, totalScore, fontsize) => {
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
        return `${d.name} (${perc < 0.01 ? "<0.1%" : perc.toFixed(1) + "%"})`;
      })
      .style("font-size", d => d.name === "grid status quo" ? `calc(${fontsize} * 1.3)` : fontsize)
      .style("fill", "#F1F3F4")
      .style("font-weight", d => d.name === "grid status quo" ? "bold" : "normal");
  
  window.labels.filter(d => d.name === "grid status quo")
    .append("tspan")
      .attr("x", d => d.x0 < 50 ? d.x1 + 25 : d.x0 - 25)
      .attr("dy", "1.2em")
      .attr("text-anchor", d => d.x0 < 50 ? "start" : "end")
      .text(d => d3.format(",.0f")(d.value) + " Mt CO2-eq")
      .style("font-size", "1em")
      .style("fill", "#F1F3F4");
};

// --- Main Functions ---

export function updateSankey(nodesData, linksData, delay = 0, transitionDuration = 600) {
  // Fade out unrelated elements.
  d3.selectAll(".bar2030, .bar2035, .bar2040, .bar2045, .year-label, .y-axis")
    .transition().duration(transitionDuration)
    .style("opacity", 0);

  const { nodes, links } = window.sankeyDia({
    nodes: nodesData.map(d => ({ ...d })),
    links: linksData.map(d => ({ ...d }))
  });

  const svgWidth = 1620;
  flipNodes(nodes, svgWidth);

  // Animate component nodes.
  d3.selectAll("rect.node.component")
    .transition().duration(transitionDuration)
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

  const radius = 10,
        format = d3.format(",.0f"),
        totalScore = d3.sum(
          links.filter(l => l.target.name === "grid status quo"),
          l => l.value
        );

  window.link = window.link.data(links, d =>
    removeBlanks(d.source.name) + "->" + removeBlanks(d.target.name)
  );
  window.link.transition().delay(delay).duration(transitionDuration)
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke-width", d => Math.max(1, d.width));

  window.rect = window.rect.data(nodes, d => d.name);
  window.rect.transition().delay(delay).duration(transitionDuration)
    .attr("stroke-width", 0)
    .attr("x", d => d.x0 - radius)
    .attr("y", d => d.y0)
    .attr("rx", radius)
    .attr("ry", radius)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0 + 2 * radius);

  window.labels = window.labels.data(nodes, d => d.name);
  window.labels.transition().delay(delay).duration(transitionDuration)
    .attr("x", d => d.x0 < 50 ? d.x1 + 25 : d.x0 - 25)
    .attr("y", d => (d.y1 + d.y0) / 2)
    .tween("text", function(d) {
      const sel = d3.select(this);
      sel.text("").append("tspan").text(d.name);
      const prev = +this.getAttribute("data-prev") || 0;
      const isGrid = d.name === "grid status quo";
      const next = isGrid ? d.value : (d.value / totalScore) * 100;
      this.setAttribute("data-prev", next);
      const interp = d3.interpolateNumber(prev, next);
      if (isGrid) {
        const tspan = sel.append("tspan")
          .attr("x", d.x0 < 50 ? d.x1 + 25 : d.x0 - 25)
          .attr("dy", "1.2em")
          .style("font-size", `calc(32px * 1.3)`);
        return t => tspan.text(format(interp(t)) + " Mt CO2-eq");
      } else {
        const tspan = sel.append("tspan").attr("class", "percent");
        return t => {
          const val = interp(t);
          tspan.text(` (${val < 0.1 ? "<0.1%" : `${val.toFixed(1)}%`})`);
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
        verticalOffset = 50,
        verticalOffsetTitles = 20,
        titlePositions = [
          { x: 360, y: -verticalOffsetTitles },
          { x: 940, y: -verticalOffsetTitles },
          { x: 1330, y: -verticalOffsetTitles }
        ],
        titles = ["components", "materials", "direct emissions"],
        format = d3.format(",.0f");

  const svg = setupSVG(width, height, radius, verticalOffset);
  const sankey = createSankeyLayout(width, height);
  window.sankeyDia = sankey;
  const { nodes, links } = sankey({
    nodes: nodesData.map(d => ({ ...d })),
    links: linksData.map(d => ({ ...d }))
  });
  flipNodes(nodes, width + 2 * radius);

  const totalScore = d3.sum(
    links.filter(l => l.target.name === "grid status quo"),
    l => l.value
  );
  const componentNames = links
    .filter(l => l.target.name === "grid status quo")
    .map(l => l.source.name);

  drawGradients(svg, links);

  const tooltip = createTooltip();
  const fadeDuration = 400,
        normalOpacity = 1,
        fadedOpacity = 0.3;

  window.link = drawLinks(svg, links, fadeDuration, normalOpacity, fadedOpacity, format, tooltip);
  window.rect = drawNodes(svg, nodes.map(d => {
    d.className = componentNames.includes(d.name) ? "node component" : "node other";
    return d;
  }), radius, getColor, format, tooltip);

  drawTitles(svg, titlePositions, titles, fontsizeTitle);
  drawLabels(svg, nodes, totalScore, fontsize);

  window.link.lower();
  window.rect.raise();
}