export function deepFreeze(object,found=new Set()) {

  // Retrieve the property names defined on object
  var propNames = Object.getOwnPropertyNames(object);

  // Freeze properties before freezing self
  for (let name of propNames) {
    let value = object[name];
    if(value && typeof value === "object" && !found.has(value)) {
    	deepFreeze(value,found);
    }
  }

  return Object.freeze(object);
}