# instead of __type, __parent. consider.__.type, .__.parent
# or consider using and extra meta object like meta(o).type or meta[o.__uid].type
# or even m(o).save() #with some closure acitons
# but mayby save some.random.ob
# where save = (o) -> o.__type.save o
# done: implement toJSON like backbone.js to get rid of __ properties. called before_save
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
  Neckbrace.obj a
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
    #get rid of all the meta information
    ret = {}
    for key,val of o
      if _.s(key, 0, 2) isnt "__" and typeof val isnt "object"
        ret[key] = val
      else if typeof val is "object" and val.__type?.before_save?
        if _.s(key, 0, 2) isnt "__" and val isnt o
          ret[key] = val.__type.before_save val
    return ret
    #return an object that you want to save
  ajax: $.ajax
  get_url: (o) ->
    return "/#{this.plural}"
  is_new: (o) ->
    if o.id or o._id
      return false
    return true
  save: (o, options) ->
    method = if o.__type.is_new o then "create" else "update"
    o.__type.sync method, o, options.success, options.error
  fetch: (options) ->
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
  set: (o, vals) ->
    for key, val of vals
     o[key] = val
  add: (o, x) ->
    if not("_byId" of o)
      o._byId = {}
    if not("_byUid" of o)
      o._byUid = {}
    #this emulates backbone collections
    o.push x
    if "id" of x
      o._byId[x.id] = x
    else if "_id" of x
      o._byId[x._id] = x
    if "__uid" of x
      o._byUid[x.__uid] = x
  getById: (o, id) ->
    console.log o, id
    o._byId[id]
  getByUid: (o, uid) ->
    o._byUid[uid]
