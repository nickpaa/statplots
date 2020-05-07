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
let plotThis = 'fx';
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

// const N = 400;

let x = [];
let fx = [];
let Fx = [];
let y = [];

// helpers

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }

// user inputs

function giveHint(dist) {
    if (dist === 'binomial') {
        distHint.textContent = 'Mean must be greater than variance';
    }
    else if (dist === 'exponential') {
        distHint.textContent = 'Mean and standard deviation must be equal';
    }
    else if (dist === 'negative binomial') {
        distHint.textContent = 'Mean must be less than variance';
    }
    else if (dist === 'poisson') {
        distHint.textContent = 'Mean and variance must be equal';
    }
    else {  // gamma, normal
        distHint.textContent = '';
    }
}

meanField.onblur = updateMean;

function updateMean() {
    mean = Number(meanField.value);
    meanField.value = mean;
    
    if (meanField.value === "") {
        meanField.value = '0';
    }
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
        sd = Number(sdField.value);
        _var = sd * sd;
        varField.value = _var;
        
        if (sdField.value === "") sdField.value = 0;
    }
    
    else {
        _var = Number(varField.value);
        sd = Math.sqrt(_var);
        sdField.value = sd;
        
        if (varField.value === "") varField.value = 0;
    }
}

plotPDF.onclick = updateWhichPlot;
plotCDF.onclick = updateWhichPlot;

function updateWhichPlot() {
    if (whichPlot[0].checked) {
        plotThis = 'fx';
    }
    else {
        plotThis = 'Fx';
    }
}

function validateInputs() {
    
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

    // dist specific
    if (whichDist === 'binomial') {
        if (mean <= 0) {
            meanField.classList.add("is-invalid");
            meanFeedback.textContent = 'Mean must be positive'
            validInputs = false;
        }
        else if (mean <= _var) {
            meanField.classList.add("is-invalid");
            meanFeedback.textContent = 'Mean must greater than variance'
            varField.classList.add("is-invalid");
            varFeedback.textContent = 'Variance must be less than mean'
            validInputs = false;
        }
        else {
            meanField.classList.remove("is-invalid");
            meanFeedback.textContent = '';
            varField.classList.remove("is-invalid");
            varFeedback.textContent = '';
        }
    }

    else if (whichDist === 'exponential') {
        if (mean <= 0) {
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

    else if (whichDist === 'folded normal') {
        if (mean <= 0) {
            meanField.classList.add("is-invalid");
            meanFeedback.textContent = 'Mean must be positive'
            validInputs = false;
        }
        else {
            meanField.classList.remove("is-invalid");
            meanFeedback.textContent = '';
        }
    }

    else if (whichDist === 'gamma') {
        if (mean <= 0) {
            meanField.classList.add("is-invalid");
            meanFeedback.textContent = 'Mean must be positive'
            validInputs = false;
        }
        else {
            meanField.classList.remove("is-invalid");
            meanFeedback.textContent = '';
        }
    }

    else if (whichDist === 'negative binomial') {
        if (mean <= 0) {
            meanField.classList.add("is-invalid");
            meanFeedback.textContent = 'Mean must be positive'
            validInputs = false;
        }
        else if (mean >= _var) {
            meanField.classList.add("is-invalid");
            meanFeedback.textContent = 'Mean must less than variance'
            varField.classList.add("is-invalid");
            varFeedback.textContent = 'Variance must be greater than mean'
            validInputs = false;
        }
        else {
            meanField.classList.remove("is-invalid");
            meanFeedback.textContent = '';
            varField.classList.remove("is-invalid");
            varFeedback.textContent = '';
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

update.onclick = updatePage;

function updatePage() {
    submitParams();
}

async function submitParams() {

    if (!validateInputs()) {
        formulaButtons.hidden = true;
        formulaTable.hidden = true;
        if (!firstChart) chart.destroy();
        return;
    };

    let params = {
        dist: whichDist,
        mean: mean,
        sd: sd,
        plotThis: plotThis
    }

    console.log('fetching');
    fetch('/update-plot', {
            method: 'POST',
            body: JSON.stringify(params),
            headers: new Headers({
                'content-type': 'application/json'
            })
        })
    .then(response => response.json())
    .then(data => {
        console.log('Python is sending as a response:');
        console.log(data);
        setArrays(data);
    });
    // .then(drawPlot());

    // drawPlot();
}

function setArrays(data) {
    console.log('setting arrays');
    x = data['x'];
    y = data['y'];
    drawPlot();
}

function drawPlot() {

    console.log('drawing plot');

    ////////////////////
    // maintenance stuff
    ////////////////////

    // if (!validateInputs()) {
    //     formulaButtons.hidden = true;
    //     formulaTable.hidden = true;
    //     if (!firstChart) chart.destroy();
    //     return;
    // };

    let continuous;
    let radius;
    let yLabel;

    switch (whichDist) {
        case 'exponential':
        case 'folded normal':
        case 'gamma':
        case 'normal':
            continuous = true;
            radius = 0;
            yLabel = 'PDF'
            break;
        case 'binomial':
        case 'negative binomial':
        case 'poisson':
            continuous = false;
            radius = 5;
            yLabel = 'PMF'
            break;
    }


    ////////////////////
    // plotting
    ////////////////////

    if (!firstChart) chart.destroy();

    firstChart = false;

    // deal with infinity
    // let yMax;
    // if (y[0] > 9999) {
    //     yMax = 2 * y[1];
    // }
    // else yMax = Math.max(...y) * 1.1;
    

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: x,
            datasets: [
                {
                    data: y,
                    label: yLabel,
                    borderColor: 'darkslategray',
                    backgroundColor: 'rgba(47, 79, 79, 0.2)',
                    fill: continuous,
                    showLine: continuous,
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
                    },
                    ticks: {
                        maxTicksLimit: 20,
                        callback: function(value, index, values) {
                            return round(value, 2);
                        }
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: yLabel
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    })

    if (y[0] === 9999) {
        chart.options.scales.yAxes[0].ticks.max = y[1] * 2;
        chart.update();
    }
    

    /////////////////////////
    // generate formula table
    /////////////////////////

    formulaButtons.hidden = false;
    formulaTable.hidden = false;

    switch (whichSyntax) {
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

    if (whichDist != 'normal') {
        rButton.disabled = true;
        jsButton.disabled = true;
        xlButton.disabled = true;
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

    if (whichDist === 'binomial') {
        document.getElementById('pdfFormula').textContent = "binom.pmf(x, n=" + mean * mean / (mean - _var) + ", p=" + (1 - (_var / mean)) + ")";
        document.getElementById('cdfFormula').textContent = "binom.cdf(x, n=" + mean * mean / (mean - _var) + ", p=" + (1 - (_var / mean)) + ")";
        document.getElementById('pctFormula').textContent = "binom.ppf(q, n=" + mean * mean / (mean - _var) + ", p=" + (1 - (_var / mean)) + ")";
        document.getElementById('rvFormula').textContent = "binom.rvs(n=" + mean * mean / (mean - _var) + ", p=" + (1 - (_var / mean)) + ", size=N)";
    }
    else if (whichDist === 'exponential') {
        document.getElementById('pdfFormula').textContent = "expon.pdf(x, scale=" + mean + ")";
        document.getElementById('cdfFormula').textContent = "expon.cdf(x, scale=" + mean + ")";
        document.getElementById('pctFormula').textContent = "expon.ppf(q, scale=" + mean + ")";
        document.getElementById('rvFormula').textContent = "expon.rvs(scale=" + mean + ", size=N)";
    }
    else if (whichDist === 'gamma') {
        document.getElementById('pdfFormula').textContent = "gamma.pdf(x, a=" + (mean * mean) / _var + ", scale=" + _var / mean + ")";
        document.getElementById('cdfFormula').textContent = "gamma.cdf(x, a=" + (mean * mean) / _var + ", scale=" + _var / mean + ")";
        document.getElementById('pctFormula').textContent = "gamma.ppf(q, a=" + (mean * mean) / _var + ", scale=" + _var / mean + ")";
        document.getElementById('rvFormula').textContent = "gamma.rvs(a=" + (mean * mean) / _var + ", scale=" + _var / mean + ", size=N)";
    }
    else if (whichDist === 'folded normal') {
        document.getElementById('pdfFormula').textContent = "foldnorm.pdf(x, scale=" + sd + ", c=" + mean / sd + ")";
        document.getElementById('cdfFormula').textContent = "foldnorm.cdf(x, scale=" + sd + ", c=" + mean / sd + ")";
        document.getElementById('pctFormula').textContent = "foldnorm.ppf(q, scale=" + sd + ", c=" + mean / sd + ")";
        document.getElementById('rvFormula').textContent = "foldnorm.rvs(scale=" + sd + ", c=" + mean / sd + ", size=N)";
    }
    else if (whichDist === 'negative binomial') {
        document.getElementById('pdfFormula').textContent = "nbinom.pmf(x, n=" + mean * mean / (_var - mean) + ", p=" + mean / _var + ")";
        document.getElementById('cdfFormula').textContent = "nbinom.cdf(x, n=" + mean * mean / (_var - mean) + ", p=" + mean / _var + ")";
        document.getElementById('pctFormula').textContent = "nbinom.ppf(q, n=" + mean * mean / (_var - mean) + ", p=" + mean / _var + ")";
        document.getElementById('rvFormula').textContent = "nbinom.rvs(n=" + mean * mean / (_var - mean) + ", p=" + mean / _var + ", size=N)";
    }
    else if (whichDist === 'normal') {
        document.getElementById('pdfFormula').textContent = "norm.pdf(x, loc=" + mean + ", scale=" + sd + ")";
        document.getElementById('cdfFormula').textContent = "norm.cdf(x, loc=" + mean + ", scale=" + sd + ")";
        document.getElementById('pctFormula').textContent = "norm.ppf(q, loc=" + mean + ", scale=" + sd + ")";
        document.getElementById('rvFormula').textContent = "norm.rvs(loc=" + mean + ", scale=" + sd + ", size=N)";
    }
    else if (whichDist === 'poisson') {
        document.getElementById('pdfpmf').textContent = "PMF (evaluated at x)";
        document.getElementById('pdfFormula').textContent = "poisson.pmf(x, mu=" + mean + ")";
        document.getElementById('cdfFormula').textContent = "poisson.cdf(x, mu=" + mean + ")";
        document.getElementById('pctFormula').textContent = "poisson.ppf(q, mu=" + mean + ")";
        document.getElementById('rvFormula').textContent = "poisson.rvs(mu=" + mean + ", size=N)";
    }
}

function displayRFormula() {
    whichSyntax = 'r';
    document.getElementById('syntax').textContent = "R";
    
    if (whichDist === 'normal') {
        document.getElementById('pdfFormula').textContent = "dnorm(x, mean=" + mean + ", sd=" + sd + ")";
        document.getElementById('cdfFormula').textContent = "pnorm(x, mean=" + mean + ", sd=" + sd + ")";
        document.getElementById('pctFormula').textContent = "qnorm(p, mean=" + mean + ", sd=" + sd + ")";
        document.getElementById('rvFormula').textContent = "rnorm(N, mean=" + mean + ", sd=" + sd + ")";
    }
    
    else {
        document.getElementById('rButton').disabled = true;
        displayPyFormula();
    }
}

function displayJsFormula() {
    whichSyntax = 'js';
    document.getElementById('syntax').textContent = "JavaScript (jStat)";
    document.getElementById('rvDescription').textContent = 'Draw one random variable'

    if (whichDist === 'normal') {
        document.getElementById('pdfFormula').textContent = "jStat.normal.pdf(x, mean=" + mean + ", std=" + sd + ")";
        document.getElementById('cdfFormula').textContent = "jStat.normal.cdf(x, mean=" + mean + ", std=" + sd + ")";
        document.getElementById('pctFormula').textContent = "jStat.normal.inv(p, mean=" + mean + ", std=" + sd + ")";
        document.getElementById('rvFormula').textContent = "jStat.normal.sample(mean=" + mean + ", std=" + sd + ")";
    }

    else {
        document.getElementById('jsButton').disabled = true;
        displayPyFormula();
    }
}

function displayXlFormula() {
    whichSyntax = 'xl';
    document.getElementById('syntax').textContent = "Excel";
    document.getElementById('rvDescription').textContent = 'Draw one random variable'

    if (whichDist === 'normal') {
        document.getElementById('pdfFormula').textContent = "norm.dist(x, "+ mean + ", " + sd + ", false)";
        document.getElementById('cdfFormula').textContent = "norm.dist(x, "+ mean + ", " + sd + ", true)";
        document.getElementById('pctFormula').textContent = "norm.inv(p, "+ mean + ", " + sd + ", false)";
        document.getElementById('rvFormula').textContent = "";
    }

    else {
        document.getElementById('xlButton').disabled = true;
        displayPyFormula();
    }
}
