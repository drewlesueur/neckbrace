(function() {
  var Neckbrace, methods;
  Neckbrace = window.Neckbrace = {};
  Neckbrace.emulateJSON = true;
  Neckbrace.emulateHTTP = true;
  Neckbrace.id = 0;
  Neckbrace.get_id = function() {
    Neckbrace.id += 1;
    return Neckbrace.id;
  };
  Neckbrace.Model = function() {
    Model.prototype.element = "div";
    Model.prototype.attributes = {};
    Model.prototype.collection = [];
    Model.prototype.appendingEl = function() {
      return this.el;
    };
    function Model(params, options) {
      _.extend(this.attributes, params);
      if (options && "parent" in options) {
        this.parent = options.parent;
      }
      this.initialize(params);
    }
    Model.prototype.triggers = {
      "change:id": function() {
        return console.log(this.id + "was triggered");
      }
    };
    Model.prototype.initialize = function(params) {
      this.cid = Neckbrace.get_id();
      this.append();
      return this.render();
    };
    Model.prototype.append = function() {
      this.el = document.createElement(this.element);
      if (this.parent) {
        return $(this.parent.appendingEl()).append(this.el);
      } else {
        return $(document.body).append(this.el);
      }
    };
    Model.prototype.render = function() {
      return $(this.el).attr("data-neckbrace", "true");
    };
    Model.prototype.toJSON = function() {
      var key, ret, val, _ref;
      if (this.collection.length > 0) {
        return this.map(function(model) {
          return model.toJSON();
        });
      } else {
        ret = {};
        _ref = this.attributes;
        for (key in _ref) {
          val = _ref[key];
          if (typeof val !== "object") {
            ret[key] = val;
          } else if (typeof val === "object" && val.toJSON) {
            if (val !== this) {
              ret[key] = val.toJSON();
            }
          }
        }
        return ret;
      }
    };
    Model.prototype.ajax = $.ajax;
    Model.prototype.url = function() {
      return "/neckbraces";
    };
    Model.prototype.isNew = function() {
      if (this.attributes.id || this.attributes._id) {
        return false;
      }
      return true;
    };
    Model.prototype.save = function(options) {
      var method;
      method = this.isNew() ? "create" : "update";
      return Neckbrace.sync(method, this, options.success, options.error);
    };
    Model.prototype.fetch = function(options) {
      return Neckbrace.sync("read", this, options.success, options.error);
    };
    Model.prototype["delete"] = function(options) {
      return Neckbrace.sync("delete", this, options.success, options.error);
    };
    Model.prototype.set = function(vals) {
      var key, old, val;
      for (key in vals) {
        val = vals[key];
        old = this.attributes[key];
        this.attributes[key] = val;
        if (this.triggers["change:" + key]) {
          this.triggers["change:" + key].apply(this, [old]);
        }
      }
      if (this.triggers["chage"]) {
        return this.triggers["change"].apply(this);
      }
    };
    Model.prototype.get = function(val) {
      return this.attributes[val];
    };
    Model.prototype.add = function(x) {
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
      if (this.triggers["add"]) {
        return this.triggers["add"].apply(this);
      }
    };
    Model.prototype.remove = function(model) {
      model = this.getByCid(model) || this.get(Model);
      if (!model) {
        return null;
      }
      delete this._byId[model.attributes.id];
      delete this._byCid[model.cid];
      delete model.parent;
      this.collection.splice(this.indexOf(model), 1);
      if (this.triggers["remove"]) {
        return this.triggers["remove"].apply(this);
      }
    };
    Model.prototype.getById = function(id) {
      return this._byId[id];
    };
    Model.prototype.getByCid = function(cid) {
      return this._byCid[cid];
    };
    return Model;
  }();
  methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect', 'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include', 'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size', 'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty'];
  _.each(methods, function(method) {
    return Neckbrace.Model.prototype[method] = function() {
      return _[method].apply(_, [this.models].concat(_.toArray(arguments)));
    };
  });
  Neckbrace.sync = function(method, o, success, error) {
    var method_map, modelJSON, params, type;
    if (method === 'create' || method === 'update') {
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
      url: _.isFunction(o.url) ? o.url() : o.url,
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
