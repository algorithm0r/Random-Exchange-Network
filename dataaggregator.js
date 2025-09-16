var socket = io.connect(PARAMETERS.ip);
var context;
var ticks = 1001;
var height = 100;
var xDelta = 1;
var width = xDelta * ticks;
var numRecords = 0;
var page = 0;
var data = [];
var limit = 20;

var query;
var filter;
var obj;

socket.on("connect", function () {
    databaseConnected();
});

socket.on("disconnect", function () {
    databaseDisconnected();
});

document.addEventListener("DOMContentLoaded", function (event) {
    context = document.getElementById("chart").getContext("2d");

    console.log("DOM loaded.");

    socket.emit("distinct",
        {
            db: PARAMETERS.db,
            collection: PARAMETERS.collection,
            key: "run"
        });

    document.getElementById("query").addEventListener("click", function (e) {
        query = document.getElementById("run_selection").value;
        document.getElementById("query_info").innerHTML = "Query Sent. Awaiting Reply.";

        filter = null;

        console.log(query);
        console.log(filter);

        socket.emit("count",
            {
                db: PARAMETERS.db,
                collection: PARAMETERS.collection,
                query: { "run": query },
            });

    }, false);

    document.getElementById("Next Query").addEventListener("click", function (e) {
        let selector = document.getElementById("run_selection");
        selector.selectedIndex = (selector.selectedIndex + 1) % selector.options.length;
        query = selector.value;
        document.getElementById("query_info").innerHTML = "Query Sent. Awaiting Reply.";
        filter = null;

        console.log(query);
        console.log(filter); 

        socket.emit("count",
            {
                db: PARAMETERS.db,
                collection: PARAMETERS.collection,
                query: { "run": query },
            });
    }, false);

    document.getElementById("download").addEventListener("click", function (e) {
        console.log("Download clicked.");
        console.log(obj);
        if (obj.run) {

        }
    }, false);
});

socket.on("count", function (length) {
    numRecords = length;
    document.getElementById("query_info").innerHTML = `Received 0 of ${numRecords} records.`;
    page = 0;
    data = [];
    // for (var i = 0; i < length/limit; i++) {
    socket.emit("find",
        {
            db: PARAMETERS.db,
            collection: PARAMETERS.collection,
            query: { run: query },
            filter: filter,
            limit: limit,
            page: page
        });
    console.log(`Requesting page ${page} of size ${limit}.`);
    // }
});

socket.on("find", function (array) {
    if (array.length > 0) {
        console.log("Find: data received.")

        data.push(...array);
        document.getElementById("query_info").innerHTML = `Received ${data.length} of ${numRecords} records.`;

        parseData(data);

        if(data.length < numRecords) socket.emit("find",
            {
                db: PARAMETERS.db,
                collection: PARAMETERS.collection,
                query: { run: query },
                filter: filter,
                limit: limit,
                page: ++page
            });
        console.log(`Requesting page ${page} of size ${limit}.`);

    }
    else console.log("Empty data.");
});

socket.on("distinct", function (array) {
    document.getElementById("query_info").innerHTML = "Ready to Query";
    console.log(array);
    console.log("\n");

    if (array.length > 0) populateDropDown(array);
    else console.log("Empty data.");
});

function populateDropDown(labels) {
    const runSelect = document.getElementById("run_selection");

    // Populate the dropdown with names
    labels.forEach((label) => {
        const option = document.createElement("option");
        option.value = label;
        option.textContent = label;
        runSelect.appendChild(option);
    });
}

function serializeGraph(timeSeriesList) {
    if (timeSeriesList.length === 0) {
        return "";
    }

    const numSeries = timeSeriesList.length;
    const numDataPoints = timeSeriesList[0].length;
    let csvString = "";
    // for (let dataIndex = 0; dataIndex < numDataPoints; dataIndex++) {
    //     for (let seriesIndex = 0; seriesIndex < numSeries; seriesIndex++) {
    for (let seriesIndex = 0; seriesIndex < numSeries; seriesIndex++) {
        for (let dataIndex = 0; dataIndex < numDataPoints; dataIndex++) {

            csvString += timeSeriesList[seriesIndex][dataIndex];
            if (seriesIndex < numDataPoints - 1) {
                csvString += ",";
            }
        }
        csvString += "\n";
    }

    return csvString;
}

function serializeHist(hist) {
    var str = "";
    for (var i = 0; i < ticks; i++) {
        str += hist[i] + "\n";
    }
    return str;
};

function combineHistograms(data, identifier) {
    var histogram = [];

    for (var i = 0; i < ticks; i++) {
        histogram.push([]);
        for (var j = 0; j < 20; j++) {
            histogram[i].push(0);
        }
    }

    for (var j = 0; j < ticks; j++) {
        for (var k = 0; k < 20; k++) {
            for (var i = 0; i < data.length; i++) {
                if(j >= data[i][identifier].length) continue;
                histogram[j][k] += data[i][identifier][j][k];
            }
        }
    }
    return histogram;
};

function parseData(data) {
    // create arrays full of zeros
    let avgPopulation = [];
    let totalPopulation = [];
    let avgUpperClass = [];
    let avgLowerClass = [];
    let avgNullPopulation = [];
    let avgGini = [];
    let avgAverageWealth = [];
    let avgMaxWealth = [];
    let avgMinWealth = [];
    for(let j =0; j < ticks; j++) {
        avgPopulation.push(0);
        totalPopulation.push(0);
        avgUpperClass.push(0);
        avgLowerClass.push(0);
        avgNullPopulation.push(0);
        avgGini.push(0);
        avgAverageWealth.push(0);
        avgMaxWealth.push(0);
        avgMinWealth.push(0);
    }

    let runs = data.length;

    for(let i =0; i < runs; i++) {
        for(let j =0; j < ticks; j++) {
            totalPopulation[j] += data[i].population[j];
            avgPopulation[j] += data[i].population[j];
            avgUpperClass[j] += data[i].upperClass[j];
            avgLowerClass[j] += data[i].lowerClass[j];
            avgNullPopulation[j] += data[i].nullPopulation[j];
            avgGini[j] += data[i].gini[j];
            avgAverageWealth[j] += data[i].averageWealth[j];
            avgMaxWealth[j] += data[i].maxWealth[j];
            avgMinWealth[j] += data[i].minWealth[j];
        }
    }
    for(let j =0; j < ticks; j++) {
        avgPopulation[j] /= runs;
        avgUpperClass[j] /= runs;
        avgLowerClass[j] /= runs;
        avgNullPopulation[j] /= runs;
        avgGini[j] /= runs;
        avgAverageWealth[j] /= runs;
        avgMaxWealth[j] /= runs;
        avgMinWealth[j] /= runs;
    }

    let histogramWealth = combineHistograms(data, "wealthDistribution");

    obj = {
        run: data[0].run,
        totalPopulation,
        avgPopulation,
        avgUpperClass,
        avgLowerClass,
        avgNullPopulation,
        avgGini,
        avgAverageWealth,
        avgMaxWealth,
        avgMinWealth,   
        histogramWealth,
    };

    drawData(runs);
    labelRun(data[0].run);
}

function labelRun(run) {

}

function drawData(runs) {
    context.font = "10px Arial";
    context.clearRect(0, 0, 2400, 1000);
    context.textAlign = "start";
    let maxHuman = 100;
    let maxWealth = 10000;

    context.fillStyle = "#eeeeee";
    context.fillRect(0, 0, width, height);

    drawGraph(context, "Black", 0, obj.avgPopulation, maxHuman, false);
    drawGraph(context, "Green", 0, obj.avgUpperClass, maxHuman, false);
    drawGraph(context, "Blue", 0, obj.avgLowerClass, maxHuman, true);

    // Draw the average wealth graphs
    drawGraph(context, "Black", 115, obj.avgAverageWealth, maxWealth, false);
    drawGraph(context, "Green", 115, obj.avgMaxWealth, maxWealth, false);
    drawGraph(context, "Blue", 115, obj.avgMinWealth, maxWealth, true);

    // Draw the Gini graph
    drawGraph(context, "Red", 230, obj.avgGini, 1, true);
    // histograms = [];

    drawHistogram(context, 0, 345, obj.histogramWealth, obj.totalPopulation, "Wealth Distribution");

    // labels = [];

    // histograms.push(obj.histogramRoots);
    // labels.push("Deep Roots");
    // histograms.push(obj.histogramWeight);
    // labels.push("Seed Weight");
    // histograms.push(obj.histogramSeeds);
    // labels.push("Fecundity");
    // // histograms.push(obj.histogramEnergy);
    // // labels.push("Fruit Energy");
    // histograms.push(obj.histogramDisp);
    // labels.push("Dispersal");

    // histograms.push(obj.histogramRootsWild);
    // labels.push("Deep Roots - Wild");
    // histograms.push(obj.histogramWeightWild);
    // labels.push("Seed Weight - Wild");
    // histograms.push(obj.histogramSeedsWild);
    // labels.push("Fecundity - Wild");
    // // histograms.push(obj.histogramEnergyWild);
    // // labels.push("Fruit Energy - Wild");
    // histograms.push(obj.histogramDispWild);
    // labels.push("Dispersal - Wild");

    // histograms.push(obj.histogramRootsDomesticated);
    // labels.push("Deep Roots - Domesticated");
    // histograms.push(obj.histogramWeightDomesticated);
    // labels.push("Seed Weight - Domesticated");
    // histograms.push(obj.histogramSeedsDomesticated);
    // labels.push("Fecundity - Domesticated");
    // // histograms.push(obj.histogramEnergyDomesticated);
    // // labels.push("Fruit Energy - Domesticated");
    // histograms.push(obj.histogramDispDomesticated);
    // labels.push("Dispersal - Domesticated");

    // for (var i = 0; i < histograms.length; i++) {
    //     drawHistogram(ctx, 0, 55 + 55 * i, histograms[i], totals, labels[i]);
    // }

    // ctx.strokeStyle = "black";
    // ctx.strokeRect(0, 0, width, height);

    context.font = "20px Arial";
    context.fillText(obj.run, 10, 900);
    context.fillText("Runs: " + runs, 10, 950);
}

function drawGraph(ctx, color, start, obj, maxVal, labeling) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    var initAnt = height + start - Math.floor(obj[0] / maxVal * height);
    ctx.moveTo(0, initAnt);
    for (var i = 0; i < ticks; i++) {
        var yPos = height + start - Math.floor(obj[i] / maxVal * height);
        ctx.lineTo(i * xDelta, yPos);
    }
    ctx.stroke();
    ctx.closePath();

    if (labeling) {
        ctx.fillStyle = "#000000";
        ctx.fillText(Math.ceil(maxVal), width + 4, start + 10);
        ctx.fillText(10000, width / 2 - 15, start + height + 10);
        ctx.fillText(20000, width - 15, start + height + 10);
    }
}

function drawHistogram(ctx, xStart, yStart, histogramData, histogramTotals, label) {
    ctx.fillRect(xStart * xDelta, yStart, width, height);
    ctx.fillStyle = "#eeeeee";
    // console.log(`drawing histogram ${label}`);
    for (var i = 0; i < ticks; i++) {
        var sum = 0;
        for (var j = 0; j < 20; j++) {
            sum += histogramData[i][j];
            fill(ctx, histogramData[i][j] / histogramTotals[i], yStart, xStart + i, 19 - j);
        }
        // if(sum != totalSeeds[i]) {
        //     console.log(`i: ${i} sum: ${sum} totalSeeds[i]: ${totalSeeds[i]}`);
        // }
    }

    ctx.strokeStyle = "black";
    ctx.strokeRect(xStart * xDelta, yStart, width, height);

    ctx.fillStyle = "Black";
    ctx.fillText(label, xStart * xDelta + width / 2 - 30, yStart + height + 10);
}

function fill(ctx, color, start, x, y) {
    var base = 16;
    var c = color * (base - 1) + 1;
    c = 511 - Math.floor(Math.log(c) / Math.log(base) * 512);
    if (c > 255) {
        c = c - 256;
        ctx.fillStyle = rgb(c, c, 255);
    }
    else {
        //c = 255 - c;
        ctx.fillStyle = rgb(0, 0, c);
    }

    ctx.fillRect(x * xDelta,
        start + (y * height / 20),
        xDelta,
        height / 20);

}