makeLikeUnderscore = () ->
  _nb = (o) ->
    _nb.currentObject = o
    return _nb.methods
  _nb.methods = {}
  _nb.mixin = (funcs) ->
    for name, func of funcs
      _nb[name] = func 
      _nb.methods[name] = (args...) -> func(_nb.currentObject, args...)
  return _nb  
_nb = window._nb = makeLikeUnderscore()
_(_nb).extend emulateJSON: true, emulateHTTP: true, currentUniqueId: 0, metaInfo: {}
_nb.mixin
  extend: (model, params) ->
    ret = _.clone model
    _.extend ret, params
    ret.super = model
    ret
  extendModel: (params) -> _nb.extend _nb.Model, params
  extendCollection: (params) -> _nb.extend _nb.Collection, params
  uniqueId: () -> _nb.currentUniqueId +=1
  metaObj: (o, extra) -> #can be array
    o = o or {}
    cid = _nb.uniqueId()
    o.__cid = cid
    metaO = _nb.metaInfo[cid] = record: o
    _.extend metaO, extra
    if metaO.type and metaO.type.initialize then metaO.type.initialize(o)
    o
  metaType: (type, o) -> _nb.metaObj o, {type: type}
  meta: (o) ->
    meta = _nb.metaInfo[o.__cid]
    meta
_m = window._m = (o) -> _nb(o).meta()
_t = window._t = makeLikeUnderscore() #t is for types
_t.addMethods = (methodNames) ->
  mixins = {}
  for name in methodNames
    mixins[name] = (o, args...) -> _m(o).type[name] o, args...
  _t.mixin mixins
_t.addProps = (propNames) -> #static attributes
  mixins = {}
  for name in propNames
    mixins[name] = (o) -> _m(o).type[name]
  _t.mixin mixins
_t.addMethods ["save", "initialize", "append", "render", "add", "remove", "fetch", "getById", "getByCid", "toJSON", "set", "isNew", "appendingEl", "url"]
_t.addProps ["triggers"]
_nb.Model =
  appendingEl: (o) -> return _m(o).el
  #triggers: {"change:id": () -> console.log this.id + "was triggered"}
  initialize: (o, params) ->
    mo = _m(o)
    mo.cid = _nb.uniqueId()  #kind of redundant
    mo.element = "div"
    _t.append o
    _t.render o
  append: (o) ->
    mo = _m(o)
    if not (mo.el) then mo.el = document.createElement mo.element
    if mo.parent then $(_t(mo.parent).appendingEl()).append mo.el else $(document.body).append mo.el
  render: (o) -> #specific rendering
  toJSON: (o) -> return o #this is the beaty of using meta stuff
  ajax: $.ajax
  url: (o) -> "/neckbraces"
  isNew: (o) -> return (o.id or o._id)
  save: (o, options) ->
    method = if _t(o).isNew() then "create" else "update"
    _nb.sync method, this, options.success, options.error
  fetch: (o, options) -> _nb.sync "read", o, options.success, options.error #todo add more hre
  delete: (o, options) -> _nb.sync "delete", o, options.success, options.error
  set: (o, vals) ->
    mo = _m(o)
    tp = mo.type
    for key, val of vals
      old = o[key]
      o[key] = val
      if tp.triggers["change:#{key}"] then tp.triggers["change:#{key}"](o, [old])
    if tp.triggers["chage"] then tp.triggers["change"](o)
  get: (o, val) -> return o[val]
_nb.Collection = _nb.extendModel
  add: (o, adding) ->
    mo = _m(o)
    tp = mo.type
    if not("_byId" of mo) then mo._byId = {}
    if not("_byUid" of mo) then mo._byUid = {}
    #this emulates backbone collections
    o.push adding
    if "id" of adding then mo._byId[adding.id] = adding else if "_id" of adding then mo._byId[adding._id] = adding
    if "cid" of adding then mo._byCid[adding.cid] = adding
    _m(adding).parent = o
    if tp.triggers["add"] then tp.triggers["add"](o)
  remove: (o, model) ->
    mo = _m(o)
    tp = mo.type
    model = mo.getByCid(model) || mo.get(model)
    if not model then return null
    delete mo._byId[model.id]
    delete mo._byCid[model.cid]
    delete model.parent #backbone says model.collection
    o.splice _.indexOf(o, model), 1
    if tp.triggers["remove"] then tp.triggers["remove"](o)
  getById: (o, id) -> _m(o)._byId[id]
  getByCid: (o, cid) -> _m(o)._byCid[cid]
_nb.sync = (method, o, success, error) -> #copied from Backbone.sync
  mo = _m(o)
  if method in ['create', 'update'] then modelJSON = JSON.stringify _t(o).toJSON()
  method_map = {'create' : "POST", 'update' : 'PUT', 'delete' : "DELETE", 'read' : 'GET'}
  type = method_map[method]
  params = {url: _t(o).url(), type: type, contentType: 'application/json', data: modelJSON, dataType: 'json', processData: false, success: success, error: error}
  if _nb.emulateJSON
    params.contentType = 'application/x-www-form-urlencoded'
    params.processData = true
    params.data = if modelJSON then {model: modelJSON} else {}
  if _nb.emulateHTTP
    if type is 'PUT' or type is 'DELETE'
      if _nb.emulateJSON then params.data._method = type
      params.type = 'POST'
      params.beforeSend  = (xhr) -> xhr.setRequestHeader "X-HTTP-Method-Override", type
  o.ajax params