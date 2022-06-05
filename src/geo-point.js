import * as turf from "@turf/turf";

function GeoPoint({lat,lon}) {
    const proxy = new Proxy(turf.point([lat,lon]), {
        get(target,property) {
            if(property==="constructor") {
                return GeoPoint;
            }
            if(property==="lat") {
                return target.geometry.coordinates[0];
            }
            if(property==="lon") {
                return target.geometry.coordinates[0];
            }
            if(property==="toObject") {
                return function() {
                    return Object.assign({lat:proxy.lat,lon:proxy.lon},{"#": proxy["#"],"^":proxy["^"]})
                }
            }
            return target[property];
        },
        getPrototypeOf(target) {
            return GeoPoint;
        }
    });
    return proxy;
}

export {GeoPoint as default,GeoPoint}