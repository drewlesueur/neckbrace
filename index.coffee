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

#simple array with adding and removing
Arr = window.Arr = _p.class
  initialize: (o) ->
    _m(o)._byCid = {}
  add: (o, item) ->
    o.push item
    _m(o)._byCid[item.__cid] = item
  remove: (o, item) ->
    if not (item.__cid of o._byCid)
      return false
    for member, key in o
      if member.__cid == item.__cid
        o.splice key, 1 
