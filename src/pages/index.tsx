import React, { useState, useCallback } from 'react'
import Head from 'next/head'
import { Inter } from 'next/font/google'
import { useDropzone } from 'react-dropzone'
import c from '../styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [data, setData] = useState({ docxHtml: null, latex: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setLoading(true)
    if (acceptedFiles?.length) {
      const file = acceptedFiles[0]
      const formData = new FormData()
      formData.append('file', file)
      const data = await fetch(process.env.NEXT_PUBLIC_CONVERT_TEX_2_DOCX_ENDPOINT!, {
        method: 'POST',
        body: formData
      })
        .then(res => {
          return res.ok
            ? res.json()
            : (
              setLoading(false),
              setError(true)
            )
        })
        .then(data => {
          setLoading(false)
          return data
        })
        .catch(_ => {
          setLoading(false)
          setError(true)
        })
      setData(data)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    onDrop
  })

  const shouldRenderContent = data?.docxHtml && data?.latex && !loading && !error

  return (
    <>
      <Head>
        <title>docx2tex viewer</title>
        <meta name='description' content='Drop here the docx file and watch its LaTeX version' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <header className={c.header}>
          docx2tex
      </header>
      <main className={`${c.main} ${inter.className}`}>
        <form className={c.form}>
          <div
            {...getRootProps({
              className: c.dropzoneContainer
            })}
          >
            <input {...getInputProps()} />
            <div>
              {isDragActive ? (
                <p>Отпустите здесь ...</p>
              ) : (
                <p>Перетащите docx файл сюда или кликните</p>
              )}
            </div>
          </div>
        </form>

        {loading && 'загрузка...'}
        {error && 'что-то пошло не так'}

        {shouldRenderContent && (
          <div className={c.docxHtmlAndLatex}>
            <div dangerouslySetInnerHTML={{ __html: data.docxHtml! }} className={c.docxHtml}></div>
            <div className={c.latexContainer}>
              <code className={c.latexContent}>
                {data.latex}
              </code>
            </div>
        </div>)}
      </main>
    </>
  )
}
