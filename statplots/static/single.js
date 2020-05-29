function resetForm() {
    document.getElementById('inputs').reset();
}
resetForm();

//// SHARED ELEMENTS

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
const xlButton = document.getElementById('xlButton');
let whichSyntax = 'py';

const formulaTable = document.getElementById('formulaTable');


//// DISTRIBUTION ELEMENTS

// CREATE DISTRIBUTIONS

class Distribution {
    constructor(distField, hintField, meanField, meanFeedback, sdField, sdFeedback, varField, varFeedback, 
            sigmaRadios, useSD, useVar, pdfFormula, cdfFormula, pctFormula, rvFormula) {
        this.whichDist = 'normal';
        this.distField = distField,
        this.hintField = hintField;
        this.mean = 0;
        this.meanField = meanField;
        this.meanFeedback = meanFeedback;
        this.sd = 1;
        this.sdField = sdField;
        this.sdFeedback = sdFeedback;
        this._var = 1;
        this.varField = varField;
        this.varFeedback = varFeedback;
        this.sigmaRadios = sigmaRadios;
        this.useSD = useSD;
        this.useVar = useVar;
        this.inputsValid = true;
        this.pdfFormula = pdfFormula;
        this.cdfFormula = cdfFormula;
        this.pctFormula = pctFormula;
        this.rvFormula = rvFormula;
    }
}

dist1 = new Distribution(
    distField = document.getElementById('distField'),
    hintField = document.getElementById('distHint'),
    meanField = document.getElementById('meanField'),
    meanFeedback = document.getElementById('meanFeedback'),
    sdField = document.getElementById('sdField'),
    sdFeedback = document.getElementById('sdFeedback'),
    varField = document.getElementById('varField'),
    varFeedback = document.getElementById('varFeedback'),
    sigmaRadios = document.getElementsByName('whichSigma'),
    useSD = document.getElementById('useSD'),
    useVar = document.getElementById('useVar'),
    pdfFormula = document.getElementById('pdfFormula1'),
    cdfFormula = document.getElementById('cdfFormula1'),
    pctFormula = document.getElementById('pctFormula1'),
    rvFormula = document.getElementById('rvFormula1')
);

dists = [dist1];


// DISTRIBUION UPDATES

dists.forEach(d => {
    d.distField.addEventListener('change', () => {
        d.whichDist = d.distField.value;
        switchDist(d);
    })
})

function switchDist(d) {
    d.hintField.textContent = '';
    
    if (d.whichDist === 'beta') {
        d.hintField.textContent = 'Mean must be between 0 and 1';
    }
    else if (d.whichDist === 'binomial') {
        d.hintField.textContent = 'Mean must be greater than variance';
    }
    else if (d.whichDist === 'exponential') {
        d.hintField.textContent = 'Mean and standard deviation must be equal';
    }
    else if (d.whichDist === 'folded normal') {
        d.hintField.textContent = 'Inputs are pre-fold';
    }
    else if (d.whichDist === 'negative binomial') {
        d.hintField.textContent = 'Mean must be less than variance';
    }
    else if (d.whichDist === 'poisson') {
        d.hintField.textContent = 'Mean and variance must be equal';
    }
    else if (d.whichDist === 'truncated normal') {
        d.hintField.textContent = 'Inputs are pre-truncation; truncate left tail at x=0';
    }
}


// MEAN UPDATES

function updateMean(d) {
    d.mean = Number(d.meanField.value);
    d.meanField.value = d.mean;
    if (d.meanField.value === '') {
        d.meanField.value = '0';
    }
}


// SD AND VAR UPDATES

function toggleSigmaRadios(d) {
    if (d.sigmaRadios[0].checked) {
        d.sdField.disabled = false;
        d.varField.disabled = true;
    }
    else {
        d.sdField.disabled = true;
        d.varField.disabled = false;
    }
}

function updateSigmas(d) {
    if (d.sigmaRadios[0].checked) {
        d.sd = Number(d.sdField.value);
        d._var = d.sd * d.sd;
        d.varField.value = d._var;
        if (d.sdField.value === "") d.sdField.value = 0;
    }
    else {
        d._var = Number(d.varField.value);
        d.sd = Math.sqrt(d._var);
        d.sdField.value = d.sd;        
        if (d.varField.value === "") d.varField.value = 0;
    }
}


//// SHARED ELEMENTS

// PDF/CDF toggle

function updateWhichPlot() {
    if (whichPlot[0].checked) {
        plotThis = 'fx';
    }
    else {
        plotThis = 'Fx';
    }
}


// SUBMIT AND VALIDATE

function validateInputs(d) {
    
    d.inputsValid = true;
    d.meanFeedback.textContent = '';
    d.meanField.classList.remove("is-invalid");
    d.sdFeedback.textContent = '';
    d.sdField.classList.remove("is-invalid");
    d.varFeedback.textContent = '';
    d.varField.classList.remove("is-invalid");

    // all dists: check that SD is positive
    if (d.sd <= 0) {
        d.sdField.classList.add("is-invalid");
        d.sdFeedback.textContent = 'Standard deviation must be positive';
        d.inputsValid = false;
    }
    else {
        d.sdField.classList.remove("is-invalid");
        d.sdFeedback.textContent = '';
    }

    // all dists: check that var is positive
    if (d._var <= 0) {
        d.varField.classList.add("is-invalid");
        d.varFeedback.textContent = 'Variance must be positive';
        d.validInputs = false;
    }
    else {
        d.varField.classList.remove("is-invalid");
        d.varFeedback.textContent = "";
    }

    // dist specific
    if (d.whichDist === 'beta') {
        if (d.mean <= 0 || d.mean >= 1) {
            d.meanField.classList.add("is-invalid");
            d.meanFeedback.textContent = 'Mean must be between 0 and 1'
            d.inputsValid = false;
        }
        else {
            d.meanField.classList.remove("is-invalid");
            d.meanFeedback.textContent = '';
        }
    }
    else if (d.whichDist === 'binomial') {
        if (d.mean <= 0) {
            d.meanField.classList.add("is-invalid");
            d.meanFeedback.textContent = 'Mean must be positive'
            d.inputsValid = false;
        }
        else if (d.mean <= d._var) {
            d.meanField.classList.add("is-invalid");
            d.meanFeedback.textContent = 'Mean must greater than variance'
            d.varField.classList.add("is-invalid");
            d.varFeedback.textContent = 'Variance must be less than d.mean'
            d.inputsValid = false;
        }
        else {
            d.meanField.classList.remove("is-invalid");
            d.meanFeedback.textContent = '';
            d.varField.classList.remove("is-invalid");
            d.varFeedback.textContent = '';
        }
    }

    else if (d.whichDist === 'exponential') {
        if (d.mean <= 0) {
            d.meanField.classList.add("is-invalid");
            d.meanFeedback.textContent = 'Mean must be positive'
            d.inputsValid = false;
        }
        else if (d.mean != d.sd) {
            d.meanField.classList.add("is-invalid");
            d.meanFeedback.textContent = 'Mean and standard deviation must be equal'
            d.sdField.classList.add("is-invalid");
            d.sdFeedback.textContent = 'Mean and standard deviation must be equal'
            d.inputsValid = false;
        }
        else {
            d.meanField.classList.remove("is-invalid");
            d.meanFeedback.textContent = '';
            d.sdField.classList.remove("is-invalid");
            d.sdFeedback.textContent = '';
        }
    }

    else if (d.whichDist === 'gamma') {
        if (d.mean <= 0) {
            d.meanField.classList.add("is-invalid");
            d.meanFeedback.textContent = 'Mean must be positive'
            d.inputsValid = false;
        }
        else {
            d.meanField.classList.remove("is-invalid");
            d.meanFeedback.textContent = '';
        }
    }

    else if (d.whichDist === 'negative binomial') {
        if (d.mean <= 0) {
            d.meanField.classList.add("is-invalid");
            d.meanFeedback.textContent = 'Mean must be positive'
            d.inputsValid = false;
        }
        else if (d.mean >= d._var) {
            d.meanField.classList.add("is-invalid");
            d.meanFeedback.textContent = 'Mean must less than variance'
            d.varField.classList.add("is-invalid");
            d.varFeedback.textContent = 'Variance must be greater than d.mean'
            d.inputsValid = false;
        }
        else {
            d.meanField.classList.remove("is-invalid");
            d.meanFeedback.textContent = '';
            d.varField.classList.remove("is-invalid");
            d.varFeedback.textContent = '';
        }
    }

    else if (d.whichDist === 'poisson') {
        if (d.mean <= 0) {
            d.meanField.classList.add("is-invalid");
            d.meanFeedback.textContent = 'Mean must be positive'
            d.inputsValid = false;
        }
        else if (d.mean != d._var) {
            d.meanField.classList.add("is-invalid");
            d.meanFeedback.textContent = 'Mean and variance must be equal'
            d.varField.classList.add("is-invalid");
            d.varFeedback.textContent = 'Mean and variance must be equal'
            d.inputsValid = false;
        }
        else {
            d.meanField.classList.remove("is-invalid");
            d.meanFeedback.textContent = '';
            d.varField.classList.remove("is-invalid");
            d.varFeedback.textContent = '';
        }
    }

    return d.inputsValid;
}

function addListeners(dists) {
    dists.forEach(d => {
        d.meanField.addEventListener('blur', () => updateMean(d));
    });
    dists.forEach(d => {
    
        // radio toggles
        d.useSD.addEventListener('click', () => toggleSigmaRadios(d));
        d.useVar.addEventListener('click', () => toggleSigmaRadios(d));
        
        // update and link values
        d.sdField.addEventListener('blur', () => updateSigmas(d));
        d.varField.addEventListener('blur', () => updateSigmas(d));
    });

    // not dist specific
    plotPDF.addEventListener('click', updateWhichPlot);
    plotCDF.addEventListener('click', updateWhichPlot);

    update.addEventListener('click', () => submitParams(dists));

    // submit on enter key press
    document.addEventListener('keyup', (e) => {
        if (e.keyCode === 13) {
            dists.forEach(d => updateMean(d));
            dists.forEach(d => updateSigmas(d));
            submitParams(dists);
        }
    })
}

addListeners(dists);

async function submitParams(dists) {

    d1 = dists[0];

    if (!validateInputs(d1)) {
        formulaButtons.hidden = true;
        formulaTable.hidden = true;
        if (!firstChart) chart.destroy();
        return;
    };

    let params1 = {
        dist: d1.whichDist,
        mean: d1.mean,
        sd: d1.sd
    }

    let params = {
        params1: params1,
        plotThis: plotThis
    }

    fetch('/update-plot-single', {
            method: 'POST',
            body: JSON.stringify(params),
            headers: new Headers({
                'content-type': 'application/json'
            })
        })
    .then(response => response.json())
    .then(data => {
        setArrays(data);
    });
}


function setArrays(data) {
    x = data['x'];
    y1 = data['y1'];
    type1 = data['type1'];
    drawPlot();
}

function drawPlot() {

    if (type1 === 'cont') {
        plotType = 'line';
        plotType1 = 'line';
        radius1 = 0;
        showLine1 = true;
        yLabel = 'PDF';
    }

    else {
        plotType = 'line';
        plotType1 = 'line';
        if (plotThis === 'fx') radius1 = 3;
        else radius1 = 1;
        showLine1 = false;
        y1 = y1.map(function(val, i) {
            return val === 0 ? null : val;
        });
        yLabel = 'PMF';
    }

    if (plotThis === 'Fx') yLabel = 'CDF';

    ////////////////////
    // plotting
    ////////////////////

    if (!firstChart) chart.destroy();

    firstChart = false;

    chart = new Chart(ctx, {
        type: plotType,
        data: {
            labels: x,
            datasets: [
                {
                    data: y1,
                    type: plotType1,
                    label: 'Dist 1',
                    borderColor: 'darkslategray',
                    borderWidth: 2,
                    backgroundColor: 'rgba(47, 79, 79, 0.2)',
                    showLine: showLine1,
                    barPercentage: 0.7,
                    pointRadius: radius1,
                    pointHitRadius: 5
                }
            ],
        },
        options: {
            legend: {
                display: true
            },
            tooltips: {
                mode: 'index'
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

    if (y1[0] === 9999 || y1.slice(-1)[0] === 9999) {
        chart.options.scales.yAxes[0].ticks.max = round(Math.max(y1[1], y1.slice(-2)[0]) * 1.5, 0);
        chart.update();
    }


    /////////////////////////
    // generate formula table
    /////////////////////////

    formulaButtons.hidden = false;
    formulaTable.hidden = false;

    switch (whichSyntax) {
        case 'py':
            dists.forEach(d => displayPyFormula(d));
            break;
        case 'r':
            dists.forEach(d => displayRFormula(d));
            break;
        // case 'js':
        //     displayJsFormula();
        //     break;
        case 'xl':
            dists.forEach(d => displayXlFormula(d));
            break;
    }

}

////////////////
// formula table
////////////////

pyButton.addEventListener('click', () => {
    dists.forEach(d => displayPyFormula(d));
});
rButton.addEventListener('click', () => {
    dists.forEach(d => displayRFormula(d));
});
xlButton.addEventListener('click', () => {
    dists.forEach(d => displayXlFormula(d));
});

let pdfDescription = document.getElementById('pdfDescription');


function displayPyFormula(d) {
    whichSyntax = 'py';
    pyButton.classList.add('btn-selected');
    rButton.classList.remove('btn-selected');
    xlButton.classList.remove('btn-selected');
    document.getElementById('syntax').textContent = "Python (scipy.stats)";
    document.getElementById('pctDescription').textContent = 'Percentile (evaluated at q)';
    document.getElementById('rvDescription').textContent = 'Draw N random variables';

    if (d.whichDist === 'beta') {
        let a = -d.mean * (d.mean * d.mean - d.mean + d._var) / d._var;
        let b = (d.mean - 1) * (d.mean * d.mean - d.mean + d._var) / d._var;
        d.pdfFormula.textContent = "beta.pmf(x, a=" + a + ", b=" + b + ")";
        d.cdfFormula.textContent = "beta.cdf(x, a=" + a + ", b=" + b + ")";
        d.pctFormula.textContent = "beta.ppf(q, a=" + a + ", b=" + b + ")";
        d.rvFormula.textContent = "beta.rvs(a=" + a + ", b=" + b + ", size=N)";
    }
    else if (d.whichDist === 'binomial') {
        pdfDescription.textContent = 'PMF (evaluated at x)'

        let n = d.mean * d.mean / (d.mean - d._var);
        let p = (1 - (d._var / d.mean));
        d.pdfFormula.textContent = "binom.pmf(x, n=" + n  + ", p=" + p + ")";
        d.cdfFormula.textContent = "binom.cdf(x, n=" + n + ", p=" + p + ")";
        d.pctFormula.textContent = "binom.ppf(q, n=" + n + ", p=" + p + ")";
        d.rvFormula.textContent = "binom.rvs(n=" + n + ", p=" + p + ", size=N)";
    }
    else if (d.whichDist === 'exponential') {
        d.pdfFormula.textContent = "expon.pdf(x, scale=" + d.mean + ")";
        d.cdfFormula.textContent = "expon.cdf(x, scale=" + d.mean + ")";
        d.pctFormula.textContent = "expon.ppf(q, scale=" + d.mean + ")";
        d.rvFormula.textContent = "expon.rvs(scale=" + d.mean + ", size=N)";
    }
    else if (d.whichDist === 'gamma') {
        let a = (d.mean * d.mean) / d._var;
        let scale = d._var / d.mean;
        d.pdfFormula.textContent = "gamma.pdf(x, a=" + a + ", scale=" + scale + ")";
        d.cdfFormula.textContent = "gamma.cdf(x, a=" + a + ", scale=" + scale + ")";
        d.pctFormula.textContent = "gamma.ppf(q, a=" + a + ", scale=" + scale + ")";
        d.rvFormula.textContent = "gamma.rvs(a=" + a + ", scale=" + scale + ", size=N)";
    }
    else if (d.whichDist === 'folded normal') {
        c = Math.abs(d.mean) / d.sd;
        d.pdfFormula.textContent = "foldnorm.pdf(x, scale=" + d.sd + ", c=" + c + ")";
        d.cdfFormula.textContent = "foldnorm.cdf(x, scale=" + d.sd + ", c=" + c + ")";
        d.pctFormula.textContent = "foldnorm.ppf(q, scale=" + d.sd + ", c=" + c + ")";
        d.rvFormula.textContent = "foldnorm.rvs(scale=" + d.sd + ", c=" + c + ", size=N)";
    }
    else if (d.whichDist === 'negative binomial') {
        pdfDescription.textContent = 'PMF (evaluated at x)'

        let n = d.mean * d.mean / (d._var - d.mean);
        let p = d.mean / d._var;
        d.pdfFormula.textContent = "nbinom.pmf(x, n=" + n + ", p=" + p + ")";
        d.cdfFormula.textContent = "nbinom.cdf(x, n=" + n + ", p=" + p + ")";
        d.pctFormula.textContent = "nbinom.ppf(q, n=" + n + ", p=" + p + ")";
        d.rvFormula.textContent = "nbinom.rvs(n=" + n + ", p=" + p + ", size=N)";
    }
    else if (d.whichDist === 'normal') {
        d.pdfFormula.textContent = "norm.pdf(x, loc=" + d.mean + ", scale=" + d.sd + ")";
        d.cdfFormula.textContent = "norm.cdf(x, loc=" + d.mean + ", scale=" + d.sd + ")";
        d.pctFormula.textContent = "norm.ppf(q, loc=" + d.mean + ", scale=" + d.sd + ")";
        d.rvFormula.textContent = "norm.rvs(loc=" + d.mean + ", scale=" + d.sd + ", size=N)";
    }
    else if (d.whichDist === 'poisson') {
        pdfDescription.textContent = 'PMF (evaluated at x)';
        
        d.pdfFormula.textContent = "poisson.pmf(x, mu=" + d.mean + ")";
        d.cdfFormula.textContent = "poisson.cdf(x, mu=" + d.mean + ")";
        d.pctFormula.textContent = "poisson.ppf(q, mu=" + d.mean + ")";
        d.rvFormula.textContent = "poisson.rvs(mu=" + d.mean + ", size=N)";
    }
    else if (d.whichDist === 'truncated normal') {
        a = (0 - d.mean) / d.sd;
        b = (99999 - d.mean) / d.sd;
        d.pdfFormula.textContent = "truncnorm.pdf(x, loc=" + d.mean + ", scale=" + d.sd + ", a=" + a + ", b=" + b + ")";
        d.cdfFormula.textContent = "truncnorm.cdf(x, loc=" + d.mean + ", scale=" + d.sd + ", a=" + a + ", b=" + b + ")";
        d.pctFormula.textContent = "truncnorm.ppf(q, loc=" + d.mean + ", scale=" + d.sd + ", a=" + a + ", b=" + b + ")";
        d.rvFormula.textContent = "truncnorm.rvs(loc=" + d.mean + ", scale=" + d.sd + ", a=" + a + ", b=" + b + ", size=N)";
    }
}

function displayRFormula(d) {
    whichSyntax = 'r';
    pyButton.classList.remove('btn-selected');
    rButton.classList.add('btn-selected');
    xlButton.classList.remove('btn-selected');
    document.getElementById('syntax').textContent = "R";
    document.getElementById('pctDescription').textContent = 'Percentile (evaluated at p)';
    document.getElementById('rvDescription').textContent = 'Draw N random variables';

    if (d.whichDist === 'beta') {
        let shape1 = -d.mean * (d.mean * d.mean - d.mean + d._var) / d._var;
        let shape2 = (d.mean - 1) * (d.mean * d.mean - d.mean + d._var) / d._var;
        d.pdfFormula.textContent = "dbeta(x, shape1=" + shape1 + ", shape2=" + shape2 + ")";
        d.cdfFormula.textContent = "pbeta(x, shape1=" + shape1 + ", shape2=" + shape2 + ")";
        d.pctFormula.textContent = "qbeta(p, shape1=" + shape1 + ", shape2=" + shape2 + ")";
        d.rvFormula.textContent = "rbeta(n=N, shape1=" + shape1 + ", shape2=" + shape2 + ")";
    }
    else if (d.whichDist === 'binomial') {
        pdfDescription.textContent = 'PMF (evaluated at x)'

        let size = d.mean * d.mean / (d.mean - d._var);
        let prob = (1 - (d._var / d.mean));
        d.pdfFormula.textContent = "dbinom(x, size=" + size  + ", prob=" + prob + ")";
        d.cdfFormula.textContent = "pbinom(x, size=" + size + ", prob=" + prob + ")";
        d.pctFormula.textContent = "qbinom(p, size=" + size + ", prob=" + prob + ")";
        d.rvFormula.textContent = "rbinom(n=N, size=" + size + ", prob=" + prob + ")";
    }
    else if (d.whichDist === 'exponential') {
        let rate = 1 / d.mean;
        d.pdfFormula.textContent = "dexp(x, rate=" + rate  + ")";
        d.cdfFormula.textContent = "pexp(x, rate=" + rate + ")";
        d.pctFormula.textContent = "qexp(p, rate=" + rate + ")";
        d.rvFormula.textContent = "rexp(n=N, rate=" + rate + ")";
    }
    else if (d.whichDist === 'gamma') {
        document.getElementById('syntax').textContent = "R (coming soon)";
        clearFormulas();
    }
    else if (d.whichDist === 'folded normal') {
        document.getElementById('syntax').textContent = "R (coming soon)";
        clearFormulas();
    }
    else if (d.whichDist === 'negative binomial') {
        pdfDescription.textContent = 'PMF (evaluated at x)'
        
        document.getElementById('syntax').textContent = "R (coming soon)";
        clearFormulas();
    }
    else if (d.whichDist === 'normal') {
        d.pdfFormula.textContent = "dnorm(x, d.mean=" + d.mean + ", d.sd=" + d.sd + ")";
        d.cdfFormula.textContent = "pnorm(x, d.mean=" + d.mean + ", d.sd=" + d.sd + ")";
        d.pctFormula.textContent = "qnorm(p, d.mean=" + d.mean + ", d.sd=" + d.sd + ")";
        d.rvFormula.textContent = "rnorm(n=N, d.mean=" + d.mean + ", d.sd=" + d.sd + ")";
    }
    else if (d.whichDist === 'poisson') {
        pdfDescription.textContent = 'PMF (evaluated at x)';
        
        d.pdfFormula.textContent = "dpois(x, lambda=" + d.mean + ")";
        d.cdfFormula.textContent = "ppois(x, lambda=" + d.mean + ")";
        d.pctFormula.textContent = "qpois(p, lambda=" + d.mean + ")";
        d.rvFormula.textContent = "rpois(n=N, lambda=" + d.mean + ")";
    }
}

function displayXlFormula(d) {
    whichSyntax = 'xl';
    pyButton.classList.remove('btn-selected');
    rButton.classList.remove('btn-selected');
    xlButton.classList.add('btn-selected');
    document.getElementById('syntax').textContent = "Excel";
    document.getElementById('pctDescription').textContent = 'Percentile (evaluated at alpha)'
    document.getElementById('rvDescription').textContent = 'Draw one random variable';

    if (d.whichDist === 'beta') {
        let alpha = -d.mean * (d.mean * d.mean - d.mean + d._var) / d._var;
        let beta = (d.mean - 1) * (d.mean * d.mean - d.mean + d._var) / d._var;
        d.pdfFormula.textContent = "beta.dist(x, " + alpha + ", " + beta + ", false)";
        d.cdfFormula.textContent = "beta.dist(x, " + alpha + ", " + beta + ", true)";
        d.pctFormula.textContent = "beta.inv(" + alpha + ", " + beta + ", alpha)";
        d.rvFormula.textContent = "";
    }
    else if (d.whichDist === 'binomial') {
        let trials = d.mean * d.mean / (d.mean - d._var);
        let probability_s = (1 - (d._var / d.mean));
        d.pdfFormula.textContent = "binom.dist(x, " + trials + ", " + probability_s + ", false)";
        d.cdfFormula.textContent = "binom.dist(x, " + trials + ", " + probability_s + ", true)";
        d.pctFormula.textContent = "binom.inv(" + trials + ", " + probability_s + ", alpha)";
        d.rvFormula.textContent = "";
    }
    else if (d.whichDist === 'exponential') {
        let lambda = 1 / d.mean;
        d.pdfFormula.textContent = "expon.dist(x, " + lambda + ", false)";
        d.cdfFormula.textContent = "expon.dist(x, " + lambda + ", true)";
        d.pctFormula.textContent = "";
        d.rvFormula.textContent = "";
    }
    else if (d.whichDist === 'normal') {
        d.pdfFormula.textContent = "norm.dist(x, " + d.mean + ", " + d.sd + ", false)";
        d.cdfFormula.textContent = "norm.dist(x, " + d.mean + ", " + d.sd + ", true)";
        d.pctFormula.textContent = "norm.inv(" + d.mean + ", " + d.sd + ", alpha)";
        d.rvFormula.textContent = "";
    }
    else if (d.whichDist === 'poisson') {
        d.pdfFormula.textContent = "poisson.dist(x, " + d.mean + ", false)";
        d.cdfFormula.textContent = "poisson.dist(x, " + d.mean + ", true)";
        d.pctFormula.textContent = "poisson.inv(" + d.mean + ", alpha)";
        d.rvFormula.textContent = "";
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

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }
