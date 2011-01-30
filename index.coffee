makeLikeUnderscore = () ->
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
      do (name, func) ->
        like_[name] = func
        like_.methods[name] = (args...) ->
          ret = func(like_.currentObject, args...)
          if like_.chained
            like_.currentObject = ret
            like_.methods
          else
            ret
  return like_
_e = window._e = makeLikeUnderscore()
_e.mixin
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
    _e.s str, 0, with_what.lenght == with_what
  
  rnd: (low, high) -> Math.floor(Math.random() * (high-low+1)) + low

  time: () ->
    (new Date()).getTime()

  replaceBetween: (str, start, between, end) ->
    pos = str.indexOf start
    if pos is -1 then return str
    endpos = str.indexOf end, pos + start.length
    if endpos is -1 then return str
    return _e.s(str, 0, pos + start.length) + between + _e.s(str, endpos)

# Drew LeSueur @drewlesueur
# An abstraction for calling multiple asynchronous
# functions at once, and calling a callback 
# with the "return values" of all functions
# when they are all done.
# requires underscore.js

_e.mixin # underscore.js mixin
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
# _e.do_these [get_pics, get_videos], (ret) ->
#   console.log "pics are", ret[0]
#   console.log "videos are", ret[1]
#
##  OR 
#
# _e.do_these {pics: get_pics, videos: get_videos}, (ret) ->
#   console.log "pics are ", ret.pics
#   console.log "videos are", ret.videos
#

_e.mixin makeLikeUnderscore: makeLikeUnderscore
_p = _e._p = window._p = makeLikeUnderscore()
_e._p = _p
_e.metaInfo = {}
_e.mixin
  class: (obj) ->
    funcs = []
    props = []
    for key, val of obj
      if key of _p then continue
      if _.isFunction val
        funcs.push key
      else 
        props.push key
    _e.addPolymorphicMethods funcs
    _e.addPolymorphicProps props
    obj
  new: (type, o, extra) ->
    extra = extra || {}
    if type then extra.type = type
    o = o or {}
    metaO = _e.meta(o)
    _.extend metaO, extra
    if metaO.type and metaO.type.initialize then metaO.type.initialize o
    o
  reverseMeta: (cid) -> _e.metaInfo[cid].record #meybe do this a different way
  meta: (o) -> 
    metaO =  _p.metaInfo[o.__cid]
    if metaO then return metaO
    cid = _.uniqueId()
    o.__cid = cid
    return _e.metaInfo[cid] = record: o
    
_e.addPolymorphicMethods = (methodNames) ->
  mixins = {}
  for name in methodNames
    do(name) -> mixins[name] = (o, args...) -> _e.meta(o).type[name] o, args...
  _p.mixin mixins
_e.addPolymorphicProps = (propNames) -> #static attributes
  mixins = {}
  for name in propNames
    mixins[name] = (o) -> _p.meta(o).type[name]
  _p.mixin mixins
window._m = _m = _e.meta


_e.mixin
  bind: (o, event, callback) ->
    mo = _m(o)
    calls = mo._callbacks or (mo._callbacks = {})
    list = mo._callbacks[event] or  (mo._callbacks[event] = [])
    list.push callback

  unbind: (o, event, callback) ->
    mo = _m(o)
    if not event
      mo._callbacks = {}
    else if (calls = mo._callbacks) 
      if not callback
        calls[event] = []
      else
        list = calls[ev]
        if not list then return o
        for func, index in list
          if callback == func
            list.splice index, 1 
            break
    return o

  trigger: (o, event, restOfArgs...) ->
    mo = _m(o)
    calls = mo._callbacks
    if not calls then return o
    list = calls[event]
    if list
      for func, index in list
        func o, restOfArgs...
    allList = calls["all"]
    if allList
      for func, index in allList
        func o, event, restOfArgs...


#simple array with adding and removing
  
  initialize: (o) ->
    _m(o)._byCid = {}
  add: (o, item) ->
    o.push item
    mo = _m(o)
    if not mo._byCid then mo._byCid = {}
    mo._byCid[item.__cid] = item
    _e(o).trigger "add", item, o  
    return o
  remove: (o, item) ->
    mo = _m(o)
    if not mo._byCid then return
    if not (item.__cid of mo._byCid)
      return false
    for member, key in o
      if member.__cid == item.__cid
        o.splice key, 1 
        _e(o).trigger "remove", item, o
        

#jQuery or zepto extensions.
library = jQuery || Zepto
do (library) ->
  $ = library
  $.fn.dragsimple = (options) ->
    el = this 
    console.log el
    $(el).bind "mousedown", (e) ->
      obj = this
      e.preventDefault()
      parent_offset_left = $(obj).parent().offset().left
      parent_offset_top = $(obj).parent().offset().top
      start_offset_left = e.pageX - $(obj).offset().left
      start_offset_top = e.pageY - $(obj).offset().top 
      if _.isFunction options.start
        options.start obj

      mousemove = (e) ->
        new_left = e.pageX - parent_offset_left - start_offset_left
        new_top = e.pageY - parent_offset_top - start_offset_top
        if _.isFunction options.xFilter
          new_left = options.xFilter x, obj
        if _.isFunction options.yFilter
          new_top = options.yFilter obj
        $(obj).css("left", (new_left) + "px")
        $(obj).css("top", (new_top) + "px")
        if _.isFunction options.drag
          options.drag obj

      mouseup = (e) ->
        $(document.body).unbind "mousemove", mousemove
        if _.isFunction options.stop
          options.stop obj
      
      $(document.body).bind "mousemove", mousemove
      $(document.body).bind "mouseup", mouseup
    return el
