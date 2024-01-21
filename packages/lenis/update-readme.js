const fs = require('fs')
const packageJson = require('./package.json')

const readmePath = './README.md'

function updateVersion() {
  return new Promise((resolve, reject) => {
    // update version in README
    fs.readFile(readmePath, 'utf8', (err, data) => {
      if (err) {
        console.log(`Error reading README file: ${err}`)
        return reject(err)
      }

      const updatedReadme = data.replace(
        /\/lenis@([^\/]+)\//,
        `/lenis@${packageJson.version}/`
      )

      fs.writeFile(readmePath, updatedReadme, 'utf8', (err) => {
        resolve()

        if (err) {
          return reject(err)
        }
      })
    })
  })
}

function copyReadme() {
  // copy README to root (both NPM and Github display the right README)
  fs.readFile(readmePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading source file: ${err.message}`)
      return
    }

    // Write the content to the destination file
    fs.writeFile('../../README.md', data, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing to destination file: ${err.message}`)
      } else {
        console.log('File copied successfully!')
      }
    })
  })
}

updateVersion().then(() => copyReadme())
