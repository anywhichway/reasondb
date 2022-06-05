import Schema from "../src/schema.js";

import {secure} from "./user/secure.js";
const UserSchema = new Schema(
    {
        forClassName: "User",
        manage: {
            versioning: true,
            expiration: {
                ttl: "Infinity", // this error not getting caught
                updateTTLOnWrite: true,
            }
        },
        validate: {
            additionalProperties: true,
            pattern: {
                userId: {$and:{$typeof: "string",$isUnique:true}},
                mobilePhone: {$optional:{$isPhoneNumber: "US"}},
                roles: {$default: {}}
            }
        },
        compute: {
            now: "${Date()}"
        },
        aggregate: {
            name: {
                count: true
            }
        },
        triggers: {
            testTrigger: {
                on: {
                    put: {$kindof: "User"}
                },
                dispatch: {
                    log: '${format("condition {0} context {1}",condition,context)}'
                }
            }
        }
    });

export {UserSchema as default, UserSchema}