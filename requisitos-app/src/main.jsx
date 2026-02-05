import './index.css'
import ReactDOM from "react-dom/client"
import { RouterProvider } from 'react-router-dom'
import {router} from "./app/router"
//import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
