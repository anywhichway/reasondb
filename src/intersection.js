//from https://gist.github.com/lovasoa/3361645 + length==1 mod by AnyWhichWay
export function intersection(){
	if(arguments.length===0) return []; 
	if(arguments.length===1) return arguments[0].slice(); 
	var a,b,c,d,e,f,g=[],h={},i;
	i=arguments.length-1;
	d=arguments[0].length;
	c=0;
	for(a=0;a<=i;a++){
		e=arguments[a].length;
		if(e<d){c=a;d=e}
	}
	for(a=0;a<=i;a++){
		e=a===c?0:a||c;f=arguments[e].length;
		for(var j=0;j<f;j++){
			var k=arguments[e][j];
			if(h[k]===a-1){
				if(a===i){
					g.push(k);h[k]=0
				} else {
					h[k]=a
				}
			}
			else if(a===0){
				h[k]=0
			}
		}
	}
	return g;
}