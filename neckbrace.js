(function() {
  var Neckbrace;
  Neckbrace = (window.Neckbrace = {});
  Neckbrace.emulateJSON = true;
  Neckbrace.emulateHTTP = true;
  Neckbrace.id = 0;
  Neckbrace.get_id = function() {
    Neckbrace.id += 1;
    return Neckbrace.id;
  };
  Neckbrace.obj = function(o) {
    var _ref;
    o.__uid = Neckbrace.get_id();
    if (!(typeof (_ref = o.__type) !== "undefined" && _ref !== null)) {
      o.__type = Neckbrace.Type;
    }
    if (o.__type.initialize) {
      o.__type.initialize(o);
    }
    return o;
  };
  Neckbrace.arr = function(a, options) {
    _.extend(a, options);
    return obj(a);
  };
  Neckbrace.Type = {
    name: "DefaultType",
    plural: "DefaultTypes",
    element: "div",
    appendingEl: function(o) {
      return o.__el;
    },
    initialize: function(o) {
      o.__type.append(o);
      return o.__type.render(o);
    },
    append: function(o) {
      o.__el = document.createElement(o.__type.element);
      if (o.__class) {
        $(o.__el).addClass(o.__class);
      }
      return o.__parent ? $(o.__parent.__type.appendingEl(o.__parent)).append(o.__el) : $(document.body).append(o.__el);
    },
    render: function(object) {
      return $(object.__el).attr("data-neckbrace", "true");
    },
    copy: function(props) {
      var ret;
      ret = _.extend(_.clone(this), props);
      ret["super"] = this;
      return ret;
    },
    before_save: function(o) {
      return o;
    },
    ajax: $.ajax,
    get_url: function(o) {
      return ("/" + (this.plural));
    },
    is_new: function(o) {
      if (o.id) {
        return true;
      }
      return false;
    },
    save: function(o, options) {
      var method;
      method = o.__type.is_new(o) ? "create" : "update";
      return o.__type.sync(method, o, options.success, options.error);
    },
    fetch: function(o, options) {
      return this.sync("read", {
        __type: this
      }, options.success, options.error);
    },
    "delete": function(o, options) {
      return o.__type.sync("delete", o, options.success, options.error);
    },
    sync: function(method, o, success, error) {
      var method_map, modelJSON, params, type;
      if (('create' === method || 'update' === method)) {
        modelJSON = JSON.stringify(o.__type.before_save(o));
      }
      method_map = {
        'create': "POST",
        'update': 'PUT',
        'delete': "DELETE",
        'read': 'GET'
      };
      type = method_map[method];
      params = {
        url: this.get_url(o),
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
      return o.__type.ajax(params);
    }
  };
}).call(this);