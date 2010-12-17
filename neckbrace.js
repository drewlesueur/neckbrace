(function() {
  var makeLikeUnderscore, _m, _nb, _t;
  var __slice = Array.prototype.slice;
  makeLikeUnderscore = function() {
    var _nb;
    _nb = function(o) {
      _nb.currentObject = o;
      return _nb.methods;
    };
    _nb.methods = {};
    _nb.mixin = function(funcs) {
      var func, name, _fn, _results;
      _fn = function(name, func) {
        _nb[name] = func;
        return _results.push(_nb.methods[name] = function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return func.apply(null, [_nb.currentObject].concat(__slice.call(args)));
        });
      };
      _results = [];
      for (name in funcs) {
        func = funcs[name];
        _fn(name, func);
      }
      return _results;
    };
    return _nb;
  };
  _nb = window._nb = makeLikeUnderscore();
  _(_nb).extend({
    emulateJSON: true,
    emulateHTTP: true,
    currentUniqueId: 0,
    metaInfo: {}
  });
  _nb.mixin({
    extend: function(model, params) {
      var ret;
      ret = _.clone(model);
      _.extend(ret, params);
      ret["super"] = model;
      return ret;
    },
    extendModel: function(params) {
      return _nb.extend(_nb.Model, params);
    },
    extendCollection: function(params) {
      return _nb.extend(_nb.Collection, params);
    },
    uniqueId: function() {
      return _nb.currentUniqueId += 1;
    },
    metaObj: function(o, extra) {
      var cid, metaO;
      o = o || {};
      cid = _nb.uniqueId();
      o.__cid = cid;
      metaO = _nb.metaInfo[cid] = {
        record: o
      };
      _.extend(metaO, extra);
      if (metaO.type && metaO.type.initialize) {
        metaO.type.initialize(o);
      }
      return o;
    },
    metaType: function(type, o) {
      return _nb.metaObj(o, {
        type: type
      });
    },
    meta: function(o) {
      var meta;
      meta = _nb.metaInfo[o.__cid];
      return meta;
    }
  });
  _m = window._m = function(o) {
    return _nb(o).meta();
  };
  _t = window._t = makeLikeUnderscore();
  _t.addMethods = function(methodNames) {
    var mixins, name, _fn, _i, _len;
    mixins = {};
    _fn = function(name) {
      return mixins[name] = function() {
        var args, o, _ref;
        o = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return (_ref = _m(o).type)[name].apply(_ref, [o].concat(__slice.call(args)));
      };
    };
    for (_i = 0, _len = methodNames.length; _i < _len; _i++) {
      name = methodNames[_i];
      _fn(name);
    }
    return _t.mixin(mixins);
  };
  _t.addProps = function(propNames) {
    var mixins, name, _fn, _i, _len;
    mixins = {};
    _fn = function(name) {
      return mixins[name] = function(o) {
        return _m(o).type[name];
      };
    };
    for (_i = 0, _len = propNames.length; _i < _len; _i++) {
      name = propNames[_i];
      _fn(name);
    }
    return _t.mixin(mixins);
  };
  _t.addMethods(["save", "initialize", "append", "render", "add", "remove", "fetch", "getById", "getByCid", "toJSON", "set", "isNew", "appendingEl", "url"]);
  _t.addProps(["triggers"]);
  _nb.Model = {
    appendingEl: function(o) {
      return _m(o).el;
    },
    initialize: function(o, params) {
      var mo;
      mo = _m(o);
      mo.cid = _nb.uniqueId();
      mo.element = "div";
      _t.append(o);
      return _t.render(o);
    },
    append: function(o) {
      var mo;
      mo = _m(o);
      if (!mo.el) {
        mo.el = document.createElement(mo.element);
      }
      if (mo.parent) {
        return $(_t(mo.parent).appendingEl()).append(mo.el);
      } else {
        return $(document.body).append(mo.el);
      }
    },
    render: function(o) {},
    toJSON: function(o) {
      return o;
    },
    ajax: $.ajax,
    url: function(o) {
      return "/neckbraces";
    },
    isNew: function(o) {
      return o.id || o._id;
    },
    save: function(o, options) {
      var method;
      method = _t(o).isNew() ? "create" : "update";
      return _nb.sync(method, this, options.success, options.error);
    },
    fetch: function(o, options) {
      return _nb.sync("read", o, options.success, options.error);
    },
    "delete": function(o, options) {
      return _nb.sync("delete", o, options.success, options.error);
    },
    set: function(o, vals) {
      var key, mo, old, tp, val;
      mo = _m(o) && (tp = mo.type);
      for (key in vals) {
        val = vals[key];
        old = o[key] && (o[key] = val);
        if (tp.triggers["change:" + key]) {
          tp.triggers["change:" + key].apply(o, [old]);
        }
      }
      if (tp.triggers["chage"]) {
        return tp.triggers["change"].apply(o);
      }
    },
    get: function(o, val) {
      return o[val];
    }
  };
  _nb.Collection = _nb.extendModel({
    add: function(o, adding) {
      var mo, tp;
      mo = _m(o) && (tp = mo.type);
      if (!("_byId" in mo)) {
        mo._byId = {};
      }
      if (!("_byUid" in mo)) {
        mo._byUid = {};
      }
      o.push(adding);
      if ("id" in adding) {
        mo._byId[adding.id] = adding;
      } else if ("_id" in adding) {
        mo._byId[adding._id] = adding;
      }
      if ("cid" in adding) {
        mo._byCid[adding.cid] = adding;
      }
      _m(adding).parent = o;
      if (tp.triggers["add"]) {
        return tp.triggers["add"].apply(o);
      }
    },
    remove: function(model) {
      var mo, tp;
      mo = _m(o) && (tp = mo.type);
      model = mo.getByCid(model) || mo.get(model);
      if (!model) {
        return null;
      }
      delete mo._byId[model.id];
      delete mo._byCid[model.cid];
      delete model.parent;
      o.splice(_.indexOf(o, model), 1);
      if (tp.triggers["remove"]) {
        return tp.triggers["remove"].apply(this);
      }
    },
    getById: function(o, id) {
      return _m(o)._byId[id];
    },
    getByCid: function(o, cid) {
      return _m(o)._byCid[cid];
    }
  });
  _nb.sync = function(method, o, success, error) {
    var method_map, mo, modelJSON, params, type;
    mo = _m(o);
    if (method === 'create' || method === 'update') {
      modelJSON = JSON.stringify(_t(o).toJSON());
    }
    method_map = {
      'create': "POST",
      'update': 'PUT',
      'delete': "DELETE",
      'read': 'GET'
    };
    type = method_map[method];
    params = {
      url: _t(o).url(),
      type: type,
      contentType: 'application/json',
      data: modelJSON,
      dataType: 'json',
      processData: false,
      success: success,
      error: error
    };
    if (_nb.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.processData = true;
      params.data = modelJSON ? {
        model: modelJSON
      } : {};
    }
    if (_nb.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (_nb.emulateJSON) {
          params.data._method = type;
        }
        params.type = 'POST';
        params.beforeSend = function(xhr) {
          return xhr.setRequestHeader("X-HTTP-Method-Override", type);
        };
      }
    }
    return o.ajax(params);
  };
}).call(this);
