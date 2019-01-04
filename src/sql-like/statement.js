export class Statement {
	constructor(db) {
		this.db = db;
	}
	async exec() {
		return this.query();
	}
}