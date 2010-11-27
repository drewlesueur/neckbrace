Neckbrace.js
============

Neckbrace.js is inspired from [Backbone.js](http://documentcloud.github.com/backbone/). Some of the code is taken
straight from the Backbone.js source

It gives some methods for helping you create JavaScript web applications.

Neckbrace.js is very experimental.

Some things I am experimenting with
------------------------------------

* Not using any prototypal inheritance. All *inheritance* is explicitly programmed. (ie. `obj.__parent`)
  One problem with this is I explicitly say `obj.__type.save obj` instead of `obj.save()`
  This would be better if the
  [__noSuchMethod__](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/noSuchMethod)
  method was available in all browsers.
  Or I could wrap function calling up into another function. something like `obj.call "render"`
  
* Backbone.js wraps parameter getting and setting up into specific functions.(`model.get`, `model.set`)
  I choose not to do this, but then there are no triggers to render, etc. You must specifically `call obj.__type.render obj`
  Again, if Javascript had global getters and setters, array accessors, etc., this would be easier.
  But they don't.
  I may implement it the same way Backbone.js does in the future. If so I would 
  probably do `obj.__type.set param: value`
  
* Backbone.js wraps the attributes of the model into `model.attributes`. I don't. The attributes are
  just properties on the object

* If [Harmony Proxies](http://wiki.ecmascript.org/doku.php?id=harmony:proxies) were cross browser, much of
  the above points would be moot.
    

Tutorial
--------

demo app will be at [http://officelist.the.tl]([http://officelist.the.tl)
also see [https://github.com/drewlesueur/officelist](https://github.com/drewlesueur/officelist)  (app3.coffee)
