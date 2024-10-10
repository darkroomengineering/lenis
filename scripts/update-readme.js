import fs from 'fs'
import packageJson from '../package.json' assert { type: 'json' }

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
        /\/lenis@([^\/]+)\//g,
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

if (!packageJson.version.includes('-dev')) {
  updateVersion()
}
