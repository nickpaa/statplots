const distField = document.getElementById('distField');
let distHint = document.getElementById('distHint');
let whichDist = 'normal';
distField.addEventListener("change", function(){
    whichDist = distField.value;
    giveHint(whichDist);
})

const meanField = document.getElementById('meanField');
const meanFeedback = document.getElementById('meanFeedback');
let mean = 0;

const whichSigma = document.getElementsByName('whichSigma');
const useSD = document.getElementById('useSD');
const useVar = document.getElementById('useVar');

const sdField = document.getElementById('sdField');
const sdFeedback = document.getElementById('sdFeedback');
let sd = 1;

const varField = document.getElementById('varField');
const varFeedback = document.getElementById('varFeedback');
let _var = 1;

const whichPlot = document.getElementsByName('whichPlot');
const plotPDF = document.getElementById('plotPDF');
const plotCDF = document.getElementById('plotCDF');
let plotThis = 'pdf';
let firstChart = true;

const update = document.getElementById('update');

const canvas = document.querySelector('canvas');
const ctx = document.getElementById('chart').getContext('2d');

const formulaButtons = document.getElementById('formulaButtons');
const pyButton = document.getElementById('pyButton');
const rButton = document.getElementById('rButton');
const jsButton = document.getElementById('jsButton');
const xlButton = document.getElementById('xlButton');
let whichSyntax = 'py';

const formulaTable = document.getElementById('formulaTable');

const N = 400;

let x = [];
let y = [];

// helpers

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }

// user inputs

function giveHint(dist) {
    if (dist === 'normal') {
        distHint.textContent = '';
    }
    else if (dist === 'exponential') {
        distHint.textContent = 'Mean and standard deviation must be equal';
    }
    else if (dist === 'poisson') {
        distHint.textContent = 'Mean and variance must be equal';
    }
}

meanField.onblur = updateMean;

function updateMean() {
    mean = Number(meanField.value);
    meanField.value = mean;
    
    if (meanField.value === "") {
        meanField.value = '0';
    }

    // if (whichDist === 'exponential') {
    //     sd = mean;
    //     sdField.value = sd;
    //     _var = mean * mean;
    //     varField.value = _var;
    // }

    // else if (whichDist === 'poisson') {
    //     _var = mean;
    //     varField.value = _var;
    //     sd = Math.sqrt(mean);
    //     sdField.value = sd;
    // }
}

useSD.onclick = toggleSDandVar;
useVar.onclick = toggleSDandVar;
sdField.onblur = updateSDandVar;
varField.onblur = updateSDandVar;

function toggleSDandVar() {
    if (whichSigma[0].checked) {
        sdField.disabled = false;
        varField.disabled = true;
    }

    else {
        sdField.disabled = true;
        varField.disabled = false;
    }
}

function updateSDandVar() {
    if (whichSigma[0].checked) {
        // sdField.disabled = false;
        // varField.disabled = true;

        sd = Number(sdField.value);
        // sdField.value = sd;
        _var = sd * sd;
        varField.value = _var;
        
        if (sdField.value === "") sdField.value = 0;
    }
    
    else {
        // sdField.disabled = true;
        // varField.disabled = false;

        _var = Number(varField.value);
        // varField.value = _var;
        sd = Math.sqrt(_var);
        sdField.value = sd;
        
        if (varField.value === "") varField.value = 0;
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
    // updateMean();
    // updateSDandVar();
    
    var validInputs = true;

    // all dists: check that SD is positive
    if (sd <= 0) {
        sdField.classList.add("is-invalid");
        sdFeedback.textContent = 'Standard deviation must be positive';
        validInputs = false;
    }
    else {
        sdField.classList.remove("is-invalid");
        sdFeedback.textContent = '';
    }

    // all dists: check that var is positive
    if (_var <= 0) {
        varField.classList.add("is-invalid");
        varFeedback.textContent = 'Variance must be positive';
        validInputs = false;
    }
    else {
        varField.classList.remove("is-invalid");
        varFeedback.textContent = "";
    }

    // if (whichDist === 'normal') {
        
    // }

    if (whichDist === 'exponential') {
        if (mean <= 0) {
            console.log('also in here')
            meanField.classList.add("is-invalid");
            meanFeedback.textContent = 'Mean must be positive'
            validInputs = false;
        }
        else if (mean != sd) {
            meanField.classList.add("is-invalid");
            meanFeedback.textContent = 'Mean and standard deviation must be equal'
            sdField.classList.add("is-invalid");
            sdFeedback.textContent = 'Mean and standard deviation must be equal'
            validInputs = false;
        }
        else {
            meanField.classList.remove("is-invalid");
            meanFeedback.textContent = '';
            sdField.classList.remove("is-invalid");
            sdFeedback.textContent = '';
        }
    }

    else if (whichDist === 'poisson') {
        if (mean <= 0) {
            meanField.classList.add("is-invalid");
            meanFeedback.textContent = 'Mean must be positive'
            validInputs = false;
        }
        else if (mean != _var) {
            meanField.classList.add("is-invalid");
            meanFeedback.textContent = 'Mean and variance must be equal'
            varField.classList.add("is-invalid");
            varFeedback.textContent = 'Mean and variance must be equal'
            validInputs = false;
        }
        else {
            meanField.classList.remove("is-invalid");
            meanFeedback.textContent = '';
            varField.classList.remove("is-invalid");
            varFeedback.textContent = '';
        }
    }

    return validInputs;
}

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
        x[i] = round(minX + i * inc, 6);
        if (plotThis === 'pdf') {
            y[i] = jStat.normal.pdf(x[i], mean, sd);
        }
        else {
            y[i] = jStat.normal.cdf(x[i], mean, sd);
        }
    }
}

function calcExponential() {
    let minX = 0;
    let maxX = mean + 4 * sd;
    let inc = setIncrement(minX, maxX);
    
    for (let i = 0; i <= N; i++) {
        x[i] = round(minX + i * inc, 6);
        if (plotThis === 'pdf') {
            y[i] = jStat.exponential.pdf(x[i], 1 / mean);
        }
        else {
            y[i] = jStat.exponential.cdf(x[i], 1 / mean);
        }
    }
}

function calcPoisson() {
    let minX = 0;
    let maxX = 4 * _var;
    // let inc = setIncrement(minX, maxX);

    let i = 0;

    do {
    // for (let i = 0; i < Infinity; i++)
    // for (let i = 0; i <= maxX; i++) {
        x[i] = i;
        if (plotThis === 'pdf') {
            y[i] = jStat.poisson.pdf(x[i], mean);
        }
        else {
            y[i] = jStat.poisson.cdf(x[i], mean);
        }

        // if (x[i] > mean && y[i] < 0.000001) {
        //     break;
        // }
        i++;
    } while (x[i-1] <= mean || y[i-1] > 0.000001)
}

update.onclick = updatePage;

function updatePage() {

    ////////////////////
    // maintenance stuff
    ////////////////////

    if (!validateInputs()) {
        formulaButtons.hidden = true;
        formulaTable.hidden = true;
        if (!firstChart) chart.destroy();
        return;
    };

    // mean = Number(meanField.value);
    // sd = Number(sdField.value);
    // updateMean();
    // updateSDandVar();

    x = [];
    y = [];


    let plotType;
    // let distrType;
    let cont;
    let radius;

    if (distField.value === 'normal') {
        calcNormal();
        // plotType = 'line';
        // distrType = 
        cont = true;
        radius = 0;
    }
    else if (distField.value === 'exponential') {
        calcExponential();
        // plotType = 'line';
        cont = true;
        radius = 0;
    }
    else if (distField.value === 'poisson') {
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
                    borderColor: 'darkslategray',
                    backgroundColor: 'rgba(47, 79, 79, 0.2)',
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
                        labelString: plotThis.toUpperCase()
                    }
                }]
            }
        }
    })

    /////////////////////////
    // generate formula table
    /////////////////////////

    formulaButtons.hidden = false;
    formulaTable.hidden = false;

    switch(whichSyntax) {
        case 'py':
            displayPyFormula();
            break;
        case 'r':
            displayRFormula();
            break;
        case 'js':
            displayJsFormula();
            break;
        case 'xl':
            displayXlFormula();
            break;
    }

}

////////////////
// formula table
////////////////

pyButton.addEventListener('click', displayPyFormula);
rButton.addEventListener('click', displayRFormula);
jsButton.addEventListener('click', displayJsFormula);
xlButton.addEventListener('click', displayXlFormula);


function displayPyFormula() {
    whichSyntax = 'py';
    document.getElementById('syntax').textContent = "Python (scipy.stats)";

    if (whichDist === 'normal') {
        document.getElementById('pdfFormula').textContent = "norm.pdf(x, loc=" + mean + ", scale=" + sd + ")";
        document.getElementById('cdfFormula').textContent = "norm.cdf(x, loc=" + mean + ", scale=" + sd + ")";
        document.getElementById('pctFormula').textContent = "norm.ppf(q, loc=" + mean + ", scale=" + sd + ")";
        document.getElementById('rvFormula').textContent = "norm.rvs(loc=" + mean + ", scale=" + sd + ", size=N)";
    }
    else if (whichDist === 'exponential') {
        document.getElementById('pdfFormula').textContent = "expon.pdf(x, scale=1/" + mean + ")";
        document.getElementById('cdfFormula').textContent = "expon.cdf(x, scale=1/" + mean + ")";
        document.getElementById('pctFormula').textContent = "expon.ppf(q, scale=1/" + mean + ")";
        document.getElementById('rvFormula').textContent = "expon.rvs(scale=1/" + mean + ", size=N)";
    }
    else if (whichDist === 'poisson') {
        document.getElementById('pdfpmf').textContent = "PMF (evaluated at x)";
        document.getElementById('pdfFormula').textContent = "poisson.pmf(x, shape=" + mean + ")";
        document.getElementById('cdfFormula').textContent = "poisson.cdf(x, shape=" + mean + ")";
        document.getElementById('pctFormula').textContent = "poisson.ppf(q, shape=" + mean + ")";
        document.getElementById('rvFormula').textContent = "poisson.rvs(shape=" + mean + ", size=N)";
    }
}

function displayRFormula() {
    whichSyntax = 'r';
    document.getElementById('syntax').textContent = "R";
    document.getElementById('pdfFormula').textContent = "dnorm(x, mean=" + mean + ", sd=" + sd + ")";
    document.getElementById('cdfFormula').textContent = "pnorm(x, mean=" + mean + ", sd=" + sd + ")";
    document.getElementById('pctFormula').textContent = "qnorm(p, mean=" + mean + ", sd=" + sd + ")";
    document.getElementById('rvFormula').textContent = "rnorm(N, mean=" + mean + ", sd=" + sd + ")";
}

function displayJsFormula() {
    whichSyntax = 'js';
    document.getElementById('syntax').textContent = "JavaScript (jStat)";
    document.getElementById('pdfFormula').textContent = "jStat.normal.pdf(x, mean=" + mean + ", std=" + sd + ")";
    document.getElementById('cdfFormula').textContent = "jStat.normal.cdf(x, mean=" + mean + ", std=" + sd + ")";
    document.getElementById('pctFormula').textContent = "jStat.normal.inv(p, mean=" + mean + ", std=" + sd + ")";
    document.getElementById('rvFormula').textContent = "jStat.normal.sample(mean=" + mean + ", std=" + sd + ")";
    document.getElementById('rvDescription').textContent = 'Draw one random variable'
}

function displayXlFormula() {
    whichSyntax = 'xl';
    document.getElementById('syntax').textContent = "Excel";
    document.getElementById('pdfFormula').textContent = "norm.dist(x, "+ mean + ", " + sd + ", false)";
    document.getElementById('cdfFormula').textContent = "norm.dist(x, "+ mean + ", " + sd + ", true)";
    document.getElementById('pctFormula').textContent = "norm.inv(p, "+ mean + ", " + sd + ", false)";
    document.getElementById('rvFormula').textContent = "";
    document.getElementById('rvDescription').textContent = 'Draw one random variable'
}
