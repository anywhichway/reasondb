import copy from "fast-copy";

const implement = (target, extensions) => {
    extensions = copy(extensions);
    const proxy = new Proxy(target, {
        get(target, property) {
            const extension = extensions[property];
            if (extension) {
                if (typeof (extension) === "function") {
                    return extension.bind(proxy);
                }
                return extension;
            }
            return target[property];
        }
    })
    return proxy;
}

export {implement as default,implement}

