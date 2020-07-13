import os
import sys
import traceback

import base64
import zlib

from html import escape

from blockdiag.utils.fontmap import FontMap
from sanic import Sanic
from sanic import Blueprint
from sanic.response import json, html, redirect, text
from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader('./templates', encoding='utf8'))

app = Sanic()

bp = Blueprint('blockdiag_api')

DIAGRAM_FORMAT = 'SVG'

app.static('/static', './static')

def gen_svg_error_image(etype, error, message):
    import textwrap
    svg_header = '''
    <svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="600" height="300"
     >
     <text x="10" y="10" font-size="16" dy="0">
    '''
    svg_footer = '''
      </text>
    </svg>
    '''

    escaped_etype = escape(etype)
    escaped_error = escape(error)
    escaped_message = escape(message)

    svg = svg_header
    svg += f'<tspan x="10" dy="1.2em">ErrorType: {escaped_etype}</tspan>'
    svg += f'<tspan x="10" dy="1.2em">ErrorMessage: {escaped_error}</tspan>'
    svg += f'<tspan x="10" dy="1.2em">Source:</tspan>'
    for m in escaped_message.splitlines():
        svg += f'<tspan x="10" dy="1.2em" xml:space="preserve">{m}</tspan>'
    svg += svg_footer

    return svg

def inflate(data):
    decoded_data = base64.urlsafe_b64decode(data)
    return zlib.decompress(decoded_data, -zlib.MAX_WBITS)

def create_fontmap():
    fontmap = FontMap(None)
    fontmap.set_default_font(os.path.join(
        os.getcwd(), 'dummy_font', 'ipag.ttf'))

    return fontmap


def drawGraph(source, parser, builder, drawer):
    etype = None
    error = None

    try:
        tree = parser.parse_string(source)
        diagram = builder.ScreenNodeBuilder.build(tree)
        draw = drawer.DiagramDraw(
            DIAGRAM_FORMAT, diagram, fontmap=create_fontmap(), ignore_pil=True)
        draw.draw()

        image = draw.save()
    except Exception as err:
        image = ''
        etype = err.__class__.__name__
        error = str(err)

    return image, etype, error

@bp.route("/api/v1/<diag_type>/inflate/<deflate_string>", methods=['GET'])
async def get_handler(request, diag_type, deflate_string):
    diags = ["actdiag", "blockdiag", "nwdiag", "packetdiag", "rackdiag", "seqdiag"]
    etype = None
    error = None

    if diag_type not in diags:
        return json(
            dict(image=None, etype='invalid diag type', error=f'valid type: {diags}'),
            status=400
        )

    diag_module = __import__(diag_type, fromlist=["parser", "builder", "drawer"])

    try:
        source_bytes = inflate(deflate_string)
    except Exception as err:
        etype = err.__class__.__name__
        error = str(err)
        return text(
            gen_svg_error_image(etype, error, deflate_string),
            headers={'Content-Type': 'image/svg+xml'},
            status=400
        )

    source = source_bytes.decode('utf-8')

    image, etype, error = drawGraph(
        source, diag_module.parser, diag_module.builder, diag_module.drawer)

    if error is None:
        return text(
            image,
            headers={'Content-Type': 'image/svg+xml'},
            status=200
        )
    else:
        return text(
            gen_svg_error_image(etype, error, source),
            headers={'Content-Type': 'image/svg+xml'},
            status=400
        )

@bp.route("/api/v1/<diag_type>", methods=['POST'])
async def post_handler(request, diag_type):
    diags = ["actdiag", "blockdiag", "nwdiag", "packetdiag", "rackdiag", "seqdiag"]

    if diag_type not in diags:
        return json(
            dict(image=None, etype='invalid diag type', error=f'valid type: {diags}'),
            status=400
        )

    diag_module = __import__(diag_type, fromlist=["parser", "builder", "drawer"])

    etype = None
    error = None

    image, etype, error = drawGraph(
        request.json["source"], diag_module.parser, diag_module.builder, diag_module.drawer)

    return json(
        dict(image=image, etype=etype, error=error),
        status=200 if error is None else 400
    )


@bp.route("/ui")
async def ui_handler(request):
    tpl = env.get_template('index.html')
    return html(tpl.render())


@bp.route("/")
async def root_handler(request):
    url = request.app.url_for('blockdiag_api.ui_handler')
    return redirect(url)

if os.getenv('BLOCKDIAG_API_SUBDIR'):
    app.blueprint(bp, url_prefix=os.getenv('BLOCKDIAG_API_SUBDIR'))
else:
    app.blueprint(bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
