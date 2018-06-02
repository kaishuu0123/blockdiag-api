import os
import sys
import traceback

from blockdiag.utils.fontmap import FontMap
from sanic import Sanic
from sanic.response import json, html, redirect
from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader('./templates', encoding='utf8'))

app = Sanic()

DIAGRAM_FORMAT = 'SVG'

app.static('/static', './static')


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


@app.route("/api/v1/actdiag", methods=['POST'])
async def actdiag_handler(request):
    from actdiag import parser, builder, drawer

    etype = None
    error = None

    image, etype, error = drawGraph(
        request.json["source"], parser, builder, drawer)

    return json(
        dict(image=image, etype=etype, error=error),
        status=200 if error is None else 400
    )


@app.route("/api/v1/blockdiag", methods=['POST'])
async def blockdiag_handler(request):
    from blockdiag import parser, builder, drawer

    image, etype, error = drawGraph(
        request.json["source"], parser, builder, drawer)

    return json(
        dict(image=image, etype=etype, error=error),
        status=200 if error is None else 400
    )


@app.route("/api/v1/nwdiag", methods=['POST'])
async def nwdiag_handler(request):
    from nwdiag import parser, builder, drawer

    image, etype, error = drawGraph(
        request.json["source"], parser, builder, drawer)

    return json(
        dict(image=image, etype=etype, error=error),
        status=200 if error is None else 400
    )


@app.route("/api/v1/packetdiag", methods=['POST'])
async def packetdiag_handler(request):
    from packetdiag import parser, builder, drawer

    image, etype, error = drawGraph(
        request.json["source"], parser, builder, drawer)

    return json(
        dict(image=image, etype=etype, error=error),
        status=200 if error is None else 400
    )


@app.route("/api/v1/rackdiag", methods=['POST'])
async def rackdiag_handler(request):
    from rackdiag import parser, builder, drawer

    image, etype, error = drawGraph(
        request.json["source"], parser, builder, drawer)

    return json(
        dict(image=image, etype=etype, error=error),
        status=200 if error is None else 400
    )


@app.route("/api/v1/seqdiag", methods=['POST'])
async def seqdiag_handler(request):
    from seqdiag import parser, builder, drawer

    image, etype, error = drawGraph(
        request.json["source"], parser, builder, drawer)

    return json(
        dict(image=image, etype=etype, error=error),
        status=200 if error is None else 400
    )


@app.route("/ui")
async def ui_handler(request):
    tpl = env.get_template('index.html')
    return html(tpl.render())


@app.route("/")
async def root_handler(request):
    return redirect('/ui')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
