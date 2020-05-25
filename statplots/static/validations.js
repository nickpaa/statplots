export default validateInputs;

function validateInputs(d) {
    
    d.inputsValid = true;

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