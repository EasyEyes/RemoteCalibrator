/* eslint-disable no-undef */

const process = require('process')
const fs = require('fs')
const XLSX = require('xlsx')
const google = require('googleapis')

const auth = new google.Auth.GoogleAuth({
  keyFile: `${__dirname}/credentials.json`,
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
})

async function processLanguageSheet() {
  const spreadsheetId = '1UFfNikfLuo8bSromE34uWDuJrMPFiJG3VpoQKdCGkII'
  const googleSheets = new google.sheets_v4.Sheets()
  const rows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: 'Sheet1',
  })

  const rowsJSON = XLSX.utils.sheet_to_json(
    XLSX.utils.aoa_to_sheet(rows.data.values),
    {
      defval: '',
    }
  )

  const data = {}
  for (let phrase of rowsJSON) {
    const { language, ...translations } = phrase
    if (language.includes('RC_') || language.includes('EE_'))
      data[language] = translations
  }

  const exportWarning = `/*
  Do not modify this file! Run npm \`npm run phrases\` at ROOT of this project to fetch from the Google Sheets.
  https://docs.google.com/spreadsheets/d/1UFfNikfLuo8bSromE34uWDuJrMPFiJG3VpoQKdCGkII/edit#gid=0
*/\n\n`
  const exportHandle = `export const phrases = `

  fs.writeFile(
    `${process.cwd()}/src/i18n.js`,
    exportWarning + exportHandle + JSON.stringify(data) + '\n',
    error => {
      if (error) {
        console.log("Error! Couldn't write to the file.", error)
      } else {
        console.log(
          'EasyEyes International Phrases fetched and written into files successfully.'
        )
      }
    }
  )
}

require('dns').resolve('www.google.com', function (err) {
  if (err) {
    console.log('No internet connection. Skip fetching phrases.')
  } else {
    console.log('Fetching up-to-date phrases...')
    processLanguageSheet()
  }
})
