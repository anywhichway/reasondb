//--trace-uncaught --report-uncaught-exception

import * as JSON from "../src/json.js";

import ReasonDB from "../src/reason-db.js";

import User from "../src/user.js";

import {DEFAULTCONTEXT} from "../src/parser.js";

import SchemaSchema from "../schema/schema.js";
import UserSchema from "../schema/user.js";

class Contact {
    constructor(options) {Object.assign(this,options);
    }
}

const toArray = async (generator) => {
    const result = [];
    for await(const item of generator) {
        result.push(item);
    }
    return result;
}

const database = { // todo create database class and schema
    name: "reasondb",
    encryptionKey: "maryhadalittlelambwhosfleecewaswhiteassnow".substring(0, 32),
    superAdmins: {
        "syblackwell@anywhichway.com": true
    },
    schema: { // mapped by class name

    }
}


const run = async () => {
        const foo = JSON.createClass("Foo");
        console.log(new foo({test:1}));
        const obj = JSON.createClass("Object");
        console.log(new obj({test:1}));
        const db = new ReasonDB({overwrite:true,...database});
        const currentuser = await db.postItem(new User({
            userId: "syblackwell@anywhichway.com",
            roles:  {
                admin: true,
                userAdmin: true
            }
        }))
        db.setCurrentUser(currentuser);
       const user = new User({ // todo remove id gen, change to post
                "#": db.generateId("User"),
                secret: "a secret",
               friends: {
                    "syblackwell@anywhichway.com": true
              },
                userId: "joe@somewhere.com",
                mobilePhone: "202-456-1414",
                notes: "This is a note with a number 1 and not a note with a boolean",
                contact: new Contact({name: "joe", age: 27})
            }),
            user2 = new User({"#": db.generateId("User"), userId: "joe@somewhere.com", mobilePhone: "202-456-1414"}),
           user3 =  new User({"#": db.generateId("User"), userId: "mary@somewhere.com", mobilePhone: "202-456-1414",contact:{age:15}});
       const duration = DEFAULTCONTEXT.Duration({days: 3, hours: 6});
        console.log(0, await db.postItem(SchemaSchema));
        console.log(0, await db.postItem(UserSchema));
        try {
            const put = await db.setItem(user),
                reparsed = JSON.parse(JSON.stringify(put));
            console.log(1, reparsed);
            const get = await db.getItem(user["#"]);
            console.log(get);
        } catch(e) {
            console.log(e);
        }
        try {
            await db.setItem(user2);
        } catch(e) {
            console.log("bubble",e);
            user2.userId = "joe@somewherelse.com";
            try {
                await db.setItem(user2);
            } catch(e) {
                console.log(e);
            }
        }
        await db.setItem(user3);
        console.log(3, await db.getItem(user2["#"]));
        const patterns = {};
        console.log(4, db.optimizePattern({
            $hasProperty: "name",
            "$aaa/*?": 1,
            userId: "joe@somewhere.com",
            contact: {name: {$and: [{$eq: "joe"}, "joe"]}, age: 27}
        }));
        const matched = await db.match(user,{
            testDistance: {$evaluate: "format('{0} miles',distance(GeoPoint({lat:-75.343,lon:39.984}),GeoPoint({lat:-75.534,lon:39.123}),{units:'miles'}))"},
            testDate: {$evaluate: "DateTime.now().plus({days:7})"},
            userId: "joe@somewhere.com",
            contact: {
                //age: {$and: [{$gt: 26}, {$eq: 27}]},
                userId: {$evaluate: "parent.userId"},
                entries: {$evaluate: "Object.entries(this)"},
                computed: {$evaluate: "this.name"}
            },
            joined: {$evaluate: "Array.join(',',1,2,3,4)"}
        });
        console.log(5,JSON.stringify(user));
        const u = JSON.parse(JSON.stringify(user));
        console.log(u);
        console.log(6, JSON.stringify(await db.extract(user,{contact: {age: {$and: [{$gt: 26}, {$eq: 27}]}}})));
        const pattern = Object.create(User.prototype);

        Object.assign(pattern, {userId: "joe@somewhere.com", contact: {age: {$and: [{$gt: 26}, {$eq: 27}]}}});
        console.log(7, JSON.stringify(await toArray(db.query(pattern))));
        console.log(8, JSON.stringify(await toArray(db.query({
            $kindof: "User",
            userId: "joe@somewhere.com",
            contact: {age: {$ior: [{$gt: 26}, {$eq: 28}]}}
        }))));
        console.log(9, JSON.stringify(await toArray(db.query({
            userId: "joe@somewhere.com",
            contact: {age: {$ior: [{$gt: 26}, {$eq: 27}]}}
        }))));
        console.log(10, JSON.stringify(await toArray(db.query({
            userId: "joe@somewhere.com",
            notes: {$search: "note"}
        }))));
        console.log(11, JSON.stringify(await toArray(db.query({notes: {$search: "note 1"}}))));
        console.log(12, JSON.stringify(await toArray(db.query({notes: {$search: "This is note with a number 1 not note with a boolean"}}))));
        console.log(13, JSON.stringify(await toArray(db.query({
            userId: "joe@somewhere.com",
            contact: {age: {$gt: 26}}
        }))));
        console.log(14, JSON.stringify(await toArray(db.query({userId: "joe@somewhere.com",contact:{age: 27}}))));
        console.log(15, JSON.stringify(await toArray(db.query({userId: "joe@somewhere.com", age: 27}))));
        console.log(16);
        (await toArray(db.query({
            $query:
                {
                    select: "{leftId:a.userId,rightId:b.userId}", // {leftId:{a:{userId:{$isAny:true}}},rightId:{b:{userId:{$isAny:true}}}},
                    from: {a: {userId: {$isAny:true}}, b: {userId: {$isAny:true}}},
                    on: "neq(a.userId,b.userId)"
                }
        }))).forEach(row => {
            console.log(row)
        });
    console.log(17);
    try {
        for await(const item of db.query({
            $query:
                {
                    select: "{leftId:a.userId,rightId:b.userId}",
                    from: {a: {userId: {$isAny:true}}, b: {userId: {$isAny:true}}},
                    on: "{a:{userId:{$neeq:b.userId}}}"
                }
        })) {
            console.log(JSON.stringify(item))
        }
    } catch(e) {
        console.log(e);
    }
    

    (await toArray(db.query({
        $query:
            {
                //select: {leftId:{a:{userId:{$isAny:true}}},rightId:{b:{userId:{$isAny:true}}}},
                from: {a: {userId: {$isAny:true}}, b: {userId: {$isAny:true}}},
                on: "neq(a.userId,b.userId)"
                // todo aggregate at join level
            }
    }))).forEach(row => console.log(row));


    (await toArray(db.query({userId: {$isAny: true},contact:{$typeof:"object"}},
        {aggregates:{contact:{age:{$isAny:true}}}}
    ))).forEach(row => console.log(row));


    (await toArray(db.query({
        $query: {
            aggregate: {contact: {age: {$typeof: "number"}}},
            from: {userId: {$isAny: true}}
        }
    }))).forEach(row => console.log(row));

        try {
            await db.setItem(new User({"#": 6789, userId: 1}))
        } catch(e) {
            console.log(e)
        }
        try {
            await db.setItem(new User({"#": 6789, userId: "foo"}))
        } catch(e) {
            console.log(e)
        }
        for await(const item of db.query({$kindof:"User",contact:{age:{$evidence:{pattern:27,score:10}}}})) {
            console.log(item);
        }
        for await(const item of db.query({$matchSimilar: {pattern:new User({userId: "joe@somewhere.com", mobilePhone: "202-456-1414"}),exclude:{contact:true}}})) {
            JSON.stringify(console.log(item))
        }
        console.log(18)
        for await(const item of db.query({["$"+new RegExp("con.+","g")]:{$isAny: true}})) {
            console.log(item)
        }
    console.log(19)
    for await(const item of db.query({contact:{["$"+new RegExp("ag.+","g")]:{$typeof: "number"}}})) {
        console.log(item)
    }
    console.log(20);
    const d = await db.postItem(duration)
    console.log(d);
    console.log(await db.getItem(d["#"]));
       /* const now = Date.now(),
            count = 1000;
        for(let i=0;i<count;i++) {
            await db.post(new User({userId:`user${i}@somewhere.com`}))
        }
        let done = Date.now();
        console.log(`${count} POST seconds: ${(done-now)/1000} per second:${count/((done-now)/1000)}`);
        for(let i=0;i<count;i++) {
            await db._lmdb.put(i,new User({userId:`user${i}@somewhere.com`}))
        }
        console.log(`${count} LMDB PUT seconds: ${(done-now)/1000} per second:${count/((done-now)/1000)}`); */
    db.close();
}

run();






