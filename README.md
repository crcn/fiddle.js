### Features

- supported operators: $inc, $set, $unset, $push, $pushAll, $addToSet, $each, $pop, $pull, $pullAll, $rename, $bit


### Examples

```javascript
var fiddle = require('fiddle');

//increment age by one
var fiddled = fiddle({$inc:{age:1}}, null, { name: "Craig", age: 21 }); //{ name: "Craig", age: 22 }

//check if the age is less than 22 before modifying
fiddled = fiddle({$inc:{$age:1}}, {age:{$lt:22}}, fiddled); //{ name: "Craig", age: 22 }


//return a function instead
var fiddler = fiddle({$inc:{n:1}});

//modify it
fiddler({ name: "Joe" }); //{ name: "Joe", n: 1}

//modify multiple
fiddler([ {name: "Joe" }, { name: "John "}])
```


### Filter Example


```javascript
var fiddle = require('fiddle');

var fiddler = fiddle({$inc:{n:1}},{age:{$lt:25}});

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
}]);
```


### API

#### .fiddle(modifiers[, filter][, targets])

- `modifiers` - the modifiers against the given target / targets
- `filter` - the optional filter to check against the targets. Can be mongodb expression, regexp, or function
- `targets` - the target / targets to modify
