
	"use strict";
	/* Copyright 2017,2018, AnyWhichWay, Simon Y. Blackwell, MIT License
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
	*/
	const cleaner = (data,extensions={},options=cleaner.options) => {
		// include extensions, to exclude standard options pass {coerce:[],accept:[],reject:[],escape:[],eval:false} as third argument
		options = Object.keys(options).reduce((accum,key) =>
			{
				if(Array.isArray(options[key])) { // use union of arrays
					accum[key] = (extensions[key]||[]).reduce((accum,item) => { accum.includes(item) || accum.push(item); return accum; },options[key].slice());
				} else if(typeof(extensions[key])==="undefined") {
					accum[key] = options[key];
				} else {
					accum[key] = extensions[key];
				}
				return accum;
			},
			{});
		// data may be safe if coerced into a proper format
		data = options.coerce.reduce((accum,coercer) => coercer(accum),data);
		//these are always safe
		if(options.accept.some(test => test(data))) return data;
		//these are always unsafe
		if(options.reject.some(test => test(data))) return;
		//remove unsafe data from arrays
		if(Array.isArray(data)) {
			data.forEach((item,i) => data[i] = cleaner(item));
			return data;
		}
		//recursively clean data on objects
		if(data && typeof(data)==="object") {
			for(let key in data) {
				const cleaned = cleaner(data[key]);
				if(typeof(cleaned)==="undefined") {
					delete data[key];
				} else {
					data[key] = cleaned;
				}
			}
			return data;
		}
		if(typeof(data)==="string") {
			data = options.escape.reduce((accum,escaper) => escaper(accum),data); // escape the data
			if(options.eval) {
				try {
					// if data can be converted into something that is legal JavaScript, clean it
					// make sure that options.reject has already removed undesireable self evaluating or blocking functions
					// call with null to block global access
					return cleaner(Function("return " + data).call(null));
				} catch(error) {
					// otherwise, just return it
					return data;
				}
			}
		}
		return data;
	}
// statically merge extensions into default options
	cleaner.extend = (extensions) => {
		const options = cleaner.options;
		cleaner.options = Object.keys(options).reduce((accum,key) =>
			{
				if(Array.isArray(options[key])) { // use union of arrays
					accum[key] = (extensions[key]||[]).reduce((accum,item) => { accum.includes(item) || accum.push(item); return accum; },options[key].slice());
				} else if(typeof(extensions[key])==="undefined") {
					accum[key] = options[key];
				} else {
					accum[key] = extensions[key];
				}
				return accum;
			},
			{});
	}
// default options/support for coerce, accept, reject, escape, eval
	cleaner.options = {
		coerce: [],
		accept: [data => !data || ["number","boolean"].includes(typeof(data))],
		reject: [
			// executable data
			data => typeof(data)==="function",
			// possible server execution like <?php
			data => typeof(data)==="string" && data.match(/<\s*\?\s*.*\s*/),
			// direct eval, might block or negatively impact cleaner itself,
			data => typeof(data)==="string" && data.match(/eval|alert|prompt|dialog|void|cleaner\s*\(/),
			// very suspicious,
			data => typeof(data)==="string" && data.match(/url\s*\(/),
			// might inject nastiness into logs,
			data => typeof(data)==="string" && data.match(/console\.\s*.*\s*\(/),
			// contains javascript,
			data => typeof(data)==="string" && data.match(/javascript:/),
			// arrow function
			data => typeof(data)==="string" && data.match(/\(\s*.*\s*\)\s*.*\s*=>/),
			// self eval, might negatively impact cleaner itself
			data => typeof(data)==="string" && data.match(/[Ff]unction\s*.*\s*\(\s*.*\s*\)\s*.*\s*\{\s*.*\s*\}/),
		],
		escape: [
			data => { // handle possible query strings
				if(typeof(data)==="string" && data[0]==="?") {
					const parts = data.split("&");
					let max = parts.length;
					return parts.reduce((accum,part,i) => {
						const [key,value] = decodeURIComponent(part).split("="),
							type = typeof(value), // if type undefined, then may not even be URL query string, so clean "key"
							cleaned = (type!=="undefined" ? cleaner(value) : cleaner(key));
						if(typeof(cleaned)!=="undefined") {
							// keep only those parts of query string that are clean
							accum += (type!=="undefined" ? `${key}=${cleaned}` : cleaned) + (i<max-1 ? "&" : "");
						} else {
							max--;
						}
						return accum;
					},"?");
				}
				return data;
			}/*, // will not work with slndr
			data => { // handle escaping html entities
				if(typeof(data)==="string" && data[0]!=="?" && typeof(document)!=="undefined") {
					// on client or a server DOM is operable
					const div = document.createElement('div');
					div.appendChild(document.createTextNode(data));
					return div.innerHTML;
				}
				return data;
			}*/
		],
		eval: true
	}
	function setAttribute(name,value) {
		const cleaned = (name.indexOf("on")===0 ? value : cleaner(value));
		if(typeof(cleaned)!=="undefined") {
			this.__setAttribute__(name,cleaned);
		}
	}
	cleaner.protect = (el) => {
		if(typeof(el.value)!=="undefined") {
			const get = () => get._value,
				set = (value) => {
					const cleaned = cleaner(value);
					if(typeof(cleaned)!=="undefined") {
						get._value = cleaned;
					}
				};
			// save current value;
			get.__value = cleaner(el.value);
			// re-define the value property so data is cleaned
			Object.defineProperty(el,"value",{enumerable:true,
				configurable:true,
				get,set});
		}
//redefine setAttribute so it works with cleaned value
		if(el.setAttribute!==setAttribute) {
			Object.defineProperty(el,"__setAttribute__",{enumerbale:false,configurable:true,writable:true,value:el.setAttribute});
			el.setAttribute = setAttribute;
		}
		for(let child of [].slice.call(el.children)) {
			cleaner.protect(child);
		}
		return el;
	}

	if(typeof(window)!=="undefined") {
// on client or a server pseudo window is available
		if(window.prompt) {
			const _prompt = window.prompt.bind(window);
			window.prompt = function(title) {
				const input = _prompt(title),
					cleaned = cleaner(input);
				if(typeof(cleaned)=="undefined") {
					window.alert("Invalid input: " + input);
				} else {
					return cleaned;
				}
			}
		}
		window.addEventListener("DOMContentLoaded",() => {
			if(typeof(document)!=="undefined") {
//on client or a server DOM is operable
				const _documentCreateElement =
					document.createElement.bind(document);
				document.createElement = function(tagName,options) {
					return cleaner.protect(_documentCreateElement(tagName,options));
				}
			}
			cleaner.protect(document.head);
			cleaner.protect(document.body);
		});
	}

export {cleaner as default};