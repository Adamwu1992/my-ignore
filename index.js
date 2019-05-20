#!/usr/bin/env node

const figlet = require('figlet')
const fs = require('fs')
const https = require('https')

function fetchJSON(type) {

  return new Promise((resolve, reject) => {
    https.get('https://www.gitignore.io/api/list?format=json', function(res) {

      let raw = ''
      res.on('data', function(chunk) {
        raw += chunk.toString('utf-8')
      })

      res.on('error', reject)
    
      res.on('end', function() {
        const json = JSON.parse(raw)
        resolve(type ? json[type] : json)
      })
    })
  })
}

function writeIgnoreFile(contents) {

  function write(contents) {
    return new Promise((resolve, reject) => {
      fs.writeFile('.gitignore', contents, function(err) {
        err ? reject(err) : resolve()
      })
    })
  }

  return new Promise((resolve, reject) => {
    const path = '.gitignore'
    fs.open(path, 'wx', function(err, fd) {
      if (err) {
        if (err.code !== 'EEXIST') {
          reject(err)
          return
        }
        // 文件已存在
        fs.rename(path, `${path}.${Date.now()}`, function(err) {
          if (err) {
            reject(err)
          } else {
            write(contents).then(resolve)
          }
        })
      } else {
        write(contents).then(resolve)
      }
    })
  })
}

function print(msg) {
  figlet.text(msg, {
    font: 'isometric2',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  }, (err, data) => {
    if (err) {
      throw err
    }
    console.log(data)
  })
}

const args = process.argv.slice(2)

if (args && (args.includes('--test') || args.includes('-t'))) {
  print('very six')
} else {
  fetchJSON('node')
    .then(json => writeIgnoreFile(json.contents))
    .then(() => {
      print('very six')
    })
}
