document.addEventListener("DOMContentLoaded", function () {
  // Function to add 'visible' class
  const setVisible = (element, visible) => {
    if (visible) {
      element.classList.add("visible");
    } else {
      element.classList.remove("visible");
    }
  };

  // Setting up the observer
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        setVisible(entry.target, entry.isIntersecting);
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

//
// Sidebar
const sections = document.querySelectorAll("section");
const dots = document.querySelectorAll(".dot");

window.addEventListener("scroll", () => {
  const scrollPosition =
    window.pageYOffset || document.documentElement.scrollTop;

  sections.forEach((section, i) => {
    const rect = section.getBoundingClientRect();

    if (rect.top <= scrollPosition && rect.bottom > scrollPosition) {
      dots.forEach((dot) => dot.classList.remove("active"));
      dots[i].classList.add("active");
    }
  });
});