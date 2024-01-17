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
  function fadeOthers(element, datasetName) {
    d3.select("#chart-sunburst")
      .selectAll("path")
      // Select the specific element and apply fadeOthers
      // path;
      .filter((d) => d.data.name === datasetName)
      // .filter(function (d) {
      //   return d.data.name === "Land cable, vpe al";
      // })
      .each(function (d) {
        d3.select("#chart-sunburst")
          .selectAll("path")
          .transition()
          .duration(fadeDuration)
          .style("opacity", fadedOpacity);

        // Highlight the current element
        d3.select(this)
          .transition()
          .duration(fadeDuration)
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
          d3.select("#chart-sunburst")
            .transition()
            .duration(fadeDuration)
            .selectAll("path")
            .style("opacity", normalOpacity);
        }
        if (entry.target.id === "section2" && entry.isIntersecting) {
          fadeOthers(this, "Land cable, vpe al"); //TODO: zoom out to correct level!
        }
        if (entry.target.id === "section3" && entry.isIntersecting) {
          fadeOthers(this, "Transformer, 40MVA");
        }
        if (entry.target.id === "section4" && entry.isIntersecting) {
          d3.select("#chart-sunburst")
            .transition()
            .duration(fadeDuration)
            .selectAll("path")
            .style("opacity", normalOpacity);
        }
        if (entry.target.id === "section5" && entry.isIntersecting) {
          d3.select("#chart-sunburst")
            .transition()
            .duration(fadeDuration)
            .selectAll("path")
            .style("opacity", normalOpacity);
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

// Get the actual height of the div with id "charts"
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
