var fiddle = require('../');

var targets = [
	{
		name: "Craig",
		comments: [
			{
				text: "hello world!"
			}
		]
	},
	{
		name: "John",
		comments: [
			{
				text: "blah"
			}
		]
	},
	{
		name: "Jake",
		comments: [
			{
				text: "test",
				replies: [
					{
						text: "another embedded test"
					}
				]
			}
		]
	}
];


var fiddler1 = fiddle({$inc:{age:1}}),
fiddler2     = fiddle({$set:{"comments.$.date": Date.now(), "comments.$.replies.$.date": Date.now() }}),
fiddler3     = fiddle({$addToSet:{hobbies:'cooking'}}),
fiddler4     = fiddle({$rename:{doesNotExist:'cooking'}}),
fiddler5     = fiddle({$pull:{hobbies:'cooking'}});


console.log(fiddler2(targets));
console.log(fiddler3(targets));
console.log(fiddler4(targets));
console.log(fiddler5(targets));
// console.log(JSON.stringify(targets, null, 2));