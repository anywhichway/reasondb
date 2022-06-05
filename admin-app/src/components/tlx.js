import cleaner from "./little-cleaner.js";

const tagPrefix = "tlx";

const registry = {};

const register = (name, elementNode) => {
    name = name.toLowerCase();
    const clone = elementNode.cloneNode(true);
    const initialize = (newNode, {attributes, slotContents = {}, source}) => {
        newNode.__customElement__ = true;
        [...clone.attributes].forEach((attribute) => {
            newNode.setAttribute(attribute.name, attribute.value);
        });
        attributes.forEach(attribute => newNode.setAttribute(attribute.name, attribute.value));
        const shadowRoot = newNode.attachShadow({mode: "open"});
        [...clone.childNodes].forEach((child) => shadowRoot.appendChild(child.cloneNode(true)));
        const slot = shadowRoot.querySelector("slot:not([name])");
        if (slot) {
            const dflt = slotContents.__default__;
            if (dflt) {
                slot.after(dflt.cloneNode(true));
                slot.remove();
            } else {
                slot.replaceWith(source.cloneNode(true));
            }
        } else {
            Object.entries(slotContents).forEach(([name, content]) => {
                [...shadowRoot.querySelectorAll(`slot[name=${name}]`)]
                    .forEach((slot) => {
                        slot.replaceWith(content.cloneNode());
                    })
            });
        }
        const storage = Storage(),
            storageProxy = StorageProxy(storage),
            $$slots = Object.keys(slotContents).reduce((slots, key) => {
                slots[key] = true;
                return slots;
            }, {});
        storageProxy.set(newNode, "$$slots", $$slots, storageProxy);
        newNode.render = () => render.call(newNode, newNode, {vars: storageProxy});
        return {element: newNode, storageProxy, shadowRoot};
    }
    return registry[name] = ({
                                 attributes,
                                 slotContents,
                                 source
                             }) => initialize(document.createElement(name), {attributes, slotContents, source});
}

const Reactor = (object, variable, root = object) => {
    if (!object || typeof (object) !== "object") return object;
    return new Proxy(object, {
        set(target, property, value) {
            if (target[property] != value) {
                target[property] = value;
                variable.set(root);
            }
        },
        get(target, property) {
            const value = target[property],
                type = typeof (value);
            if (value && type === "object") {
                return Reactor(value, variable, root);
            }
            if (type === "function") {
                return value.bind(target);
            }
            return value;
        },
    })
}


const Variable = ({node, storage, storageProxy, name, value}) => {
    let _value = value,
        _dependents = new Set(),
        _react = false,
        _import = false,
        _export = false,
        _share = false,
        _global = false,
        _setAttribute = node.setAttribute;
    return {
        set(value) {
            _value = value;
            if (_export) {
                if (value && typeof (value) === "object") {
                    value = JSON.stringify(value);
                }
                node.attributes ? (node.attributes[name].value = value) : (node.host.attributes[name].value = value);
            }
            if (_share) {
                const proto = Object.getPrototypeOf(node);
                proto.__shared__ ||= {};
                proto.__shared__[name] = value;
            }
            if (_react) {
                [..._dependents.values()]
                    .sort((a, b) => a == b ? 0 : a.contains(b) ? 1 : -1)
                    .forEach((node) => {
                        if (!node.parentNode && !node.ownerElement) {
                            _dependents.delete(node);
                        } else if (node.render) {
                            node.render({vars: storageProxy}, {withOwner: true});
                        } else if (node.nodeType === Node.ELEMENT_NODE) {
                            throw new TypeError("reactivity should only reach text nodes and attributes")
                            //renderElementNode(node,{vars:storageProxy})
                        }
                    })
            }
            if(_global) {
                window[name] = value;
            }
            return _value;
        },
        valueOf() {
            if (_react && activeNode) {
                const values = [..._dependents.values()];
                if (values.length === 0) {
                    _dependents.add(activeNode);
                } else {
                    values.forEach((node) => {
                        if (activeNode.contains(node) && node !== activeNode) _dependents.delete(node);
                        if (!node.contains(activeNode)) _dependents.add(activeNode);
                    })
                }
            }
            if (_share) {
                const proto = Object.getPrototypeOf(node);
                _value = proto.__shared__ ? proto.__shared__[name] : undefined;
            }
            if(_global) {
                _value = window[name];
            }
            if (_import) { // imports shadow globals
                let value = getAttribute(node, name);
                if (!value) value = node.hasAttribute(name) + "";
                try {
                    _value = JSON.parse(value);
                } catch (e) {
                    _value = value === "" ? null : value;
                }
            }
            if (_react && _value && typeof (value) === "object") {
                return Reactor(_value, this);
            }
            return _value;
        },
        exports(bool = true) {
            _export = bool;
        },
        shares(bool = true) {
            _share = bool;
        },
        imports(bool = true) {
            if (bool) {
                node.setAttribute = function (name, value) {
                    try {
                        value = JSON.parse(value);
                    } catch (e) {

                    }
                    _value = value;
                }
            } else {
                node.setAttribute = _setAttribute;
            }
            _import = bool;
        },
        reacts(bool = true) {
            _react = bool;
            if (!bool) _dependents = new Set(); // reset dependents
        },
        globals(bool = true) {
            if(window[name]!==undefined) {
                _value = window[name];
            }
            _global = bool;
        }
    }
}

let activeNode;

const setActiveNode = (node) => activeNode = node;

const getActiveNode = () => activeNode;

const resolve = (text, {vars = {}, locals = {}}, {clean = true} = {}) => {
    if (clean) text = cleaner(text);
    return Function("{vars,locals}", "with(vars) { with(locals) { return `" + text + "`}}")({
        vars,
        locals
    });
}

const getAttribute = (node, aname) => node.getAttribute ? node.getAttribute(aname) : node.host.getAttribute(aname);

const getSlotContents = (node) => {
    return [...node.querySelectorAll("[slot]")].reduce((slots, node) => {
        slots[getAttribute(node, "slot")] = node;
        return slots;
    }, {})
}

const render = function (node, {vars, locals}, {withAttributes = true, autobind, bindingRoot} = {}) {
    if (node.__rendered__ || node?.style?.display.includes("none")) return node;
    if (node.beforeUpdate) {
        node.beforeUpdate();
    }
    if (node.render && node !== this) return node.render({vars, locals}, {
        withAttributes,
        autobind,
        bindingRoot
    });
    if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (!autobind) {
                autobind = getAttribute(node, "autobind")
                if (autobind) {
                    bindingRoot = node;
                }
            }
            if (!node.__customElement__) {
                const customelement = registry[node.tagName.toLowerCase()];
                if (customelement) {
                    const slotContents = getSlotContents(node),
                        {element, storageProxy, shadowRoot} = customelement({
                            attributes: [...node.attributes],
                            slotContents,
                            source: node
                        });
                    node.replaceWith(element);
                    element.render();
                    if (element.onMount) element.onMount();
                    return;
                }
            }
            if (autobind && node === bindingRoot) {
                node.addEventListener("input", ({target}) => {
                    setActiveNode(target);
                    const value = tryCatchParse(target.value),
                        vname = getAttribute(target, "name");
                    if (target.type === "checkbox") {
                        if (target.checked) vars.set(bindingRoot, vname, value);
                    } else {
                        vars.set(bindingRoot, vname, value);
                    }
                });
            }
            if (withAttributes) {
                [...node.attributes]
                    .sort((a, b) => a.name[0] === ":" ? -1 : (a.name.includes(":") ? 1 : -1))
                    .forEach((attribute, i, array) => renderAttributeNode(attribute, {vars, locals}, {
                        autobind,
                        bindingRoot
                    }));
            }
            if (node.tagName === "SCRIPT" && node.className.split(" ").includes("tlx")) {
                renderScriptNode(node, {vars, locals});
                return node;
            }
            [...node.childNodes].forEach(child => render(child, {vars, locals}, {autobind, bindingRoot}));
        }
        for (const child of node.childNodes) render(child, {vars, locals}, {autobind, bindingRoot});
        if (node.shadowRoot) render(node.shadowRoot, {vars, locals}, {autobind, bindingRoot})
    } else if (node.nodeType === Node.TEXT_NODE) {
        return renderTextNode(node, {vars, locals});
    }
    if (node.afterUpdate) {
        node.afterUpdate();
    }
    return node;
}

const renderAttributeNode = (node, {vars, locals}, {autobind, bindingRoot}) => {
    const defaults = {
        vars,
        locals
    };
    if (node.render) node.render({vars, locals} = defaults);
    (node.render = ({vars, locals} = defaults, {
        withAttributes = true,
        withoutTemplate,
        withOwner,
        autobind,
        bindingRoot
    } = {}) => {
        setActiveNode(node);
        const name = node.name,
            parent = node.ownerElement;
        node.__template__ ||= node.value;
        if (withAttributes) {
            if (node.__template__.includes("${") && (!withoutTemplate || withoutTemplate !== node)) renderTemplateAttribute(node, {
                vars,
                locals
            }, {parent, name})
            if (name === ":") renderBooleanAttribute(node, {vars, locals}, {parent, name})
            else if (name.startsWith("class:")) renderClassAttribute(node, {vars, locals}, {parent, name})
            else if (name.startsWith("on:")) renderEventAttribute(node, {vars, locals}, {parent, name})
            else if (name.startsWith("if:") || name.startsWith("elseif:") || name === ":else") renderConditionalNode(node, {
                vars,
                locals
            }, {parent, name})
            else if (name.startsWith("foreach:") || name.startsWith("forvalues:") || name.startsWith("forentries:") || name.startsWith("forkeys:")) {
                renderLoopNode(node, {vars, locals}, {parent, name})
            } else if (name === "checked") renderCheckedNode(node, {vars, locals}, {parent, name})
            else if ((name === "name" || name === "id") && autobind) bindNode(node, {vars, locals}, {
                parent,
                name,
                autobind,
                bindingRoot
            })
            else if (name.startsWith("bind:")) bindNode(node, {vars, locals}, {
                parent,
                name,
                autobind: "reacts",
                bindingRoot: document.body
            }) // dela with tlx brenaing body
        }
        if (withOwner) render(node.ownerElement, {vars, locals}, {withAttributes, withoutTemplate: node});
    })({vars, locals}, {autobind, bindingRoot});
    return node;
}

const promised = (promise) => promise && typeof (promise) === "object" && promise instanceof Promise ? true : false;
const resolved = (promise) => promise && typeof (promise) === "object" && promise instanceof Promise ? !!promise.__resolved__ : true;
const rejected = (promise) => promise && typeof (promise) === "object" && promise instanceof Promise && promise.__rejected__ ? !!promise.__rejected__ : false;
const renderTemplateAttribute = (node, {vars, locals}, {parent, name}) => {
    node.__template__ ||= node.nodeValue;
    let value = resolve(node.__template__, {
        vars,
        locals: Object.assign({}, locals, {resolved, rejected, promised})
    });
    if (value == "undefined") value = "";
    if (value && typeof (value) === "object") parent.attributes[name].value = JSON.stringify(value)
    else parent.setAttribute(name, value);
    return node;
}

const renderBooleanAttribute = (node, {vars, locals}, {parent}) => {
    const value = node.value;
    if ((value.startsWith("{") || value.startsWith("${")) && value.endsWith("}")) {
        parent.removeAttribute("true");
        parent.removeAttribute("false");
        const start = value[0] === "$" ? 2 : 1,
            result = !!resolve(value.substring(start, value.length - 1), {vars, locals})
        parent.setAttribute(result, "");
    }
    return node;
}

const renderEventAttribute = (node, {vars, locals}, {name, parent}) => {
    parent.__handlers__ ||= {};
    const eventname = name.split(":")[1];
    if (!parent.__handlers__[eventname]) {
        let body = node.value.trim().replace("(event)", "()");
        const handler = parent.__handlers__[eventname] = (event) => {
            setActiveNode(node);
            return Function("{vars={},locals={},event}", "with(vars) { with(locals) { return (" + body + ")()}}")({
                vars,
                locals,
                event
            })
        };
        parent.addEventListener(eventname, handler);
    }
}

const renderClassAttribute = (node, {vars, locals}, {name, parent}) => {
    const classname = name.split(":")[1],
        value = !!tryCatchParse(parent.getAttribute(name));
    if (value) {
        parent.classList.add(classname)
    } else {
        parent.classList.remove(classname)
    }
}

const tryCatchParse = (value) => {
    if (value == "undefined") {
        return undefined;
    }
    try {
        return JSON.parse(value)
    } catch (e) {
        return value;
    }
}

const renderConditionalNode = (node, {vars, locals}, {parent, name}) => {
    let value;
    if (name === ":else") {
        value = true;
    } else {
        let [_, v] = name.split(":");
        if (v) {
            value = !!tryCatchParse(v);
        } else {
            const property = getAttribute(parent, name);
            if (parent.hasAttribute(property)) {
                value = !!tryCatchParse(getAttribute(parent, property));
            } else {
                const varvalue = locals ? locals[property] : (vars ? vars[property] : undefined);
                if (varvalue !== undefined) value = !!varvalue
                else value = !!tryCatchParse(property);
            }
        }
    }
    if (value) {
        parent.style.display = parent.style.display.replace("none", "");
        if (name.startsWith("elseif:") || name === ":else") {
            for (const child of parent.parentElement.childNodes) {
                if (child.attributes) {
                    if (child !== parent) child.style.display += "none"
                } else {
                    child.data = child.data || child.olddata || "";
                    child.data = "";
                }
            }
        } else {
            for (const child of parent.childNodes) {
                if (child.attributes) {
                    for (const attribute of child.attributes) {
                        const name = attribute.name;
                        if (name.startsWith("elseif:") || name === ":else") child.style.display += "none"
                    }
                } else {
                    child.data = child.olddata || child.data || "";
                }
            }
        }
    } else {
        if (name.startsWith("elseif:") || name === ":else") {
            parent.style.display += "none";
        } else {
            let some;
            for (const child of parent.childNodes) {
                if (child.attributes) {
                    if (some) {
                        child.style.display += "hidden";
                    } else {
                        for (const attribute of child.attributes) {
                            const name = attribute.name;
                            if (name.startsWith("elseif:") || name === ":else") {
                                child.style.display = child.style.display.replace("none", "");
                                render(child, {vars, locals});
                                if (!child.style.display.includes("none")) {
                                    some = child;
                                    break;
                                }
                            }
                        }
                    }
                } else {
                    child.olddata = child.data || child.olddata || "";
                    child.data = "";
                }
            }
        }
    }
}

const doLoop = ({attrname, element, index, locals, vars, clone, parent}) => {
    if (attrname) locals[attrname] = element;
    locals.index = index;
    for (const child of clone.childNodes) {
        const clone = child.cloneNode(true);
        parent.appendChild(clone);
        render(clone, {vars, locals});
    }
}
const renderLoopNode = (node, {vars, locals = {}}, {parent, name}) => {
    parent.__rendered__ = true;
    const clone = parent.cloneNode(true);
    let [_, value] = name.split(":"),
        attrname;
    if (value) {
        value = tryCatchParse(value);
    } else {
        value = getAttribute(parent, name);
        if (parent.hasAttribute(value)) {
            attrname = value;
            value = tryCatchParse(getAttribute(parent, attrname));
        } else {
            const varvalue = (locals ? locals[value] : undefined) || (vars ? vars[value] : undefined);
            if (varvalue !== undefined) {
                attrname = value;
                value = varvalue;
            } else {
                value = tryCatchParse(value);
            }
        }
    }
    while (parent.lastChild) {
        parent.removeChild(parent.lastChild);
    }
    if (name.startsWith("foreach:")) {
        Object.assign(locals, {array: value});
        value.forEach((element, index) => {
            locals.element = element;
            doLoop({attrname, element, index, locals, vars, clone, parent});
        })
    } else if (name.startsWith("forvalues:")) {
        const values = Object.values(value);
        Object.assign(locals, {object: value});
        values.forEach((element, index) => {
            locals.value = element;
            doLoop({attrname, element, index, locals, vars, clone, parent})
        })
    } else if (name.startsWith("forentries:")) {
        const values = Object.entries(value);
        Object.assign(locals, {object: value});
        values.forEach((element, index) => {
            locals.entry = element;
            doLoop({attrname, element, index, locals, vars, clone, parent})
        })
    } else if (name.startsWith("forkeys:")) {
        const values = Object.keys(value);
        Object.assign(locals, {object: value});
        values.forEach((element, index) => {
            locals.key = element;
            doLoop({attrname, element, index, locals, vars, clone, parent})
        })
    }
    return node;
}

const renderCheckedNode = (node, {vars, locals}, {parent, name}) => {
    const value = !!tryCatchParse(node.value);
    if (parent.tagName === "INPUT") {
        const vname = getAttribute(parent, "name") || getAttribute(parent, "id");
        vars.set(parent, vname, value, true);
        ;
    }
    parent.checked = value;
}

const renderValueNode = (node, {vars, locals}, {parent, name}) => {
    const tagname = parent.tagName;
    let value = node.value;
    if (["INPUT", "SELECT", "TEXTAREA", "RADIO"].includes(tagname)) {
        const vname = getAttribute(parent, "name") || getAttribute(parent, "id");
        if (tagname === "SELECT" && parent.hasAttribute("multiple")) {
            value = value.split(",").map(value => tryCatchParse(value))
        } else {
            value = tryCatchParse(value);
        }
        vars.set(parent, vname, value, true);
    }
    parent.value = value;
}

const getHost = (node) => {
    if (!node) return;
    if (node.tagName === "BODY") return node;
    return node.host ? node.host : getHost(node.parentNode);
}

const getShadowRoot = (node) => {
    if (!node) return;
    if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE && node.host) {
        return node;
    }
    return getHost(node.parentNode);
}

const preserveKeyValues = (source, ...keys) => {
    return keys.reduce((preserved, key) => {
            if (source[key] !== undefined) preserved[key] = source[key];
            return preserved;
        }
        , {})
};

const restoreKeyValues = (target, preserved) => Object.values(([key, value]) => target[key] = value);

const renderScriptNode = (node, {vars, locals}) => {
    const args  = {...functions};
    for(const fname in args)  args[fname] = args[fname].bind(this,getHost(node),vars);
    args.Stores = Stores;
    Function(" {uses,imports,exports,shares,reacts,Stores}",node.innerHTML)(args);
    // todo  if (["onMount", "beforeUpdate", "afterUpdate"].includes(key)) {
    return;
}

const renderTextNode = (node, {vars, locals} = {}) => {
    if (node.__rendered__) return node;
    const defaults = {
        vars,
        locals
    }
    if (node.render) return node.render({vars, locals});
    if (node.nodeValue.includes("${")) {
        node.__template__ ||= node.nodeValue;
        (node.render = ({vars, locals} = defaults) => {
            setActiveNode(node);
            node.nodeValue = resolve(node.__template__, {vars, locals});
            node.__rendered__ = true;
        })({vars, locals})
    }
    return node;
}

const bindNode = (node, {vars, locals}, {parent, name, autobind, bindingRoot}) => {
    if (node.__bound__) return node;
    node.__bound__ = true;
    let [_, vname] = name.split(":"),
        value = parent.getAttribute("value");
    if (parent.tagName === "SELECT" && parent.hasAttribute("multiple")) {
        value = value.split(",").map(value => tryCatchParse(value))
    } else {
        value = tryCatchParse(value);
    }
    vname ||= getAttribute(parent, "name") || getAttribute(parent, "id");
    if (!vname) throw TypeError(`Can't bind node that has no id or name or variable name`);
    const variable = value != null ? vars.set(bindingRoot, vname, value, vars) : vars.get(bindingRoot, vname, vars);
    if (autobind === "reacts") variable.reacts(true);
    if (name.startsWith("bind:")) {
        parent.addEventListener("input", ({target}) => {
            const value = tryCatchParse(target.value);
            vars.set(bindingRoot, vname, value, vars);
        })
    }
    return node;
}

const Storage = () => {
    const _storage = new WeakMap();
    return {
        get(node, vname, storageProxy) {
            const _node = node;
            while (true) {
                let storage = _storage.get(node);
                if (!storage) {
                    if (node.host) { // handle navigating up from shadowDOM
                        storage = _storage.get(node.host);
                    }
                    if (!storage && !node.parentNode && !node.ownerElement) break;
                }
                if (storage) {
                    const variable = storage[vname];
                    if (variable !== undefined) return variable;
                }
                node = node.parentNode || node.ownerElement || node.host;
            }
            if (storageProxy) {
                this.use(_node, storageProxy, {[vname]: undefined});
                return this.get(_node, vname);
            }
        },
        set(node, vname, value, storageProxy) {
            if (value && typeof (value) === "object" && value instanceof Promise) {
                value.then(_value => {
                    value.__resolved__ = true;
                    this.set(node, vname, _value,storageProxy);
                    return value;
                }).catch((e) => {
                    value.__rejected__ = true;
                    this.set(node, vname, e+"",storageProxy);
                });
            }
            const _node = node;
            while (true) {
                let storage = _storage.get(node);
                if (!storage) {
                    if (node.host) { // handle navigating up from shadowDOM
                        storage = _storage.get(node.host);
                    }
                    if (!storage && !node.parentNode && !node.ownerElement) break;
                }
                if (storage) {
                    const variable = storage[vname];
                    if (variable !== undefined) {
                        variable.set(value);
                        return variable;
                    }
                }
                node = node.parentNode || node.ownerElement || node.host;
            }
            if (storageProxy) {
                this.use(_node, storageProxy, {[vname]: value});
                return this.get(_node, vname);
            } else {
                throw new TypeError(`${vname} is not used in node or node's parents`)
            }
        },
        use(node, storageProxy, ...variables) {
            const validate = (name) => {
                if (["use", "imports", "exports", "shares", "reacts", "valueOf", "promised", "rejected", "resolved"].includes(name)) {
                    throw new TypeError(`'${name} is a reserved word and can';t be used as a variable`)
                }
                return name;
            }
            let storage = _storage.get(node);
            if (!storage) {
                storage = {};
                _storage.set(node, storage);
            }
            for (let variable of variables) {
                let value;
                if (Array.isArray(variable)) {
                    value = variable[1];
                    variable = variable[0];
                    storage[variable] = Variable({
                        node,
                        value,
                        storage: this,
                        storageProxy,
                        name: validate(variable)
                    });
                    this[variable] = true; // so that a proxy can return the right key list
                } else if (variable && typeof (variable) === "object") {
                    Object.entries(variable).forEach(([vname, value]) => {
                        storage[vname] = Variable({
                            node,
                            value,
                            storage: this,
                            storageProxy,
                            name: validate(vname)
                        });
                        this[vname] = true; // so that a proxy can return the right key list
                    })
                } else if (typeof (variable) === "string") {
                    storage[variable] = Variable({
                        node,
                        value,
                        storage: this,
                        storageProxy,
                        name: validate(variable)
                    });
                    this[variable] = true; // so that a proxy can return the right key list
                }
            }
        }
    }
}

const StorageProxy = (storage) => new Proxy(storage, {
    get(target, property) {
        const value = target[property];
        if (typeof (value) === "function") return value.bind(target);
        if (typeof (property) === "symbol") return;
        const variable = target.get(getActiveNode(), property);
        return variable ? variable.valueOf() : variable;
    },
    set(target, property, value) {
        target.set(getActiveNode(), property, value);
        return true;
    }
})

class Store {};

const ValueProxy = (value,{store,key,target=value,path=[]}) => {
    if(!value || typeof(value)!=="object") return value
    const storeName = store.getName(),
        functions = {
            valueOf() { return value; }
        };
    return new Proxy(value,{
        get(_target,property) {
            if(property in functions) return functions[property];
            return _target[property];
        },
        set(_target,property,value) {
            if(property in functions) throw new Error(`Can't override ${property} for ${storeName}.${key}.${path.join(".")}`);
            let oldValue = _target[property];
            if(oldValue) oldValue = oldValue.valueOf();
            if(oldValue!==value) {
                _target[property] = ValueProxy(value,{store,key,target,path:[...path,property]});
                if(oldValue===undefined) {
                    store.publish({store:storeName,type:"create",key,target,path:[...path,property],value})
                } else {
                    store.publish({store:storeName,type:"change",key,target,path:[...path,property],value,oldValue})
                }
            }
            return true;
        },
        deleteProperty(_target,property) {
            const oldValue = _target[property];
            if(oldValue!==undefined) {
                delete _target[property];
                store.publish({store:storeName,type:"delete",key,target,path:[...path,property],value,oldValue})
            }
            return true;
        }
    })
}

const StoreProxy = (name) => {
    const _subscriptions = new Set(),
        functions = {
        subscribe(subscription) {
            _subscriptions.add(subscription);
            return () => _subcriptions.remove(subscription);
        },
        unsubscribe(subscription) {
            _subscriptions.remove(subscription);
        },
        publish(message) {
            [..._subscriptions].forEach(f => f(message))
        },
        protect() {
            _protected = true;
        },
        clearSubscriptions() {
            if(_protected) throw new Error(`Can't clear subscriptions on protected store ${name}`)
            _subscriptions.clear();
        },
        getName() {
            return name;
        }
    };
    let _protected;
    const proxy = new Proxy(new Store(),{
        get(target,property) {
            if(property in functions) return functions[property]
            return target[property];
        },
        set(target,property,value) {
            if(property in functions) throw new Error(`Can't override ${property} in store ${name}`)
            if(value===undefined && _protected) throw new Error(`Can't set ${property} to undefined in protected store ${name}`)
            const oldValue = target[property],
                type = typeof(value);
            if(oldValue!==value) {
                if(oldValue===undefined) {
                    functions.publish({store:name,eventType:"create",key:property,target:value,path:[],value:value})
                } else {
                    functions.publish({store:name,eventType:"change",key:property,target:value,path:[],value:value,oldValue})
                }
                target[property] = ValueProxy(value,{store:proxy,key:property});
            }
            return true;
        },
        deleteProperty(target,property) {
            if(_protected) throw new Error(`Can't delete property ${property} from protected store ${name}`)
            const oldValue = target[property];
            if(oldValue!==undefined) {
                delete target[property];
                functions.publish({store:name,eventType:"delete",key:property,path:[],oldValue})
            }
            return true;
        }
    });
    return proxy;
}

const Stores = (() => {
    return new Proxy({}, {
        get(target, property) {
            return target[property] ||= StoreProxy(property);
        },
        set(target,property) {
            throw new Error(`Can't create store ${property} without destructuring`)
        },
        deleteProperty(target,property) {
            const store = target[property];
            if(store) {
                Object.keys(store).forEach((key) => delete store[key]);
                store.clearSubscriptions();
            }
        }
    })
})();
window.Stores = Stores;

const tlx = (node = document.body) => {
    const slotContents = getSlotContents(node),
        {element, storageProxy, shadowRoot} = (register(node.tagName, node))({
            attributes: [...node.attributes],
            slotContents,
            source: node
        });
    node.replaceWith(element);
    element.render();
    const onmount = storageProxy.get(element, "onMount");
    if (onmount) {
        onMount(element);
    }
    return element;
}

const parser = new DOMParser();
tlx.import = async ({as, from}) => {
    const response = await fetch(from),
        text = await response.text(),
        dom = parser.parseFromString(text, "text/html");
    register(as, dom.body);
    while (dom.head.firstChild) document.head.appendChild(dom.head.firstChild);
}

const functions = {};
["uses","imports", "exports", "shares", "reacts","globals"].forEach((fname) => {
    functions[fname] = (node,vars,...variables) => {
        for (const variable of variables) {
            for (const vname in variable) {
                const value = variable[vname],
                    type = typeof(value);
                if(fname==="uses") {
                    vars.set(node, vname,value,vars)
                } else {
                    vars.set(node, vname,value,vars)[fname](true)
                }
                if(value && type==="object" && value instanceof Promise) {
                    vars.get(node, vname,value).reacts(true)
                }
            }
        }
    }
});

const globals = (...variables) => {
    for (const variable of variables) {
        for (const vname in variable) {
            window[vname] = variable[vname];
        }
    }
}

export {
    tlx,
    globals,
    Stores
}