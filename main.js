const distrField = document.getElementById('distrField');
const meanField = document.getElementById('meanField');
const sdField = document.getElementById('sdField');
const varField = document.getElementById('varField');
const update = document.getElementById('update');
const canvas = document.querySelector('canvas');
const ctx = document.getElementById('chart').getContext('2d');

const N = 800;

let mean;
let sd;
let whichFunction;
let x = [];
let y = [];
let firstChart = true;

meanField.onblur = validateInputs;
sdField.onblur = validateInputs;
varField.onblur = validateInputs;

function validateInputs() {
    if (sdField.value < 0) {
        alert('Standard deviation must be positive');
        return;
    }

    if (varField.value < 0) {
        alert('Variance must be positive');
        return;
    }

    if (distrField.value === 'normal') {
        varField.value = sdField.value * sdField.value;
    }

    if (distrField.value === 'exponential') {
        sdField.value = meanField.value;
        varField.value = meanField.value * meanField.value;
    }
}

update.onclick = updatePlot;

function setWhichValue() {
    const whichField = document.getElementsByName('which');
    if (whichField[0].checked) {
        whichFunction = 'pdf';
    }
    else {
        whichFunction = 'cdf';
    }
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
        x[i] = Math.round((minX + i * inc) * 100) / 100;
        if (whichFunction === 'pdf') {
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
        if (whichFunction === 'pdf') {
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
        if (whichFunction === 'pdf') {
            y[i] = jStat.poisson.pdf(x[i], mean);
        }
        else {
            y[i] = jStat.poisson.cdf(x[i], mean);
        }
    }
}

function updatePlot() {
    x = [];
    y = [];

    mean = Number(meanField.value);
    sd = Number(sdField.value);
    setWhichValue();

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

    if (!firstChart) chart.destroy();

    firstChart = false;

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: x,
            datasets: [
                {
                    data: y,
                    label: whichFunction,
                    borderColor: '#blue',
                    backgroundColor: 'blue',
                    fill: cont,
                    showLine: cont,
                    pointRadius: radius,
                    pointHitRadius: 3
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
                        labelString: whichFunction
                    }
                }]
            }
        }
    })
}