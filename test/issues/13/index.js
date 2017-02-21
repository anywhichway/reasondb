/* https://github.com/anywhichway/reasondb/issues/13

When using JSONBlockStore on the server, with clear=false, activate=true

Steps to reproduce:

Launch app
Insert document
Update document
Observe that document is updated (1)
Relaunch app
Get document (looks fine)
Update document
Observe that document is updated (2)
Relaunch app
Get document
Observe that document has reverted to the last version before the first App relaunch
*/

const ReasonDB = require("../../../src/index.js");
ReasonDB.JSONBlockStore = require("../../../src/drivers/JSONBlockStore.js")(ReasonDB);

let db = new ReasonDB("./test/issues/13/database","@key",ReasonDB.JSONBlockStore,false,true),
	doc = {test:0};
db.select().from({$o:Object}).where({$o: {test: {$gte: 0}}}).exec().then((cursor) => {
	if(cursor.maxCount>0) {
		cursor.forEach((row) => {
			doc = row[0];
			doc.test++;
			Object.index.store.compress();
			console.log("Verify that db/Object contains " + JSON.stringify(doc) + " then relaunch.");
		});
	} else {
		db.insert(doc).into(Object).exec().then(() => {
			Object.index.store.compress();
			console.log("Verify that db/Object contains " + JSON.stringify(doc)  + " then relaunch.");
		});
	}
});