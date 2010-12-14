(function() {
  var Neckbrace;
  Neckbrace = window.Neckbrace = {};
  Neckbrace.emulateJSON = true;
  Neckbrace.emulateHTTP = true;
  Neckbrace.id = 0;
  Neckbrace.get_id = function() {
    Neckbrace.id += 1;
    return Neckbrace.id;
  };
  NeckBrace.Type = function() {
    Type.prototype.name = "DefaultType";
    Type.prototype.plural = "DefaultTypes";
    Type.prototype.element = "div";
    Type.prototype.attributes = {};
    Type.prototype.collection = [];
    Type.prototype.appendingEl = function() {
      return this.el;
    };
    function Type(params) {
      _.extend(this.attributes, params);
      this.initialize(params);
    }
    Type.prototype.initialize = function(params) {
      this.append;
      return this.render;
    };
    Type.prototype.append = function() {
      this.el = document.createElement(this.element);
      if (this["class"]) {
        $(this.el).addClass(this["class"]);
      }
      if (this.parent) {
        return $(this.parent.appendingEl(this.parent)).append(this.el);
      } else {
        return $(document.body).append(this.el);
      }
    };
    Type.prototype.render = function() {
      return $(this.el).attr("data-neckbrace", "true");
    };
    Type.prototype.before_save = function() {
      var key, ret, val, _ref;
      ret = {};
      _ref = this.attributes;
      for (key in _ref) {
        val = _ref[key];
        if (_.s(key, 0, 2) !== "__" && typeof val !== "object") {
          ret[key] = val;
        } else if (typeof val === "object" && (val.before_save != null)) {
          if (_.s(key, 0, 2) !== "__" && val !== this) {
            ret[key] = this.before_save();
          }
        }
      }
      return ret;
    };
    Type.prototype.ajax = $.ajax;
    Type.prototype.get_url = function() {
      return "/" + this.plural;
    };
    Type.prototype.is_new = function() {
      if (this.attributes.id || this.attributes._id) {
        return false;
      }
      return true;
    };
    Type.prototype.save = function(options) {
      var method;
      method = this.is_new() ? "create" : "update";
      return Neckbrace.sync(method, this, options.success, options.error);
    };
    Type.prototype.fetch = function(options) {
      return Neckbrace.sync("read", this, options.success, options.error);
    };
    Type.prototype["delete"] = function(options) {
      return Neckbrace.sync("delete", this, options.success, options.error);
    };
    Type.prototype.set = function(vals) {
      var key, val, _results;
      _results = [];
      for (key in vals) {
        val = vals[key];
        _results.push(this.attributes[key] = val);
      }
      return _results;
    };
    Type.prototype.add = function(x) {
      if (!("_byId" in this)) {
        this._byId = {};
      }
      if (!("_byUid" in this)) {
        this._byUid = {};
      }
      this.collection.push(x);
      if ("id" in x) {
        this._byId[x.id] = x;
      } else if ("_id" in x) {
        this._byId[x._id] = x;
      }
      if ("__uid" in x) {
        return this._byUid[x.__uid] = x;
      }
    };
    Type.prototype.getById = function(id) {
      return this._byId[id];
    };
    Type.prototype.getByUid = function(uid) {
      return this._byUid[uid];
    };
    return Type;
  }();
  Neckbrace.sync = function(method, o, success, error) {
    var method_map, modelJSON, params, type;
    if (method === 'create' || method === 'update') {
      modelJSON = JSON.stringify(o.before_save());
    }
    method_map = {
      'create': "POST",
      'update': 'PUT',
      'delete': "DELETE",
      'read': 'GET'
    };
    type = method_map[method];
    params = {
      url: o.get_url,
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
