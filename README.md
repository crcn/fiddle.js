### Features

- supported operators: $inc, $set, $unset, $push, $pushAll, $addToSet, $each, $pop, $pull, $pullAll, $rename, $bit


### Examples

```javascript
var fiddle = require('fiddle');

var fiddler = fiddle({$inc:{n:1}});

fiddler({ name: "Joe" }); //{ name: "Joe", n: 1}
```


### Sift Example


```javascript
var fiddle = require('fiddle');
var sift   = require('sift');

var fiddler = fiddle({$inc:{n:1}});
sifter      = sift({ age:{$lt:25}});

//result: {name:"Craig",age:22, n:1}, {name:"Tim",age:21,n:1}
fiddler([{
	name: "Craig",
	age: 22
},
{
	name: "Tim",
	age: 21
},
{
	name: "John",
	age: 25
}], sifter.test);
```
