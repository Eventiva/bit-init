import * as fs from 'fs'
import * as core from '@actions/core'
import run from './scripts/init'

try {
  const wsDir: string | undefined = process.env.WS_DIR
  const BIT_CLOUD_ACCESS_TOKEN: string | undefined =
    process.env.BIT_CLOUD_ACCESS_TOKEN
  const BIT_CONFIG_USER_TOKEN: string | undefined =
    process.env.BIT_CONFIG_USER_TOKEN

  if (!wsDir) {
    throw new Error('Workspace directory is not set')
  }

  process.env.GIT_USER_NAME =
    process.env.GIT_USER_NAME ?? core.getInput('GIT_USER_NAME')

  process.env.GIT_USER_EMAIL =
    process.env.GIT_USER_EMAIL ?? core.getInput('GIT_USER_EMAIL')

  process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? core.getInput('token')

  if (!BIT_CLOUD_ACCESS_TOKEN && !BIT_CONFIG_USER_TOKEN) {
    // Keeping backward compatibility for BIT_CONFIG_USER_TOKEN
    throw new Error('BIT_CLOUD_ACCESS_TOKEN environment variable is not set!')
  } else if (!BIT_CONFIG_USER_TOKEN) {
    process.env.BIT_CONFIG_USER_TOKEN = BIT_CLOUD_ACCESS_TOKEN
  }

  // eslint-disable-next-line github/no-then
  run(wsDir).then((): void => {
    // Set wsDir env for subsequent steps in GitHub Actions
    fs.appendFileSync(
      process.env.GITHUB_ENV as string,
      `WSDIR=${process.env.WSDIR}\n`
    )
    // Set Bit path for subsequent steps in GitHub Actions
    fs.appendFileSync(
      process.env.GITHUB_PATH as string,
      process.env.PATH as string
    )
    // Set BIT_CONFIG_USER_TOKEN env for subsequent steps in GitHub Actions
    fs.appendFileSync(
      process.env.GITHUB_ENV as string,
      `BIT_CONFIG_USER_TOKEN=${process.env.BIT_CONFIG_USER_TOKEN}\n`
    )
    // Set org env for subsequent steps in GitHub Actions
    fs.appendFileSync(
      process.env.GITHUB_ENV as string,
      `ORG=${process.env.ORG}\n`
    )
    // Set scope env for subsequent steps in GitHub Actions
    fs.appendFileSync(
      process.env.GITHUB_ENV as string,
      `SCOPE=${process.env.SCOPE}\n`
    )
    // Set Bit analytics reporting env for subsequent steps in GitHub Actions
    fs.appendFileSync(
      process.env.GITHUB_ENV as string,
      `BIT_CONFIG_ANALYTICS_REPORTING=${process.env.BIT_CONFIG_ANALYTICS_REPORTING}\n`
    )
    // Set Bit anonymous reporting env for subsequent steps in GitHub Actions
    fs.appendFileSync(
      process.env.GITHUB_ENV as string,
      `BIT_CONFIG_ANONYMOUS_REPORTING=${process.env.BIT_CONFIG_ANONYMOUS_REPORTING}\n`
    )
    // Set Bit interactive env for subsequent steps in GitHub Actions
    fs.appendFileSync(
      process.env.GITHUB_ENV as string,
      `BIT_CONFIG_INTERACTIVE=${process.env.BIT_CONFIG_INTERACTIVE}\n`
    )
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} catch (error: any) {
  core.setFailed(error.message)
}
