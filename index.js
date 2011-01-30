(function() {
  var library, makeLikeUnderscore, _e, _m, _p;
  var __slice = Array.prototype.slice;
  makeLikeUnderscore = function() {
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
        _results.push((function(name, func) {
          like_[name] = func;
          return like_.methods[name] = function() {
            var args, ret;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            ret = func.apply(null, [like_.currentObject].concat(__slice.call(args)));
            if (like_.chained) {
              like_.currentObject = ret;
              return like_.methods;
            } else {
              return ret;
            }
          };
        })(name, func));
      }
      return _results;
    };
    return like_;
  };
  _e = window._e = makeLikeUnderscore();
  _e.mixin({
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
      return _e.s(str, 0, with_what.lenght === with_what);
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
      return _e.s(str, 0, pos + start.length) + between + _e.s(str, endpos);
    }
  });
  _e.mixin({
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
  _e.mixin({
    makeLikeUnderscore: makeLikeUnderscore
  });
  _p = _e._p = window._p = makeLikeUnderscore();
  _e._p = _p;
  _e.metaInfo = {};
  _e.mixin({
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
      _e.addPolymorphicMethods(funcs);
      _e.addPolymorphicProps(props);
      return obj;
    },
    "new": function(type, o, extra) {
      var metaO;
      extra = extra || {};
      if (type) {
        extra.type = type;
      }
      o = o || {};
      metaO = _e.meta(o);
      _.extend(metaO, extra);
      if (metaO.type && metaO.type.initialize) {
        metaO.type.initialize(o);
      }
      return o;
    },
    reverseMeta: function(cid) {
      return _e.metaInfo[cid].record;
    },
    meta: function(o) {
      var cid, metaO;
      metaO = _p.metaInfo[o.__cid];
      if (metaO) {
        return metaO;
      }
      cid = _.uniqueId();
      o.__cid = cid;
      return _e.metaInfo[cid] = {
        record: o
      };
    }
  });
  _e.addPolymorphicMethods = function(methodNames) {
    var mixins, name, _fn, _i, _len;
    mixins = {};
    _fn = function(name) {
      return mixins[name] = function() {
        var args, o, _ref;
        o = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return (_ref = _e.meta(o).type)[name].apply(_ref, [o].concat(__slice.call(args)));
      };
    };
    for (_i = 0, _len = methodNames.length; _i < _len; _i++) {
      name = methodNames[_i];
      _fn(name);
    }
    return _p.mixin(mixins);
  };
  _e.addPolymorphicProps = function(propNames) {
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
  window._m = _m = _e.meta;
  _e.mixin({
    bind: function(o, event, callback) {
      var calls, list, mo;
      mo = _m(o);
      calls = mo._callbacks || (mo._callbacks = {});
      list = mo._callbacks[event] || (mo._callbacks[event] = []);
      return list.push(callback);
    },
    unbind: function(o, event, callback) {
      var calls, func, index, list, mo, _len;
      mo = _m(o);
      if (!event) {
        mo._callbacks = {};
      } else if ((calls = mo._callbacks)) {
        if (!callback) {
          calls[event] = [];
        } else {
          list = calls[ev];
          if (!list) {
            return o;
          }
          for (index = 0, _len = list.length; index < _len; index++) {
            func = list[index];
            if (callback === func) {
              list.splice(index, 1);
              break;
            }
          }
        }
      }
      return o;
    },
    trigger: function() {
      var allList, calls, event, func, index, list, mo, o, restOfArgs, _len, _len2, _results;
      o = arguments[0], event = arguments[1], restOfArgs = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      mo = _m(o);
      calls = mo._callbacks;
      if (!calls) {
        return o;
      }
      list = calls[event];
      if (list) {
        for (index = 0, _len = list.length; index < _len; index++) {
          func = list[index];
          func.apply(null, [o].concat(__slice.call(restOfArgs)));
        }
      }
      allList = calls["all"];
      if (allList) {
        _results = [];
        for (index = 0, _len2 = allList.length; index < _len2; index++) {
          func = allList[index];
          _results.push(func.apply(null, [o, event].concat(__slice.call(restOfArgs))));
        }
        return _results;
      }
    },
    initialize: function(o) {
      return _m(o)._byCid = {};
    },
    add: function(o, item) {
      var mo;
      o.push(item);
      mo = _m(o);
      if (!mo._byCid) {
        mo._byCid = {};
      }
      mo._byCid[item.__cid] = item;
      _e(o).trigger("add", item, o);
      return o;
    },
    remove: function(o, item) {
      var key, member, mo, _len, _results;
      mo = _m(o);
      if (!mo._byCid) {
        return;
      }
      if (!(item.__cid in mo._byCid)) {
        return false;
      }
      _results = [];
      for (key = 0, _len = o.length; key < _len; key++) {
        member = o[key];
        _results.push(member.__cid === item.__cid ? (o.splice(key, 1), _e(o).trigger("remove", item, o)) : void 0);
      }
      return _results;
    }
  });
  library = jQuery || Zepto;
  (function(library) {
    var $;
    $ = library;
    return $.fn.dragsimple = function(options) {
      var el;
      el = this;
      console.log(el);
      $(el).bind("mousedown", function(e) {
        var mousemove, mouseup, obj, parent_offset_left, parent_offset_top, start_offset_left, start_offset_top;
        obj = this;
        e.preventDefault();
        parent_offset_left = $(obj).parent().offset().left;
        parent_offset_top = $(obj).parent().offset().top;
        start_offset_left = e.pageX - $(obj).offset().left;
        start_offset_top = e.pageY - $(obj).offset().top;
        if (_.isFunction(options.start)) {
          options.start(obj);
        }
        mousemove = function(e) {
          var new_left, new_top;
          new_left = e.pageX - parent_offset_left - start_offset_left;
          new_top = e.pageY - parent_offset_top - start_offset_top;
          if (_.isFunction(options.xFilter)) {
            new_left = options.xFilter(x, obj);
          }
          if (_.isFunction(options.yFilter)) {
            new_top = options.yFilter(obj);
          }
          $(obj).css("left", new_left + "px");
          $(obj).css("top", new_top + "px");
          if (_.isFunction(options.drag)) {
            return options.drag(obj);
          }
        };
        mouseup = function(e) {
          $(document.body).unbind("mousemove", mousemove);
          if (_.isFunction(options.stop)) {
            return options.stop(obj);
          }
        };
        $(document.body).bind("mousemove", mousemove);
        return $(document.body).bind("mouseup", mouseup);
      });
      return el;
    };
  })(library);
}).call(this);
