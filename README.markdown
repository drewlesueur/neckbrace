Neckbrace.js
============

Neckbrace.js is inspired from [Backbone.js](http://documentcloud.github.com/backbone/). Some of the code is taken
straight from the Backbone.js source

It gives some methods for helping you create JavaScript web applications.

## Diferences from backbone.js

* The main difference is Neckbrace uses real javascript objects and arrays, not nested ones
* Functions are called based off the __cid of the object or array.
* neckbrace models have meta elements like `_m(obj).el`
* call polymorphic functions like `_t(obj).myfunction()`
this will look up the type of the meta object of `obj` (like `_m(ojb).type.myFunction o`)
* Copied this way of doing oop from Underscore.js

Still working out kinks

##Thoughts.
    people.phones[0].extension
    peopele.get("phones").get(1).get("extension")
    people.attributes.phones.collection[0].extension
    listing._.save()
    _t(record).save()
