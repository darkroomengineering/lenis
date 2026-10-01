import fs from 'node:fs'
import packageJson from '../package.json' with { type: 'json' }

const readmePath = './README.md'
const pluginPath = './plugin.json'

function updateVersion() {
  return new Promise((resolve, reject) => {
    // update version in README
    fs.readFile(readmePath, 'utf8', (err, data) => {
      if (err) {
        console.log(`Error reading README file: ${err}`)
        return reject(err)
      }

      const updatedReadme = data.replace(
        /\/lenis@([^/]+)\//g,
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

// keep the agent plugin manifest on the published version
function updatePluginVersion() {
  const plugin = fs.readFileSync(pluginPath, 'utf8')
  fs.writeFileSync(
    pluginPath,
    plugin.replace(/"version": "[^"]+"/, `"version": "${packageJson.version}"`)
  )
}

if (!packageJson.version.includes('-dev')) {
  updateVersion()
  updatePluginVersion()
}
