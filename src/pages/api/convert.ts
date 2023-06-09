import { NextApiResponse } from 'next'
import { IncomingMessage } from 'node:http'
import { spawn } from 'node:child_process'
import fs from 'fs'
import { IncomingForm, File } from 'formidable'
import mammoth from 'mammoth'

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function POST(req: IncomingMessage, res: NextApiResponse) {
  let response: Response = {
    docxHtml: null,
    latex: null,
  }

  if (req.method !== 'POST') {
    return res
      .status(404)
      .json({ error: 'Invalid request method' })
  }

  let convertedFileContent: string | null = null
  const form = new IncomingForm()
  
  form.parse(req, async (err, _fields, files) => {
    if (err) {
      console.error(err)
      return res
        .status(500)
        .json({ error: 'Failed to parse form data' })
    }

    let file: File = Array.isArray(files['file']) ? files['file'][0] : files['file']

    const docx2texPath = process.env.DOCX_2_TEX_ABSOLUTE_PATH

    if (!docx2texPath) {
      return res
        .status(400)
        .json({ error: 'Please provide an absolute path in .env for the d2t unix executable file' })
    }

    const { filepath } = file

    const renamedFilepath = `${filepath}.docx`
    fs.renameSync(filepath, renamedFilepath)

    mammoth.convertToHtml({ path: renamedFilepath })
      .then((result) => {
          const html = result.value
          response = { ...response, docxHtml: html }
      })
      .catch(function(error) {
          console.error(error)
          return res
            .status(500)
            .json({ error: 'Conversion failed' })
      })

    const conversionProcess = spawn(docx2texPath, [renamedFilepath])

    conversionProcess.on('close', code => {
      if (code !== 0) {
        return res
          .status(500)
          .json({ error: 'Conversion failed' })
      }

      const convertedFilePath = renamedFilepath.replace('.docx', '.tex')
      convertedFileContent = fs.readFileSync(convertedFilePath, 'utf-8')

      response = { ...response, latex: convertedFileContent }

      return res
        .status(200)
        .setHeader('Content-Type', 'text/plain')
        .json(response)
    })
  })
}

interface Response {
  docxHtml: string | null
  latex: string | null
}
