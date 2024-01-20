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
  const fadeDuration = 300; // Duration of fade in milliseconds

  function fadeOthers(datasetName, delay) {
    d3.select("#chart-sunburst")
      .selectAll("path")
      .transition()
      .delay(delay)
      .duration(fadeDuration)
      .style("opacity", fadedOpacity);

    d3.select("#chart-sunburst")
      .selectAll("path")
      // Select the specific element and apply fadeOthers
      // path;
      .filter((d) => d.data.name === datasetName)
      // .filter(function (d) {
      //   return d.data.name === "Land cable, vpe al";
      // })
      .each(function (d) {
        // Highlight the current element
        d3.select(this)
          .transition()
          .delay(delay)
          .duration(fadeDuration)
          .style("opacity", normalOpacity);
        // console.log(d.data.name);
      });
  }
  function zoomInto(name, delay) {
    const elementToZoomInto = d3
      .select("#chart-sunburst")
      .selectAll("path")
      .transition()
      .delay(delay)
      .filter((d) => d.data.name === name);
    const clickEvent = new Event("click");
    elementToZoomInto.node().dispatchEvent(clickEvent);
  }
  // Setting up the observer
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        setVisible(entry.target, entry.isIntersecting);

        // Additional check for the specific container 'id1'
        if (entry.target.id === "section1" && entry.isIntersecting) {
          activateDot(1);
          d3.select("#chart-sunburst")
            .transition()
            .duration(fadeDuration)
            .selectAll("path")
            .style("opacity", normalOpacity);
          window.returnToRoot();
        }
        if (entry.target.id === "section2" && entry.isIntersecting) {
          // const clickEvent = new Event("click");
          activateDot(2);
          // window.root.dispatchEvent(clickEvent);
          if (window.currentFocusDepth === 0) {
            fadeOthers("Land cable, vpe al", 0);
          } else {
            window.returnToRoot();
            fadeOthers("Land cable, vpe al", 750);
          }
          //TODO: zoom out to correct level!
        }
        if (entry.target.id === "section3" && entry.isIntersecting) {
          activateDot(3);
          zoomInto("Land cable, vpe al", 0);

          d3.select("#chart-sunburst")
            .selectAll("path")
            .transition()
            .delay(750)
            .style("opacity", normalOpacity);
        }
        if (entry.target.id === "section4" && entry.isIntersecting) {
          activateDot(4);
          if (window.currentNodeName === "Land cable, vpe al") {
            fadeOthers("market for aluminiu", 0);
          } else {
            zoomInto("Land cable, vpe al", 0);
            fadeOthers("market for aluminiu", 750);
          }
        }
        if (entry.target.id === "section5" && entry.isIntersecting) {
          activateDot(5);
          window.returnToRoot();
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
