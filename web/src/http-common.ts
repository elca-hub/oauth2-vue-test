import axios, { AxiosInstance } from 'axios'

const apiClient: AxiosInstance = axios.create({
  // APIのURI
  baseURL: 'http://localhost:3000'
})

export default apiClient
