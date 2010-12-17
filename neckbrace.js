(function() {
  var Neckbrace, makeLikeUnderscore, _m, _t, _u;
  var __slice = Array.prototype.slice;
  Neckbrace = window.Neckbrace = {};
  Neckbrace.emulateJSON = true;
  Neckbrace.emulateHTTP = true;
  makeLikeUnderscore = function() {
    var _u;
    _u = function(o) {
      _u.currentObject = o;
      return _u.methods;
    };
    _u.mixin = function(funcs) {
      var _fn, _results;
      _fn = function(name, func) {
        _u[name] = func;
        return _results.push(_u.methods = function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return func.apply(null, [_u.currentObject].concat(__slice.call(args)));
        });
      };
      _results = [];
      for (name in funcs) {
        func = funcs[name];
        _fn(name, func);
      }
      return _results;
    };
    return _u;
  };
  _u = window._u = makeLikeUnderscore();
  _u.currentUniqueId = 0;
  _u.metaInfo = {};
  _u.mixin({
    uniqueId: function() {
      return _u.currentUniqueId += 1;
    },
    metaObj: function(o, extra) {
      var cid, metaO;
      cid = _u.uniqueId();
      o.__cid = cid;
      metaO = _u.metaInfo[cid] = {
        record: o
      };
      _.extend(metaO, extra);
      if (metaO.type && metaO.type.initialize) {
        return _u(o).initialize();
      }
    },
    metaType: function(type, o) {
      return _u.metaObj(o, {
        type: type
      });
    },
    meta: function(o) {
      var meta;
      meta = _u.metaInfo[o.__cid];
      return meta;
    },
    save: function() {
      var args, o;
      o = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return (_ref = _u.meta(o).type).save.apply(_ref, [o].concat(__slice.call(args)));
    }
  });
  _m = window._m = function(o) {
    return _m(o).meta();
  };
  _t = window._t = makeLikeUnderscore();
  _t.addMethods = function(methodNames) {
    var mixins, _fn, _i, _len, _results;
    mixins = {};
    _fn = function(name) {
      return _results.push(mixins[name] = function() {
        var args, o;
        o = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return (_ref = _m(o).type)[name].apply(_ref, [o].concat(__slice.call(args)));
      });
    };
    _results = [];
    for (_i = 0, _len = methodNames.length; _i < _len; _i++) {
      name = methodNames[_i];
      _fn(name);
    }
    return _results;
  };
  _t.addMethods(["save", "initialize", "append", "render", "add", "remove", "fetch", "getById", "getByCid", "toJSON", "set", "isNew", "appendingEl", "url"]);
  Neckbrace.Model = {
    appendingEl: function(o) {
      return _m(o).el;
    },
    initialize: function(o, params) {
      _(o).meta({
        "cid": _.uniqueId()
      });
      _m(o).element = "div";
      _.append(o);
      return _.render(o);
    },
    append: function(o) {
      var appendingEl;
      if (!(_m(o).el)) {
        _m(o).el = document.createElement(_u(o).meta.element);
      }
      if (_m(o).parent) {
        appendingEl = _.appendingEl(_m(o).parent);
        return $(appendingEl).append(_m(o).el);
      } else {
        return $(document.body).append(_m(o).el);
      }
    },
    render: function(o) {
      return $(_m(o).el).attr("data-neckbrace", "true");
    },
    toJSON: function(o) {
      return o;
    },
    ajax: $.ajax,
    url: function(o) {
      return "/neckbraces";
    },
    isNew: function(o) {
      if (o.id || o._id) {
        return false;
      }
      return true;
    },
    save: function(o, options) {
      var method;
      method = _t(o).isNew() ? "create" : "update";
      return Neckbrace.sync(method, this, options.success, options.error);
    },
    fetch: function(o, options) {
      return Neckbrace.sync("read", o, options.success, options.error);
    },
    "delete": function(o, options) {
      return Neckbrace.sync("delete", o, options.success, options.error);
    },
    set: function(o, vals) {
      var key, mo, old, val;
      mo = _m(o);
      for (key in vals) {
        val = vals[key];
        old = o[key];
        o[key] = val;
        if (_m(o).triggers["change:" + key]) {
          mo.triggers["change:" + key].apply(o, [old]);
        }
      }
      if (mo.triggers["chage"]) {
        return mo.triggers["change"].apply(o);
      }
    },
    get: function(o, val) {
      return o[val];
    }
  };
  Neckbrace.Collection = _.clone(Neckbrace.Model);
  _.extend(Neckbrace.Collection, {
    add: function(o, adding) {
      var mo;
      mo = _m(o);
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
      if (mo.triggers["add"]) {
        return mo.triggers["add"].apply(o);
      }
    },
    remove: function(model) {
      var _mo;
      _mo = _m(o);
      model = mo.getByCid(model) || mo.get(model);
      if (!model) {
        return null;
      }
      delete mo._byId[model.id];
      delete mo._byCid[model.cid];
      delete model.parent;
      o.splice(_.indexOf(o, model), 1);
      if (mo.triggers["remove"]) {
        return mo.triggers["remove"].apply(this);
      }
    },
    getById: function(o, id) {
      return _m(o)._byId[id];
    },
    getByCid: function(o, cid) {
      return _m(o)._byCid[cid];
    }
  });
  Neckbrace.sync = function(method, o, success, error) {
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
    if (Neckbrace.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.processData = true;
      params.data = modelJSON ? {
        model: modelJSON
      } : {};
    }
    if (Neckbrace.emulateHTTP) {
      if (type === 'PUT' || type === 'DELETE') {
        if (Neckbrace.emulateJSON) {
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
