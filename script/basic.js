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

const color = d => labelColorMapping[d.name] || "rgb(156,158,159)"; // default color if not mapped


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

  document.querySelector('#chart-sankey').classList.add('fade-in');

  // Function to add 'visible' class
  const setVisible = (element, visible) => {
    if (visible) {
      element.classList.add("visible");
    } else {
      element.classList.remove("visible");
    }
  };

  function fadeOtherLinks(connection, delay=0, localFadeDuration = fadeDuration) {
    d3.select("#chart-sankey")
    .selectAll("path")
    .transition()
    .delay(delay)
    .duration(localFadeDuration)
    .style("opacity", d => (Array.isArray(connection) ? connection.includes(d.uid) : d.uid === connection) ? normalOpacity : fadedOpacity);
  };
  

  function fadeLinksInSubstring(connection, delay=0, localFadeDuration = fadeDuration) {
    const paths = d3.select("#chart-sankey").selectAll("path");
  
    paths.transition()
      .delay(delay)
      .duration(localFadeDuration)
      .style("opacity", fadedOpacity);
  
    paths.filter(d => Array.isArray(connection) ? connection.some(conn => d.uid.includes(conn)) : d.uid === connection || d.uid.includes(connection))
      .transition()
      .delay(delay)
      .duration(localFadeDuration)
      .style("opacity", normalOpacity);
  };
  
  function showAllLinks(delay=0, localFadeDuration=fadeDuration) {
    d3.select("#chart-sankey")
      .selectAll("path")
      .transition()
      .delay(delay)
      .duration(localFadeDuration)
      .style("opacity", normalOpacity);
  }

  function fadeOtherRects(names, delay=0, localFadeDuration=fadeDuration) {
    d3.select("#chart-sankey")
      .selectAll("rect")
      .transition()
      .delay(delay)
      .duration(localFadeDuration)
      // .style("fill", d => names.includes(d.name) ? d3.color(color(d)) : d3.color(color(d)).darker(2));
      .style("fill", d => names.includes(d.name) ? color(d) : d3.color(color(d)).darker(2));
      // .style("opacity", d=> names.includes(d.name) ? normalOpacity : fadedOpacity);
  }

  function showAllRects(delay=0, localFadeDuration=fadeDuration) {
    d3.select("#chart-sankey")
      .selectAll("rect")
      .transition()
      .delay(delay)
      .duration(localFadeDuration)
      .style("opacity", normalOpacity)
      .style("fill", d => color(d));
  }

  function showAllTexts(delay=0, localFadeDuration=fadeDuration) {
    d3.select("#chart-sankey")
      .selectAll("text")
      .transition()
      .delay(delay)
      .duration(localFadeDuration)
      .style("fill-opacity", normalOpacity);
  }
  // Setting up the observer
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        setVisible(entry.target, entry.isIntersecting);

        // Additional check for the specific container 'id1'
        if (entry.target.id === "section1" && entry.isIntersecting) {
          activateDot(1);
          showAllLinks();
          showAllRects();
          showAllTexts();
        }
        if (entry.target.id === "section2" && entry.isIntersecting) {
          activateDot(2);
          // window.sankeyDia.update({nodes: window.snodes2045, links: window.slinks2045});
          fadeOtherLinks("substations->gridstatusquo");
          fadeOtherRects(["substations", "grid status quo"])
        }
        if (entry.target.id === "section3" && entry.isIntersecting) {
          activateDot(3);
          fadeOtherRects(["substations", "grid status quo"])
          fadeOtherLinks("substations->gridstatusquo", 0);
          fadeOtherLinks(["substations->gridstatusquo", "concrete&cement->substations"], 300);
          fadeOtherRects(["concrete & cement", "substations", "grid status quo"], 300)
          fadeOtherLinks(["substations->gridstatusquo", "concrete&cement->substations", "clinker->concrete&cement"], 600);
          fadeOtherRects(["clinker", "concrete & cement", "substations", "grid status quo"], 600)
        }
        if (entry.target.id === "section4" && entry.isIntersecting) {
          activateDot(4);
          fadeLinksInSubstring(["electricity->", "clinker->"], 0);
          fadeOtherRects(["electricity", "clinker"]);
          
        }
        if (entry.target.id === "section5" && entry.isIntersecting) {
          activateDot(5);
          showAllRects();
          showAllLinks();
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
