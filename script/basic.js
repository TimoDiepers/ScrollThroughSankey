const container = document.querySelector(".container");
const sections = container.querySelectorAll("section");
const dots = document.querySelectorAll(".dot");

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

document.addEventListener("DOMContentLoaded", function () {
  // Function to add 'visible' class
  const setVisible = (element, visible) => {
    if (visible) {
      element.classList.add("visible");
    } else {
      element.classList.remove("visible");
    }
  };

  const normalOpacity = 1; // Normal opacity for elements
  const fadedOpacity = 0.3; // Reduced opacity for non-hovered elements
  const fadeDuration = 400; // Duration of fade in milliseconds

  function fadeOthers(connection, delay, localFadeDuration=fadeDuration) {
    d3.select("#chart-sankey")
      .selectAll("path")
      .transition()
      .delay(delay)
      .duration(localFadeDuration)
      .style("opacity", fadedOpacity);

    d3.select("#chart-sankey")
      .selectAll("path")
      // Select the specific element and apply fadeOthers
      // path;
      .filter((d) => {
        if (Array.isArray(connection)) {
          return connection.includes(d.uid);
        } else {
          return d.uid === connection;
        }
      })
      // .filter(function (d) {
      //   return d.data.name === "Land cable, vpe al";
      // })
      .each(function (d) {
        // Highlight the current element
        d3.select(this)
          .transition()
          .delay(delay)
          .duration(localFadeDuration)
          .style("opacity", normalOpacity);
        // console.log(d.data.name);
      });
  }

  // Setting up the observer
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        setVisible(entry.target, entry.isIntersecting);

        // Additional check for the specific container 'id1'
        if (entry.target.id === "section1" && entry.isIntersecting) {
          activateDot(1);
          d3.select("#chart-sankey")
            .transition()
            .duration(fadeDuration)
            .selectAll("path")
            .style("opacity", normalOpacity);
        }
        if (entry.target.id === "section2" && entry.isIntersecting) {
          // const clickEvent = new Event("click");
          fadeOthers("substations->gridstatusquo", 0);
          fadeOthers(["substations->gridstatusquo", "concrete&cement->substations"], 300);
          fadeOthers(["substations->gridstatusquo", "concrete&cement->substations", "clinker->concrete&cement"], 600);
          activateDot(2);
          //TODO: zoom out to correct level!
        }
        if (entry.target.id === "section3" && entry.isIntersecting) {
          // fadeOthers(["substations->gridstatusquo", "concrete&cement->substations"], 0);
          activateDot(3);
          // d3.select("#chart-sankey")
          //   .selectAll("g")
          //   .transition()
          //   .delay(750)
          //   .style("opacity", normalOpacity);
        }
        if (entry.target.id === "section4" && entry.isIntersecting) {
          activateDot(4);
        }
        if (entry.target.id === "section5" && entry.isIntersecting) {
          activateDot(5);
        }
      });
    },
    { threshold: 0.5 }
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
