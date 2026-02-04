// set the dimensions and margins of the graph
const margin = { top: 50, right: 25, bottom: 45, left: 80 };
const baseWidth = 800;
const baseHeight = 600;
const width = baseWidth - margin.left - margin.right;
const height = baseHeight - margin.top - margin.bottom;

// append the svg object to the body of the page
const svgRoot = d3.select("#chart0")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${baseWidth} ${baseHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

// Create gradient definitions for bubbles (must be in SVG root, not in group)
const defs = svgRoot.append("defs");

// Create the main group for chart elements
const svg = svgRoot
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Gold gradient for positive sentiment
const goldGradient = defs.append("linearGradient")
    .attr("id", "goldGradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "100%");
goldGradient.append("stop").attr("offset", "0%").attr("stop-color", "#ffd700").attr("stop-opacity", 1);
goldGradient.append("stop").attr("offset", "100%").attr("stop-color", "#ffaa00").attr("stop-opacity", 1);

// Red gradient for negative sentiment
const redGradient = defs.append("linearGradient")
    .attr("id", "redGradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "100%");
redGradient.append("stop").attr("offset", "0%").attr("stop-color", "#e63946").attr("stop-opacity", 1);
redGradient.append("stop").attr("offset", "100%").attr("stop-color", "#c41e3a").attr("stop-opacity", 1);

// Silver gradient for neutral
const silverGradient = defs.append("linearGradient")
    .attr("id", "silverGradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "100%");
silverGradient.append("stop").attr("offset", "0%").attr("stop-color", "#c0c0c0").attr("stop-opacity", 1);
silverGradient.append("stop").attr("offset", "100%").attr("stop-color", "#8c8274").attr("stop-opacity", 1);

// Blue gradient for interactive elements
const blueGradient = defs.append("linearGradient")
    .attr("id", "blueGradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "100%");
blueGradient.append("stop").attr("offset", "0%").attr("stop-color", "#00d4ff").attr("stop-opacity", 1);
blueGradient.append("stop").attr("offset", "100%").attr("stop-color", "#0d47a1").attr("stop-opacity", 1);

// Glow filter for bubbles
const glowFilter = defs.append("filter")
    .attr("id", "glow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");
glowFilter.append("feGaussianBlur")
    .attr("stdDeviation", "4")
    .attr("result", "coloredBlur");
const feMerge = glowFilter.append("feMerge");
feMerge.append("feMergeNode").attr("in", "coloredBlur");
feMerge.append("feMergeNode").attr("in", "SourceGraphic");

// Strong glow filter
const strongGlowFilter = defs.append("filter")
    .attr("id", "strongGlow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");
strongGlowFilter.append("feGaussianBlur")
    .attr("stdDeviation", "8")
    .attr("result", "coloredBlur");
const feMergeStrong = strongGlowFilter.append("feMerge");
feMergeStrong.append("feMergeNode").attr("in", "coloredBlur");
feMergeStrong.append("feMergeNode").attr("in", "SourceGraphic");

// set colours for plot (updated to match new theme)
const color_mapping = {
    red: '#e63946',
    grey: '#c0c0c0',
    green: '#00d4ff',
    gold: '#ffd700',
    amber: '#ffaa00'
}

// Add X axis (using base width for viewBox scaling)
const x = d3.scaleLinear()
    .domain([0, 13])
    .range([0, baseWidth - margin.left - margin.right]);

svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "Xaxis axis")
    .style("opacity", 0)
    .call(d3.axisBottom(x));

// Add Y axis
const y = d3.scaleLinear()
    .domain([0, 2])
    .range([height, 0]);

svg.append("g")
    .attr("class", "Yaxis axis")
    .style("opacity", 0)
    .call(d3.axisLeft(y));

// Add a scale for bubble size
const z = d3.scaleLinear()
    .domain([0, 1])
    .range([1, 4]);

var tooltip = d3.select("#chart0")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("left", "0px")
    .style("top", "0px")

// change tooltip text based on position in story
function returnTooltipText(step, d) {
    switch (step) {
        case 'title':
            return `<strong style="color: #ffd700;">${d.index}: ${d.title}</strong>`
            break;
        case 'title score':
            const scoreColor = d.score > 0.1 ? '#00d4ff' : d.score < -0.1 ? '#e63946' : '#c0c0c0';
            return `<strong style="color: #ffd700;">${d.index}: ${d.title}</strong><br/>
                    <span style="color: ${scoreColor};">Sentiment: ${d.score.toFixed(3)}</span>`
            break;
        case 'title score magnitude':
            const scoreColor2 = d.score > 0.1 ? '#00d4ff' : d.score < -0.1 ? '#e63946' : '#c0c0c0';
            return `<strong style="color: #ffd700;">${d.index}: ${d.title}</strong><br/>
                    <span style="color: ${scoreColor2};">Sentiment: ${d.score.toFixed(3)}</span><br/>
                    <span style="color: #c0c0c0;">Magnitude: ${d.magnitude.toLocaleString()}</span>`
            break;
    }
}

// create 2 functions to show and hide the tooltip
var showTooltip = function (event, d) {
    tooltip
        .transition()
        .duration(300)
        .style("opacity", 1)
        .html(returnTooltipText(toolTipState, d))

    // Get mouse position relative to the chart container
    const chartRect = d3.select("#chart0").node().getBoundingClientRect();
    const [x, y] = d3.pointer(event, d3.select("#chart0").node());

    tooltip
        .style("left", (x + 20) + "px")
        .style("top", (y - 10) + "px")
}

var hideTooltip = function (d) {
    tooltip
        .transition()
        .duration(300)
        .style("opacity", 0)
}

// add bubble chart with staggered entrance animation
const bubbleChart = svg.append('g')
    .attr("class", "chart")
    .selectAll("circle.bubbles")
    .data(data)
    .join("circle")
    .attr("class", "bubbles")
    .attr("cx", d => x(d.index))
    .attr("cy", d => y(1))
    .attr("r", 0)
    .style("fill", "url(#silverGradient)")
    .style("stroke", "#ffd700")
    .style("stroke-width", 2)
    .attr("filter", "url(#glow)")
    .on("mouseover", function(event, d) {
        showTooltip(event, d);
        d3.select(this)
            .transition()
            .duration(200)
            .attr("filter", "url(#strongGlow)")
            .attr("r", function() { return parseFloat(d3.select(this).attr("r")) * 1.2; })
    })
    .on("mousemove", function(event, d) {
        showTooltip(event, d);
    })
    .on("mouseleave", function(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("filter", "url(#glow)")
            .attr("r", function() { return parseFloat(d3.select(this).attr("r")) / 1.2; })
        hideTooltip(d);
    })

// Staggered entrance animation
bubbleChart
    .transition()
    .delay((d, i) => i * 100)
    .duration(800)
    .ease(d3.easeElasticOut)
    .attr("r", 10)

let bubbleRadius = 'pop'
var xAxis = d3.axisBottom().scale(x);
var yAxis = d3.axisLeft().scale(y);

// various functions to update chart elements

function dotColorGrey() {
    bubbleChart
        .data(data)
        .transition()
        .duration(1200)
        .ease(d3.easeCubicInOut)
        .attr("r", 10)
        .style("fill", "url(#silverGradient)")
        .style("stroke", "#ffd700")
        .style("stroke-width", 2)
}

function dotColorSentiment() {
    bubbleChart
        .data(data)
        .transition()
        .duration(1200)
        .ease(d3.easeCubicInOut)
        .delay((d, i) => i * 50)
        .attr("r", 10)
        .style("fill", function (d) {
            if (d.score > 0.1) {
                return "url(#goldGradient)"
            } else if (d.score < -0.1) {
                return "url(#redGradient)"
            } else {
                return "url(#silverGradient)"
            }
        })
        .style("stroke", function (d) {
            if (d.score > 0.1) {
                return "#ffd700"
            } else if (d.score < -0.1) {
                return "#e63946"
            } else {
                return "#c0c0c0"
            }
        })
        .style("stroke-width", 2)
}

function dotResize() {
    x.domain([0, 13]);

    svg.selectAll(".Xaxis")
        .transition()
        .duration(1000)
        .call(xAxis);

    y.domain([0, 2]);

    svg.selectAll(".Yaxis")
        .transition()
        .duration(1000)
        .call(yAxis);

    bubbleChart
        .data(data)
        .transition()
        .duration(1000)
        .attr("cx", d => x(d.index))
        .attr("cy", d => y(1))
        .attr("r", d => (d.magnitude / 1000000 * 2.7));

}

function dotPositionScore() {
    x.domain([-.8, .8])
        .range([0, baseWidth - margin.left - margin.right]);

    svg.selectAll(".Xaxis")
        .transition()
        .duration(1200)
        .ease(d3.easeCubicInOut)
        .style("opacity", 1)
        .call(xAxis);

    y.domain([0, 2])
        .range([baseHeight - margin.top - margin.bottom, 0]);

    svg.selectAll(".Yaxis")
        .transition()
        .duration(1200)
        .ease(d3.easeCubicInOut)
        .call(yAxis);

    bubbleChart
        .data(data)
        .transition()
        .duration(1500)
        .ease(d3.easeCubicInOut)
        .delay((d, i) => i * 60)
        .attr("cx", d => x(d.score))
        .attr("cy", d => y(1))
        .style("fill", function (d) {
            if (d.score > 0.1) {
                return "url(#goldGradient)"
            } else if (d.score < -0.1) {
                return "url(#redGradient)"
            } else {
                return "url(#silverGradient)"
            }
        })
}

function dotPositionMagnitude() {
    y.domain([1, d3.max(data, function (d) { return d.magnitude + 1 })])
        .range([baseHeight - margin.top - margin.bottom, 0]);

    svg.selectAll(".Yaxis")
        .transition()
        .duration(1200)
        .ease(d3.easeCubicInOut)
        .style("opacity", 1)
        .call(yAxis);

    bubbleChart
        .data(data)
        .transition()
        .duration(1000)
        .style("fill", function (d) {
            if (d.score > 0) {
                return color_mapping.green
            } else if (d.score < 0) {
                return color_mapping.red
            } else {
                return color_mapping.grey
            }
        })
        .attr("r", d => (d.magnitude / 1000000 * 2))
        .attr("cy", d => y(d.magnitude))
}

function dotSimplify() {
    bubbleChart
        .data(data)
        .transition()
        .duration(1200)
        .ease(d3.easeCubicInOut)
        .style("fill", "#1a1a2e")
        .style("stroke", "#ffd700")
        .style("stroke-width", 1)
        .attr("r", 5)
        .attr("filter", "url(#glow)")
}

function toggleAxesOpacity(toggleX, toggleY, opacity) {
    if (toggleX) {
        svg.selectAll(".Xaxis")
            .transition()
            .duration(1000)
            .style("opacity", opacity)
    }

    if (toggleY) {
        svg.selectAll(".Yaxis")
            .transition()
            .duration(1000)
            .style("opacity", opacity)
    }
}

function drawStraightPath() {
    if (typeof line === 'undefined') {
        var path = d3.path();

        for (var item = 0; item < data.length; item++) {
            let x_value = data[item].score
            let y_value = data[item].magnitude
            if (item === 0) {
                path.moveTo(x(x_value), y(y_value));
            } else {
                path.lineTo(x(x_value), y(y_value));
            }
        }

        window.line = svg.append("path")
            .attr("class", "straight")
            .attr("d", path)
            .attr("stroke", "url(#goldGradient)")
            .attr("fill", "none")
            .attr("stroke-width", 3)
            .attr("filter", "url(#glow)")

        window.totalLength = line.node().getTotalLength()
    }

    line
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(3000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
}

function hideStraightPath() {
    line
        .transition()
        .duration(3000)
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)

}

function toggleElementOpacity(element, opacity) {
    element
        .transition()
        .duration(1000)
        .style("opacity", opacity)
}

//	filter the dataset based on genres
var actions = popularity_csv.filter(function (d) { return d.genre === "Action"; });
var comedies = popularity_csv.filter(function (d) { return d.genre === "Comedy"; });
var dramas = popularity_csv.filter(function (d) { return d.genre === "Drama"; });
var horrors = popularity_csv.filter(function (d) { return d.genre === "Horror"; });

// parse the date / time
var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
popularity_csv.forEach(function (d) {
    d.year = parseTime(d.year);
    d.likes = +d.likes;
});

function drawDotChart() {
    console.log(movies_csv);

    var filteredMovies = d3.nest()
        .key(function (d) {
            if (d.cast_total_facebook_likes < 105000) {
                return d;
            }
        })
        .entries(movies_csv);

    var cleanedMovies = filteredMovies[0].values;
    console.log("cleanedMovies", cleanedMovies)

    cleanedMovies.forEach(movie => {
        Object.keys(movie).forEach(key => {
            movie[key] = isNaN(movie[key]) ? movie[key] : Number(movie[key]);
        });
    });

    // Creating brushing and linked scatterplots
    var durationExtent = d3.extent(cleanedMovies, row => row.duration);
    var likesExtent = d3.extent(cleanedMovies, row => row.movie_facebook_likes);
    var budgetExtent = d3.extent(cleanedMovies, row => row.budget);
    var director_facebook_likesExtent = d3.extent(cleanedMovies, row => row.director_facebook_likes);
    var imdbExtent = d3.extent(cleanedMovies, row => row.imdb_score);
    var castLikesExtent = d3.extent(cleanedMovies, row => row.cast_total_facebook_likes);

    var xScale = d3.scaleLinear().domain(director_facebook_likesExtent).range([50, 300]);
    var yScale = d3.scaleLinear().domain(imdbExtent).range([470, 50]);

    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);

    function createChart(chartId, transform = null) {
        return svg.append('g')
            .attr("class", "chart")
            .attr("id", chartId)
            .attr("width", width)
            .attr("height", height)
            .attr("transform", transform);
    }

    var chart1 = createChart("dot-chart-1");
    var chart2 = createChart("dot-chart-2", "translate(400,0)");

    var brushContainer1 = chart1.append('g').attr("id", "brushContainer1")
    var brushContainer2 = chart2.append('g').attr("id", "brushContainer2")

    // Create gradient for IMDB score ranges
    const scoreGradients = {};
    const scoreRanges = [
        { min: 0, max: 2, colors: ['#c41e3a', '#8b0000'] },
        { min: 2, max: 4, colors: ['#e63946', '#c41e3a'] },
        { min: 4, max: 6, colors: ['#8c8274', '#6b6358'] },
        { min: 6, max: 8, colors: ['#00d4ff', '#0099cc'] },
        { min: 8, max: 10, colors: ['#ffd700', '#ffaa00'] }
    ];

    scoreRanges.forEach((range, idx) => {
        const grad = defs.append("radialGradient")
            .attr("id", `scoreGradient-${idx}`)
            .attr("cx", "50%").attr("cy", "50%");
        grad.append("stop").attr("offset", "0%").attr("stop-color", range.colors[0]).attr("stop-opacity", 0.9);
        grad.append("stop").attr("offset", "100%").attr("stop-color", range.colors[1]).attr("stop-opacity", 0.7);
        scoreGradients[`${range.min}-${range.max}`] = `url(#scoreGradient-${idx})`;
    });

    function getFillColor(d) {
        if (d.imdb_score >= 0 && d.imdb_score < 2) {
            return scoreGradients['0-2'];
        } else if (d.imdb_score >= 2 && d.imdb_score < 4) {
            return scoreGradients['2-4'];
        } else if (d.imdb_score >= 4 && d.imdb_score < 6) {
            return scoreGradients['4-6'];
        } else if (d.imdb_score >= 6 && d.imdb_score < 8) {
            return scoreGradients['6-8'];
        } else if (d.imdb_score >= 8) {
            return scoreGradients['8-10'];
        }
        return scoreGradients['4-6'];
    }

    function updateChart3(d) {
        document.getElementById("title").innerHTML = d.movie_title;
        document.getElementById("movie_choice").value = d.movie_title;
        document.getElementById("imdb").innerHTML = d.imdb_score;
        document.getElementById("movie_likes").innerHTML = d.movie_facebook_likes;
        document.getElementById("cast_likes").innerHTML = d.cast_total_facebook_likes;
        document.getElementById("director").innerHTML = d.director_name !== "No Director" ? d.director_name : "Unknown";
        document.getElementById("year").innerHTML = d.title_year !== 0 ? d.title_year : "Unknown";
        document.getElementById("gross").innerHTML = d.gross !== 0 ? "$" + d.gross : "Unknown";
        document.getElementById("budget").innerHTML = d.budget !== 0 ? "$" + d.budget : "Unknown";
    }

    function circleClickHandler(d, chart) {
        d3.selectAll("circle").classed("selected", false);
        d3.select(this).classed("selected", true);
        chart.selectAll("circle").filter(f => f === d).classed("selected", true);
        updateChart3(d);
    }

    const temp1 = chart1.selectAll("circle")
        .data(cleanedMovies)
        .enter()
        .append("circle")
        .attr("id", (d, i) => i)
        .attr("fill", d => getFillColor(d))
        .style("stroke", "#ffd700")
        .style("stroke-width", 1.5)
        .style("opacity", 0.85)
        .attr("cx", d => (d.movie_title !== "Treachery" && d.movie_title !== "Hardflip" && d.movie_title !== "kickboxer: vengeance") ? xScale(d.director_facebook_likes) : undefined)
        .attr("cy", d => yScale(d.imdb_score))
        .attr("r", 0)
        .attr("filter", "url(#glow)")
        .on("mouseenter", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("filter", "url(#strongGlow)")
                .style("stroke-width", 3)
                .attr("r", function() { return parseFloat(d3.select(this).attr("r")) * 1.3; });
        })
        .on("mouseleave", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("filter", "url(#glow)")
                .style("stroke-width", 1.5)
                .attr("r", function(d) { return (d.budget / 30000000) + 3; });
        })
        .on("click", function (d) {
            circleClickHandler.call(this, d, chart2);
        })
        .transition()
        .duration(1200)
        .ease(d3.easeElasticOut)
        .delay((d, i) => i * 2)
        .attr("r", d => (d.budget / 30000000) + 3);

    chart1.append("text")
        .attr("x", baseWidth - 700)
        .attr("y", baseHeight - 5)
        .text("Popularity of the Director (FB Likes))");

    chart1.append("text")
        .attr("y", 0)
        .attr("x", -300)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("IMDB Score");


    chart1
        .append("g") // create a group node
        .attr("transform", "translate(0," + (baseHeight - 20) + ")")
        .call(xAxis) // call the axis generator
        .append("text")
        .attr("class", "label")
        .attr("x", baseWidth - 16)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Duration of Film");

    chart1
        .append("g") // create a group node
        .attr("transform", "translate(30, 0)")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("x", -15)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("IMDb Score (Out Of 10)");


    var xScale2 = d3.scaleLinear().domain(castLikesExtent).range([50, 300]);
    var yScale2 = d3.scaleLinear().domain(imdbExtent).range([470, 50]);

    var xAxis2 = d3.axisBottom().scale(xScale2);
    var yAxis2 = d3.axisLeft().scale(yScale2);

    // console.log("castextent: ", castLikesExtent);

    var temp2 = chart2.selectAll("circle")
        .data(cleanedMovies)
        .enter()
        .append("circle")
        .attr("id", function (d, i) { return i; })
        .attr("fill", d => getFillColor(d))
        .style("stroke", "#ffd700")
        .style("stroke-width", 1.5)
        .style("opacity", 0.85)
        .attr("cx", function (d) {
            if (d.movie_title != "Treachery" || d.movie_title != "Hardflip" || d.movie_title != "kickboxer: vengeance") {
                return xScale2(d.cast_total_facebook_likes);
            }
        })
        .attr("cy", function (d) { return yScale2(d.imdb_score); })
        .attr("r", 0)
        .attr("filter", "url(#glow)")
        .on("mouseenter", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("filter", "url(#strongGlow)")
                .style("stroke-width", 3)
                .attr("r", function() { return parseFloat(d3.select(this).attr("r")) * 1.3; });
        })
        .on("mouseleave", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("filter", "url(#glow)")
                .style("stroke-width", 1.5)
                .attr("r", function(d) { return (d.budget / 30000000) + 3; });
        })
        .on("click", function (d) {
            circleClickHandler.call(this, d, chart1);
        })
        .transition()
        .duration(1200)
        .ease(d3.easeElasticOut)
        .delay((d, i) => i * 2)
        .attr("r", function (d) {
            return (d.budget / 30000000) + 3;
        });

    chart2.append("text")
        .attr("x", baseWidth - 700)
        .attr("y", baseHeight - 5)
        .text("Popularity of the Total Cast (FB Likes)");


    chart2.append("text")
        .attr("y", 0)
        .attr("x", -300)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("IMDB Score");

    chart2
        .append("g") // create a group node
        .attr("transform", "translate(0," + (baseHeight - 20) + ")")
        .call(xAxis2) // call the axis generator
        .append("text")
        .attr("class", "label")
        .attr("x", baseWidth - 16)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Popularity of the Director (FB Likes)");

    chart2
        .append("g") // create a group node
        .attr("transform", "translate(30, 0)")
        .call(yAxis2)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("x", -15)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("IMDb Score (Out Of 10)");

    var brush1 = d3.brush()
        .extent([[0, 0], [300, 470]])
        .on('start', brushStart1)
        .on('brush', brushMoving)
        .on('end', brushEnd);

    brushContainer1.call(brush1);

    var brush2 = d3.brush()
        .extent([[0, 0], [300, 470]])
        .on('start', brushStart2)
        .on('brush', brushMoving2)
        .on('end', brushEnd);

    brushContainer2.call(brush2);

    function brushStart1() {
        brushContainer2.call(brush1.move, null);
    }
    function brushStart2() {
        brushContainer1.call(brush2.move, null);
    }
    function brushMoving() {
        var selection = d3.event.selection;
        if (!selection) {
            return;
        }
        var [[left, top], [right, bottom]] = selection;
        chart2.selectAll("circle")
            .classed('selected2', function (d, i) {
                var cx = xScale(d.duration);
                var cy = yScale(d.imdb_score);
                return left <= cx && cx <= right && top <= cy && cy <= bottom;
            })
    }


    function brushMoving2() {
        var selection = d3.event.selection;
        if (!selection) {
            return;
        }
        var [[left, top], [right, bottom]] = selection;
        console.log([[left, top], [right, bottom]])
        chart1.selectAll("circle")
            .classed('selected2', function (d, i) {
                var cx = xScale2(d.cast_total_facebook_likes);
                var cy = yScale2(d.imdb_score);
                return left <= cx && cx <= right && top <= cy && cy <= bottom;
            })
    }

    function brushEnd() {
        if (!d3.event.selection) {
            d3.selectAll("circle").classed('selected2', false);
        }
    }

    //	brushing finished

    var imdbs = d3.nest()
        .rollup(function (v) { return d3.sum(v, function (d) { return d.imdb_score; }); })
        .object(cleanedMovies);
    // console.log("imdbs....", imdbs);
}

function hideDotChart() {
    svg.selectAll("#dot-chart-1").remove()
    svg.selectAll("#dot-chart-2").remove()
}

function drawBarChart() {

    let movies = movies_csv;
    console.log("bar", movies);

    let filteredMovies = d3.nest()
        .key(function (d) {
            if (d.cast_total_facebook_likes < 105000) {
                return d;
            }
        })
        .entries(movies_csv);

    let cleanedMovies = filteredMovies[0].values;

    cleanedMovies.forEach(movie => {
        movie.director_name = movie.director_name;
        movie.num_critic_for_reviews = Number(movie.num_critic_for_reviews);
        movie.duration = Number(movie.duration);
        movie.gross = Number(movie.gross);
        movie.movie_title = movie.movie_title
        movie.language = movie.language;
        movie.country = movie.country;
        movie.title_year = Number(movie.title_year);
        movie.imdb_score = Number(movie.imdb_score);
        movie.movie_facebook_likes = Number(movie.movie_facebook_likes);
    });


    let durationExtent = d3.extent(cleanedMovies, row => row.duration);
    let likesExtent = d3.extent(cleanedMovies, row => row.movie_facebook_likes);
    let imdbExtent = d3.extent(cleanedMovies, row => row.imdb_score);
    let castLikesExtent = d3.extent(cleanedMovies, row => row.cast_total_facebook_likes);

    let xScale = d3.scaleLinear().domain(durationExtent).range([50, 470]);
    let yScale = d3.scaleLinear().domain(imdbExtent).range([470, 50]);

    let xAxis = d3.axisBottom().scale(xScale);
    let yAxis = d3.axisLeft().scale(yScale);


    let chart3 = svg.append('g')
        .attr("class", "chart")
        .attr("id", "chart3")

    let xScale3 = d3.scaleLinear().domain([0, 10]).range([0, baseWidth]);
    let yScale3 = d3.scaleLinear().domain([600, 0]).range([baseHeight, 0]);
    let yScaleAxis3 = d3.scaleLinear().domain([0, 600]).range([baseHeight, 0]);

    let xAxis3 = d3.axisBottom().scale(xScale3);
    let yAxis3 = d3.axisLeft().scale(yScaleAxis3);

    let imdbs = {
        0: 3, 2: 6, 3: 31, 4: 80, 5: 200, 6: 478, 7: 540, 8: 223, 9: 26, 10: 1
    };

    let colors = ["#fff5eb", "#fee8d3", "#fdd8b3", "#fdc28c", "#fda762", "#fb8d3d", "#f2701d", "#e25609", "#c44103", "#9f3303", "#7f2704"]

    chart3.selectAll(".bar")
        .data(cleanedMovies)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", (d, i) => {
            let score = Math.round(d.imdb_score);
            return colors[score - 2];
        })
        .attr("x", function (d) { return xScale3(Math.round(d.imdb_score)); })
        .attr("y", function (d) { return height - yScale3(imdbs[Math.round(d.imdb_score)]) })
        .attr("height", function (d) { return yScale3(imdbs[Math.round(d.imdb_score)] + 5); })
        .transition()
        .duration(2000)
        .attr("width", 70)
        .attr("transform", "translate(0, 10)");

    chart3.append("g")
        .attr("transform", "translate(70," + (baseHeight + 30) + ")")
        .attr("class", "axis")
        .call(xAxis3);

    chart3.append("g")
        .append("g") // create a group node
        .attr("transform", "translate(50, 10)")
        .call(yAxis3)
        .append("text")
        .attr("class", "label")
        .attr("y", 6)
        .attr("x", -15)
        .attr("dy", ".71em")
        .style("text-anchor", "end")

    chart3.append("text")
        .attr("y", 0)
        .attr("x", -300)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Number of Movies");

    chart3.append("text")
        .attr("x", baseWidth - 300)
        .attr("y", baseHeight + 30)
        .text("IMDB Scores from 0 to 10");
}

function hideBarChart() {
    svg.selectAll("#chart3").remove()
}

function drawStackedChart() {
    // append the svg object to the body of the page
    const data = stackData;
    console.log("stack", data);

    const stack_svg = svg.append('g')
        .attr("class", "chart")
        .attr("id", "stackchart");


    // List of groups = species here = value of the first column called group -> shown on the X axis
    const groups = d3.map(data, d => d.group).keys();

    // Add X axis
    const x = d3.scaleBand()
        .domain(groups)
        .range([0, baseWidth - 200])
        .padding([0.2]);

    stack_svg.append("g")
        .attr("transform", "translate(100," + (height - 100) + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .selectAll("text")
        .attr("transform", "translate(-10,20)rotate(-90)");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 700])
        .range([height - 100, 0]);

    stack_svg.append("g")
        .attr("transform", `translate(100,0)`)
        .call(d3.axisLeft(y));

    // Create gradient for each genre
    const genreGradients = {};
    const genreColors = {
        'Action': ['#e63946', '#c41e3a'],
        'Adventure': ['#ffd700', '#ffaa00'],
        'Animation': ['#00d4ff', '#0d47a1'],
        'Comedy': ['#ff6b6b', '#ee5a6f'],
        'Drama': ['#ffd700', '#ffaa00'],
        'Horror': ['#c41e3a', '#8b0000'],
        'Romance': ['#ff69b4', '#ff1493'],
        'Sci-Fi': ['#00d4ff', '#0099cc'],
        'Thriller': ['#9370db', '#7b68ee'],
        'Documentary': ['#32cd32', '#228b22'],
        'Family': ['#ffa500', '#ff8c00'],
        'Fantasy': ['#ba55d3', '#9370db']
    };

    subgroups.forEach(genre => {
        const colors = genreColors[genre] || ['#c0c0c0', '#8c8274'];
        const grad = defs.append("linearGradient")
            .attr("id", `gradient-${genre}`)
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%");
        grad.append("stop").attr("offset", "0%").attr("stop-color", colors[0]).attr("stop-opacity", 1);
        grad.append("stop").attr("offset", "100%").attr("stop-color", colors[1]).attr("stop-opacity", 1);
        genreGradients[genre] = `url(#gradient-${genre})`;
    });

    const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(subgroups.map(g => genreGradients[g] || d3.schemeCategory10[subgroups.indexOf(g)]));

    const parseDate = d3.timeParse("%Y");

    const stackedData = d3.stack().keys(subgroups)(data);

    // ----------------
    // Highlight a specific subgroup when hovered
    // ----------------

    // What happens when a user hovers over a bar
    const mouseover = function (d) {
        const subgroupName = d3.select(this.parentNode).datum().key;
        const subgroupValue = d.data[subgroupName];

        d3.selectAll(".myRect").style("opacity", 0.2);
        d3.selectAll(`.${subgroupName}`).style("opacity", 1);

        // Grey out all legends
        let genre = '';
        genre = subgroupName;

        // Highlight the selected one
        d3.select(".lineLegendThreshold").select(".legendCells").selectAll(".cell").attr("opacity", e => {
            const value = e === genre ? 1 : 0.2;
            return value;
        });
    };

    // When the user no longer hovers
    const mouseleave = function (d) {
        // Back to normal opacity: 0.8
        d3.selectAll(".myRect").style("opacity", 0.9);
        d3.select(".lineLegendThreshold").select(".legendCells").selectAll(".cell").attr("opacity", "1"); // back to normal
    };


    console.log("stackedData", stackedData)

    // Show the bars
    stack_svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter().append("g")
        .attr("fill", d => color(d.key))
        .attr("class", d => `myRect ${d.key}`) // Add a class to each subgroup: their name
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
        .attr("transform", "translate(100,0)")
        .attr("x", d => x(d.data.group))
        .attr("y", d => y(d[1]))
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
        .on("click", function (d) {
            const subgroupName = d3.select(this.parentNode).datum().key;
            const genre = subgroupName;

            d3.select("#barplot svg").remove(); // only for the 1st iteration
            const plotline_svg = d3.select("#barplot")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom + 150)
                .append("g")
                .attr("transform",
                    `translate(${margin.left},${margin.top + 150})`);

            genLinePlot(data, plotline_svg, genre, width, height, margin);
        })
        .transition()
        .duration(1000)
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .attr("stroke", "grey");

    // GENERATE LINE PLOT FOR GENRE --------------------------------------------------------------------

    function genLinePlot(data, svg, genre, width, height, margin) {
        // format the data

        new_data = [];
        flag = 0;

        for (row in data) {
            for (key in data[row]) {
                if (key == genre) {
                    new_data.push([data[row].group, genre, data[row][genre]]);
                }
            }
        }

        // Set the ranges
        var x1 = d3.scaleTime()
            .domain(d3.extent(new_data, function (d) {
                var year = d[0];
                return year;
            }))
            .range([0, (width - 400)]);
        var y1 = d3.scaleLinear()
            .domain([0, d3.max(new_data, function (d) {
                review = d[2];
                return +review;
            })])
            .range([(height - 150), 0]);

        // Define the line
        var valueline = d3.line()
            .x(function (d) {
                year = d[0];
                return x1(year);
            })
            .y(function (d) {
                review = d[2];
                return y1(review);
            });

        // Add the valueline path with gradient
        const lineGradient = defs.append("linearGradient")
            .attr("id", `lineGradient-${genre}`)
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%");
        const lineColors = genreColors[genre] || ['#c0c0c0', '#8c8274'];
        lineGradient.append("stop").attr("offset", "0%").attr("stop-color", lineColors[0]);
        lineGradient.append("stop").attr("offset", "100%").attr("stop-color", lineColors[1]);

        var path = svg.append("path")
            .data([new_data])
            .attr("class", "line")
            .attr("d", valueline)
            .style('stroke', `url(#lineGradient-${genre})`)
            .style('fill', "None")
            .style('stroke-width', 3)
            .attr("filter", "url(#glow)");

        // Variable to Hold Total Length
        var totalLength = path.node().getTotalLength();

        // Set Properties of Dash Array and Dash Offset and initiate Transition
        path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(4000)
            .ease(d3.easeCubicInOut)
            .attr("stroke-dashoffset", 0);

        // Add the X Axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (baseHeight - 150) + ")")
            .call(d3.axisBottom(x1).tickFormat(d3.timeFormat(parseDate)))
            .selectAll("text")
            .data(new_data)
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-90)")
            .text(function (d, i) {
                year = 0;
                if (i == 0) {
                    year = 1986
                }
                else if (i == 1) {
                    year = 1991
                }
                else if (i == 2) {
                    year = 1996
                }
                else if (i == 3) {
                    year = 2001
                }
                else if (i == 4) {
                    year = 2006
                }
                else if (i == 5) {
                    year = 2011
                }
                else if (i == 6) {
                    year = 2016
                }
                return year;
            });

        // Add the Y Axis
        svg.append("g")
            .attr("class", "axis")
            //               .attr("transform", "translate(0," + 71 + ")")
            .call(d3.axisLeft(y1));

        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", (baseWidth - 400))
            .attr("y", baseHeight - 110 + margin.top)
            .text("Year");

        // Y axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -margin.top + 20)
            .text(genre);
    }

    // Legend
    var g = stack_svg.append("g")
        .attr("class", "lineLegendThreshold")
        .attr("transform", "translate(-40,20)")
        .style("font-size", "11px");

    g.append("text")
        .attr("class", "line_caption")
        .attr("x", 0)
        .attr("y", -6)
        .text("Movie Genres")
        .style("font-size", "14px")
        .style("font-weight", "bold");

    var legend = d3.legendColor()
        .labels(function (d) {
            return subgroups[d.i];
        })
        .shapePadding(0)
        .scale(color);

    stack_svg.select(".lineLegendThreshold")
        .call(legend);

}

function hideStackedChart() {
    svg.selectAll("#stackchart").remove()
}
