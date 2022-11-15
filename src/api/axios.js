//导入axios
import axios from 'axios'

const API = axios.create({
  timeout: 2000,
  responseType: 'arraybuffer',
})


export default API
