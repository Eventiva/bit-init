import * as fs from 'fs'
import * as path from 'path'
import * as jsoncParser from 'jsonc-parser'
import core from '@actions/core'
import { exec } from '@actions/exec'

/**
 *
 */
const run = async (wsdir: string): Promise<void> => {
  const wsDirPath = path.resolve(wsdir)

  // sets wsdir env for dependent tasks usage
  process.env.WSDIR = wsdir
  process.env.GIT_USER_NAME =
    process.env.GIT_USER_NAME ?? core.getInput('GIT_USER_NAME')
  process.env.GIT_USER_EMAIL =
    process.env.GIT_USER_EMAIL ?? core.getInput('GIT_USER_EMAIL')
  process.env.BIT_CLOUD_ACCESS_TOKEN =
    process.env.BIT_CLOUD_ACCESS_TOKEN ??
    core.getInput('BIT_CLOUD_ACCESS_TOKEN')
  process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? core.getInput('token')

  const wsFile = path.join(wsDirPath, 'workspace.jsonc')
  const workspace = fs.readFileSync(wsFile).toString()

  // sets org and scope env for dependent tasks usage
  const workspaceObject = jsoncParser.parse(workspace)
  const defaultScope =
    workspaceObject['teambit.workspace/workspace'].defaultScope
  const [Org, Scope] = defaultScope.split('.')
  process.env.ORG = Org
  process.env.SCOPE = Scope

  // install bvm and bit
  const bitEngineVersion = workspaceObject['teambit.harmony/bit']?.engine || ''

  await exec('npm i -g @teambit/bvm')
  await exec(`bvm install ${bitEngineVersion} --use-system-node`)
  // sets path for current step
  process.env.PATH = `${process.env.HOME}/bin:${process.env.PATH}`

  // config bit/npm for CI/CD
  process.env.BIT_CONFIG_ANALYTICS_REPORTING = 'false'
  process.env.BIT_CONFIG_ANONYMOUS_REPORTING = 'false'
  process.env.BIT_CONFIG_INTERACTIVE = 'false'

  // bit install dependencies
  await exec('bit install', [], { cwd: wsdir })
}

export default run
