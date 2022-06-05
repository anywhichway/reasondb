/*async function *cartesian(...generators) {
    generators = generators.map((generator) => { generator.cache = []; return generator; })
    let leftrow = 0;
    for await(const leftitem of generators[0]) {
        let rightrow = 0;
        do {
            const results = [leftitem];
            for (let i = 1; i < generators.length; i++) {
                const right = generators[i];
                if(rightrow<leftrow) {
                    results.push(right.cache[rightrow]);
                    continue;
                }
                const {done,value} = await right.next();
                if(!done) results.push(right.cache[rightrow] = value);
            }
            yield results;
            rightrow++
        } while(rightrow<=leftrow);
        leftrow++;
    }
}*/

//async function* cartesian(head, ...tail) { for await(let h of head) { const remainder = tail.length > 0 ? cartesian(...tail) : [[]]; for await(let r of remainder) yield [h, ...r] } }

async function* cartesian(head, ...tail) {
    const remainder = tail.length > 0 ? await cartesian(...tail) : [[]];
    for await(let r of remainder) for await(let h of head) yield [h, ...r];
}

export {cartesian as default,cartesian}