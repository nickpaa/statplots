from flask import Flask, render_template, url_for, request, jsonify, make_response
from numpy import arange

from statplots import app
from statplots.distributions import *


@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/update-plot', methods=['POST'])
def update_plot():
    req = request.get_json()
    # print('JS is sending as a request:')
    # print(req)

    dist = req['dist']
    mean = float(req['mean'])
    sd = float(req['sd'])
    plotThis = req['plotThis']

    calc = {'beta': calcBeta,
            'binomial': calcBinomial,
            'exponential': calcExponential,
            'folded normal': calcFoldedNormal,
            'gamma': calcGamma,
            'negative binomial': calcNegativeBinomial,
            'normal': calcNormal, 
            'poisson': calcPoisson,
            'truncated normal': calcTruncatedNormal,}

    x, y = calc[dist](mean, sd, plotThis)
    stats = {'x':x.tolist(), 'y':y.tolist()}
    
    res = make_response(jsonify(stats), 200)
    return res

if __name__ == '__main__':
    app.run(debug=True)