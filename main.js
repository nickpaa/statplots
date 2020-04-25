const distrField = document.getElementById('distrField');
const meanField = document.getElementById('meanField');
const whichSigma = document.getElementsByName('whichSigma');
const useSD = document.getElementById('useSD');
const useVar = document.getElementById('useVar');
const sdField = document.getElementById('sdField');
const varField = document.getElementById('varField');
const whichPlot = document.getElementsByName('whichPlot');
const plotPDF = document.getElementById('plotPDF');
const plotCDF = document.getElementById('plotCDF');
const update = document.getElementById('update');

const canvas = document.querySelector('canvas');
const ctx = document.getElementById('chart').getContext('2d');

const buttons = document.getElementById('formulaButtons');
const pyButton = document.getElementById('pyButton');
const rButton = document.getElementById('rButton');
const jsButton = document.getElementById('jsButton');
const xlButton = document.getElementById('xlButton');

const table = document.getElementById('formulaTable');

const N = 400;

const syntaxes = ['p','r','j','x'];
const methods = ['pdf','cdf','pct','rv'];

let mean;
let sd;
let _var;
let plotThis = 'pdf';
let x = [];
let y = [];
let firstChart = true;

// user inputs

meanField.onblur = updateMean;

function updateMean() {
    mean = Number(meanField.value);
}

useSD.onclick = updateSDandVar;
useVar.onclick = updateSDandVar;
sdField.onblur = updateSDandVar;
varField.onblur = updateSDandVar;

function updateSDandVar() {
    if (whichSigma[0].checked) {
        sdField.disabled = false;
        varField.disabled = true;
        varField.value = sdField.value * sdField.value;
        sd = Number(sdField.value);
        _var = Number(varField.value);
    }
    else {
        sdField.disabled = true;
        varField.disabled = false;
        sdField.value = Math.sqrt(varField.value);
        sd = Number(sdField.value);
        _var = Number(varField.value);
    }
}

plotPDF.onclick = updateWhichPlot;
plotCDF.onclick = updateWhichPlot;

function updateWhichPlot() {
    if (whichPlot[0].checked) {
        plotThis = 'pdf';
    }
    else {
        plotThis = 'cdf';
    }
}

function validateInputs() {
    if (sdField.value < 0) {
        alert('Standard deviation must be positive');
        return false;
    }

    if (varField.value < 0) {
        alert('Variance must be positive');
        return false;
    }

    if (distrField.value === 'normal') {
        
    }

    if (distrField.value === 'exponential') {
        sdField.value = meanField.value;
        varField.value = meanField.value * meanField.value;
    }
}

update.onclick = updatePage;

function setIncrement(min, max) {
    return (max - min) / N;
}

function calcNormal() {
    // if (sd <= 0) {
    //     alert('Standard deviation must be positive')
    //     return;
    // }

    let minX = mean - 4 * sd;
    let maxX = mean + 4 * sd;
    let inc = setIncrement(minX, maxX);
    
    for (let i = 0; i <= N; i++) {
        x[i] = Math.round((minX + i * inc) * 100) / 100;
        if (plotThis === 'pdf') {
            y[i] = jStat.normal.pdf(x[i], mean, sd);
        }
        else {
            y[i] = jStat.normal.cdf(x[i], mean, sd);
        }
    }
}

function calcExponential() {
    if (mean != sd) {
        alert('Mean and standard deviation must be equal')
        return;
    }

    let minX = 0;
    let maxX = mean + 4 * sd;
    let inc = setIncrement(minX, maxX);
    
    for (let i = 0; i <= N; i++) {
        x[i] = Math.round((minX + i * inc) * 100) / 100;
        if (plotThis === 'pdf') {
            y[i] = jStat.exponential.pdf(x[i], 1 / mean);
        }
        else {
            y[i] = jStat.exponential.cdf(x[i], 1 / mean);
        }
    }
}

function calcPoisson() {
    if (mean != sd) {
        alert('Mean and standard deviation must be equal')
        return;
    }
    let minX = 0;
    let maxX = 4 * sd;
    // let inc = setIncrement(minX, maxX);

    let lambda = mean;
    
    for (let i = 0; i <= maxX; i++) {
        x[i] = i;
        if (plotThis === 'pdf') {
            y[i] = jStat.poisson.pdf(x[i], mean);
        }
        else {
            y[i] = jStat.poisson.cdf(x[i], mean);
        }
    }
}

function updatePage() {
    validateInputs();

    ////////////////////
    // maintenance stuff
    ////////////////////

    x = [];
    y = [];

    // mean = Number(meanField.value);
    // sd = Number(sdField.value);
    updateMean();
    updateSDandVar();

    let plotType;
    // let distrType;
    let cont;
    let radius;

    if (distrField.value === 'normal') {
        calcNormal();
        // plotType = 'line';
        // distrType = 
        cont = true;
        radius = 0;
    }
    else if (distrField.value === 'exponential') {
        calcExponential();
        // plotType = 'line';
        cont = true;
        radius = 0;
    }
    else if (distrField.value === 'poisson') {
        calcPoisson();
        // plotType = 'line';
        cont = false;
        radius = 5;
    }

    ////////////////////
    // plotting
    ////////////////////

    if (!firstChart) chart.destroy();

    firstChart = false;

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: x,
            datasets: [
                {
                    data: y,
                    label: plotThis,
                    borderColor: '#blue',
                    backgroundColor: 'blue',
                    fill: cont,
                    showLine: cont,
                    pointRadius: radius,
                    pointHitRadius: 5
                }
            ],
        },
        options: {
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'x'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: plotThis
                    }
                }]
            }
        }
    })

    ////////////////////
    // generate table
    ////////////////////

    buttons.hidden = false;

    pmethods = {
        "pdf": "norm.pdf(x, loc=" + mean + ", scale=" + sd,
        "cdf": "norm.cdf(x, loc=" + mean + ", scale=" + sd,
        "pct": "norm.ppf(q, loc=" + mean + ", scale=" + sd,
        "rv": "rvs.ppf(loc=" + mean + ", scale=" + sd + ", size=N",
    }

    // document.getElementById('ppdf').textContent = 'test';
    // for (var i = 0; i < syntaxes.length; i++) {
    //     for (var j = 0; j < methods.length; j++) {
    //         document.getElementById(syntaxes[i] + methods[j]).textContent = pmethods[methods[j]];
    //     }
    // }
}

pyButton.onclick = displayPyFormula;

function displayPyFormula() {
    table.hidden = false;

    document.getElementById('syntax').textContent = "Python (scipy.stats)";
    document.getElementById('pdfFormula').textContent = "norm.pdf(x, loc=" + mean + ", scale=" + sd + ")";
    document.getElementById('cdfFormula').textContent = "norm.cdf(x, loc=" + mean + ", scale=" + sd + ")";
    document.getElementById('pctFormula').textContent = "norm.ppf(q, loc=" + mean + ", scale=" + sd + ")";
    document.getElementById('rvFormula').textContent = "norm.rvs(loc=" + mean + ", scale=" + sd + ", size=N)";
}
