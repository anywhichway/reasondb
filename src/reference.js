class Reference {
    constructor(key) {
        this.key = key+"";
    }
    valueOf() {
        return this.key;
    }
}

export {Reference as default,Reference}