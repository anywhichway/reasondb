import fetch from "node-fetch";
import {deepEqual} from "fast-equals"

import ReasonDB from "../src/reason-db.js";

ReasonDB.server({number:1});

let testpostedobject,
    testputkey;
test("post object",async () => {
    const data = {test:"test"},
        response = await fetch("http://127.0.0.1:8080/anywhichway/use/reasondb/",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    const text = await response.text(),
        object = JSON.parse(text);
    expect(deepEqual(object,data)).toBe(false);
    expect("#" in object).toBe(true);
    expect("^" in object).toBe(true);
    testpostedobject = object;
})
test("put object",async () => {
    const key = "test",
        data = {test:"test"},
        response = await fetch(`http://127.0.0.1:8080/anywhichway/use/reasondb/${key}`,{
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
    const text = await response.text(),
        object = JSON.parse(text);
    expect(deepEqual(object,data)).toBe(false);
    expect("#" in object).toBe(false);
    expect("^" in object).toBe(true);
    testputkey = key;
})
test("delete posted object",async () => {
    expect(testpostedobject).toBeTruthy();
    const key = "test",
        data = {test:"test"},
        response = await fetch(`http://127.0.0.1:8080/anywhichway/use/reasondb/${testpostedobject["#"]}`,{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
    const text = await response.text(),
        deleted = JSON.parse(text);
    expect(deleted).toBe(true);
})
test("delete put object",async () => {
    expect(testputkey).toBeTruthy();
    const key = "test",
        data = {test:"test"},
        response = await fetch(`http://127.0.0.1:8080/anywhichway/use/reasondb/${testputkey}`,{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
    const text = await response.text(),
        deleted = JSON.parse(text);
    expect(deleted).toBe(true);
})