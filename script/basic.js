import { getColor } from "./colors.js";
import { renderSankey, updateSankey, transformIntoBars, updateBars} from "./chart-sankey.js";

// DOM & constants
const container = document.querySelector(".container");
const sections = container.querySelectorAll("section");
const dots = document.querySelectorAll(".dot");
const darkmode = true;
const normalOpacity = 1,
  fadedOpacity = 0.3,
  fadeDuration = 500;

const setVisible = (el, visible) => el.classList.toggle("visible", visible);

// Link & rect fading functions
function fadeOtherLinks(connection, delay = 0, duration = fadeDuration) {
  const conns = Array.isArray(connection) ? connection : [connection];
  d3.selectAll(".link")
    .transition()
    .delay(delay)
    .duration(duration)
    .style("opacity", function () {
      return conns.includes(this.id) ? normalOpacity : fadedOpacity;
    });
}

function fadeLinksInSubstring(connection, delay = 0, duration = fadeDuration) {
  const conns = Array.isArray(connection) ? connection : [connection];
  const paths = d3.select("#chart-sankey").selectAll("path");
  paths
    .transition()
    .delay(delay)
    .duration(duration)
    .style("opacity", fadedOpacity);
  paths
    .filter(function () {
      return conns.some((substr) => this.id.includes(substr));
    })
    .transition()
    .delay(delay)
    .duration(duration)
    .style("opacity", normalOpacity);
}

const showAllLinks = (delay = 0, duration = fadeDuration) =>
  d3.selectAll(".link")
    .style("visibility", "visible")
    .style("pointer-events", "auto")
    .transition()
    .delay(delay)
    .duration(duration)
    .style("opacity", 1)               // fully visible
    .style("stroke-opacity", 0.4);     // reset stroke-opacity

function fadeOtherRects(names, delay = 0, duration = fadeDuration) {
  d3.selectAll("rect.node")
    .transition()
    .delay(delay)
    .duration(duration)
    .style("fill", (d) =>
      names.includes(d.name) ? getColor(d) : d3.color(getColor(d)).darker(2)
    );
}

const showAllRects = (delay = 0, duration = fadeDuration) =>
  d3.selectAll("rect.node")
    .style("visibility", "visible")
    .style("pointer-events", "auto")
    .transition()
    .delay(delay)
    .duration(duration)
    .style("opacity", normalOpacity)
    .style("fill", d => getColor(d));

const showAllTexts = (delay = 0, duration = fadeDuration) =>
  d3.selectAll("text.title, text.label")
    .style("visibility", "visible")
    .style("pointer-events", "auto")
    .transition()
    .delay(delay)
    .duration(duration)
    .style("opacity", normalOpacity);

function showStats() {
  const stats = document.getElementById("stats");
  const chart = document.getElementById("chart-sankey");

  // Fade out chart
  chart.classList.remove("fade-in");
  chart.classList.add("fade-out");

  // After it's hidden, show stats
  setTimeout(() => {
    stats.style.display = "flex";
    requestAnimationFrame(() => stats.classList.remove("fade-out"));
  }, 300);

  // Animate numbers
  const animateValue = (id, end, duration = 1000, format = d3.format(",.0f"), unit = "") => {
    const sel = d3.select(`#${id}`);
    sel.transition().duration(duration).tween("text", () => {
      const interp = d3.interpolateNumber(0, end);
      return t => sel.text(format(interp(t)) + unit);
    });
  };
  animateValue("stat1", 237000, 1000, d3.format(",.0f"), "");
  animateValue("stat2", 1823000, 1000, d3.format(",.0f"), "");
  animateValue("stat3", 586000, 1000, d3.format(",.0f"), "");
}

function showChart() {
  const stats = document.getElementById("stats");
  const chart = document.getElementById("chart-sankey");

  // Add fade-out + absolute positioning
  stats.classList.add("fade-out");

  // After transition, hide completely
  setTimeout(() => {
    stats.style.display = "none"; // Remove from layout entirely
    chart.classList.remove("fade-out");
    chart.classList.add("fade-in");
  }, 300);
}

function activateDot(index) {
  dots.forEach((dot) => dot.classList.remove("active"));
  dots[index].classList.add("active");
}

dots.forEach((dot, i) =>
  dot.addEventListener("click", () => {
    const targetId = sections[i].querySelector(".animate-on-scroll")?.id;
    if (targetId === "section0") {
      showStats();
    } else {
      showChart();
    }
    sections[i].scrollIntoView({ behavior: "smooth" });
  })
);
document
  .querySelector(".arrow")
  .addEventListener("click", () =>
    sections[1].scrollIntoView({ behavior: "smooth" })
  );

// Keyboard navigation for sections
let currentSection = 0;
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown" && currentSection < sections.length - 1) {
    sections[++currentSection].scrollIntoView({ behavior: "smooth" });
  } else if (e.key === "ArrowUp" && currentSection > 0) {
    sections[--currentSection].scrollIntoView({ behavior: "smooth" });
  }
});

// Main initialization on DOM load
document.addEventListener("DOMContentLoaded", () => {
  Promise.all([
    d3.csv("data/sankey_data_paper_2023.csv"),
    d3.csv("data/sankey_data_paper_2045.csv"),
  ]).then(([slinks2023, slinks2045]) => {
    const uniqueNodes = (slinks) =>
      Array.from(new Set(slinks.flatMap((l) => [l.source, l.target]))).map(
        (name) => ({ name, category: name.replace(/[\s()]/g, "") })
      );
    window.snodes2023 = uniqueNodes(slinks2023);
    window.snodes2045 = uniqueNodes(slinks2045);
    window.slinks2023 = slinks2023;
    window.slinks2045 = slinks2045;

    renderSankey(window.snodes2023, window.slinks2023);

    // Intersection observer for scroll-triggered animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setVisible(entry.target, entry.isIntersecting);
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id === "section0") {
              currentSection = 0;
              activateDot(0);
              showStats()
            }
            if (id === "section1") {
              currentSection = 1;
              activateDot(1);
              showChart();
              updateSankey(window.snodes2023, window.slinks2023, 0, 1000);
              showAllLinks(600);
              showAllRects(600);
              showAllTexts(1000);
            } else if (id === "section2") {
              currentSection = 2;
              activateDot(2);
              updateSankey(window.snodes2023, window.slinks2023, 0, 0);
              fadeOtherRects(["overhead lines", "cables", "grid status quo"]);
              fadeOtherRects(
                ["aluminium", "overhead lines", "cables", "grid status quo"],
                300
              );
              fadeOtherRects(
                [
                  "electricity",
                  "aluminium",
                  "overhead lines",
                  "cables",
                  "grid status quo",
                ],
                600
              );
              fadeOtherLinks(
                ["overheadlines->gridstatusquo", "cables->gridstatusquo"],
                0
              );
              fadeOtherLinks(
                [
                  "overheadlines->gridstatusquo",
                  "cables->gridstatusquo",
                  "aluminium->overheadlines",
                  "aluminium->cables",
                ],
                300
              );
              fadeOtherLinks(
                [
                  "electricity->aluminium",
                  "overheadlines->gridstatusquo",
                  "cables->gridstatusquo",
                  "aluminium->cables",
                  "aluminium->overheadlines",
                ],
                600
              );
            } else if (id === "section3") {
              activateDot(3);
              updateSankey(window.snodes2023, window.slinks2023,0,0);
              fadeOtherRects(["grid status quo", "overhead lines"]);
              fadeOtherLinks(["overheadlines->gridstatusquo"]);
              fadeOtherRects(
                ["grid status quo", "overhead lines", "iron & steel"],
                0
              );
              fadeOtherLinks(
                ["overheadlines->gridstatusquo", "iron&steel->overheadlines"],
                0
              );
              fadeOtherRects(
                [
                  "grid status quo",
                  "overhead lines",
                  "iron & steel",
                  "iron & steel (direct)",
                  "electricity",
                ],
                300
              );
              fadeOtherLinks(
                [
                  "overheadlines->gridstatusquo",
                  "iron&steel->overheadlines",
                  "iron&steeldirect->iron&steel",
                  "electricity->iron&steel",
                ],
                300
              );
            } else if (id === "section4") {
              currentSection = 4;
              activateDot(4);
              updateSankey(window.snodes2023, window.slinks2023, 0, 0);
              fadeLinksInSubstring("electricity->");
              fadeOtherRects(["electricity"]);
            } else if (id === "section5") {
              currentSection = 5;
              activateDot(5);
              updateSankey(window.snodes2023, window.slinks2023, 0, 0);
              showAllLinks();
              showAllRects();
              showAllTexts();
            } else if (id === "section6") {
              currentSection = 6;
              activateDot(6);
              const years = ["2025", "2030", "2035", "2040", "2045"];
              fetch("data/expansion_component_results_static.json")
              .then(response => response.json())
              .then(allData => {
                transformIntoBars({ allData, years });
              })
              .catch(error => console.error("Error loading JSON data:", error));
            } else if (id === "section7") {
              currentSection = 7;
              activateDot(7);
              const years = ["2025", "2030", "2035", "2040", "2045"];
              fetch("data/expansion_component_results_rcp19.json")
              .then(response => response.json())
              .then(allData => {
                updateBars(allData, years );
              })
              .catch(error => console.error("Error loading JSON data:", error));
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    document
      .querySelectorAll(".animate-on-scroll")
      .forEach((el) => observer.observe(el));
  });

  // Responsive CSS variable updates
  const setDocHeight = () =>
    document.documentElement.style.setProperty(
      "--doc-height",
      `${window.innerHeight}px`
    );
  window.addEventListener("resize", setDocHeight);
  setDocHeight();

  const chartsDiv = document.getElementById("charts");
  const setChartsHeight = () =>
    document.documentElement.style.setProperty(
      "--charts-height",
      `${chartsDiv.offsetHeight}px`
    );
  window.addEventListener("resize", setChartsHeight);
  const chartsObserver = new MutationObserver(setChartsHeight);
  chartsObserver.observe(chartsDiv, { childList: true, subtree: true });
  setChartsHeight();
});
