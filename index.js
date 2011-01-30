(function() {
  var Arr, _m, _p;
  var __slice = Array.prototype.slice;
  _.mixin({
    s: function(val, start, end) {
      var need_to_join, ret;
      need_to_join = false;
      ret = [];
      if (_.isString(val)) {
        val = val.split("");
        need_to_join = true;
      }
      if (start >= 0) {} else {
        start = val.length + start;
      }
      if (end === null) {
        ret = val.slice(start);
      } else {
        if (end < 0) {
          end = val.length + end;
        } else {
          end = end + start;
        }
        ret = val.slice(start, end);
      }
      if (need_to_join) {
        return ret.join("");
      } else {
        return ret;
      }
    },
    startsWith: function(str, with_what) {
      return _.s(str, 0, with_what.lenght === with_what);
    },
    rnd: function(low, high) {
      return Math.floor(Math.random() * (high - low + 1)) + low;
    },
    time: function() {
      return (new Date()).getTime();
    },
    replaceBetween: function(str, start, between, end) {
      var endpos, pos;
      pos = str.indexOf(start);
      if (pos === -1) {
        return str;
      }
      endpos = str.indexOf(end, pos + start.length);
      if (endpos === -1) {
        return str;
      }
      return _.s(str, 0, pos + start.length) + between + _.s(str, endpos);
    }
  });
  _.mixin({
    do_these: function(to_dos, callback) {
      var make_jobs_done, return_values;
      return_values = _.isArray(to_dos) ? [] : {};
      make_jobs_done = function(id) {
        return function(ret) {
          var all_done;
          return_values[id] = ret;
          all_done = true;
          _.each(to_dos, function(func, id) {
            if (!(id in return_values)) {
              all_done = false;
              return _.breakLoop();
            }
          });
          if (all_done === true) {
            return callback(return_values);
          }
        };
      };
      return _.each(to_dos, function(to_do, id) {
        var jobs_done;
        jobs_done = make_jobs_done(id);
        return to_do(jobs_done);
      });
    }
  });
  _.mixin({
    makeLikeUnderscore: function() {
      var like_;
      like_ = function(o) {
        like_.currentObject = o;
        return like_.methods;
      };
      like_.methods = {
        chain: function() {
          like_.chained = true;
          return like_.methods;
        },
        value: function() {
          like_.chained = false;
          return like_.currentObject;
        }
      };
      like_.mixin = function(funcs) {
        var func, name, _results;
        _results = [];
        for (name in funcs) {
          func = funcs[name];
          like_[name] = func;
          _results.push(like_.methods[name] = function() {
            var args, ret;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            ret = func.apply(null, [like_.currentObject].concat(__slice.call(args)));
            if (like_.chained) {
              like_.currentObject = ret;
              return like_.methods;
            } else {
              return ret;
            }
          });
        }
        return _results;
      };
      return like_;
    }
  });
  window._p = _p = _.makeLikeUnderscore();
  _p.metaInfo = {};
  _p.mixin({
    "class": function(obj) {
      var funcs, key, props, val;
      funcs = [];
      props = [];
      for (key in obj) {
        val = obj[key];
        if (key in _p) {
          continue;
        }
        if (_.isFunction(val)) {
          funcs.push(key);
        } else {
          props.push(key);
        }
      }
      _p.addMethods(funcs);
      _p.addProps(props);
      return obj;
    },
    "new": function(type, o, extra) {
      var cid, metaO;
      extra = extra || {};
      if (type) {
        extra.type = type;
      }
      o = o || {};
      cid = _.uniqueId();
      o.__cid = cid;
      metaO = _p.metaInfo[cid] = {
        record: o
      };
      _.extend(metaO, extra);
      if (metaO.type && metaO.type.initialize) {
        metaO.type.initialize(o);
      }
      return o;
    },
    reverseMeta: function(cid) {
      return _nb.metaInfo[cid].record;
    },
    meta: function(o) {
      return _p.metaInfo[o.__cid];
    }
  });
  _p.addMethods = function(methodNames) {
    var mixins, name, _fn, _i, _len;
    mixins = {};
    _fn = function(name) {
      return mixins[name] = function() {
        var args, o, _ref;
        o = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return (_ref = _p.meta(o).type)[name].apply(_ref, [o].concat(__slice.call(args)));
      };
    };
    for (_i = 0, _len = methodNames.length; _i < _len; _i++) {
      name = methodNames[_i];
      _fn(name);
    }
    return _p.mixin(mixins);
  };
  _p.addProps = function(propNames) {
    var mixins, name, _i, _len;
    mixins = {};
    for (_i = 0, _len = propNames.length; _i < _len; _i++) {
      name = propNames[_i];
      mixins[name] = function(o) {
        return _p.meta(o).type[name];
      };
    }
    return _p.mixin(mixins);
  };
  window._m = _m = _p.meta;
  _p.Collection = _p["class"]({
    name: "Collection",
    get: function(o, id, whichId) {
      if (whichId == null) {
        whichId = "__cid";
      }
      return _p.getById;
    }
  });
  Arr = window.Arr = _p["class"]({
    initialize: function(o) {
      return _m(o)._byCid = {};
    },
    add: function(o, item) {
      o.push(item);
      return _m(o)._byCid[item.__cid] = item;
    },
    remove: function(o, item) {
      var key, member, _len, _results;
      if (!(item.__cid in o._byCid)) {
        return false;
      }
      _results = [];
      for (key = 0, _len = o.length; key < _len; key++) {
        member = o[key];
        _results.push(member.__cid === item.__cid ? o.splice(key, 1) : void 0);
      }
      return _results;
    }
  });
}).call(this);
