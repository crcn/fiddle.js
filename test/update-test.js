var assert = require('assert');
var fiddler = require('../');

describe('Incremental update', function () {
    function updCheck(obj, upd, target) {
        fiddler(upd, {}, obj);
        assert.deepEqual(obj, target);
    }

    describe("$rename", function () {
        it("#1 $rename basics", function (done) {
            updCheck(
                {_id: 1, tcores: 1, nmame: "john"},
                {$rename: {tcores: "scores", nmame: "name"}},
                {_id: 1, scores: 1, name: "john"}
            );
            done();
        });

        it("#1 $rename move", function (done) {
            updCheck(
                {_id: 2, user: {name: "john"}},
                {$rename: {"user.name": "contact.fname"}},
                {_id: 2, user: {}, contact: {fname: "john"}}
            );
            done();
        });

        it("#1 $rename move", function (done) {
            updCheck(
                {},
                {$rename: {"user.name": "contact.fname"}},
                {}
            );
            done();
        })
    });


    describe("$inc", function () {
        it("#1 $inc basics", function (done) {
            updCheck(
                {_id: 1, i1: 1, i2: 1, sub: {i1: 5.35}},
                {$inc: {i1: 5, i2: -6, i3: 1, "sub.i1": 1}},
                {_id: 1, i1: 6, i2: -5, i3: 1, sub: {i1: 6.35}}
            );
            done();
        });

        it("#2 $inc on non number throws error", function (done) {
            assert.throws(function () {
                updCheck(
                    {_id: 2, i1: "help"},
                    {$inc: {i1: 5}}
                );
            }, /Cannot apply \$inc modifier to non-number/);
            done();
        })
    });
    describe("$set", function () {

        it("#1 $set basics", function (done) {
            updCheck(
                {_id: 1, name: "John", sub: {gender: "male"}},
                {$set: {name: "Rosa", "sub.gender": "female", "sub.age": 22}},
                {"_id": 1, "name": "Rosa", "sub": {"age": 22, "gender": "female"}}
            );
            done();
        });

        it("#2 $set with subobj", function (done) {
            updCheck(
                {_id: 2, name: "John", sub: {gender: "male"}},
                {$set: {name: "Rosa", sub: {gender: "female", "age": 22}}},
                {"_id": 2, "name": "Rosa", "sub": {"age": 22, "gender": "female"}}
            );
            done();
        })

    });


    describe("$setOnInsert", function () {
        it("#1 $setOnInsert on update", function (done) {
            updCheck(
                { },
                {$setOnInsert: {name: "John", sub: {gender: "male"}}},
                {"name": "John", "sub": {"gender": "male"}},
                true
            );
            done();
        });

        it("#1 $setOnInsert on findAndUpdate", function (done) {
            updCheck(
                { _id: 2 },
                {$setOnInsert: {name: "John", sub: {gender: "male"}}},
                {_id: 2, "name": "John", "sub": {"gender": "male"}},
                true
            );
            done();
        });
    });


    describe("$unset", function () {
        it("#1 $unset basics", function (done) {
            updCheck(
                {_id: 1, name: "John", lname: "Peter", sub: {gender: "male", age: 34}},
                {$unset: {lname: 1, "sub.age": 1}},
                {"_id": 1, "name": "John", "sub": {"gender": "male"}}
            );
            done();
        });

        it("#2 $unset on non existent field does nothing", function (done) {
            updCheck(
                {_id: 2, scores: 25},
                {$unset: {"jmores.fores": 1, "pores": 1}},
                {_id: 2, scores: 25}
            );
            done();
        })
    });


    describe("$push", function () {
        it("#1 $push basics", function (done) {
            var obj = {_id: 1, scores: [1]};
            fiddler({$push: {scores: 25, age: 17, "my.rating": 12}}, {}, obj);
            assert.deepEqual(obj.age, [17]);
            assert.deepEqual(obj.scores, [1, 25]);
            assert.deepEqual(obj.my.rating, [12]);
            done();
        });
        it("#2 $push with each", function (done) {
            var obj = {_id: 2, scores: [1]};
            fiddler({$push: {scores: {$each: [25, 26]}, age: {$each: [17, 18]}}}, {}, obj);
            assert.deepEqual(obj.age, [17, 18]);
            assert.deepEqual(obj.scores, [1, 25, 26]);
            done();
        });
        it("#3 $push on non array throws error", function (done) {
            var obj = {_id: 3, scores: 25};
            assert.throws(function () {fiddler({$push: {scores: 2}}, {}, obj);}, /Cannot apply \$push\/\$pushAll modifier to non-array/);
            done();
        })
    });


    describe("$pushAll", function () {
        it("#1 $pushAll basics", function (done) {
            var obj = {_id: 1, scores: [1]};
            fiddler({$pushAll: {scores: [25, 26], age: [17, 18]}}, {}, obj);
            assert.deepEqual(obj.age, [17, 18]);
            assert.deepEqual(obj.scores, [1, 25, 26]);
            done();
        });

        it("#2 $pushAll on non array throws error", function (done) {
            var obj = {_id: 2, scores: 25};
            assert.throws(function () {fiddler({$pushAll: {scores: [12, 11]}}, {}, obj);}, /Cannot apply \$push\/\$pushAll modifier to non-array/);
            done();
        })
    });


    describe("$addToSet", function () {
        it("#1 $addToSet basics", function (done) {
            var obj = {_id: 1, scores: [25], height: [63]};
            fiddler({$addToSet: {scores: 17, height: 63, age: 17, grade: {$each: [13, 14]}}}, {}, obj);
            assert.deepEqual(obj.scores, [25, 17]);
            assert.deepEqual(obj.age, [17]);
            assert.deepEqual(obj.height, [63]);
            assert.deepEqual(obj.grade, [13, 14]);
            done();
        });

        it("#2 $addToSet with $each", function (done) {
            var obj = {_id: 2, scores: [25]};
            fiddler({$addToSet: {scores: {$each: [25, 17]}}}, {}, obj);
            assert.deepEqual(obj.scores, [25, 17]);
            done();
        });

        it("#3 $addToSet on non array throws error", function (done) {
            var obj = {_id: 3, scores: 25};
            assert.throws(function () {fiddler({$addToSet: {scores: -1}}, {}, obj);}, /Cannot apply \$addToSet modifier to non-array/);
            done();
        })
    });


    describe("$pop", function () {
        it("#1 $pop basics", function (done) {
            var obj = {_id: 1, sub: {scores: [11, 12]}, scores: [25, 27], age: [16, 17, 18], ratings: [3, 4, 5]};
            fiddler({$pop: {scores: -1, age: 1, ratings: 1, "sub.scores": -1}}, {}, obj);
            assert.deepEqual(obj.scores, [27]);
            assert.deepEqual(obj.age, [16, 17]);
            assert.deepEqual(obj.ratings, [3, 4]);
            assert.deepEqual(obj.sub.scores, [12]);
            done();
        });

        it("#1.1 $pop basics", function (done) {
            var obj = {_id: 1, sub: {scores: [11, 12]}, scores: [25, 27], age: [16, 17, 18], ratings: [3, 4, 5], grades: [13]};
            assert.throws(function () {fiddler({$pop: {scores: -1, age: 1, ratings: 1, "sub.scores": -1, grades: -2}}, {}, obj);}, /Invalid \$pop argument `\-2` for field `grades`/);
            done();
        });

        it("#2 $pop on non array throws error", function (done) {
            var obj = {_id: 2, scores: 25};
            assert.throws(function () {fiddler({$pop: {scores: -1}}, {}, obj);}, /Cannot apply \$pop modifier to non-array/);
            done();
        });

        it("#3 $pop with one or zero elements", function (done) {
            var obj = {_id: 3, scores: [], age: [16], ratings: [3]};
            fiddler({$pop: {scores: -1, age: 1, ratings: 1}}, {}, obj);
            assert.deepEqual(obj.scores, []);
            assert.deepEqual(obj.age, []);
            assert.deepEqual(obj.ratings, []);
            done();
        });

        it("#4 $pop on non existent field does nothing", function (done) {
            var obj = {_id: 4, scores: 25};
            fiddler({$pop: {"jmores.fores": -1, "pores": 1}}, {}, obj);
            assert.deepEqual({_id: 4, scores: 25}, obj);
            done();
        })
    });


    describe("$pull", function () {
        it("#1 $pull basics", function (done) {
            var obj = {_id: 1, sub: {scores: [11, 12]}, scores: [25, 27], age: [16, 17, 18], ratings: [3, 4, 5]};
            fiddler({$pull: {scores: 25, age: {$gt: 17}, ratings: {$in: [3, 4]}, "sub.scores": {$gte: 12}}}, {}, obj);
            assert.deepEqual(obj.scores, [27]);
            assert.deepEqual(obj.age, [16, 17]);
            assert.deepEqual(obj.ratings, [5]);
            assert.deepEqual(obj.sub.scores, [11]);
            done();
        });

        it("#2 $pull on non array throws error", function (done) {
            var obj = {_id: 2, scores: 25};
            assert.throws(function () {fiddler({$pull: {scores: -1}}, {}, obj);}, /Cannot apply \$pull\/\$pullAll modifier to non-array/);
            done();
        });

        it("#3 $pull on non existent field does nothing", function (done) {
            var obj = {_id: 3, scores: 25};
            fiddler({$pull: {"jmores.fores": -1, "pores": 1}}, {}, obj);
            assert.deepEqual({_id: 3, scores: 25}, obj);
            done();
        })
    });


    describe("$pullAll", function () {
        it("#1 $pullAll basics", function (done) {
            var obj = {_id: 1, sub: {scores: [11, 12, 13, 14, 15]}, age: [16, 17, 18]};
            fiddler({$pullAll: {"sub.scores": [12, 14], age: [16, 18, 20]}}, {}, obj);
            assert.deepEqual(obj.age, [17]);
            assert.deepEqual(obj.sub.scores, [11, 13, 15]);
            done();
        });

        it("#2 $pull on non array throws error", function (done) {
            var obj = {_id: 2, scores: 25};
            assert.throws(function () {fiddler({$pullAll: {scores: [20]}}, {}, obj);}, /Cannot apply \$pull\/\$pullAll modifier to non-array/);
            done();
        });

        it("#3 $pull on non existent field does nothing", function (done) {
            var obj = {_id: 3, scores: 25};
            fiddler({$pullAll: {"jmores.fores": [12], "pores": [11]}}, {}, obj);
            assert.deepEqual({_id: 3, scores: 25}, obj);
            done();
        })
    });
});
