import { getColor } from "./colors.js";

// Helper to fade out and hide elements
function fadeOutAndHide(selector, duration = 800) {
    d3.selectAll(selector)
      .transition()
      .duration(duration)
      .style("opacity", 0)
      .on("end", function () {
        d3.select(this)
          .style("pointer-events", "none")
          .style("visibility", "hidden");
      });
  }
  
  export function hideAllButComponents() {
    ["rect.node.other", "text.label", "text.title", ".link"].forEach(sel =>
      fadeOutAndHide(sel)
    );
  }
  
  // --- Tooltip Helpers ---
  function getOrCreateTooltip() {
    let tooltip = d3.select(".tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body")
        .append("div")
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
    }
    return tooltip;
  }
  
  function attachTooltip(selection, tooltip, htmlFunc) {
    selection
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(typeof htmlFunc === "function" ? htmlFunc(d) : htmlFunc)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mousemove", event => {
        tooltip.style("left", `${event.pageX + 4}px`)
               .style("top", `${event.pageY - 50}px`);
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });
  }
  
  // --- Bar Chart Helpers ---
  function computeBarGroups(allData, years, componentOrder, barX, barY) {
    const groups = {};
    years.forEach(year => {
      let yOffset = 0;
      groups[year] = {};
      componentOrder.forEach(component => {
        const d = allData.find(e => e.year === year && e.component === component);
        if (d) {
          groups[year][component] = {
            x: barX(year),
            y: barY(yOffset + d.value),
            width: barX.bandwidth(),
            height: barY(yOffset) - barY(yOffset + d.value) - 8,
            value: d.value
          };
          yOffset += d.value;
        }
      });
    });
    return groups;
  }
  
  function styleYAxis(axisGroup, height) {
    axisGroup.selectAll("text")
      .style("fill", "#F1F3F4")
      .style("font-size", "40px");
    axisGroup.selectAll("path, line")
      .style("stroke", "#F1F3F4")
      .style("stroke-width", 3);
    axisGroup.append("text")
      .attr("class", "y-axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -100)
      .style("fill", "#F1F3F4")
      .style("font-size", "40px")
      .text("Global Warming Impact [Mt CO₂-eq]");
  }

  const formatValue = d3.format(",.0f");
  
  function appendYearBars(chart, year, componentOrder, barGroups, barX, height, radius, tooltip) {
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
      .call(sel => attachTooltip(sel, tooltip, d => `${d}<br/>${formatValue(barGroups[year][d].value)} Mt CO2-eq`))
      .transition()
      .duration(1000)
      .attr("opacity", 1)
      .attr("y", d => barGroups[year][d].y)
      .attr("height", d => barGroups[year][d].height);
  }
  
  function appendYearLabel(chart, barX, year, height) {
    chart.append("text")
      .attr("class", "year-label")
      .attr("x", barX(year) + barX.bandwidth() / 2)
      .attr("y", height * 0.95)
      .attr("text-anchor", "middle")
      .text(year)
      .style("fill", "#F1F3F4")
      .style("font-size", "40px")
      .style("opacity", 0)
      .transition()
      .duration(600)
      .style("opacity", 1);
  }
  
  // --- Main Bar Functions ---
  export function transformIntoBars({ allData, years, containerSelector = "#chart-sankey" }) {
    const svg = d3.select(containerSelector);
    const margin = { top: 20, right: 20, bottom: 60, left: 40 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;
    let chart = svg.select("g");
    if (chart.empty()) {
      chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    }
    const radius = 18;
    const tooltip = getOrCreateTooltip();
  
    // Scales
    const barX = d3.scaleBand()
      .domain(years)
      .range([width * 0.15, width])
      .padding(0.3);
    const barY = d3.scaleLinear()
      .domain([0, 100])
      .range([height * 0.9, height * 0.1]);
  
    const firstYear = years[0];
    const componentOrder = allData
      .filter(d => d.year === firstYear)
      .sort((a, b) => a.value - b.value)
      .map(d => d.component);
  
    const barGroups = computeBarGroups(allData, years, componentOrder, barX, barY);
  
    // Remove old bars and labels
    svg.selectAll("rect[class^='bar'], text.year-label")
      .transition().delay(300).duration(300).style("opacity", 0).remove();
    hideAllButComponents();
  
    // Update primary component nodes using first year's positions
    d3.selectAll("rect.node.component")
      .transition()
      .duration(600)
      .attr("x", d => (barGroups[firstYear][d.name]?.x) || d.x0)
      .attr("y", d => (barGroups[firstYear][d.name]?.y) || d.y0)
      .attr("rx", radius)
      .attr("ry", radius)
      .attr("width", d => (barGroups[firstYear][d.name]?.width) || (d.x1 - d.x0))
      .attr("height", d => (barGroups[firstYear][d.name]?.height) || (d.y1 - d.y0 - 8))
      .on("start", function (event, d) {
        const data = barGroups[firstYear][d.name];
        if (data) {
          attachTooltip(d3.select(this), tooltip, `${d.name}<br/>${data.value} Mt CO2-eq`);
        }
      });
  
    // Update the y-axis
    svg.selectAll(".y-axis").transition().duration(300).style("opacity", 0).remove();
    const yAxisGroup = svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${barX(firstYear) - 80},0)`)
      .attr("opacity", 0)
      .call(d3.axisLeft(barY).ticks(6));
    styleYAxis(yAxisGroup, height);
    yAxisGroup.transition().delay(200).duration(400).attr("opacity", 1);
  
    // Append the first-year label
    chart.append("text")
      .attr("class", "year-label")
      .attr("x", barX(firstYear) + barX.bandwidth() / 2)
      .attr("y", height * 0.95)
      .attr("text-anchor", "middle")
      .text(firstYear)
      .style("fill", "#F1F3F4")
      .style("font-size", "40px")
      .style("opacity", 0)
      .transition().delay(200).duration(400).style("opacity", 1);
  
    // Append bars and labels for additional years
    years.slice(1).forEach((year, i) => {
      setTimeout(() => {
        appendYearBars(chart, year, componentOrder, barGroups, barX, height, radius, tooltip);
        appendYearLabel(chart, barX, year, height);
      }, i * 100);
    });
  }
  
  export function updateBars(allData, years, containerSelector = "#chart-sankey") {
    const svg = d3.select(containerSelector);
    const margin = { top: 20, right: 20, bottom: 60, left: 40 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;
    let chart = svg.select("g");
    if (chart.empty()) {
      chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    }
    const radius = 18;
    const barX = d3.scaleBand()
      .domain(years)
      .range([width * 0.15, width])
      .padding(0.3);
    const barY = d3.scaleLinear()
      .domain([0, 100])
      .range([height * 0.9, height * 0.1]);
    const firstYear = years[0];
    const componentOrder = allData
      .filter(d => d.year === firstYear)
      .sort((a, b) => a.value - b.value)
      .map(d => d.component);
    const barGroups = computeBarGroups(allData, years, componentOrder, barX, barY);
    const tooltip = getOrCreateTooltip();
  
    // Update primary component bars for first year
    d3.selectAll("rect.node.component")
      .transition()
      .duration(800)
      .attr("x", d => (barGroups[firstYear][d.name]?.x) || d.x0)
      .attr("y", d => (barGroups[firstYear][d.name]?.y) || d.y0)
      .attr("rx", radius)
      .attr("ry", radius)
      .attr("width", d => (barGroups[firstYear][d.name]?.width) || (d.x1 - d.x0))
      .attr("height", d => (barGroups[firstYear][d.name]?.height) || (d.y1 - d.y0 - 8))
      .on("start", function (event, d) {
        const data = barGroups[firstYear][d.name];
        if (data) {
          attachTooltip(d3.select(this), tooltip, `${d.name}<br/>${data.value} Mt CO2-eq`);
        }
      });
  
    // Update y-axis
    svg.select(".y-axis")
      .transition()
      .duration(800)
      .call(d3.axisLeft(barY).ticks(6));
  
    // Update year labels for the first year
    chart.selectAll("text.year-label")
      .filter(function () { return d3.select(this).text() === firstYear; })
      .transition()
      .duration(400)
      .attr("x", barX(firstYear) + barX.bandwidth() / 2)
      .text(firstYear);
  
    // Update bars and labels for other years
    years.slice(1).forEach(year => {
      chart.selectAll(`rect.bar${year}`)
        .call(sel => attachTooltip(sel, tooltip, d => `${d}<br/>${barGroups[year][d].value} Mt CO2-eq`))
        .transition()
        .duration(600)
        .attr("x", d => barGroups[year][d].x)
        .attr("y", d => barGroups[year][d].y)
        .attr("rx", radius)
        .attr("ry", radius)
        .attr("width", d => barGroups[year][d].width)
        .attr("height", d => barGroups[year][d].height)
        .attr("fill", d => getColor({ name: d }));
  
      chart.selectAll("text.year-label")
        .filter(function () { return d3.select(this).text() === year; })
        .transition()
        .duration(600)
        .attr("x", barX(year) + barX.bandwidth() / 2)
        .text(year);
    });
  }