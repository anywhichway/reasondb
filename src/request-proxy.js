import EventIterator from "event-iterator";
import implement from "./implement.js"

async function read() {
    const buffers = [];
    for await(const chunk of  EventIterator.stream.call(this)) {
        buffers.push(chunk)
    }
    this._buffer = Buffer.concat(buffers);
}
const extensions = {
    getHeader(name) {
        return this.headers[name.toLowerCase()];
    },
    async formData() {

    },
    async arrayBuffer() {
        if(this._buffer) {
            return this._buffer;
        }
        await read.call(this);
        return this._buffer;
    },
    async json() {
        if(this._buffer) {
            return this._buffer.toString();
        }
        await read.call(this);
        return JSON.parse(this._buffer.toString());
    },
    async text() {
        if(this._buffer) {
            return this._buffer.toString();
        }
        await read.call(this);
        return this._buffer.toString();
    }
}

function RequestProxy(nodeRequest) {
    return implement(nodeRequest,extensions)
}

export {RequestProxy as default, RequestProxy}