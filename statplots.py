from flask import Flask, render_template, url_for, request, jsonify, make_response
from numpy import arange

app = Flask(__name__)

@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/about')
def about():
    return render_template('about.html')

# @app.route('/dist')
# def guestbook():
#     return render_template('dist.html')

@app.route('/dist/update-plot', methods=['POST'])
def update_plot():
    req = request.get_json()
    print('JS is sending as a request:')
    print(req)

    mean = float(req['mean'])
    sd = float(req['sd'])

    x = arange(mean - 4 * sd, mean + 4 * sd, 1).tolist()
    
    res = make_response(jsonify(x), 200)
    return res

if __name__ == '__main__':
    app.run(debug=True)