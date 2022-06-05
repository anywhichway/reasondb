const secure = {
    // values for roles are either true, false, or a map of allowed or disallowed properties
    // attempts to create and update disallowed items will throw errors unless onViolation overrides
    onViolation: { // the defaults, can be overridden for each access type
        error: true, // throw error
        log: true, // log to sercurity log
        removeProperty: true, // remove the violating portion of an object, note ignored for read which always just drops
    },
    create: {
        roles: {
            admin: { // a match applied to the list of property names, note property values will be inserted into db, just not returned
                //userId:
            },
            userAdmin: true
        }
    },
    read: {
        roles: {
            admin: {
                $and:[{$neq: "secret"},{$neq: "mobilePhone"}]
            },
            userAdmin: {
                $and:[{$neq: "secret"},{$neq: "mobilePhone"}]
            },
            owner: true
        },
        match: [
            {
                pattern:{friends:{$hasKey:"${currentUser.userId}"}},
                properties: {
                    $neq: "secret"
                }
            }
        ]
    },
    update: {
        roles: {
            admin: true,
            userAdmin: true,
            owner: true
        },
        match: { // allow update if any of the named properties contains the value of the id of the logged in user
            userId: true
        }
    },
    delete: {
        roles: {
            admin: true,
            userAdmin: true
        }
    },
    mask: { // mask the named properties under the test conditions again the logged in user
        mobilePhone: {
            pattern: {$not:{roles:{$hasAny: ["admin","superAdmin"]}}},
            mask: "${value.substring(5)}"
        }
    },
    encrypt: {

    }
}

export { secure as default, secure}
