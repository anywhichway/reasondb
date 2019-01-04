//cartesian cross-product that works with async asyncGenerator
export async function* cartesianAsyncGenerator(head,...asyncGenerators) {
  async function* doCartesian(i,prod) {
      for await (const item of asyncGenerators[i]()) {
      	prod = prod.concat(item);
      	if(prod.length===asyncGenerators.length+1) {
      		yield prod.slice();
      		prod.pop();
      	} else if(i < asyncGenerators.length - 1){
      		yield* await doCartesian(i + 1,prod);
      	}
      }
  }
  for await(const item of head()) {
  	for await(const combo of doCartesian(0,[item])) {
  		yield combo;
  	}
  }
}