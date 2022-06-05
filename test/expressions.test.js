import {DateTime} from "luxon";

import ReasonDB from "../src/reason-db.js";

const db = new ReasonDB({name:"tesdb",overwrite:true})

test("format",async () => {
    const result = await db.evaluate('format("{0}",object)',{object:{primitive:1}});
    const object = JSON.parse(result);
    expect(object.primitive).toBe(1);
})
xtest("fetch - get", async () => {
    const result = await db.evaluate("fetch(url)",{url:"https://www.google.com"});
    expect(typeof(result)).toBe("string");
    expect(result.includes("html")).toBe(true);
})
test("eq",async () => {
    const result = await db.evaluate("eq(1,1)");
    expect(result).toBe(true);
})
test("eq - false",async () => {
    const result = await db.evaluate("eq(1,0)");
    expect(result).toBe(false);
})
test("eq - Array",async () => {
    const result = await db.evaluate("eq([1,2],[1,2])");
    expect(result).toBe(true);
})
test("eq - Array false",async () => {
    const result = await db.evaluate("eq([1,2],[1,0])");
    expect(result).toBe(false);
})
test("neq",async () => {
    const result = await db.evaluate("neq(1,0)");
    expect(result).toBe(true);
})
test("neq - false",async () => {
    const result = await db.evaluate("neq(1,1)");
    expect(result).toBe(false);
})
test("neq - Array",async () => {
    const result = await db.evaluate("neq([1,2],[1,0])");
    expect(result).toBe(true);
})
test("neq - Array false",async () => {
    const result = await db.evaluate("neq([1,2],[1,2])");
    expect(result).toBe(false);
})
test("+",async () => {
    const result = await db.evaluate("1 + 1");
    expect(result).toBe(2);
})
test("-",async () => {
    const result = await db.evaluate("1 - 1");
    expect(result).toBe(0);
})
test("*",async () => {
    const result = await db.evaluate("1 * 2");
    expect(result).toBe(2);
})


test("DateTime - general",async () => {
    const start = await db.evaluate("DateTime.local(2017, 3, 11, 10)");
    expect(start.hour).toBe(10);
    let result = await db.evaluate("start.plus({days: 1}).hour",{start});
    expect(result).toBe(10);
    result = await db.evaluate("start.plus({hours: 24}).hour",{start});
    expect(result).toBe(11);
})

test("Duration - general",async () => {
    const duration = await db.evaluate(("Duration({ days: 3, hours: 6})"));
    expect(duration.days).toBe(3);
    expect(duration.hours).toBe(6);
    expect(duration.as("minutes")).toBe(4680);
    expect(await db.evaluate("duration.as('minutes')",{duration})).toBe(4680);
    expect(await db.evaluate("DateTime.fromISO(\"2017-05-15\").plus(duration).toISO()",{duration})).toBe("2017-05-18T06:00:00.000-07:00")
    const o = db.stringify(duration);
    console.log(o)
})

test("GeoPoint - general",async () => {
    const distance = await db.evaluate("distance(GeoPoint({lat:-75.343, lon:39.984}),GeoPoint({lat:-75.534, lon:39.123}),{units:'miles'})");
    expect(typeof(distance)).toBe("number");
})