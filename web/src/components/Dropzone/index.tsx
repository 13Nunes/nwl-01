import React, { useCallback, useState } from "react"
import { FiUpload } from "react-icons/fi"
import { useDropzone } from "react-dropzone"

import "./styles.css"

interface Props{
  onFileUpload: (file: File) => void
}

const Dropzone: React.FC<Props> = ({onFileUpload}) => {

  const [selectedFileURL, setselectedFileURL] = useState('')

  const onDrop = useCallback(acceptedFiles => {
      
    const file = acceptedFiles[0]
    const fileURL = URL.createObjectURL(file)

    setselectedFileURL(fileURL)
    onFileUpload(file)

  }, [onFileUpload])

  const { getRootProps, getInputProps } = useDropzone({
      onDrop,
      accept: "image/*"
  })

  return(
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} accept="image/*"/>
      {
        selectedFileURL ? 
        <img src={selectedFileURL} alt="Point Thumbail"/> :
        (
        <p>
          <FiUpload />
          Clique para selecionar uma imagem para este estabelecimento, ou arraste aqui para dentro.
        </p>
        )
      }
    </div>
  )
}

export default Dropzone