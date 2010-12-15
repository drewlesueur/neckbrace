Neckbrace.js
============

Neckbrace.js is inspired from [Backbone.js](http://documentcloud.github.com/backbone/). Some of the code is taken
straight from the Backbone.js source

It gives some methods for helping you create JavaScript web applications.

## Diferences from backbone.js

* One class for everything. A single class handles a model and a collectoin
* There is no extra view. The `append`, and `render` methods of the model are essentially the view.
`append` is for when the model is created--how it gets appended to the dom. `render` is usually for when the model is updated.
* binding and trigger are per-class instead of per-object. You just have the `triggers` property on
  the class. It is just an hash of the triggers. You don't have to manually bind.

Still working out kinks
