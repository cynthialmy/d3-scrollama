// using d3 for convenienceviz
var main = d3.select("main");
var scrolly = main.select("#scrolly");
var figure = scrolly.select("figure");
var article = scrolly.select("article");
var step = article.selectAll(".step");

// initialize the scrollama
var scroller = scrollama();

// generic window resize listener event with debouncing
let resizeTimeout;
function handleResize() {
    // Debounce resize events for better performance
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Responsive step height based on viewport
        let stepH;
        if (windowWidth <= 968) {
            // Mobile/tablet: use viewport height
            stepH = Math.floor(windowHeight * 0.6);
        } else {
            // Desktop: maintain aspect ratio
            stepH = Math.floor(windowHeight * 0.75);
        }

        step.style("height", stepH + "px");

        // Responsive step width
        if (windowWidth <= 768) {
            step.style("width", "100%");
        } else if (windowWidth <= 1200) {
            step.style("width", "100%");
        } else {
            step.style("width", "100%");
        }

        // Responsive figure height
        let figureHeight;
        if (windowWidth <= 968) {
            // Stacked layout: use proportional height
            figureHeight = Math.min(windowHeight * 0.5, 500);
        } else {
            // Side-by-side: maintain aspect ratio
            figureHeight = Math.min(windowHeight * 0.6, 600);
        }

        // Update chart container height proportionally
        const chartContainer = d3.select("#chart0");
        if (!chartContainer.empty()) {
            const currentWidth = chartContainer.node().offsetWidth;
            const aspectRatio = 800 / 600; // Original aspect ratio
            const newHeight = currentWidth / aspectRatio;
            chartContainer.style("height", Math.min(newHeight, figureHeight) + "px");
        }

        // Update figure positioning for sticky behavior
        if (windowWidth > 968) {
            figure
                .style("height", "auto")
                .style("top", "50%");
        } else {
            figure
                .style("height", "auto")
                .style("top", "auto");
        }

        // Tell scrollama to update new element dimensions
        scroller.resize();
    }, 150); // 150ms debounce
}

// scrollama event handlers

var toolTipState = 'title';

/*
scrollama magic happens here:
- based on the index, trigger a certiain function from d3-animations.js
- sometimes only fire an event when going down or up in the story
*/
function handleStepEnter(response) {

    console.log(response);
    // response = { element, direction, index }
    let currentIndex = response.index;
    let currentDirection = response.direction;

    // add color to current step only with smooth animation
    step.classed("is-active", function (d, i) {
        return i === currentIndex;
    });

    // Animate step text with fade-in
    d3.select(response.element)
        .selectAll("h2, p")
        .style("opacity", 0)
        .transition()
        .duration(600)
        .delay((d, i) => i * 100)
        .ease(d3.easeCubicOut)
        .style("opacity", 1);

    // update graphic based on step
    switch (currentIndex) {

        case 0:
            toolTipState = 'title';
            if (currentDirection === 'up') {
                dotColorGrey();
            }
            break;
        case 1:
            toolTipState = 'title score';
            dotColorSentiment()
            break;
        case 2:
            toolTipState = 'title score magnitude';
            dotResize()
            if (currentDirection === 'up') {
                toggleAxesOpacity(true, false, 0)
            }
            break;
        case 3:
            dotPositionScore()
            if (currentDirection === 'up') {
                toggleAxesOpacity(false, true, 0)
            }
            break;
        case 4:
            dotPositionMagnitude()
            if (currentDirection === 'up') {
                toggleAxesOpacity(true, true, 1)
            } else {
                toggleAxesOpacity(false, true, 1)
            }
            break;
        case 5:
            dotSimplify()
            if (currentDirection === 'up') {
                toggleElementOpacity(bubbleChart, 1)
            } else {
                toggleAxesOpacity(true, true, 0)
                toggleElementOpacity(bubbleChart, 0)
            }
            break;
        case 6:
            if (currentDirection === 'up') {
                hideStackedChart()
            } else {
                drawStackedChart()
            }
            break;
        case 7:
            if (currentDirection === 'up') {
                drawStackedChart()
                hideDotChart()
            } else {
                hideStackedChart()
            }
            break;

        case 8:
            if (currentDirection === 'up') {
                hideDotChart()
            } else {
                hideStackedChart()
                drawDotChart();

            }
            break;
        case 9:
            if (currentDirection === 'up') {
                drawDotChart()
                hideBarChart()
            } else {
                hideDotChart()
            }
            break;

        case 10:
            if (currentDirection === 'up') {
                hideBarChart()
            } else {
                hideDotChart()
                drawBarChart();

            }
            break;
        case 11:
            if (currentDirection === 'up') {
                drawBarChart();
            } else {
                hideBarChart();
                d3.selectAll("#chart0").remove()
            }
        default:
            break;
    }

}

function setupStickyfill() {
    d3.selectAll(".sticky").each(function () {
        Stickyfill.add(this);
    });
}

function init() {
    setupStickyfill();

    // Hide loading overlay after a short delay
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }
    }, 1500);

    // 1. force a resize on load to ensure proper dimensions are sent to scrollama
    handleResize();

    // 2. setup the scroller passing options
    // 		this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    scroller
        .setup({
            step: "#scrolly article .step",
            offset: 0.5,
            debug: false,
            progress: true
        })
        .onStepEnter(handleStepEnter)
        .onStepProgress(function(response) {
            // Optional: Add progress-based animations
            const progress = response.progress;
            if (response.element) {
                d3.select(response.element)
                    .style("opacity", 0.5 + progress * 0.5);
            }
        });

    // setup resize event
    window.addEventListener("resize", handleResize);
}

// kick things off
init();
