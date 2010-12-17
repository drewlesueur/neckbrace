# people.phones[0].extension
# peopele.get("phones").get(1).get("extension")
# people.attributes.phones.collection[0].extension
#listing._.save()
Neckbrace = window.Neckbrace = {};
Neckbrace.emulateJSON = true
Neckbrace.emulateHTTP = true
#later instead of doing this on underscore, do it on another object
makeLikeUnderscore = () ->
  _u = (o) ->
    _u.currentObject = o
    return _u.methods
  _u.methods = {}
  _u.mixin = (funcs) ->
    for name, func of funcs
      _u[name] = func 
      _u.methods[name] = (args...) ->
        func(_u.currentObject, args...)
  return _u
_u = window._u = makeLikeUnderscore()
_u.currentUniqueId = 0
_u.metaInfo = {}
_u.mixin
  uniqueId: () ->
    _u.currentUniqueId +=1
  metaObj: (o, extra) -> #can be array
    cid = _u.uniqueId()
    o.__cid = cid
    metaO = _u.metaInfo[cid] = 
      record: o
    _.extend metaO, extra
    if metaO.type and metaO.type.initialize
      _u(o).initialize()
    o
  metaType: (type, o) ->
    _u.metaObj o, {type: type}
  meta: (o) ->
    meta = _u.metaInfo[o.__cid]
    return meta
  save: (o, args...) ->
    _u.meta(o).type.save o, args...
_m = window._m = (o) -> _u(o).meta()

#t is for types
_t = window._t = makeLikeUnderscore()
_t.addMethods = (methodNames) ->
  mixins = {}
  for name in methodNames
    mixins[name] = (o, args...) ->
      _m(o).type[name] o, args...
  _t.mixin mixins  
_t.addMethods ["save", "initialize", "append", "render", "add", "remove", "fetch"
"getById", "getByCid", "toJSON", "set", "isNew", "appendingEl", "url"]
#metaMethods = ["save", "initialize", "append", "render", "add", "remove", "fetch"
#"getById", "getByCid", "toJSON", "set", "isNew", "appendingEl", "url"]
#mixins = {}
#for method in metaMethods
#  mixins[method] = (o, args...) ->
#    _.meta(o).type[method] o, args...
#_.mixin mixins
#_t = (o) -> _m(o).type......
Neckbrace.Model =
  appendingEl: (o) ->
    return _m(o).el
  #triggers:
  #    "change:id": () -> #"add", "change", "remove"
  #      console.log this.id + "was triggered"
  initialize: (o, params) ->
    _(o).meta "cid" : _.uniqueId()  #kind of redundant
    _m(o).element = "div"
    _.append o
    _.render o
  append: (o) ->
    if not (_m(o).el) then _m(o).el = document.createElement _u(o).meta.element
    if _m(o).parent
      appendingEl = _.appendingEl _m(o).parent
      $(appendingEl).append _m(o).el
    else
      $(document.body).append _m(o).el
  render: (o) ->
    $(_m(o).el).attr "data-neckbrace", "true"
    #$(_m(o).el).bind("click", () -> )
  toJSON: (o) -> #todo: make sure nesting works
    return o
  ajax: $.ajax
  url: (o) -> "/neckbraces"
  isNew: (o) ->
    if o.id or o._id #also this.id or this._id
      return false
    return true
  save: (o, options) ->
    method = if _t(o).isNew() then "create" else "update"
    Neckbrace.sync method, this, options.success, options.error
  fetch: (o, options) ->
    #todo: add more options, fetch single or fetch many
    Neckbrace.sync "read", o, options.success, options.error
  delete: (o, options) ->
    Neckbrace.sync "delete", o, options.success, options.error
  set: (o, vals) ->
    mo = _m(o)
    for key, val of vals
      old = o[key]
      o[key] = val
      if _m(o).triggers["change:#{key}"]
       mo.triggers["change:#{key}"].apply(o, [old])
    if mo.triggers["chage"]
      mo.triggers["change"].apply(o)
  get: (o, val) ->
    return o[val]
Neckbrace.Collection = _.clone Neckbrace.Model
_.extend Neckbrace.Collection,
  add: (o, adding) ->
    mo = _m(o)
    if not("_byId" of mo)
      mo._byId = {}
    if not("_byUid" of mo)
      mo._byUid = {}
    #this emulates backbone collections
    o.push adding
    if "id" of adding
      mo._byId[adding.id] = adding
    else if "_id" of adding
      mo._byId[adding._id] = adding
    if "cid" of adding
      mo._byCid[adding.cid] = adding
    _m(adding).parent = o
    if mo.triggers["add"]
      mo.triggers["add"].apply(o)
  remove: (model) ->
    _mo = _m(o)
    model = mo.getByCid(model) || mo.get(model)
    if not model then return null
    delete mo._byId[model.id]
    delete mo._byCid[model.cid]
    delete model.parent #backbone says model.collection
    o.splice _.indexOf(o, model), 1
    if mo.triggers["remove"]
      mo.triggers["remove"].apply(this)
  getById: (o, id) ->
    _m(o)._byId[id]
  getByCid: (o, cid) ->
    _m(o)._byCid[cid]
#giving neckbrace.type the underscore methods

Neckbrace.sync = (method, o, success, error) -> #copied from Backbone.sync
  mo = _m(o)
  if method in ['create', 'update']
    modelJSON = JSON.stringify _t(o).toJSON()
  method_map =
    'create' : "POST"
    'update' : 'PUT'
    'delete' : "DELETE"
    'read' : 'GET'
  type = method_map[method]
  params =
    url: _t(o).url()
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
  o.ajax params