from flask import Flask
from flask_talisman import Talisman

app = Flask(__name__)

csp = {
  'default-src': [
    '\'self\'',
    'code.jquery.com',
    'cdn.jsdelivr.net',
    'stackpath.bootstrapcdn.com',
    'fonts.googleapis.com',
    'cdnjs.cloudflare.com'
  ]
}
talisman = Talisman(app, content_security_policy=csp)

from statplots import routes