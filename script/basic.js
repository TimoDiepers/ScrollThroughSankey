import { getColor } from "./colors.js";
import { renderSankey, updateSankey } from "./chart-sankey.js";

// DOM & constants
const container = document.querySelector(".container");
const sections = container.querySelectorAll("section");
const dots = document.querySelectorAll(".dot");
const darkmode = true;
const normalOpacity = 1,
  fadedOpacity = 0.3,
  fadeDuration = 500,
  delayDuration = 200,
  fadeDurationInitialShow = 500;

// Helper: toggle "visible" class
const setVisible = (el, visible) => el.classList.toggle("visible", visible);

// Transition helpers
const transitionStyle = (sel, delay, duration, styleName, val) =>
  sel.transition().delay(delay).duration(duration).style(styleName, val);

// Link & rect fading functions
function fadeOtherLinks(connection, delay = 0, duration = fadeDuration) {
  const conns = Array.isArray(connection) ? connection : [connection];
  window.link
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
  window.link
    .transition()
    .delay(delay)
    .duration(duration)
    .style("opacity", normalOpacity);

function fadeOtherRects(names, delay = 0, duration = fadeDuration) {
  window.rect
    .transition()
    .delay(delay)
    .duration(duration)
    .style("fill", (d) =>
      names.includes(d.name) ? getColor(d) : d3.color(getColor(d)).darker(2)
    );
}

const showAllRects = (delay = 0, duration = fadeDuration) =>
  window.rect
    .transition()
    .delay(delay)
    .duration(duration)
    .style("opacity", normalOpacity)
    .style("fill", (d) => getColor(d));

const showAllTexts = (delay = 0, duration = fadeDuration) =>
  window.labels
    .transition()
    .delay(delay)
    .duration(duration)
    .style("fill-opacity", normalOpacity);

function activateDot(index) {
  dots.forEach((dot) => dot.classList.remove("active"));
  dots[index].classList.add("active");
}

// Dot & arrow event listeners
dots.forEach((dot, i) =>
  dot.addEventListener("click", () => {
    document.getElementById("charts").style.visibility = "visible";
    document.getElementById("sections").classList.remove("wider");
    document.getElementById("chart-sankey").classList.add("fade-in");
    sections[i].scrollIntoView({ behavior: "instant" });
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
              activateDot(0);
              document.getElementById("charts").style.visibility = "collapse";
              document.getElementById("sections").classList.add("wider");
              document.getElementById("chart-sankey").classList.remove("fade-in");
            }

            if (id === "section1") {
              activateDot(1);
              document.getElementById("charts").style.visibility = "visible";
              document.getElementById("sections").classList.remove("wider");
              document.getElementById("chart-sankey").classList.add("fade-in");

              updateSankey(window.snodes2023, window.slinks2023, 0, 600);
              showAllLinks();
              showAllRects();
            } else if (id === "section2") {
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
              updateSankey(window.snodes2023, window.slinks2023, 0, 0);
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
              activateDot(4);
              updateSankey(window.snodes2023, window.slinks2023, 0, 0);
              fadeLinksInSubstring("electricity->");
              fadeOtherRects(["electricity"]);
            } else if (id === "section5") {
              activateDot(5);
              showAllLinks();
              showAllRects();
              updateSankey(window.snodes2023, window.slinks2023, 300);
            } else if (id === "section6") {
              activateDot(6);
              updateSankey(window.snodes2045, window.slinks2045);
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
