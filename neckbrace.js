(function() {
  var Neckbrace, methods;
  var __hasProp = Object.prototype.hasOwnProperty;
  Neckbrace = (window.Neckbrace = {});
  Neckbrace.emulateJSON = true;
  Neckbrace.emulateHTTP = true;
  Neckbrace.id = 0;
  Neckbrace.get_id = function() {
    Neckbrace.id += 1;
    return Neckbrace.id;
  };
  Neckbrace.Type = function(params) {
    _.extend(this.attributes, params);
    this.initialize(params);
    return this;
  };
  Neckbrace.Type.prototype.name = "DefaultType";
  Neckbrace.Type.prototype.plural = "DefaultTypes";
  Neckbrace.Type.prototype.element = "div";
  Neckbrace.Type.prototype.attributes = {};
  Neckbrace.Type.prototype.collection = [];
  Neckbrace.Type.prototype.appendingEl = function() {
    return this.el;
  };
  Neckbrace.Type.prototype.triggers = {
    "add": function() {},
    "change": function() {},
    "change:id": function() {
      return console.log(this.id + "was triggered");
    }
  };
  Neckbrace.Type.prototype.initialize = function(params) {
    this.cid = Neckbrace.get_id();
    this.append();
    return this.render();
  };
  Neckbrace.Type.prototype.append = function() {
    this.el = document.createElement(this.element);
    return this.parent ? $(this.parent.appendingEl()).append(this.el) : $(document.body).append(this.el);
  };
  Neckbrace.Type.prototype.render = function() {
    return $(this.el).attr("data-neckbrace", "true");
  };
  Neckbrace.Type.prototype.toJSON = function() {
    if (this.collection.length > 0) {
      return reutrn(this.collection);
    } else {
      return this.attributes;
    }
  };
  Neckbrace.Type.prototype.ajax = $.ajax;
  Neckbrace.Type.prototype.get_url = function() {
    return ("/" + (this.plural));
  };
  Neckbrace.Type.prototype.is_new = function() {
    if (this.attributes.id || this.attributes._id) {
      return false;
    }
    return true;
  };
  Neckbrace.Type.prototype.save = function(options) {
    var method;
    method = this.is_new() ? "create" : "update";
    return Neckbrace.sync(method, this, options.success, options.error);
  };
  Neckbrace.Type.prototype.fetch = function(options) {
    return Neckbrace.sync("read", this, options.success, options.error);
  };
  Neckbrace.Type.prototype["delete"] = function(options) {
    return Neckbrace.sync("delete", this, options.success, options.error);
  };
  Neckbrace.Type.prototype.set = function(vals) {
    var _ref, key, old, val;
    _ref = vals;
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      val = _ref[key];
      old = this.attributes[key];
      this.attributes[key] = val;
      if (this.triggers[("change:" + (val))]) {
        this.triggers[("change:" + (val))](old);
      }
    }
    return this.triggers["chage"] ? this.triggers["change"]() : null;
  };
  Neckbrace.Type.prototype.get = function(val) {
    return this.attributes[val];
  };
  Neckbrace.Type.prototype.add = function(x) {
    if (!("_byId" in this)) {
      this._byId = {};
    }
    if (!("_byUid" in this)) {
      this._byUid = {};
    }
    this.collection.push(x);
    if ("id" in x.attributes) {
      this._byId[x.attributes.id] = x;
    } else if ("_id" in x.attributes) {
      this._byId[x.attributes._id] = x;
    }
    if ("cid" in x) {
      this._byCid[x.cid] = x;
    }
    x.parent = this;
    return this.triggers["add"] ? this.triggers["add"]() : null;
  };
  Neckbrace.Type.prototype.remove = function(model) {
    model = this.getByCid(model) || this.get(Model);
    if (!model) {
      return null;
    }
    delete this._byId[model.attributes.id];
    delete this._byCid[model.cid];
    delete model.parent;
    this.collection.splice(this.indexOf(model), 1);
    return this.triggers["remove"] ? this.triggers["remove"]() : null;
  };
  Neckbrace.Type.prototype.getById = function(id) {
    return this._byId[id];
  };
  Neckbrace.Type.prototype.getByCid = function(cid) {
    return this._byCid[cid];
  };
  methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size', 'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty'];
  _.each(methods, function(method) {
    return (Neckbrace.Type.prototype[method] = function() {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    });
  });
  Neckbrace.sync = function(method, o, success, error) {
    var method_map, modelJSON, params, type;
    if (('create' === method || 'update' === method)) {
      modelJSON = JSON.stringify(o.toJSON());
    }
    method_map = {
      'create': "POST",
      'update': 'PUT',
      'delete': "DELETE",
      'read': 'GET'
    };
    type = method_map[method];
    params = {
      url: o.get_url(),
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
