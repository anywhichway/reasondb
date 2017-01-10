// ** First script covers **
// Relaunch app
// Get document (looks fine)
// Update document
// Observe that document is updated (2)

'use strict'

const ReasonDB = require('reasondb')
const path = require('path')
const mkdirp = require('mkdirp')

const secondInsert = {
  firstname: "James",
  lastname: "Smith"
}

const updatedName = 'Jack'

class Person {

}

const Second = function () {
  this.db_path = path.resolve(__dirname, 'db')

  this.initDB()
  this.get(secondInsert).then((docs) => {
    console.log(`On third get, the returned document is ${docs[0].firstname} ${docs[0].lastname}. Success!`)
    secondInsert.firstname = updatedName
    this.update(secondInsert).then((success) => {
      if (success) {
        console.log(`Again, on update, we get a '0' which seems to coincide with success`)
        this.get(secondInsert).then((doc) => {
          console.log(`On the fourth GET, the returned document is ${docs[0].firstname} ${docs[0].lastname}. Success!`)
        })
      }
    })
  })
}

Second.prototype.insert = function (values) {
  return new Promise((resolve, reject) => {
    return this.db.insert(values)
    .into(Person)
    .exec()
    .then((doc, err) => {
      if (err) return reject(err)
      return resolve(doc)
    })
  })
}

Second.prototype.update = function (values) {
  return new Promise((resolve, reject) => {
    return this.db.update({$p: Person})
    .set({$p: values})
    .where({$p: {lastname: {$eq: values.lastname}}})
    .exec()
    .then((res) => {
      resolve(res === 0)
    })
  })
}

Second.prototype.get = function (values) {
  let results = []
  return new Promise((resolve, reject) => {
    return this.db
    .select()
    .from({$p: Person})
    .where({$p: values})
    .exec()
    .then((cursor) => {
      return cursor.forEach((row) => {
          results.push(row[0])
        }).then(() => {
          resolve(results)
        })
    }).catch((e) => {
      console.log(e)
    })
  })
}

Second.prototype.initDB = function () {
  console.log(`Starting DB in ${this.db_path}`)
  this.db = new ReasonDB(this.db_path, "@key",ReasonDB.JSONBlockStore,false,true,{saveIndexAsync: true})
}

module.exports = function () {
  return new Second()
}

module.exports = new Second()

