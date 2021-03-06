define(function() {

    'use strict';

    var RMath = require('../util/rMath');
    var Tooltip = require('./tooltip');
    var RightMenu = require('./rightmenu');

    var padding = 0; // 文字与图形间的间距

    function Node(graph, id, option) {

        this.graph = graph; // RGraph Object

        this.lines = [];

        this._add(id, option);
    }

    Node.prototype._add = function(id, option) {

        if (this.graph._nodesMap[id]) {
            return this.graph._nodesMap[id];
        }

        this.id = id ? id : new Date() - 0;

        var _node = this;

        var option = option || {};
        _node.data = option.data;

        var _type = option.type ? option.type : 'circle';
        var _x = option.x ? option.x : 0;
        var _y = option.y ? option.y : 0;
        var _attr = option.attr ? option.attr : {};
        var _r = option.r ? option.r : 10;
        var _src = option.src;
        var _width = option.width ? option.width : 60;
        var _height = option.height ? option.height : 60;

        var _text = option.text;
        this.text = _text;
        var _textAttr = option.textAttr ? option.textAttr : {};
        var _textAlign = option.textAlign ? option.textAlign : 'bottom';

        var _hoverText = option.hoverText;

        var _showCircle = option.showCircle || false;
        var _circleAttr = option.circleAttr ? option.circleAttr : {
            stroke: '#FFFF00',
            'storke-width': 5,
            'storke-dasharray': ['.']
        };

        var _dbclick = option.dbclick;

        switch (_type) {

            case 'circle':
                _node.rNode = _node.graph.rPaper.circle(_x, _y, _r).attr(_attr);
                if (_text) {
                    _node.rText = _node.graph.rPaper.text(_x, _y, _text).attr(_textAttr);
                    var textBBox = _node.rText.getBBox();
                    if ('bottom' == _textAlign) {
                        _node.rText.attr({
                            y: _y + _r + padding + textBBox.height / 2
                        });
                    } else if ('top' == _textAlign) {
                        _node.rText.attr({
                            y: _y - _r - padding - textBBox.height / 2
                        });
                    } else if ('left' == _textAlign) {
                        _node.rText.attr({
                            x: _x - _r - padding - textBBox.width / 2
                        });
                    } else if ('right' == _textAlign) {
                        _node.rText.attr({
                            x: _x + _r + padding + textBBox.width / 2
                        });
                    } else if ('center' == _textAlign) {

                    } else if ('rotate' == _textAlign) {
                        var _angle = option.angle ? option.angle : 0;
                        var mathAngle = RMath.transToMathAngle(_angle);
                        var lr = _r + textBBox.width / 2;
                        _angle = _angle > 90 && _angle < 270 ? _angle + 180 : _angle;
                        _node.rText.attr({
                            x: _x + Math.cos(mathAngle) * lr,
                            y: _y + Math.sin(mathAngle) * lr
                        }).rotate(_angle);
                    }

                }
                break;
            case 'image':
                _node.rNode = _node.graph.rPaper.image(_src, _x - _width / 2, _y - _height / 2, _width, _height).attr(_attr);
                if (_text) {
                    _node.rText = _node.graph.rPaper.text(_x, _y, _text).attr(_textAttr);
                    var textBBox = _node.rText.getBBox();
                    if ('bottom' == _textAlign) {
                        _node.rText.attr({
                            y: _y + _height / 2 + padding + textBBox.height / 2
                        });
                    } else if ('top' == _textAlign) {
                        _node.rText.attr({
                            y: _y - _height / 2 - padding - textBBox.height / 2
                        });
                    } else if ('left' == _textAlign) {
                        _node.rText.attr({
                            x: _x - _width / 2 - padding - textBBox.width / 2
                        });
                    } else if ('right' == _textAlign) {
                        _node.rText.attr({
                            x: _x + _width / 2 + padding + textBBox.width / 2
                        });
                    } else if ('center' == _textAlign) {

                    } else if ('rotate' == _textAlign) {
                        var _angle = option.angle ? option.angle : 0;
                        var mathAngle = RMath.transToMathAngle(_angle);
                        var lr = Math.sqrt(_width * _width / 4 + _height * _height / 4) + textBBox.width / 2;
                        _angle = _angle > 90 && _angle < 270 ? _angle + 180 : _angle;
                        _node.rText.attr({
                            x: _x + Math.cos(mathAngle) * lr,
                            y: _y + Math.sin(mathAngle) * lr
                        }).rotate(_angle);
                    }
                }
                break;
        }

        // hover begin
        var _hoverHighlight = _node.graph.option.hoverHighlight;
        _node.rNode.mouseover(function() {

            if (_hoverText) {
                Tooltip.create(_hoverText);
            }

            if (_hoverHighlight) {
                for (var i = 0, len = _node.graph.getNodes().length; i < len; i++) {
                    _node.graph.getNodes()[i].weaken();
                }
                for (var i = 0, len = _node.graph.getLines().length; i < len; i++) {
                    _node.graph.getLines()[i].weaken();
                }
                _node.restore();
                for (var i = 0, len = _node.lines.length; i < len; i++) {
                    var line = _node.lines[i];
                    line.restore();
                    line.n1.restore();
                    line.n2.restore();
                }
            }

        });
        _node.rNode.mouseout(function() {
            if (_hoverText) {
                Tooltip.remove();
            }
            if (_hoverHighlight) {
                for (var i = 0, len = _node.graph.getNodes().length; i < len; i++) {
                    _node.graph.getNodes()[i].restore();
                }
                for (var i = 0, len = _node.graph.getLines().length; i < len; i++) {
                    _node.graph.getLines()[i].restore();
                }
            }
        });
        _node.rNode.mousemove(function(e) {
            if (_hoverText) {
                Tooltip.repos(e);
            }
        });
        // hover end

        // dbclick begin
        if ('function' == typeof _dbclick) {
            _node.rNode.attr('cursor', 'pointer');
            _node.rNode.dblclick(function() {
                _dbclick(_node.id, _text);
            });
            _node.rText.dblclick(function() {
                _dbclick(_node.id, _text);
            });
        }
        // dbclick end

        // rightclick begin 
        if (option.rightMenu) {
            _node.rNode.mousedown(function(e) {
                e = e || window.event;
                if (e.button != 2) {
                    return;
                }
                RightMenu.create(_node.id, _text, option.rightMenu);
                RightMenu.repos(e);
            });
        }
        // rightclick end

        // extends begin
        var _extends = option.extends;
        if (_extends) {
            if ('object' == typeof _extends) {
                if (!isNaN(_extends.length)) {
                    _node.extends = new Array();
                    for (var i = 0, len = _extends.length; i < len; i++) {
                        if ('image' == _extends[i].type) {
                            _node.extends.push(_node.graph.rPaper.image(_extends[i].src, _extends[i].x - _extends[i].width / 2, _extends[i].y - _extends[i].height / 2, _extends[i].width, _extends[i].height));
                        }
                    }
                } else {
                    if ('image' == _extends.type) {
                        _node.extends = [_node.graph.rPaper.image(_extends.src, _extends.x - _extends.width / 2, _extends.y - _extends.height / 2, _extends.width, _extends.height)];
                    }
                }
            }
        }
        // extends end

        // drag begin 
        _node.rNode.drag(function(dx, dy, x, y, event) {
            _node.rNode.transform(['t', _node._tx + dx / _node._zoom, _node._ty + dy / _node._zoom].join(','));
            if (_node.rText) {
                _node.rText.transform(['t', _node._tx + dx / _node._zoom, _node._ty + dy / _node._zoom, 'r', _node._textDeg].join(','));
            }

            if (_node.extends) {
                for (var i = 0, len = _node.extends.length; i < len; i++) {
                    _node.extends[i].transform(['t', _node._tx + dx / _node._zoom, _node._ty + dy / _node._zoom].join(','));
                }
            }

            for (var i = 0, len = _node.lines.length; i < len; i++) {
                _node.lines[i].rePaint();
            }

        }, function(x, y, event) {
            _node._zoom = _node.graph._paper.zoom;
            _node._tx = _node.rNode._.dx;
            _node._ty = _node.rNode._.dy;
            // _node.rNode.toFront();

            if (_node.rText) {
                _node._textDeg = _node.rText._.deg;
            }

            for (var i = 0, len = _node.lines.length; i < len; i++) {
                if (_node.lines[i].lineEffect) {
                    _node.lines[i].lineEffect.stop();
                }
            }
        }, function(event) {
            if (_node.rText) {
                // _node.rText.toFront();
            }

            for (var i = 0, len = _node.lines.length; i < len; i++) {
                _node.lines[i].resetEffect();
                if (_node.lines[i].lineEffect) {
                    _node.lines[i].lineEffect.run();
                }
            }
        });
        // drag end


        _node.graph.nodes.push(_node);
        _node.graph._nodesMap[id] = _node;

        return _node;
    };

    Node.prototype.getCenterPos = function(node) {
        var _node = node;
        if (!_node) {
            _node = this;
        }
        var bbox = _node.rNode.getBBox();
        return {
            x: parseInt((bbox.x + bbox.x2) / 2, 10),
            y: parseInt((bbox.y + bbox.y2) / 2, 10)
        };
    };

    Node.prototype.attr = function(type, value) {
        var _node = this;
        if ('string' == typeof type) {
            if ('text' == type) {
                if ('undefined' == typeof value) {
                    return _node.text;
                } else {
                    _node.text = value;
                    _node.rText.attr('text', value);
                }
            }
        }
    };
    Node.prototype.addExtend = function(option) {
        var _node = this;
        if ('object' == typeof option) {
            if (!_node.extends) {
                _node.extends = new Array();
            }
            if (!isNaN(option.length)) {
                for (var i = 0, len = option.length; i < len; i++) {
                    if ('image' == option[i].type) {
                        _node.extends.push(_node.graph.rPaper.image(option[i].src, option[i].x - option[i].width / 2, option[i].y - option[i].height / 2, option[i].width, option[i].height));
                    }
                }
            } else {
                if ('image' == option.type) {
                    _node.extends.push(_node.graph.rPaper.image(option.src, option.x - option.width / 2, option.y - option.height / 2, option.width, option.height));
                }
            }
        }
    };
    Node.prototype.clearExtend = function() {
        var _node = this;
        if (_node.extends) {
            for (var i = 0, len = _node.extends.length; i < len; i++) {
                _node.extends[i].remove();
            }
            _node.extends = [];
        }
    };
    Node.prototype.weaken = function() {
        var _node = this;
        var oldOpacity = _node.rNode.attr('opacity');
        _node.rNode.oldOpacity = oldOpacity;
        _node.rNode.attr('opacity', oldOpacity * 0.1);

        if (_node.rText) {
            oldOpacity = _node.rText.attr('opacity');
            _node.rText.oldOpacity = oldOpacity;
            _node.rText.attr('opacity', oldOpacity * 0.1);
        }

    };
    Node.prototype.restore = function() {
        var _node = this;
        _node.rNode.attr('opacity', _node.rNode.oldOpacity);

        if (_node.rText) {
            _node.rText.attr('opacity', _node.rText.oldOpacity);
        }
    };
    return Node;
});
