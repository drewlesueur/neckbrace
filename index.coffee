_.mixin
  s: (val, start, end) ->
    need_to_join = false
    ret = []
    if _.isString val
      val = val.split ""
      need_to_join = true
    
    if start >= 0
    else
      start = val.length + start
    
    if end == null
      ret = val.slice start
    else
      if end < 0
        end = val.length + end
      else
        end = end + start
      ret = val.slice start, end

    if need_to_join
      ret.join ""
    else
      ret

  startsWith: (str, with_what) ->
    _.s str, 0, with_what.lenght == with_what
  
  rnd: (low, high) -> Math.floor(Math.random() * (high-low+1)) + low

  time: () ->
    (new Date()).getTime()

  replaceBetween: (str, start, between, end) ->
    pos = str.indexOf start
    if pos is -1 then return str
    endpos = str.indexOf end, pos + start.length
    if endpos is -1 then return str
    return _.s(str, 0, pos + start.length) + between + _.s(str, endpos)

# Drew LeSueur @drewlesueur
# An abstraction for calling multiple asynchronous
# functions at once, and calling a callback 
# with the "return values" of all functions
# when they are all done.
# requires underscore.js

_.mixin # underscore.js mixin
  do_these: (to_dos, callback) ->
    return_values = if _.isArray(to_dos) then [] else {}
    make_jobs_done = (id) ->
      return (ret) ->
        return_values[id] = ret
        all_done = true
        _.each to_dos, (func, id) ->
          if not(id of return_values)
            all_done = false
            _.breakLoop()
        if all_done is true
          callback(return_values)
    _.each to_dos, (to_do, id) ->
      jobs_done = make_jobs_done(id)
      to_do(jobs_done)

##  Example usage
# get_pics = (done) ->
#   API.getPictures "houses", (urls) ->
#     done urls
#
# get_videos = (done) ->
#   API2.login, "user", "password", (access) ->
#     access.getVideos (videos) ->
#       done videos
#           
# _.do_these [get_pics, get_videos], (ret) ->
#   console.log "pics are", ret[0]
#   console.log "videos are", ret[1]
#
##  OR 
#
# _.do_these {pics: get_pics, videos: get_videos}, (ret) ->
#   console.log "pics are ", ret.pics
#   console.log "videos are", ret.videos
#

_.mixin
  makeLikeUnderscore: () ->
    like_ = (o) ->
      like_.currentObject = o
      return like_.methods
    like_.methods =
      chain: () ->
        like_.chained = true
        like_.methods
      value: () ->
        like_.chained = false
        like_.currentObject
    like_.mixin = (funcs) ->
      for name, func of funcs
        like_[name] = func
        like_.methods[name] = (args...) ->
          ret = func(like_.currentObject, args...)
          if like_.chained
            like_.currentObject = ret
            like_.methods
          else
            ret
    return like_


window._p = _p = _.makeLikeUnderscore()
_p.metaInfo = {}
_p.mixin
  class: (obj) ->
    funcs = []
    props = []
    for key, val of obj
      if key of _p then continue
      if _.isFunction val
        funcs.push key
      else 
        props.push key
    _p.addMethods funcs
    _p.addProps props
    obj
  new: (type, o, extra) ->
    extra = extra || {}
    if type then extra.type = type
    o = o or {}
    cid = _.uniqueId()
    o.__cid = cid
    metaO = _p.metaInfo[cid] = record: o
    _.extend metaO, extra
    if metaO.type and metaO.type.initialize then metaO.type.initialize o
    o
  reverseMeta: (cid) -> _nb.metaInfo[cid].record #meybe do this a different way
  meta: (o) -> _p.metaInfo[o.__cid]
_p.addMethods = (methodNames) ->
  mixins = {}
  for name in methodNames
    do(name) -> mixins[name] = (o, args...) -> _p.meta(o).type[name] o, args...
  _p.mixin mixins
_p.addProps = (propNames) -> #static attributes
  mixins = {}
  for name in propNames
    mixins[name] = (o) -> _p.meta(o).type[name]
  _p.mixin mixins
window._m = _m = _p.meta
_p.Collection = _p.class
  name: "Collection"
  get: (o, id, whichId="__cid") ->
    return _p.getById

#this is a work in progress         
return
  
_nb.Model =
  appendingEl: (o) -> $ _m(o).el
  #triggers: {"change:id": () -> console.log this.id + "was triggered"}
  initialize: (o, params) ->
    mo = _m(o)
    mo.cid = o.__cid
    mo.element = "div"
    _t.append o
    _t.render o
  append: (o) ->
    mo = _m(o)
    if not(mo.el) then mo.el = $(document.createElement mo.type.element)
    if mo.parent
      _t(mo.parent).appendingEl().append mo.el
    else
      $(document.body).append mo.el
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
      if tp.triggers and tp.triggers["change:#{key}"] then tp.triggers["change:#{key}"](o, [old])
    if tp.triggers and tp.triggers["chage"] then tp.triggers["change"](o)
  get: (o, val) -> return o[val]
_nb.Collection = _nb.extendModel
  add: (o, adding) ->
    mo = _m(o)
    tp = mo.type
    if not("_byId" of mo) then mo._byId = {}
    if not("_byCid" of mo) then mo._byCid = {}
    #this emulates backbone collections
    o.push adding
    if "id" of adding then mo._byId[adding.id] = adding else if "_id" of adding then mo._byId[adding._id] = adding
    if "cid" of adding then mo._byCid[adding.cid] = adding
    _m(adding).parent = o
    if tp.triggers and tp.triggers["add"] then tp.triggers["add"](o, adding)
  remove: (o, model) -> #pass in the model you want to remove, not the id
    #todo: fix this code to make sure the model is actually in the array
    mo = _m(o)
    tp = mo.type
    if not model then return null
    delete mo._byId[model.id]
    delete mo._byCid[model.cid]
    delete _m(model).parent #backbone says model.collection #todo:fix this
    o.splice _.indexOf(o, model), 1
    if tp.triggers and tp.triggers["remove"] then tp.triggers["remove"](o, model)
    model
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


