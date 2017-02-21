(function() {
	module.exports = function(ReasonDB) {
		const fs = require("fs");
		
		function blockString(block,encoding="utf8") {
			return "[" + bytePadEnd(block[0]+"",20," ",encoding) + "," + bytePadEnd(block[1]+"",20," ",encoding) + "]";
		}
	
		function bytePadEnd(str,length,pad,encoding="utf8") {
			const needed = length - Buffer.byteLength(str,encoding);
			if(needed>0) {
				return str + Buffer.alloc(needed," ",encoding).toString(encoding);
			}
			return str;
		}
	
		class JSONBlockStore extends ReasonDB.Store {
			constructor(name,keyProperty,db,clear) {
				super(name,keyProperty,db);
				this.path = db.name + "/" + name;
				this.encoding = "utf8";
				this.opened = false;
				if(clear) {
					this.clear();
				}
			}
			open() { // also add a transactional file class <file>.json, <file>.queue.json, <file>.<line> (line currently processing), <file>.done.json (lines processed)
				try {
					this.freefd = fs.openSync(this.path + "/free.json","r+");
				} catch(e) {
					this.freefd = fs.openSync(this.path + "/free.json","w+");
				}
				try {
					this.blocksfd = fs.openSync(this.path + "/blocks.json","r+"); // r+ block offsets and lengths for ids
				} catch(e) {
					this.blocksfd = fs.openSync(this.path + "/blocks.json","w+");
				}
				try {
					this.storefd = fs.openSync(this.path + "/store.json","r+"); // the actual data
				} catch(e) {
					this.storefd = fs.openSync(this.path + "/store.json","w+");
				}
				const blocks = fs.readFileSync(this.path + "/blocks.json",this.encoding),  // {<id>:{start:start,end:end,length:length}[,...]}
					freestat = fs.statSync(this.path + "/free.json"),
					blocksstat = fs.statSync(this.path + "/blocks.json"),
					storestat = fs.statSync(this.path + "/store.json");
				let free = fs.readFileSync(this.path + "/free.json",this.encoding); // [{start:start,end:end,length:length}[,...]]
				if(free.length===0) {
					this.free = [];
				} else {
					free = free.trim();
					if(free[0]===",") {
						free = free.substring(1);
					}
					if(free[free.length-1]===",") {
						free = free.substring(0,free.length-1);
					}
					this.free= JSON.parse("["+free+"]");
				}
				this.blocks = (blocks.length>0 ? JSON.parse(blocks) : {});
				this.freeSize = freestat.size;
				this.blocksSize = blocksstat.size;
				this.storeSize = storestat.size;
				this.opened = true;
				return true;
			}
			alloc(length,encoding="utf8") {
				const me = this;
				let block;
				if(!me.alloc.size) {
					me.alloc.size = Buffer.byteLength(blockString([0,0],encoding),encoding);
					me.alloc.empty = bytePadEnd("null",me.alloc.size," ",encoding);
				}
				for(var i=0;i<me.free.length;i++) {
					block = me.free[i];
					if(block && block[1]-block[0]>=length) {
						let position = ((me.alloc.size+1) * i);
						me.free[i] = null;
						fs.writeSync(me.freefd,me.alloc.empty,position,encoding);
						return block;
					}
				}
				let start = (me.storeSize===0 ? 0 : me.storeSize+1);
				return [start, start+length];
			}
			async clear() {
				if(!this.opened) {
					this.open();
				}
				fs.ftruncateSync(this.freefd);
				fs.ftruncateSync(this.blocksfd);
				fs.ftruncateSync(this.storefd);
				this.freeSize = 0;
				this.blocksSize = 0;
				this.storeSize = 0;
				this.free = [];
				this.blocks = {};
			}
			compress() {
				const me = this;
				if(!me.opened) {
					me.open();
				}
				let newfree = [];
				me.freeSize = 0;
				me.free.forEach((block,i) => {
					if(block) {
						newfree.push(block);
						let str = blockString(block,me.encoding)+",";
						fs.writeSync(me.freefd,str,me.freeSize,me.encoding);
						me.freeSize += Buffer.byteLength(str,me.encoding);
					}
				});
				me.free = newfree;
				fs.ftruncateSync(me.freefd,me.freeSize);
				me.blocksSize = 1;
				me.storeSize = 0;
				fs.writeSync(me.blocksfd,"{",0,me.encoding);
				Object.keys(me.blocks).forEach((key,i) => {
					let str = '"'+key+'":' + JSON.stringify(me.blocks[key])+",";
					fs.writeSync(me.blocksfd,str,me.blocksSize,me.encoding);
					me.blocksSize += Buffer.byteLength(str,me.encoding);		
				});
				fs.writeSync(me.blocksfd,"}",me.blocksSize-1,me.encoding);
				fs.ftruncateSync(me.blocksfd,me.blocksSize);
			}
			async delete(id) {
				const me = this;
				if(!me.opened) {
					me.open();
				}
				const block = me.blocks[id];
				if(block) {
					const blanks = bytePadEnd("",block[1]-block[0],me.encoding);
					delete me.blocks[id];
					fs.writeSync(me.storefd,blanks,block[0],"utf8"); // write blank padding
					me.free.push(block);
					let str = blockString(block,me.encoding)+",";
					fs.writeSync(me.freefd,str,me.freeSize,me.encoding);
					me.freeSize += Buffer.byteLength(str,me.encoding);
					str = (me.blocksSize===0 ? '{' : ',')+'"'+id+'":null}';
					const fposition = (me.blocksSize===0 ? 0 : me.blocksSize-1);
					fs.writeSync(me.blocksfd,str,fposition,me.encoding);
					me.blocksSize = fposition + Buffer.byteLength(str,me.encoding);
				}
			}
			async get(id) {
				const me = this;
				if(!me.opened) {
					me.open();
				}
				const block = me.blocks[id];
				if(block) {
					const buffer = Buffer.alloc(block[1]-block[0]);
					fs.readSync(me.storefd,buffer,0,block[1]-block[0],block[0]);
					const result = JSON.parse(buffer.toString());
					return super.restore(result.value);
				}
			}
			async set(id,data,normalize) {
				const me = this;
				return super.set(id,data,normalize,(normalized) => new Promise((resolve,reject) => {
					if(!me.opened) {
						me.open();
					}
					const block = me.blocks[id];
					let str = '{"id":"'+id+'","value":'+JSON.stringify(normalized)+'}';
					const blen = Buffer.byteLength(str, 'utf8');
					if(block) { // if normalized already stored
						if((block[0] + blen) - 1 < block[1]) { // and update is same or smaller
							fs.writeSync(me.storefd,bytePadEnd(str,(block[1]-block[0]),me.encoding),block[0],me.encoding); // write the normalized with blank padding
							resolve(true)
						}
					}
					const freeblock = me.alloc(blen,me.encoding); // find a free block large enough
					fs.writeSync(me.storefd,bytePadEnd(str,(freeblock[1]-freeblock[0]),me.encoding),freeblock[0]); // write the normalized with blank padding
					me.storeSize = Math.max(freeblock[1],me.storeSize);
					me.blocks[id] = freeblock; // update the blocks info
					if(block) { // free old block which was too small, if there was one
						fs.writeSync(me.storefd,bytePadEnd("",(block[1]-block[0])," "),block[0],me.encoding); // write blank padding
						me.free.push(block);
						str = blockString(block,me.encoding)+",";
						fs.writeSync(me.freefd,str,me.freeSize,me.encoding);
						me.freeSize += Buffer.byteLength(str,me.encoding);
					}
					str = (me.blocksSize===0 ? '{' : ',')+'"'+id+'":'+JSON.stringify(freeblock)+"}";
					const fposition = (me.blocksSize===0 ? 0 : me.blocksSize-1);
					fs.writeSync(me.blocksfd,str,fposition,me.encoding);
					me.blocksSize = fposition + Buffer.byteLength(str,me.encoding);
					resolve(true);
				}));
			}
		}
		return JSONBlockStore;
	}
}).call(this);