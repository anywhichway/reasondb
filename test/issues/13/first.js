// ** First script covers **
// Launch app
// Insert document
// Update document
// Observe that document is updated

'use strict'

const ReasonDB = require('reasondb')
const path = require('path')
const mkdirp = require('mkdirp')

const firstInsert = {
  firstname: "John",
  lastname: "Smith"
}

const updatedName = 'James'

class Person {

}

const First = function () {
  this.db_path = path.resolve(__dirname, 'db')
  mkdirp.sync(this.db_path) // Make the directory (seems to need to with JSONBlockStore)
  // For some reason, I also have to make the directories for all used Classes
  mkdirp.sync(this.db_path + '/Person')
  mkdirp.sync(this.db_path + '/Object') 
  mkdirp.sync(this.db_path + '/String')

  this.initDB()
  return this.insert(firstInsert).then((doc) => {
    console.log(`On insert, the returned document is ${doc[0].firstname} ${doc[0].lastname}. Success!`)
    this.get(firstInsert).then((docs) => {
      console.log(`On get, the returned document is ${docs[0].firstname} ${docs[0].lastname}. Success!`)
      firstInsert.firstname = updatedName
      this.update(firstInsert).then((success) => {
        if (success) {
          console.log(`On update, we get a '0' which seems to coincide with success`)
          this.get(firstInsert).then((doc) => {
            console.log(`On the second GET, the returned document is ${docs[0].firstname} ${docs[0].lastname}. Success!`)
          })
        }
      })
    })
  })
  // this.insert()
}

First.prototype.insert = function (values) {
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

First.prototype.update = function (values) {
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

First.prototype.get = function (values) {
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

First.prototype.initDB = function () {
  console.log(`Starting DB in ${this.db_path}`)
  this.db = new ReasonDB(this.db_path, "@key",ReasonDB.JSONBlockStore,false,true,{saveIndexAsync: true})
}

module.exports = function () {
  return new First()
}

module.exports = new First()

