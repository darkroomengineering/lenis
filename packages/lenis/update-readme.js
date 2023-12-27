const fs = require('fs')
const packageJson = require('./package.json')

const readmePath = './README.md'

fs.readFile(readmePath, 'utf8', (err, data) => {
  if (err) {
    console.log(`Error reading README file: ${err}`)
    return
  }

  const updatedReadme = data.replace(
    /lenis@[0-9]+\.[0-9]+\.[0-9]+/i,
    'lenis@' + packageJson.version
  )

  fs.writeFile(readmePath, updatedReadme, 'utf8', (err) => {
    if (err) {
      return
    }
  })
})
