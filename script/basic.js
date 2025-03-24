const container = document.querySelector(".container");
const sections = container.querySelectorAll("section");
const dots = document.querySelectorAll(".dot");

let startUpAnimationHasRun = false;

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
  "substations": violett100,
  "overhead lines": gruen100,
  "cables": petrol100,
  "transformers": lila100,
  "switchgears": magenta100,
  "concrete": petrol50,
  "aluminium": orange100,
  "copper": rot75,
  "iron & steel": tuerkis100,
  "clinker": violett75,
  "electricity": gelb100,
  "aluminium (process emissions)": orange50,
  "iron & steel (process emissions)": tuerkis50,
  "coal": schwarz75,
  "heat": rot100,
  "SF6": maigruen100,
  "transport": blau50,
  "plastics": gelb75
  // Add other mappings as needed
  };

const color = d => labelColorMapping[d.name] || "rgb(156,158,159)"; // default color if not mapped

// Function to add 'visible' class
const setVisible = (element, visible) => {
  if (visible) {
    element.classList.add("visible");
  } else {
    element.classList.remove("visible");
  }
};

function fadeOtherLinks(connection, delay = 0, localFadeDuration = fadeDuration) {
  // Ensure connection is an array
  const connections = Array.isArray(connection) ? connection : [connection];

  // Select all links
  window.link
    .transition()
    .delay(delay)
    .duration(localFadeDuration)
    .style("opacity", function (d) {
      const linkId = this.id; // Get the actual ID from the DOM element
      return connections.includes(linkId) ? normalOpacity : fadedOpacity;
    });
}


function fadeLinksInSubstring(connection, delay = 0, localFadeDuration = fadeDuration) {
  const paths = d3.select("#chart-sankey").selectAll("path");

  // Ensure connection is an array
  const connections = Array.isArray(connection) ? connection : [connection];

  // Fade all links
  paths.transition()
    .delay(delay)
    .duration(localFadeDuration)
    .style("opacity", fadedOpacity);

  // Highlight links that contain any substring from the connections array
  paths.filter(function () {
      const linkId = this.id; // Get actual ID from the DOM element
      return connections.some(conn => linkId.includes(conn));
    })
    .transition()
    .delay(delay)
    .duration(localFadeDuration)
    .style("opacity", normalOpacity);
}

function showAllLinks(delay=0, localFadeDuration=fadeDuration) {
  window.link
    .transition()
    .delay(delay)
    .duration(localFadeDuration)
    .style("opacity", normalOpacity);
}

function fadeOtherRects(names, delay=0, localFadeDuration=fadeDuration) {
  window.rect
    .transition()
    .delay(delay)
    .duration(localFadeDuration)
    // .style("fill", d => names.includes(d.name) ? d3.color(color(d)) : d3.color(color(d)).darker(2));
    .style("fill", d => names.includes(d.name) ? color(d) : d3.color(color(d)).darker(2));
    // .style("opacity", d=> names.includes(d.name) ? normalOpacity : fadedOpacity);
}

function showAllRects(delay=0, localFadeDuration=fadeDuration) {
  window.rect
    .transition()
    .delay(delay)
    .duration(localFadeDuration)
    .style("opacity", normalOpacity)
    .style("fill", d => color(d));
}

function showAllTexts(delay=0, localFadeDuration=fadeDuration) {
  window.labels
    .transition()
    .delay(delay)
    .duration(localFadeDuration)
    .style("fill-opacity", normalOpacity);
}

function activateDot(index) {
  dots.forEach((dot) => dot.classList.remove("active"));
  dots[index - 1].classList.add("active");
}

dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    sections[i].scrollIntoView({ behavior: "instant" });
  });
});

document.querySelector(".arrow").addEventListener("click", () => {
  sections[1].scrollIntoView({ behavior: "smooth" });
});

const normalOpacity = 1; // Normal opacity for elements
const fadedOpacity = 0.3; // Reduced opacity for non-hovered elements
const fadeDuration = 500; // Duration of fade in milliseconds
const delayDuration = 200; // Duration of delay in milliseconds
const fadeDurationInitialShow = 500;

function startupTransition() {
  const first_level_names = ["grid status quo"]
  const first_level_conns = ["->gridstatusquo"]
  const second_level_names = ["substations", "overhead lines", "cables", "transformers", "switchgears"]
  const second_level_conns = ["->substations", "->overheadlines", "->cables", "->transformers", "->switchgears"]
  const third_level_names = ["concrete & cement", "aluminium", "copper", "iron & steel", "other materials"]
  const third_level_conns = ["->concrete&cement", "->aluminium", "->copper", "->iron&steel", "->othermaterials"]
  const fourth_level_names = ["clinker", "electricity", "aluminium (process em.)", "iron & steel (process em.)", "coal", "heat", "SF6", "other processes"]
  const fourth_level_conns = ["->clinker", "->electricity", "->aluminium(processem.)", "->iron&steel(processem.)", "->coal", "->heat", "->SF6", "->otherprocesses"]
  d3.select("#chart-sankey")
    .selectAll("path")
    .filter(d => first_level_conns.some(substr => d.uid.includes(substr)))
    .style("opacity", 0)
    .transition()
    .delay(delayDuration)
    .duration(fadeDuration)
    .style("opacity", normalOpacity)

    d3.select("#chart-sankey")
    .selectAll("path")
    .filter(d => second_level_conns.some(substr => d.uid.includes(substr)))
    .style("opacity", 0)
    .transition()
    .delay(delayDuration*2)
    .duration(fadeDurationInitialShow)
    .style("opacity", normalOpacity)

  d3.select("#chart-sankey")
    .selectAll("path")
    .filter(d => third_level_conns.some(substr => d.uid.includes(substr)))
    .style("opacity", 0)
    .transition()
    .delay(delayDuration*3)
    .duration(fadeDurationInitialShow)
    .style("opacity", normalOpacity)

  d3.select("#chart-sankey")
    .selectAll("path")
    .filter(d => fourth_level_conns.some(substr => d.uid.includes(substr)))
    .style("opacity", 0)
    .transition()
    .delay(delayDuration*4)
    .duration(fadeDurationInitialShow)
    .style("opacity", normalOpacity)

  d3.select("#chart-sankey")
    .selectAll("rect")
    .filter(d => first_level_names.includes(d.name))
    .style("opacity", 0)
    .transition()
    .duration(fadeDurationInitialShow)
    .style("opacity", normalOpacity) 

  d3.select("#chart-sankey")
    .selectAll("rect")
    .filter(d => second_level_names.includes(d.name))
    .style("opacity", 0)
    .transition()
    .delay(delayDuration)
    .duration(fadeDurationInitialShow)
    .style("opacity", normalOpacity)

  d3.select("#chart-sankey")
    .selectAll("rect")
    .filter(d => third_level_names.includes(d.name))
    .style("opacity", 0)
    .transition()
    .delay(delayDuration*2)
    .duration(fadeDurationInitialShow)
    .style("opacity", normalOpacity)

  d3.select("#chart-sankey")
    .selectAll("rect")
    .filter(d => fourth_level_names.includes(d.name))
    .style("opacity", 0)
    .transition()
    .delay(delayDuration*3)
    .duration(fadeDurationInitialShow)
    .style("opacity", normalOpacity)

  d3.select("#chart-sankey")
    .selectAll("text.label")
    .filter(d => first_level_names.includes(d.name))
    .style("fill-opacity", 0)
    .transition()
    .duration(fadeDurationInitialShow)
    .style("fill-opacity", normalOpacity)

  d3.select("#chart-sankey")
    .selectAll("text.label")
    .filter(d => second_level_names.includes(d.name))
    .style("fill-opacity", 0)
    .transition()
    .delay(delayDuration)
    .duration(fadeDurationInitialShow)
    .style("fill-opacity", normalOpacity)

  d3.select("#chart-sankey")
    .selectAll("text.label")
    .filter(d => third_level_names.includes(d.name))
    .style("fill-opacity", 0)
    .transition()
    .delay(delayDuration*2)
    .duration(fadeDurationInitialShow)
    .style("fill-opacity", normalOpacity)
  
  d3.select("#chart-sankey")
    .selectAll("text.label")
    .filter(d => fourth_level_names.includes(d.name))
    .style("fill-opacity", 0)
    .transition()
    .delay(delayDuration*3)
    .duration(fadeDurationInitialShow)
    .style("fill-opacity", normalOpacity)

    d3.select("#chart-sankey")
    .selectAll("text.title")
    .filter(function() {
      return d3.select(this).text() === "components"
    })
    .style("fill-opacity", 0)
    .transition()
    .delay(delayDuration)
    .duration(fadeDurationInitialShow)
    .style("fill-opacity", 1)

  d3.select("#chart-sankey")
    .selectAll("text.title")
    .filter(function() {
      return d3.select(this).text() === "materials"
    })
    .style("fill-opacity", 0)
    .transition()
    .delay(delayDuration*2)
    .duration(fadeDurationInitialShow)
    .style("fill-opacity", 1)
  
  d3.select("#chart-sankey")
    .selectAll("text.title")
    .filter(function() {
      return d3.select(this).text() === "direct emissions"
    })
    .style("fill-opacity", 0)
    .transition()
    .delay(delayDuration*3)
    .duration(fadeDurationInitialShow)
    .style("fill-opacity", 1)
}; 

document.addEventListener("DOMContentLoaded", function () {
  Promise.all([
    d3.csv("data/sankey_data_paper_2023.csv"),
    d3.csv("data/sankey_data_paper_2045.csv"),
  ]).then(([slinks2023, slinks2045]) => {
    
    const snodes2023 = Array.from(new Set(slinks2023.flatMap(l => [l.source, l.target])), name => ({ 
      name, 
      category: name.replace(/[\s()]/g, "") 
    })).map(d => Object.assign({}, d));
  
    const snodes2045 = Array.from(new Set(slinks2045.flatMap(l => [l.source, l.target])), name => ({ 
        name, 
        category: name.replace(/[\s()]/g, "") 
    })).map(d => Object.assign({}, d));

    window.slinks2023 = slinks2023;
    window.slinks2045 = slinks2045;
    window.snodes2023 = snodes2023;
    window.snodes2045 = snodes2045;
  
    renderSankey(snodes2023, slinks2023);

  document.querySelector('#chart-sankey').classList.add('fade-in');


  
  // Setting up the observer
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        setVisible(entry.target, entry.isIntersecting);

        // Additional check for the specific container 'id1'
        if (entry.target.id === "section1" && entry.isIntersecting) {
          activateDot(1);
          updateSankey(window.snodes2023, window.slinks2023);
          showAllLinks();
          showAllRects();
        }
        if (entry.target.id === "section2" && entry.isIntersecting) {
          activateDot(2);
          updateSankey(window.snodes2023, window.slinks2023);
          fadeOtherRects(["overhead lines", "cables", "grid status quo"])
          fadeOtherRects(["aluminium", "overhead lines", "cables", "grid status quo"], 300)
          fadeOtherRects(["electricity", "aluminium", "overhead lines", "cables", "grid status quo"], 600)
          fadeOtherLinks(["overheadlines->gridstatusquo","cables->gridstatusquo"], 0);
          fadeOtherLinks(["overheadlines->gridstatusquo","cables->gridstatusquo", "aluminium->overheadlines","aluminium->cables"], 300);
          fadeOtherLinks(["electricity->aluminium", "overheadlines->gridstatusquo","cables->gridstatusquo", "aluminium->cables","aluminium->overheadlines"], 600);
        }
        if (entry.target.id === "section3" && entry.isIntersecting) {
          activateDot(3);
          updateSankey(window.snodes2023, window.slinks2023);
          fadeLinksInSubstring(["electricity->"], 0);
          fadeOtherRects(["electricity"]);
        }
        if (entry.target.id === "section4" && entry.isIntersecting) {
          activateDot(4);
          showAllRects(0);
          showAllLinks(0);
          showAllTexts(0);
          updateSankey(window.snodes2023, window.slinks2023, 600);
        }        
        if (entry.target.id === "section5" && entry.isIntersecting) {
          activateDot(5);
          updateSankey(window.snodes2045, window.slinks2045);
        }
        if (entry.target.id === "section6" && entry.isIntersecting) {
          activateDot(6);
          updateSankey(window.snodes2023, window.slinks2023);
        }
      });
    },
    { threshold: 0.3 }
  ); // Adjust threshold value as needed

    // Targeting elements with 'animate-on-scroll' class
    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((element) => {
      observer.observe(element); // Start observing
    });
  });

//for responsive
const documentHeight = () => {
  const doc = document.documentElement;
  doc.style.setProperty("--doc-height", `${window.innerHeight}px`);
};
window.addEventListener("resize", documentHeight);
documentHeight();

// Get the actual height of thew div with id "charts"
const chartsDiv = document.getElementById("charts");
const chartsHeight = () => {
  const chartsHeight = chartsDiv.offsetHeight;
  document.documentElement.style.setProperty(
    "--charts-height",
    `${chartsHeight}px`
  );
};
window.addEventListener("resize", chartsHeight);

// Update --charts-height when the contents of #charts change
const observer = new MutationObserver(chartsHeight);
observer.observe(chartsDiv, { childList: true, subtree: true });

chartsHeight();
});
