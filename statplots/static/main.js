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
const plotPDFLabel = document.getElementById('plotPDFLabel');
const plotCDF = document.getElementById('plotCDF');
let plotThis = 'fx';
let firstChart = true;

const update = document.getElementById('update');

const canvas = document.querySelector('canvas');
const ctx = document.getElementById('chart').getContext('2d');

const formulaButtons = document.getElementById('formulaButtons');
const pyButton = document.getElementById('pyButton');
const rButton = document.getElementById('rButton');
// const jsButton = document.getElementById('jsButton');
const xlButton = document.getElementById('xlButton');
let whichSyntax = 'py';

const formulaTable = document.getElementById('formulaTable');

const copyPdfButton = document.getElementById('pdfCopyButton');
const copyCdfButton = document.getElementById('cdfCopyButton');
const copyPctButton = document.getElementById('pctCopyButton');
const copyRvButton = document.getElementById('rvCopyButton');

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
    if (dist === 'beta') {
        distHint.textContent = 'Mean must be between 0 and 1';
    }
    else if (dist === 'binomial') {
        distHint.textContent = 'Mean must be greater than variance';
        plotPDFLabel.textContent = 'Plot PMF';
    }
    else if (dist === 'exponential') {
        distHint.textContent = 'Mean and standard deviation must be equal';
    }
    else if (dist === 'negative binomial') {
        distHint.textContent = 'Mean must be less than variance';
        plotPDFLabel.textContent = 'Plot PMF';
    }
    else if (dist === 'poisson') {
        distHint.textContent = 'Mean and variance must be equal';
        plotPDFLabel.textContent = 'Plot PMF';
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
    if (whichDist === 'beta') {
        if (mean <= 0 || mean >= 1) {
            meanField.classList.add("is-invalid");
            meanFeedback.textContent = 'Mean must be between 0 and 1'
            validInputs = false;
        }
        else {
            meanField.classList.remove("is-invalid");
            meanFeedback.textContent = '';
        }
    }
    else if (whichDist === 'binomial') {
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

    // console.log('fetching');
    fetch('/update-plot', {
            method: 'POST',
            body: JSON.stringify(params),
            headers: new Headers({
                'content-type': 'application/json'
            })
        })
    .then(response => response.json())
    .then(data => {
        // console.log('Python is sending as a response:');
        // console.log(data);
        setArrays(data);
    });
    // .then(drawPlot());

    // drawPlot();
}

function setArrays(data) {
    // console.log('setting arrays');
    x = data['x'];
    y = data['y'];
    drawPlot();
}

function drawPlot() {

    // console.log('drawing plot');

    ////////////////////
    // maintenance stuff
    ////////////////////

    let type;
    // let continuous;
    let radius;
    let yLabel;

    switch (whichDist) {
        case 'beta':
        case 'exponential':
        case 'folded normal':
        case 'gamma':
        case 'normal':
            type = 'line';
            // continuous = true;
            radius = 0;
            yLabel = 'PDF'
            break;
        case 'binomial':
        case 'negative binomial':
        case 'poisson':
            type = 'bar';
            // continuous = false;
            radius = 5;
            yLabel = 'PMF'
            break;
    }


    ////////////////////
    // plotting
    ////////////////////

    if (!firstChart) chart.destroy();

    firstChart = false;

    chart = new Chart(ctx, {
        type: type,
        data: {
            labels: x,
            datasets: [
                {
                    data: y,
                    label: yLabel,
                    borderColor: 'darkslategray',
                    borderWidth: 2,
                    backgroundColor: 'rgba(47, 79, 79, 0.2)',
                    // fill: continuous,
                    // showLine: continuous,
                    barPercentage: 0.5,
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
        // case 'js':
        //     displayJsFormula();
        //     break;
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
// jsButton.addEventListener('click', displayJsFormula);
xlButton.addEventListener('click', displayXlFormula);

let pdfDescription = document.getElementById('pdfDescription');
let pdfFormula = document.getElementById('pdfFormula');
let cdfFormula = document.getElementById('cdfFormula');
let pctFormula = document.getElementById('pctFormula');
let rvFormula = document.getElementById('rvFormula');

function displayPyFormula() {
    whichSyntax = 'py';
    pyButton.classList.add('btn-selected');
    rButton.classList.remove('btn-selected');
    xlButton.classList.remove('btn-selected');
    document.getElementById('syntax').textContent = "Python (scipy.stats)";
    document.getElementById('rvDescription').textContent = 'Draw N random variables';

    if (whichDist === 'beta') {
        let a = -mean * (mean * mean - mean + _var) / _var;
        let b = (mean - 1) * (mean * mean - mean + _var) / _var;
        pdfFormula.textContent = "beta.pmf(x, a=" + a + ", b=" + b + ")";
        cdfFormula.textContent = "beta.cdf(x, a=" + a + ", b=" + b + ")";
        pctFormula.textContent = "beta.ppf(q, a=" + a + ", b=" + b + ")";
        rvFormula.textContent = "beta.rvs(a=" + a + ", b=" + b + ", size=N)";
    }
    else if (whichDist === 'binomial') {
        pdfDescription.textContent = 'PMF (evaluated at x)'

        let n = mean * mean / (mean - _var);
        let p = (1 - (_var / mean));
        pdfFormula.textContent = "binom.pmf(x, n=" + n  + ", p=" + p + ")";
        cdfFormula.textContent = "binom.cdf(x, n=" + n + ", p=" + p + ")";
        pctFormula.textContent = "binom.ppf(q, n=" + n + ", p=" + p + ")";
        rvFormula.textContent = "binom.rvs(n=" + n + ", p=" + p + ", size=N)";
    }
    else if (whichDist === 'exponential') {
        pdfFormula.textContent = "expon.pdf(x, scale=" + mean + ")";
        cdfFormula.textContent = "expon.cdf(x, scale=" + mean + ")";
        pctFormula.textContent = "expon.ppf(q, scale=" + mean + ")";
        rvFormula.textContent = "expon.rvs(scale=" + mean + ", size=N)";
    }
    else if (whichDist === 'gamma') {
        let a = (mean * mean) / _var;
        let scale = _var / mean;
        pdfFormula.textContent = "gamma.pdf(x, a=" + a + ", scale=" + scale + ")";
        cdfFormula.textContent = "gamma.cdf(x, a=" + a + ", scale=" + scale + ")";
        pctFormula.textContent = "gamma.ppf(q, a=" + a + ", scale=" + scale + ")";
        rvFormula.textContent = "gamma.rvs(a=" + a + ", scale=" + scale + ", size=N)";
    }
    else if (whichDist === 'folded normal') {
        pdfFormula.textContent = "foldnorm.pdf(x, scale=" + sd + ", c=" + mean / sd + ")";
        cdfFormula.textContent = "foldnorm.cdf(x, scale=" + sd + ", c=" + mean / sd + ")";
        pctFormula.textContent = "foldnorm.ppf(q, scale=" + sd + ", c=" + mean / sd + ")";
        rvFormula.textContent = "foldnorm.rvs(scale=" + sd + ", c=" + mean / sd + ", size=N)";
    }
    else if (whichDist === 'negative binomial') {
        pdfDescription.textContent = 'PMF (evaluated at x)'

        let n = mean * mean / (_var - mean);
        let p = mean / _var;
        pdfFormula.textContent = "nbinom.pmf(x, n=" + n + ", p=" + p + ")";
        cdfFormula.textContent = "nbinom.cdf(x, n=" + n + ", p=" + p + ")";
        pctFormula.textContent = "nbinom.ppf(q, n=" + n + ", p=" + p + ")";
        rvFormula.textContent = "nbinom.rvs(n=" + n + ", p=" + p + ", size=N)";
    }
    else if (whichDist === 'normal') {
        pdfFormula.textContent = "norm.pdf(x, loc=" + mean + ", scale=" + sd + ")";
        cdfFormula.textContent = "norm.cdf(x, loc=" + mean + ", scale=" + sd + ")";
        pctFormula.textContent = "norm.ppf(q, loc=" + mean + ", scale=" + sd + ")";
        rvFormula.textContent = "norm.rvs(loc=" + mean + ", scale=" + sd + ", size=N)";
    }
    else if (whichDist === 'poisson') {
        pdfDescription.textContent = 'PMF (evaluated at x)';
        
        pdfFormula.textContent = "poisson.pmf(x, mu=" + mean + ")";
        cdfFormula.textContent = "poisson.cdf(x, mu=" + mean + ")";
        pctFormula.textContent = "poisson.ppf(q, mu=" + mean + ")";
        rvFormula.textContent = "poisson.rvs(mu=" + mean + ", size=N)";
    }
}

function displayRFormula() {
    whichSyntax = 'r';
    pyButton.classList.remove('btn-selected');
    rButton.classList.add('btn-selected');
    xlButton.classList.remove('btn-selected');
    document.getElementById('syntax').textContent = "R";
    document.getElementById('rvDescription').textContent = 'Draw N random variables';

    if (whichDist === 'beta') {
        let shape1 = -mean * (mean * mean - mean + _var) / _var;
        let shape2 = (mean - 1) * (mean * mean - mean + _var) / _var;
        pdfFormula.textContent = "dbeta(x, shape1=" + shape1 + ", shape2=" + shape2 + ")";
        cdfFormula.textContent = "pbeta(x, shape1=" + shape1 + ", shape2=" + shape2 + ")";
        pctFormula.textContent = "qbeta(q, shape1=" + shape1 + ", shape2=" + shape2 + ")";
        rvFormula.textContent = "rbeta(n=N, shape1=" + shape1 + ", shape2=" + shape2 + ")";
    }
    else if (whichDist === 'binomial') {
        pdfDescription.textContent = 'PMF (evaluated at x)'

        let size = mean * mean / (mean - _var);
        let prob = (1 - (_var / mean));
        pdfFormula.textContent = "dbinom(x, size=" + size  + ", prob=" + prob + ")";
        cdfFormula.textContent = "pbinom(x, size=" + size + ", prob=" + prob + ")";
        pctFormula.textContent = "qbinom(q, size=" + size + ", prob=" + prob + ")";
        rvFormula.textContent = "rbinom(n=N, size=" + size + ", prob=" + prob + ")";
    }
    else if (whichDist === 'exponential') {
        let rate = 1 / mean;
        pdfFormula.textContent = "dexp(x, rate=" + rate  + ")";
        cdfFormula.textContent = "pexp(x, rate=" + rate + ")";
        pctFormula.textContent = "qexp(q, rate=" + rate + ")";
        rvFormula.textContent = "rexp(n=N, rate=" + rate + ")";
    }
    else if (whichDist === 'gamma') {
        document.getElementById('syntax').textContent = "R (coming soon)";
        clearFormulas();
        // let a = (mean * mean) / _var;
        // let scale = _var / mean;
        // pdfFormula.textContent = "gamma.pdf(x, a=" + a + ", scale=" + scale + ")";
        // cdfFormula.textContent = "gamma.cdf(x, a=" + a + ", scale=" + scale + ")";
        // pctFormula.textContent = "gamma.ppf(q, a=" + a + ", scale=" + scale + ")";
        // rvFormula.textContent = "gamma.rvs(a=" + a + ", scale=" + scale + ", size=N)";
    }
    else if (whichDist === 'folded normal') {
        document.getElementById('syntax').textContent = "R (coming soon)";
        clearFormulas();
    //     pdfFormula.textContent = "foldnorm.pdf(x, scale=" + sd + ", c=" + mean / sd + ")";
    //     cdfFormula.textContent = "foldnorm.cdf(x, scale=" + sd + ", c=" + mean / sd + ")";
    //     pctFormula.textContent = "foldnorm.ppf(q, scale=" + sd + ", c=" + mean / sd + ")";
    //     rvFormula.textContent = "foldnorm.rvs(scale=" + sd + ", c=" + mean / sd + ", size=N)";
    }
    else if (whichDist === 'negative binomial') {
        pdfDescription.textContent = 'PMF (evaluated at x)'
        
        document.getElementById('syntax').textContent = "R (coming soon)";
        clearFormulas();
    //     let n = mean * mean / (_var - mean);
    //     let p = mean / _var;
    //     pdfFormula.textContent = "nbinom.pmf(x, n=" + n + ", p=" + p + ")";
    //     cdfFormula.textContent = "nbinom.cdf(x, n=" + n + ", p=" + p + ")";
    //     pctFormula.textContent = "nbinom.ppf(q, n=" + n + ", p=" + p + ")";
    //     rvFormula.textContent = "nbinom.rvs(n=" + n + ", p=" + p + ", size=N)";
    }
    else if (whichDist === 'normal') {
        pdfFormula.textContent = "dnorm(x, mean=" + mean + ", sd=" + sd + ")";
        cdfFormula.textContent = "pnorm(x, mean=" + mean + ", sd=" + sd + ")";
        pctFormula.textContent = "qnorm(p, mean=" + mean + ", sd=" + sd + ")";
        rvFormula.textContent = "rnorm(n=N, mean=" + mean + ", sd=" + sd + ")";
    }
    else if (whichDist === 'poisson') {
        pdfDescription.textContent = 'PMF (evaluated at x)';
        
        pdfFormula.textContent = "dpois(x, lambda=" + mean + ")";
        cdfFormula.textContent = "ppois(x, lambda=" + mean + ")";
        pctFormula.textContent = "qpois(p, lambda=" + mean + ")";
        rvFormula.textContent = "rpois(n=N, lambda=" + mean + ")";
    }
}

function displayXlFormula() {
    whichSyntax = 'xl';
    pyButton.classList.remove('btn-selected');
    rButton.classList.remove('btn-selected');
    xlButton.classList.add('btn-selected');
    document.getElementById('syntax').textContent = "Excel";
    document.getElementById('rvDescription').textContent = 'Draw one random variable';

    if (whichDist === 'beta') {
        let alpha = -mean * (mean * mean - mean + _var) / _var;
        let beta = (mean - 1) * (mean * mean - mean + _var) / _var;
        pdfFormula.textContent = "beta.dist(x, " + alpha + ", " + beta + ", false)";
        cdfFormula.textContent = "beta.dist(x, " + alpha + ", " + beta + ", true)";
        pctFormula.textContent = "beta.inv(p, " + alpha + ", " + beta + ", false)";
        rvFormula.textContent = "";
    }
    else if (whichDist === 'binomial') {
        let trials = mean * mean / (mean - _var);
        let probability_s = (1 - (_var / mean));
        pdfFormula.textContent = "binom.dist(x, " + trials + ", " + probability_s + ", false)";
        cdfFormula.textContent = "binom.dist(x, " + trials + ", " + probability_s + ", true)";
        pctFormula.textContent = "binom.inv(p, " + trials + ", " + probability_s + ", false)";
        rvFormula.textContent = "";
    }
    else if (whichDist === 'exponential') {
        let lambda = 1 / mean;
        pdfFormula.textContent = "expon.dist(x, " + lambda + ", false)";
        cdfFormula.textContent = "expon.dist(x, " + lambda + ", true)";
        pctFormula.textContent = "";
        rvFormula.textContent = "";
    }
    else if (whichDist === 'normal') {
        pdfFormula.textContent = "norm.dist(x, " + mean + ", " + sd + ", false)";
        cdfFormula.textContent = "norm.dist(x, " + mean + ", " + sd + ", true)";
        pctFormula.textContent = "norm.inv(p, " + mean + ", " + sd + ", false)";
        rvFormula.textContent = "";
    }
    else if (whichDist === 'poisson') {
        pdfFormula.textContent = "poisson.dist(x, " + mean + ", false)";
        cdfFormula.textContent = "poisson.dist(x, " + mean + ", true)";
        pctFormula.textContent = "poisson.inv(p, " + mean + ", false)";
        rvFormula.textContent = "";
    }

    else {
        document.getElementById('syntax').textContent = "Excel (coming soon)";
        clearFormulas();
    }
}

function clearFormulas() {
    pdfFormula.textContent = '';
    cdfFormula.textContent = '';
    pctFormula.textContent = '';
    rvFormula.textContent = '';
}

// var clipboard = new ClipboardJS('.btn-sm');

// copyPdfButton.addEventListener('click', copyPdfFormula);
// copyCdfButton.addEventListener('click', copyCdfFormula);
// copyPctButton.addEventListener('click', copyPctFormula);
// copyRvButton.addEventListener('click', copyRvFormula);

// function copyPdfFormula() {
//     pdfFormula.focus();
//     pdfFormula.select();
//     var successful = document.execCommand('copy');
//     var msg = successful ? 'successful' : 'unsuccessful';
//     console.log('Copying was ' + msg);
// }