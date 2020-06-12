import React, {useEffect, useState, ChangeEvent, FormEvent} from "react"
import {Link, useHistory} from "react-router-dom"
import {FiArrowLeft} from "react-icons/fi"
import {Map, TileLayer, Marker} from "react-leaflet"
import {LeafletMouseEvent} from "leaflet"
import api from "../../services/api"
import axios from "axios"

import "./styles.css"
import logo from "../../assets/logo.svg"
import Dropzone from "../../components/Dropzone"

interface Item {
  id: number,
  title: string,
  image_url: string
}

interface IGBEUFResponse {
  sigla: string
}

interface IGBECityResponse{
  nome: string
}

const CreatePoint = () => {
    
  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [cidades, setCidades] = useState<string[]>([])
  const [selectedUf, setSelectedUf] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0])
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0])
  const [selectedFile, setSelectedFile] = useState<File>()
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    whatsapp: ""
  })  
  const history = useHistory()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
        const {latitude, longitude} = position.coords

        setInitialPosition([latitude, longitude])
    })
  }, [])
  
  useEffect(() => {
    api.get('items').then(response => {
        setItems(response.data)
    })
  }, [])

  useEffect(() => {
    axios.get<IGBEUFResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome").then(response =>{
        const uf_initials = response.data.map(uf => uf.sigla)

        setUfs(uf_initials)
    })
  }, [])

  useEffect(() => {
    //carregar as cidade sempres que a uf mudar
    if (selectedUf === '0') {return}

    axios.get<IGBECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`)
    .then(response => {
        const nome_cidade = response.data.map(cidade => cidade.nome)
        setCidades(nome_cidade)
    })
  }, [selectedUf])

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
    const uf = event.target.value
    setSelectedUf(uf)
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
    const city = event.target.value
    setSelectedCity(city)
  }

  function handleMapClick(event: LeafletMouseEvent){
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>){
    const {name, value} = event.target
    setFormData({...formData, [name]: value})
  }

  function handleSelectedItem(id: number){
    const alreadySelected = selectedItems.findIndex(item => item === id)

    if (alreadySelected >= 0) {
        const filteredItems = selectedItems.filter(item => item !== id)
        setSelectedItems(filteredItems)
    }
    else {setSelectedItems([...selectedItems, id])}
  }

  async function handleSubmit(event: FormEvent){
    event.preventDefault()

    const {nome, email, whatsapp} = formData
    const uf = selectedUf
    const city = selectedCity
    const [latitude, longitude] = selectedPosition
    const items = selectedItems

    const data = new FormData()

    data.append("nome", nome)
    data.append("email", email)
    data.append("whatsapp", whatsapp)
    data.append("uf", uf)
    data.append("city", city)
    data.append("latitude", String(latitude))
    data.append("longitude", String(longitude))
    data.append("items", items.join(","))
    
    if (selectedFile){ data.append("image", selectedFile) }

    await api.post('points', data)

    alert("Ponto de coleta criado com sucesso")

    history.push("/")
  }

  return(
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> ponto de coleta</h1>

        <Dropzone onFileUpload={setSelectedFile}/>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
                type="text"
                name="nome"
                id="nome"
                onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
                  type="email"
                  name="email"
                  id="email"
                  onChange={handleInputChange}
              />
            </div>
              <div className="field">
                <label htmlFor="whatsapp">Whatsapp</label>
                <input 
                    type="text"
                    name="whatsapp"
                    id="whatsapp"
                    onChange={handleInputChange}
                />
              </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <Marker position={selectedPosition}/>
          </Map>

          <div className="field-group">
            <div className="field">
                <label htmlFor="uf">Estado (UF)</label>
                <select 
                    name="uf" 
                    id="uf" 
                    value={selectedUf} 
                    onChange={handleSelectUf}
                >
                  <option value="0">Selecione uma UF</option>
                  {ufs.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
            </div>
            <div className="field">
                <label htmlFor="city">Cidade</label>
                <select 
                    name="city" 
                    id="city"
                    value={selectedCity}
                    onChange={handleSelectCity}
                >
                  <option value="0">Selecione uma cidade</option>
                  {cidades.map(cidade => (
                      <option key={cidade} value={cidade}>{cidade}</option>
                  ))}
                </select>
              </div>
            </div>
        </fieldset>

        <fieldset>
          <legend>
              <h2>Ítens de coleta</h2>
              <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
              {items.map(item => (
                <li 
                    key={item.id} 
                    onClick={() => handleSelectedItem(item.id)}
                    className={selectedItems.includes(item.id) ? "selected" : ""}
                >
                    <img src={item.image_url} alt={item.title}/>
                    <span>{item.title}</span>
                </li>
              ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  )
}

export default CreatePoint