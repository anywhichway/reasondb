import * as mime from "mime-types";
import ittyrouter from "itty-router";
const {Router} = ittyrouter;
import {
    json,
    missing,
    error,
    status,
    withContent,
    withCookies,
    withParams,
    ThrowableRouter,
    StatusError
} from 'itty-router-extras'
const router = Router(); //ThrowableRouter({stack:true});

import ReasonDB from "./reason-db.js";

const logRequest = request => {
    console.log(new Date(),request.url)
}

const withMimeType = request => {
    const headertype = request.getHeader('Content-Type'),
        filetype = mime.lookup(request.parsedURL.pathname);
    if(headertype && filetype && headertype!==filetype) {
        throw new StatusError(400, `Conflicting content types. header:${headertype} extension:${extension} ${filetype}`)
    }
    request.mimeType = headertype || filetype;
}

const withDatabaseKey = (request, {db}) => {
    if(request.mimeType==="application/json") {
        const [_,account,database,...rest]= request.parsedURL.pathname.split("/");
        let key = rest.join("/");
        if(key.endsWith(".json")) {
            key = key.substring(0,key.length-5);
        }
        if(!key.startsWith("/")) {
            key = "/" + key;
        }
        request.databaseKey = key;
    }
}

const withDatabase = (request,{databases}) => {
    if(request.mimeType==="application/json") {
        const [_, account, database] = request.parsedURL.pathname.split("/"),
            path = `${account}/${database}`;
        let db = request.database = databases[path];
        if(!db) {
            db = request.database = databases[path] = new ReasonDB({name: path, overwrite: true});
        }
        if(db.timeout) {
            clearTimeout(db.timeout);
        }
        // todo update timeout on cursor iteration
        db.timeout = setTimeout(() => {
            db.close();
            delete databases[path];
        },1000*60*5)
    }
}

// withUser modifies original request, but returns nothing
const withUser = request => {
    request.user = { userId: "syblackwell@anywhichway.com" }
}

// requireUser optionally returns (early) if user not found on request
const requireUser = (request,{Response}) => {
    if (!request.user) {
        return new Response('Not Authenticated', { status: 401 })
    }
}

// showUser returns a response with the user (assumed to exist)
const showUser = (request,{Response}) => new Response(JSON.stringify(request.user))

const missingHandler = (request, {Response}) => new Response('Not found.', { status: 404 });

router.all("*",logRequest,withUser,requireUser,withCookies,withMimeType);
router.get("/ping",withParams,(req, {response}) => {
    response.write(new Date());
    return response;
});
router.get("/echo/:message",withParams,(req, {response}) => {
    response.write("echo " + JSON.stringify(req?.params?.message));
    return response;
});
router.delete("/:account/use/:database/*",withDatabaseKey,withDatabase,async (request, {Response}) => {
    if(request.database) {
        return new Response(await request.database.removeItem(request.databaseKey))
    }
})
router.get("/:account/use/:database/*",withDatabaseKey,withDatabase,async (request, {Response}) => {
    if(request.database) {
        return new Response(await request.database.getItem(request.databaseKey))
    }
})
router.put("/:account/use/:database/*",withDatabaseKey,withDatabase,async (request, {Response}) => {
    if(request.database) {
        const json = await request.json();
        return new Response(await request.database.setItem(request.databaseKey,json))
    }
})
router.post("/:account/use/:database/*",withDatabaseKey,withDatabase,async (request, {Response}) => {
    if(request.database) {
        const json = await request.json();
        return new Response(await request.database.postItem(json,{key:request.databaseKey}))
    }
});
router.all('*',missingHandler);

export {router as default,router}