#I combine Model and Collection
# maybe I will split them up
Neckbrace = window.Neckbrace = {};
Neckbrace.emulateJSON = true
Neckbrace.emulateHTTP = true
Neckbrace.id = 0
Neckbrace.get_id = () ->
  Neckbrace.id += 1
  return Neckbrace.id
class Neckbrace.Model
  element: "div"
  attributes: {}
  collection: []
  appendingEl: () ->
    return this.el
  constructor: (params, options) ->
    _.extend this.attributes, params
    if options && "parent" of options
      this.parent = options.parent
    this.initialize(params)
  triggers:
      "change:id": () -> #"add", "change", "remove"
        console.log this.id + "was triggered"
  initialize: (params) ->
    this.cid = Neckbrace.get_id()
    this.append()
    this.render()
    
  append: () ->
    this.el = document.createElement this.element
    if this.parent
      $(this.parent.appendingEl()).append this.el
    else
      $(document.body).append this.el
  render: () ->
    $(this.el).attr "data-neckbrace", "true"
    #$(this.el).bind("click", () -> )
  toJSON: () -> #todo: make sure nesting works
    if this.collection.length > 0
      return this.map (model) ->
        model.toJSON()
    else
      ret = {}
      for key, val of this.attributes
        if typeof val isnt "object"
          ret[key] = val
        else if typeof val is "object" and val.toJSON
          if val isnt this
            ret[key] = val.toJSON()
      ret
  ajax: $.ajax
  url: () -> "/neckbraces"
  isNew: () ->
    if this.attributes.id or this.attributes._id #also this.id or this._id
      return false
    return true
  save: (options) ->
    method = if this.isNew() then "create" else "update"
    Neckbrace.sync method, this, options.success, options.error
  fetch: (options) ->
    #todo: add more options, fetch single or fetch many
    Neckbrace.sync "read", this, options.success, options.error
  delete: (options) ->
    Neckbrace.sync "delete", this, options.success, options.error
  set: (vals) ->
    for key, val of vals
      old = this.attributes[key]
      this.attributes[key] = val
      if this.triggers["change:#{key}"]
       this.triggers["change:#{key}"].apply(this, [old])
    if this.triggers["chage"]
      this.triggers["change"].apply(this)
  get: (val) ->
    return this.attributes[val]
  add: (x) ->
    if not("_byId" of this)
      this._byId = {}
    if not("_byUid" of this)
      this._byUid = {}
    #this emulates backbone collections
    this.collection.push x
    if "id" of x.attributes
      this._byId[x.attributes.id] = x
    else if "_id" of x.attributes
      this._byId[x.attributes._id] = x
    if "cid" of x
      this._byCid[x.cid] = x
    x.parent = this
    if this.triggers["add"]
      this.triggers["add"].apply(this)
  remove: (model) ->
    model = this.getByCid(model) || this.get(Model)
    if not model then return null
    delete this._byId[model.attributes.id]
    delete this._byCid[model.cid]
    delete model.parent #backbone says model.collection
    this.collection.splice this.indexOf(model), 1
    if this.triggers["remove"]
      this.triggers["remove"].apply(this)
  getById: (id) ->
    this._byId[id]
  getByCid: (cid) ->
    this._byCid[cid]
#giving neckbrace.type the underscore methods
methods = ['forEach', 'each', 'map', 'reduce', 'reduceRight', 'find', 'detect',
'filter', 'select', 'reject', 'every', 'all', 'some', 'any', 'include',
'invoke', 'max', 'min', 'sortBy', 'sortedIndex', 'toArray', 'size',
'first', 'rest', 'last', 'without', 'indexOf', 'lastIndexOf', 'isEmpty']
_.each methods, (method) ->
  Neckbrace.Model.prototype[method] = () ->
    return _[method].apply _, [this.models].concat(_.toArray(arguments))
Neckbrace.sync = (method, o, success, error) -> #copied from Backbone.sync
  if method in ['create', 'update']
    modelJSON = JSON.stringify o.toJSON()
  method_map =
    'create' : "POST"
    'update' : 'PUT'
    'delete' : "DELETE"
    'read' : 'GET'
  type = method_map[method]
  params =
    url: if _.isFunction(o.url) then o.url() else o.url
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