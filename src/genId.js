// based on https://github.com/ai/nanoid, MIT License, enhanced to support NodeJS
export function genId(size=21){
		const me = typeof(self)==="undefined" ? this : self,
			crypto = typeof(module)==="undefined" ? me.crypto || me.msCrypto : require("crypto"),
			url = '_~getRandomVcryp0123456789bfhijklqsuvwxzABCDEFGHIJKLMNOPQSTUWXYZ',
			bytes = crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(size)) : crypto.randomFillSync(new Uint8Array(size));
	  let id = ''
	  while (0 < size--) {
	    id += url[bytes[size] & 63]
	  }
	  return id
	}
	
