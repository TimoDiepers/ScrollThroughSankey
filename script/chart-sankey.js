function generateUID(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 11)}`;
}

function removeBlanks(str) {
  return str.replace(/\s+/g, '');
}

Promise.all([
  d3.csv("data/sankey_data_with_substations-8.csv"),
  d3.csv("data/sankey_data_with_substations-8_2045.csv"),
]).then(([slinks2023, slinks2045]) => {
  
  const snodes2023 = Array.from(new Set(slinks2023.flatMap(l => [l.source, l.target])), name => ({name, category: name.replace(/ .*/, "")})).map(d => Object.assign({}, d));
  const snodes2045 = Array.from(new Set(slinks2045.flatMap(l => [l.source, l.target])), name => ({name, category: name.replace(/ .*/, "")})).map(d => Object.assign({}, d));

  window.slinks2023 = slinks2023;
  window.slinks2045 = slinks2045;
  window.snodes2023 = snodes2023;
  window.snodes2045 = snodes2045;

  renderSankey(snodes2023, slinks2023);
});

function renderSankey(nodesData, linksData) {
  const sankeyElements = d3.select("#chart-sankey").selectAll("*");
  sankeyElements.remove()

  // Immediately proceed with rendering the new Sankey
  drawSankey(nodesData, linksData); // Call a separate function for rendering
}

function drawSankey(nodesData, linksData) {

  const linkColor = "source-target";

  const darkmode = true;
  const blau100 = "#00549F";
  const blau75 = "#407FB7";
  const blau50 = "#8EBAE5";
  const blau25 = "#C7DDF2";
  const blau10 = "#E8F1FA";
  const schwarz100 = "#000000";
  const schwarz75 = "#646567";
  const schwarz50 = "#9C9E9F";
  const schwarz25 = "#CFD1D2";
  const schwarz10 = "#ECEDED";
  const magenta100 = "#E30066";
  const magenta75 = "#E96088";
  const magenta50 = "#F19EB1";
  const magenta25 = "#F9D2DA";
  const magenta10 = "#FDEEF0";
  const gelb100 = "#FFED00";
  const gelb75 = "#FFF055";
  const gelb50 = "#FFF59B";
  const gelb25 = "#FFFAD1";
  const gelb10 = "#FFFDEE";
  const petrol100 = "#006165";
  const petrol75 = "#2D7F83";
  const petrol50 = "#7DA4A7";
  const petrol25 = "#BFD0D1";
  const petrol10 = "#E6ECEC";
  const tuerkis100 = "#0098A1";
  const tuerkis75 = "#00B1B7";
  const tuerkis50 = "#89CCCF";
  const tuerkis25 = "#CAE7E7";
  const tuerkis10 = "#EBF6F6";
  const gruen100 = "#57AB27";
  const gruen75 = "#8DC060";
  const gruen50 = "#B8D698";
  const gruen25 = "#DDEBCE";
  const gruen10 = "#F2F7EC";
  const maigruen100 = "#BDCD00";
  const maigruen75 = "#D0D95C";
  const maigruen50 = "#E0E69A";
  const maigruen25 = "#F0F3D0";
  const maigruen10 = "#F9FAED";
  const orange100 = "#F6A800";
  const orange75 = "#FABE50";
  const orange50 = "#FDD48F";
  const orange25 = "#FEEAC9";
  const orange10 = "#FFF7EA";
  const rot100 = "#CC071E";
  const rot75 = "#D85C41";
  const rot50 = "#E69679";
  const rot25 = "#F3CDBB";
  const rot10 = "#FAEBE3";
  const bordeaux100 = "#A11035";
  const bordeaux75 = "#B65256";
  const bordeaux50 = "#CD8B87";
  const bordeaux25 = "#E5C5C0";
  const bordeaux10 = "#F5E8E5";
  const violett100 = "#612158";
  const violett75 = "#834E75";
  const violett50 = "#A8859E";
  const violett25 = "#D2C0CD";
  const violett10 = "#EDE5EA";
  const lila100 = "#7A6FAC";
  const lila75 = "#9B91C1";
  const lila50 = "#BCB5D7";
  const lila25 = "#DEDAEB";
  const lila10 = "#F2F0F7";

  const labelColorMapping = {
    "grid status quo": blau100,
    "substations": gruen100,
    "overhead lines": petrol100,
    "cables": violett100,
    "transformers": bordeaux100,
    "switchgears": rot100,
    "concrete & cement": orange100,
    "aluminium": tuerkis100,
    "copper": maigruen100,
    "iron & steel": bordeaux75,
    "clinker": rot100,
    "electricity": violett75,
    "aluminium (process emissions)": tuerkis50,
    "iron & steel (process emissions)": bordeaux50,
    "coal": schwarz75,
    "heat": bordeaux75,
    "SF6": gelb100,
    // Add other mappings as needed
    };
  const fontsize = "32px"; 
  const fontsizeTitle = "38px"
  // Specify the dimensions of the chart.
  const width = 1600;
  const height = 1200;
  const format = d3.format(",.0f");
  const radius = 10; //of rect
  const totalScore = 397.306839

    // for titles
  const verticalOffset = 50
  const verticalOffsetTitles = 20
  const titlePositions = [
    { x: 0, y: -verticalOffsetTitles},   // Position for "direct emissions"
    { x: 525, y: -verticalOffsetTitles},  // Position for "materials"
    { x: 1050, y: -verticalOffsetTitles}   // Position for "components"
  ];

  // Create a SVG container.
  const svg = d3
      .select("#chart-sankey")
      .attr("width", width + radius * 2)
      .attr("height", height)
      .attr("viewBox", [0, -verticalOffset, width, height+verticalOffset])
      .attr("style", "max-width: 100%; height: auto; font: 1rem sans-serif;");

  // Constructs and configures a Sankey generator.
  const sankeyDia = d3.sankey()
      .nodeId(d => d.name)
      .nodeAlign(d3.sankeyJustify) // d3.sankeyLeft, etc.
      .nodeWidth(30)
      .nodePadding(30)
      .extent([[1, 5], [width - 1, height - 5]])

  // Applies it to the data. We make a copy of the nodes and links objects
  // so as to avoid mutating the original.
  const {nodes, links} = sankeyDia({
    nodes: nodesData.map(d => ({...d})),
    links: linksData.map(d => ({...d})),
  });

  const tooltip = d3.select("body").append("div")
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
    .style("font-family", "sans-serif")
    .style("z-index", 1000) // Set a high z-index value
    
  const color = d => labelColorMapping[d.name] || "rgb(156,158,159)"; // default color if not mapped
  
  const normalOpacity = 1; // Normal opacity for elements
  const fadedOpacity = 0.3; // Reduced opacity for non-hovered elements
  const fadeDuration = 400; // Duration of fade in milliseconds

  // Adds a title on the nodes.
  //rect.append("title")
    //  .text(d => `${d.name}\n${format(d.value)} TWh`);
  // Creates the paths that represent the links.
  const link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke-opacity", 0.5)
    .selectAll("g")
    .data(links)
    .join("g")
      .style("mix-blend-mode", "normal");

  // Creates a gradient for the source-target color option.
  const gradient = svg.append("defs").selectAll("linearGradient")
      .data(links)
      .join("linearGradient")
        // .attr("id", d => d.uid = generateUID("link"))
        .attr("id", d => d.uid = removeBlanks(d.source.name) + "->" + removeBlanks(d.target.name))
        // .attr("id", d => d.uid = `${d.source}->${d.target}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", d => d.source.x1)
        .attr("x2", d => d.target.x0);

  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", d => color(d.source));

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", d => color(d.target));
  

  function fadeOtherLinks(element) {
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

  link.append("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke", d => `url(#${d.uid})`)
      .attr("stroke-width", d => Math.max(1, d.width))
      .style("z-index", -1) // Set a high z-index value
      // .style("opacity", 0)
      .on("mouseover", function (event, d) {
        fadeOtherLinks(this);
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`${d.source.name} → ${d.target.name}<br/>${format(d.value)} Mt CO2-eq`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mousemove", function (event, d) {
        tooltip.style("left", (event.pageX + 4) + "px")
          .style("top", (event.pageY - 50) + "px");
      })
      .on("mouseout", () => {
        svg.selectAll("path").transition().duration(fadeDuration).style("opacity", normalOpacity);
        tooltip.transition().duration(500).style("opacity", 0);
      });

        // Creates the rects that represent the nodes.
  const rect = svg.append("g")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 0)
    .selectAll()
    .data(nodes)
    .join("rect")
      .attr("x", d => d.x0 - radius)
      .attr("y", d => d.y0)
      .attr("rx", radius)
      .attr("ry", radius)
      .attr("height", d => d.y1 - d.y0 )
      .attr("width", d => d.x1 - d.x0 + radius * 2)
      .attr("fill", d => color(d))
      // .attr("opacity", 0)
      .style("z-index", 1000) // Set a high z-index value
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`${d.name}<br/>${format(d.value)} Mt CO2-eq`)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mousemove", function (event, d) {
        tooltip.style("left", (event.pageX + 4) + "px")
          .style("top", (event.pageY - 50) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });
  //link.append("title")
    //  .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)} TWh`);

    // Add labels above the left three levels of the Sankey diagram
  const titles = ["direct emissions", "materials", "components"];
  
  const titleGroup = svg.append("g");
  
  titles.forEach((title, i) => {
    titleGroup.append("text")
      .attr("x", titlePositions[i].x)
      .attr("y", titlePositions[i].y)
      .text(title)
      .style("font-size", fontsizeTitle)
      .style("fill", darkmode ? "#F1F3F4" : "black")
      .style("font-weight", "bold")
      // .style("fill-opacity", 0)
      .attr("class", "title");
  });
    
  // Adds labels on the nodes.
  const labels = svg.append("g")
    .selectAll()
    .data(nodes)
    .join("text")
      .attr("x", d => d.x0 < width - 50 ? d.x1 + 20 : d.x0 - 20)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      //.attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .attr("text-anchor", d => d.x0 < width - 50 ? "start" : "end")
      .attr("class", "label")
      //.text(d => d.name)
      .text(d => {
        if (d.name === "grid status quo") {
          return d.name;
        }
        const percentage = ((d.value / totalScore) * 100)
        const percentageText = percentage < 0.01 ? "<0.1%" : `${percentage.toFixed(1)}%`;
        return `${d.name} (${percentageText})`;
      })
      .style("font-size", fontsize)
      .style("fill", d => darkmode? "#F1F3F4" : "black")
      // .style("fill-opacity", 0)
      .style("font-weight", d => d.name === "grid status quo" ? "bold" : "normal");


  // Adds total number beneath the "grid status quo" label
  labels.filter(d => d.name === "grid status quo")
    .append("tspan")
      .attr("x", d => d.x0 < width - 50 ? d.x1 + 20 : d.x0 - 20)
      .attr("dy", "1.2em")
      .attr("text-anchor", d => d.x0 < width - 50 ? "start" : "end")
      .text(d => format(d.value) + " Mt CO2-eq")
      .style("font-size", "1em")
      .style("fill", d => darkmode ? "#F1F3F4" : "black");
    
  link.lower()
  rect.raise()
}

