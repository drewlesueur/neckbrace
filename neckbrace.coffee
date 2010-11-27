# instead of __type, __parent. consider.__.type, .__.parent
# or consider using and extra meta object like meta(o).type or meta[o.__uid].type

Neckbrace = window.Neckbrace = {}
Neckbrace.emulateJSON = true
Neckbrace.emulateHTTP = true
Neckbrace.id = 0
Neckbrace.get_id = () ->
  Neckbrace.id += 1
  return Neckbrace.id
Neckbrace.obj = (o) ->
  o.__uid = Neckbrace.get_id()
  if not o.__type?
    o.__type = Neckbrace.Type
  if o.__type.initialize
    o.__type.initialize o
  return o
Neckbrace.arr = (a, options) ->
  _.extend a, options
  obj a
Neckbrace.Type = 
  name: "DefaultType"
  plural: "DefaultTypes"
  element: "div"
  appendingEl: (o) ->
    return o.__el
  initialize: (o) ->
    o.__type.append o
    o.__type.render o
  append: (o) ->
    o.__el = document.createElement o.__type.element
    if o.__class
      $(o.__el).addClass o.__class
    if o.__parent
      $(o.__parent.__type.appendingEl o.__parent).append o.__el
    else
      $(document.body).append o.__el
  render: (object) ->
    $(object.__el).attr "data-neckbrace", "true"
  copy: (props) ->
    ret = _.extend _.clone(this), props
    ret.super = this
    return ret
  before_save: (o) ->
    return o
    #return an object that you want to save
  ajax: $.ajax
  get_url: (o) ->
    return "/#{this.plural}"
  is_new: (o) ->
    if o.id
      return true
    return false
  save: (o, options) ->
    method = if o.__type.is_new o then "create" else "update"
    o.__type.sync method, o, options.success, options.error
  fetch: (o, options) ->
    #todo: add more options
    this.sync "read", {__type: this}, options.success, options.error
  delete: (o, options) ->
    o.__type.sync "delete", o, options.success, options.error
  sync: (method, o, success, error) -> #copied from Backbone.sync
    if method in ['create', 'update']
      modelJSON = JSON.stringify o.__type.before_save o #could have said this.before_save o
    method_map =
      'create' : "POST"
      'update' : 'PUT'
      'delete' : "DELETE"
      'read' : 'GET'
    type = method_map[method]
    params =
      url: this.get_url o
      type: type
      contentType: 'application/json'
      data: modelJSON
      dataType: 'json'
      processData: false
      success: success
      error: error
    if Neckbrace.emulateJSON
      params.contentType = 'application/x-www-form-urlencoded'
      params.processData = true
      params.data = if modelJSON then {model: modelJSON} else {}
    if Neckbrace.emulateHTTP
      if type is 'PUT' or type is 'DELETE'
        if Neckbrace.emulateJSON then params.data._method = type
        params.type = 'POST'
        params.beforeSend  = (xhr) ->
          xhr.setRequestHeader "X-HTTP-Method-Override", type
    o.__type.ajax params 

