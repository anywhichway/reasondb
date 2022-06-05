import * as turf from "@turf/turf";
import GeoPoint from "../src/geo-point.js"
import ReasonDB from "../src/reason-db.js";

// just make sure the constructor and database set/get works because this is really just the turf library

const db = new ReasonDB({name:"tesdb",overwrite:true});

test("GeoPoint - general",async () => {
    const from = new GeoPoint({lat:-75.343, lon:39.984}),
        to = new GeoPoint({lat:-75.534, lon:39.123}),
        distance = turf.distance(from, to, {units:"miles"});
    expect(typeof(distance)).toBe("number");
});

test("GeoPoint - post", async() => {
    const point = await  db.postItem(new GeoPoint({lat:-75.343, lon:39.984}));
    expect(point.constructor.name).toBe("GeoPoint");
    const result = await db.getItem(point["#"]);
    expect(result.constructor.name).toBe("GeoPoint");
    expect(typeof(point.lat)).toBe("number");
    expect(typeof(point.lon)).toBe("number");
    expect(point.lat).toEqual(result.lat);
    expect(point.lon).toEqual(result.lon);
})

