from flask import Flask, render_template, url_for, request, jsonify, make_response
from numpy import arange

from statplots import app
from statplots.distributions import *


@app.route('/')
@app.route('/single')
def home():
    return render_template('single.html')

@app.route('/compare')
def compare():
    return render_template('compare.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/update-plot-single', methods=['POST'])
def update_plot_single():
    req = request.get_json()

    dist1 = req['params1']['dist']
    mean1 = float(req['params1']['mean'])
    sd1 = float(req['params1']['sd'])

    plotThis = req['plotThis']

    x, y1, type1 = oneDistribution(dist1, mean1, sd1, plotThis)
    stats = {'x':x.tolist(), 'y1':y1.tolist(), 'type1':type1}
    
    res = make_response(jsonify(stats), 200)
    return res

@app.route('/update-plot-compare', methods=['POST'])
def update_plot_compare():
    req = request.get_json()

    dist1 = req['params1']['dist']
    mean1 = float(req['params1']['mean'])
    sd1 = float(req['params1']['sd'])

    dist2 = req['params2']['dist']
    mean2 = float(req['params2']['mean'])
    sd2 = float(req['params2']['sd'])

    plotThis = req['plotThis']

    x, y1, y2, type1, type2 = twoDistributions(dist1, mean1, sd1, dist2, mean2, sd2, plotThis)
    stats = {'x':x.tolist(), 'y1':y1.tolist(), 'y2':y2.tolist(), 'type1':type1, 'type2':type2}
    
    res = make_response(jsonify(stats), 200)
    return res


if __name__ == '__main__':
    app.run(debug=True)