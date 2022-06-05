import cleaner from "./little-cleaner.js";

let activeNode;

const setActiveNode = (node) => {
    activeNode = node;
}
const resolveAttributes = (node,{vars,locals}={}) => {
    if(node.attributes && vars) {
        let forloop,
            ifcondition;
        for(const attribute of node.attributes) {
            const value = attribute.template ||= attribute.value.trim();
            const name = attribute.name;
            if(value.includes("${") && name!==":") {
                try {
                    let result = (Function("{vars,locals={}}","with(vars) { with(locals) { return `" + cleaner(value) + "`}}"))({vars,locals});
                    if(name.startsWith("if:") || name.startsWith("elseif:")) {
                        node.setAttribute(!!result,"");
                    }
                    if(result && typeof(result)==="object") {
                        node.setAttribute(JSON.stringify(result))
                    } else {
                        node.setAttribute(attribute.name,result);
                    }
                } catch(e) {
                    node.data = e+"";
                    throw e;
                }
            }
            if(name===":") {
                if((value.startsWith("{") || value.startsWith("${")) && value.endsWith("}")) {
                    node.removeAttribute("true");
                    node.removeAttribute("false");
                    const start = value[0]==="$" ? 2 : 1;
                    let result = !!(Function("{vars,locals={}}","with(vars) { with(locals) { return " + cleaner(value.substring(start,value.length-1)) + "}}"))({vars,locals});
                    node.setAttribute(result,"");
                }
            } else if(name.startsWith("on:")) {
                const eventname = attribute.name.split(":")[1];
                node.setAttribute("on"+eventname,`(()=>${attribute.value})()`);
            } else if(name.startsWith("forvalues:") || name.startsWith("forentries:") || name.startsWith("forkeys:")) { // foreach:<attrname>
                forloop = attribute;
            } else if(name.startsWith("if:") || name.startsWith("elseif:") ||name.startsWith("else:")) { // if:!!expression
                ifcondition = attribute;
            }
        }
        let passed = true;
        if(ifcondition) {
            node.rendered = true;
            const testresult = JSON.parse(ifcondition.name==="else:" ? true : node.getAttribute(ifcondition.name));
            if(testresult) {
                for(const child of node.childNodes) {
                    if(!child.attributes) {
                        child.data ||= child.olddata || "";
                        continue;
                    }
                    if(!Object.keys(child.attributes).some((key) => {
                        if(key.startsWith("elseif:") || key.startsWith("else:")) {
                            child.style.display = "none";
                            return true;
                        } else {
                            child.style.display = node.style.display.replace("none","");
                        }
                        return false;
                    })) {
                        resolve(child,{vars,locals});
                        render(child,{vars,locals});
                    }
                }
                if(node.attributes) {
                    node.style.display = node.style.display.replace("none","");
                } else {
                    node.data ||= node.olddata;
                }
            } else {
                passed = false;
                for(const child of node.childNodes) {
                    if(child.attributes) {
                        let some;
                        for(const attribute of child.attributes) {
                            const name = attribute.name;
                            if(name.startsWith("elseif:") || name.startsWith("else:")) {
                                resolve(child,{vars,locals});
                                render(child,{vars,locals});
                                if(!child.style.display.includes("none")) {
                                    child.rendered = true;
                                    some = true;
                                    break;
                                }
                            }
                        }
                        if(!some) {
                           node.style.display += "none";
                        }
                    } else {
                        child.olddata = child.data || child.olddata || "";
                        child.data = "";
                    }
                }
            }
        }
        if(forloop) {
            node.rendered = true;
            const [looptype,attrname] = forloop.name.split(":"),
                clone = node.cloneNode(true);
            while(node.lastChild) {
                node.removeChild(node.lastChild);
            }
            if(passed) {
                let value = node.attributes[attrname].value;
                try {
                    value = JSON.parse(value)
                } catch(e) {
                    ;
                }
                if(looptype==="forvalues") {
                    const values = Object.values(value);
                    for(let i=0;i<values.length;i++) {
                        const item = values[i],
                            locals= {[attrname]:item,"@value":item,"@index":i,"@target":value};
                        for(const child of clone.childNodes) {
                            const clone = child.cloneNode(true);
                            resolve(clone,{vars,locals});
                            render(clone,{vars,locals});
                            node.appendChild(clone);
                        }
                    }
                } else if(looptype==="forentries") {
                    const entries = Object.entries(value);
                    for(let i=0;i<entries.length;i++) {
                        const [key,value] = entries[i],
                            locals = {[attrname]:[key,value],"@key":key,"@value":value,"@index":i,"@target":value};
                        for(const child of clone.childNodes) {
                            const clone = child.cloneNode(true);
                            resolve(clone,{vars,locals});
                            render(clone,{vars,locals});
                            node.appendChild(clone);
                        }
                    }
                } else if(looptype==="forkeys") {
                    const keys = Object.keys(value);
                    for(let i=0;i<keys.length;i++) {
                        const key = keys[i],
                            locals = {[attrname]:key,"@key":key,"@value":key,"@index":i,"@target":value};
                        for(const child of clone.childNodes) {
                            const clone = child.cloneNode(true);
                            resolve(clone,{vars,locals});
                            render(clone,{vars,locals});
                            node.appendChild(clone);
                        }
                    }
                }
            }
        }
    }
};

const resolve = (node,{vars,locals}={},withAttributes=true) => {
    activeNode = node;
    locals ||= node.locals;
    if(withAttributes) {
        resolveAttributes(node,{vars});
    }
    if(node.rendered) {
        return;
    }
    let value = node.template ||= node.nodeValue ? node.nodeValue.trim() : "";
    if(value.includes("${")) {
        const _vars = vars,
            _locals = locals;
        const resolver = Function("{vars,locals={}}","with(vars) { with(locals) { return `" + cleaner(value) + "`}}");
        const render = ({vars,locals}={vars:_vars,locals:_locals}) => {
            if(node.style) {
               if(node.style?.display==="none") {
                   return
               }
            } else if(node?.parentElement?.style?.display==="none") {
                return;
            }
            let value;
            try {
                value = resolver({vars,locals});
            } catch(e) {
                node.data = e+"";
                throw e;
            }
            node.data = value && typeof(value)==="object" ? JSON.stringify(value) : value;
        }
        // todo bind function to vars?
        Object.defineProperty(node,"render",{enumerable:false,configurable:true,value:render});
        render({vars,locals});
    } else {
        for(const child of node.childNodes) {
            resolve(child,{vars,locals});
        }
    }
}

const render = (node,{vars,locals}) => {
    if(node.rendered) {
        return;
    }
    if(node.render) {
        node.render({vars,locals})
    } else if(node.hasChildNodes()) {
        for(const child of node.childNodes) {
            if(child.observed) {
                let rendering = true;
                if(propagate) {
                    for(const attribute of child.observed) {
                        const value = propagate[attribute];
                        if(value!==undefined) {
                            child.setAttribute(attribute,value);
                        }
                    }
                }
                if(vars.__target__._variables.monitors) {
                    const _setAttribute = child.setAttribute;
                    child.setAttribute = function(name,value) {
                        const oldValue = this.getAttribute(name);
                        if(oldValue!==value) {
                            _setAttribute.call(this,name,value);
                            if(rendering) {
                                return;
                            }
                            const variable = monitor[variable.name];
                            if(variable) {
                                variable.handle("change",{name,value,oldValue,vars});
                            }
                        }
                    }
                }
                rendering = false;
            }
            render(child,{vars,locals})
        }
    } else if(node.nodeValue && node.nodeValue.includes("$")) {
        node.locals = locals;
        const template = node.template ||= node.nodeValue ? node.nodeValue.trim() : "",
            resolver = Function("{vars,locals={}}","with(vars) { with(locals) { return `" + cleaner(template) + "`}}");
        let value;
        try {
            value = resolver({vars,locals});
        } catch(e) {
            node.data = e+"";
            throw e;
        }
        node.data = value && typeof(value)==="object" ? JSON.stringify(value) : value;
    }
}

const Reactor = (target,{callback},path="") => {
    if(!target || typeof(target)!=="object") {
        return target;
    }
    const proxy = new Proxy(target,{
        get(target,property) {
            if(property==="valueOf" && target.valueOf) {
                return target.valueOf.bind(target);
            }
            if(property==="toString") {
                return;
            }
            if(typeof(property)==="symbol") {
                return;
            }
            const value = target[property];
            if(typeof(value)==="function") {
                return;
            }
            return Reactor(target[property],{callback},path ? path + "." + property : property);
        },
        set(target,property,value) {
            const oldValue = target.get ? target.get(property) : target[property];
            if(oldValue!==value) {
                if(target.set) {
                    target.set(value,property);
                } else {
                    target[property] = value;
                }
                callback.call(proxy,path+"."+property,value,oldValue);
            }
            return true;
        }
    });
    return proxy;
}

class Variable {
    constructor({name,value,type,handlers={change:new Set()},dependents= new Set()}) {
        if((!value && type==="object") || type==="undefined") {
            type = undefined;
        }
        Object.assign(this,{name,value,type,handlers,dependents});
    }
    get() {
        return this.valueOf();
    }
    set(value) {
        const oldValue = this.valueOf();
        if(value!==oldValue) {
            if(this.attribute) {
                this.attribute.set(value);
            } else {
                this.value = value;
            }
            const handlers = this.handlers.change.values();
            for(const handler of handlers) {
                handler({name:this.name,value,oldValue});
            }
        }
    }
    valueOf() {
        if(this.attribute) {
            try {
                return JSON.parse(this.attribute.value)
            } catch(e) {
                return this.attribute.value;
            }
        }
        return this.value;
    }
    addEventListener(eventName,handler) {
        this.handlers[eventName].add(handler);
    }
    proxy(reactiveProxy) {
        return new Proxy(this,{
            set(target,property,value) {
                let _value = target.valueOf();
                if(_value) {
                    _value = target.value = {}; // todo what about attributes
                }
                if(_value[property]!==value) {
                    _value[property] = value;
                    reactiveProxy[target.name] = _value;
                }
                return true;
            },
            get(target,property) {
                if(typeof(property)==="symbol") {
                    return;
                }
                if(property==="__target__") {
                    return target;
                }
                let value = target[property];
                if(typeof(value)==="function") {
                    return value.bind(target);
                }
                value = target.valueOf();
                if(value) {
                    return value[property];
                }
            }
        })
    }
}

class SlendrProxy { // never create directly, always used static create
    constructor(node,options = {imports:{},exports:{},shares:{},propagates:{},reacts:{},watches:{},monitors:{}}) {
        Object.defineProperty(this,"_variables",{value:{...options}});
        Object.defineProperty(this,"_node",{value:node});
        const ctx = this;
        for(const key in options) {
            Object.defineProperty(Object.getPrototypeOf(this),key,{value:function(variables) { return ctx.addVariables(key,variables)}})
        }
    }
    export({name,value}) {
        if(value && typeof(value)==="object") {
            value = JSON.stringify(value);
        }
        if(value!==undefined) {
            this._node.setAttribute(name,value);
        }
    }
    propagate({name,value}) {
        if(value && typeof(value)==="object") {
            value = JSON.stringify(exportable);
        }
        if(value!==undefined) {
            for(const child of this._node.children) {
                const observed = child?.constructor?.observed || [];
                if (observed.includes(property)) {
                    child.setAttribute(property, value);
                }
            }
        }
    }
    addVariables(kind,variables) {
        if(!Array.isArray(variables)) {
            if(variables.__target__) {
                variables = variables.__target__;
            }
            variables = Object.entries(variables);
        }
        const reactiveProxy = this.__proxy__;
        variables
            .map(([name, value]) => {
                if(value && typeof(value)==="object" && value instanceof Variable) {
                    if(value.__target__) {
                        return value.__target__;
                    }
                    return value;
                }
                return new Variable({name, value, type: typeof (value)});
            })
            .forEach((variable) => {
                let existing = this[variable.name];
                if (!existing) {
                    existing = this[variable.name] = variable;
                } else {
                    existing.type ||= variable.type;
                    if (variable.valueOf() !== undefined) {
                        existing.set(variable.valueOf());
                    }
                }
                this._variables[kind][variable.name] = existing;
                if(kind==="exports") {
                    variable.addEventListener("change",this.export.bind(this))
                }
                if(kind==="propagates") {
                    variable.addEventListener("change",this.propagate.bind(this))
                }
                if(kind==="imports") {
                    const _setAttribute = this._node.setAttribute;
                    this._node.setAttribute = function(name,value) {
                        reactiveProxy[variable.name] = value;
                    }
                    const dummy = reactiveProxy[variable.name]; // forces an initial get to initialize
                }
                const value = variable.valueOf();
                if(value!==undefined) {
                    this.__proxy__[variable.name] = value;
                }
            });
        return new Proxy(this._variables[kind],{
            get(target,property) {
                const variable = target[property];
                if(variable) {
                    return variable.proxy(reactiveProxy);
                }
            }
        })
    }
    static create(rootNode) {
        let causalNode,
            slndr = new SlendrProxy(rootNode),
            proto = Object.getPrototypeOf(slndr);
        const proxy =  new Proxy(slndr,{
            get(target,property) {
                if(property==="__target__") {
                    return target;
                }
                if(property in proto) {
                    return proto[property];
                }
                let variable = target[property];
                if(property in target._variables.shares) {
                    let existing = target._node.constructor[property];
                    if(!existing) {
                        existing = target._node.constructor[property] = variable;
                    }
                    variable = existing;
                } else if(property in target._variables.imports) {
                    let attribute = variable.attribute;
                    if(!attribute) {
                        attribute = rootNode.attributes[property];
                        if(attribute) {
                            if(!attribute.set) {
                                Object.defineProperty(attribute,"set",
                                {
                                    enumerable:false,
                                    value:function(value) {
                                        this.value = value && typeof(value)==="object" ? JSON.stringify(value) : value;
                                    }});
                          }
                        }
                        variable.attribute = attribute;
                    }
                }
                if(property in target._variables.reacts) {
                    if(activeNode) {
                        const node = activeNode;
                        if(["INPUT","SELECT","TEXTAREA"].includes(activeNode.tagName)) {
                            // todo multi-select parsing
                            node.addEventListener("change",() => {
                                let value = node.value;
                                if(node.getAttribute("value")!==value) {
                                    node.setAttribute("value",value);
                                }
                                try {
                                    value = JSON.parse(value);
                                } catch(e) {

                                }
                                causalNode = node;
                                proxy[property] = value;
                                causalNode = null;
                            })
                        }
                        const callback = () => {
                            proxy[property] = variable.valueOf();
                        }
                        for(const possibleparent of variable.dependents) {
                            if(possibleparent.contains(node)) {
                                return Reactor(variable.proxy(proxy),callback);
                            }
                        }
                        variable.dependents.add(node);
                        return Reactor(variable.proxy(proxy),callback);
                    }
                }
            },
            set(target,property,value) {
                if(property in proto) {
                    throw new TypeError(`${property} is a reserved word`);
                }
                const variable = target[property],
                    oldValue = variable.valueOf();
                if(value===oldValue && (!value || typeof(value)!=="object")) { // todo deepequal test
                    return true;
                }
                variable.set(value);
                if(property in target._variables.shares) {
                    let existing = rootNode.constructor[property];
                    if(!existing) {
                        existing = rootNode.constructor[property] = variable;
                    }
                    existing.set(value);
                }
                if(property in target._variables.reacts) {
                    const values = [...variable.dependents.values()]; // .values() is a live list, so copy
                    for(const dependent of values) {
                        if(!dependent.isConnected || !dependent.parentNode) {
                            variable.dependents.delete(dependent);
                            continue;
                        }
                        if(dependent===causalNode) {
                            continue;
                            continue;
                        }
                        if(dependent.render) {
                            dependent.render({vars:proxy});
                        } else if(dependent.parentElement?.render) {
                            dependent.parentElement.render({vars:proxy});
                        }
                    }
                }
                return true;
            }
        })
        Object.defineProperty(slndr,"__proxy__",{value:proxy});
        return proxy;
    }
}

const nameFromUrl = (url) => {
    // handle relative path
    if(!url.startsWith("http://") && !url.startsWith("https://")) {
        if(url.startsWith("./")) {
            url = url.substring(1);
        }
        if(url[0]==="/") {
            url = url.substring(1);
        }
        const parts = window.location.pathname.split("/");
        parts[parts.length-1] = url;
        url = parts.join("/")
    }
    // get rid of extension
    const parts = url.split(".");
    if(parts.length>1) {
        parts.pop();
    }
    // remove illegal characters
    return parts.join(".").replaceAll(/[\.-]/g,"/").replaceAll(/ [^a-zA-Z0-9\/]/g,"/").split("/").map(token => token[0] ? token[0].toUpperCase() + token.substring(1) : token).join("");
}

const compile = ({pathname,name=pathname,targets=[],document}) => {
    const script = document.head.querySelector("script[type=slndr]").innerHTML;
    if(pathname && name===pathname) {
        name = nameFromUrl(name);
    }
    const selfcompile = document.body.querySelector("script[id=slndr]");
    if(selfcompile) {
        selfcompile.remove();
    }
    for(const item of document.body.querySelectorAll("script[type='slndr']")) {
        item.setAttribute("type","application/javascript");
    }
    let body = document.body.innerHTML;
    for(const name in CUSTOMELEMENTS) { // handle existing custom elements
        body = body.replaceAll(new RegExp(`<${name}(?=[\\s>])(.*)>`,"gi"),`<slndr-${name}$1>`)
            .replaceAll(new RegExp(`<\/${name}>`,"gi"),`<\/slndr-${name}>`)
    }
    const cls = Function("{name,script,html,resolve,render,setActiveNode,SlendrProxy}",
        "return " + `class ${name.replaceAll("-","")} extends HTMLElement {
constructor() {
    super();
    const reactiveProxy = SlendrProxy.create(this);
    const {imports,exports,shares,propagates,reacts,watches,monitors} = reactiveProxy;
    ${script}
    const _render = () => {
        if(!this.shadowRoot) this.attachShadow({mode:"open"});
        const fragment = document.createElement("body"); fragment.innerHTML = html;
        const scripts = fragment.querySelectorAll("script")||[];
        for(const script of scripts) {
            const render = function() {
                const newscript = document.createElement("script"); newscript.template = this.template;
                newscript.innerHTML = "with(window.reactiveProxy) { " +  this.template + "}";
                newscript.render = render; setActiveNode(newscript); window.reactiveProxy = reactiveProxy;
                this.replaceWith(newscript); window.reactiveProxy = null;
            }
            script.template = script.innerHTML; script.render = render; 
        }
        while(this.shadowRoot.firstChild) this.shadowRoot.removeChild(this.shadowRoot.firstChild);
        window.reactiveProxy = reactiveProxy;
        fragment.normalize();
        while(fragment.firstChild) {
            setActiveNode(fragment.firstChild); const node = fragment.firstChild; this.shadowRoot.appendChild(node);
            resolve(node,{vars:reactiveProxy});
            render(node,{vars:reactiveProxy});
        }
        window.reactiveProxy = null;
    }
    Object.defineProperty(this,"reactiveProxy",{enumerable:false,value:reactiveProxy});
    Object.defineProperty(this,"render",{enumerable:false,value:_render});
}
attributeChangedCallback(name,oldValue,newValue) { this.render(); } connectedCallback() { if(this.isConnected) this.render(); }
static observed = Object.freeze(${JSON.stringify(script.match(/const\s*imports\s*=\s*{(?<imports>.*)}/)?.groups?.imports.split(",")||[])});
static get observedAttributes() { return this.observed; }
static get tagName() { return "slndr-${name}".toUpperCase()}
}`)({name,script,html:body,resolve,render,setActiveNode,SlendrProxy});
    defineCustomElement(name,cls);
    for(const target of targets) {
        target.innerHTML = `<slndr-${name}></slndr-${name}>`
    }
    return cls;
}

const CUSTOMELEMENTS = {};
const defineCustomElement = (name,cls) => {
    name = name.toLowerCase();
    CUSTOMELEMENTS[name]=cls;
    customElements.define("slndr-"+name,cls);
}

const parser = new DOMParser();
const slendr = async ({name,url}) => {
    name = name ? name : nameFromUrl(url);
    CUSTOMELEMENTS[name] = true; // must do before async stuff starts happening
    const response = await fetch(url),
        text = await  response.text(),
        document = parser.parseFromString(text,"text/html");
    return compile({name,document})
}


const transformTags = (html) => {
    for(const name in CUSTOMELEMENTS) { // handle existing custom elements
        html = html.replaceAll(new RegExp(`<${name}(?=[\\s>])(.*)>`,"gi"),`<slndr-${name}$1>`)
            .replaceAll(new RegExp(`<\/${name}>`,"gi"),`<\/slndr-${name}>`)
    }
    return html;
}

export {slendr,transformTags,compile};

