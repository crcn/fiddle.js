### Features

- supported operators: $inc, $set, $unset, $push, $pushAll, $addToSet, $each, $pop, $pull, $pullAll, $rename, $bit


### Examples

```javascript
var fiddle = require('fiddle');

var fiddler = fiddle({$inc:{n:1}});

fiddler({ name: "Joe" }); //{ name: "Joe", n: 1}
```
