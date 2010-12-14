Neckbrace = window.Neckbrace = {};
Neckbrace.emulateJSON = true
Neckbrace.emulateHTTP = true
Neckbrace.id = 0
Neckbrace.get_id = () ->
  Neckbrace.id += 1
  return Neckbrace.id
  
class NeckBrace.Type
  name: "DefaultType"
  plural: "DefaultTypes"
  element: "div"
  attributes: {}
  collection: []
  appendingEl: () ->
    return this.el
  constructor: (params) ->
    _.extend this.attributes, params
    this.initialize(params)
  initialize: (params) ->  
    this.append
    this.render
  append: () ->
    this.el = document.createElement this.element
    if this.class
      $(this.el).addClass this.class
    if this.parent
      $(this.parent.appendingEl this.parent).append this.el
    else
      $(document.body).append this.el
  render: () ->
    $(this.el).attr "data-neckbrace", "true"
  before_save: () ->
    #get rid of all the meta information
    ret = {}
    for key,val of this.attributes
      if _.s(key, 0, 2) isnt "__" and typeof val isnt "object"
        ret[key] = val
      else if typeof val is "object" and val.before_save?
        if _.s(key, 0, 2) isnt "__" and val isnt this
          ret[key] = this.before_save()
    return ret
    #return an object that you want to save
  ajax: $.ajax
  get_url: () ->
    return "/#{this.plural}"
  is_new: () ->
    if this.attributes.id or this.attributes._id #also this.id or this._id
      return false
    return true
  save: (options) ->
    method = if this.is_new() then "create" else "update"
    Neckbrace.sync method, this, options.success, options.error
  fetch: (options) ->
    #todo: add more options
    Neckbrace.sync "read", this, options.success, options.error
  delete: (options) ->
    Neckbrace.sync "delete", this, options.success, options.error
  set: (vals) ->
    for key, val of vals
     this.attributes[key] = val
  add: (x) ->
    if not("_byId" of this)
      this._byId = {}
    if not("_byUid" of this)
      this._byUid = {}
    #this emulates backbone collections
    this.collection.push x
    if "id" of x
      this._byId[x.id] = x
    else if "_id" of x
      this._byId[x._id] = x
    if "__uid" of x
      this._byUid[x.__uid] = x
  getById: (id) ->
    this._byId[id]
  getByUid: (uid) ->
    this._byUid[uid]

Neckbrace.sync = (method, o, success, error) -> #copied from Backbone.sync
  if method in ['create', 'update']
    modelJSON = JSON.stringify o.before_save()
  method_map =
    'create' : "POST"
    'update' : 'PUT'
    'delete' : "DELETE"
    'read' : 'GET'
  type = method_map[method]
  params =
    url: o.get_url
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