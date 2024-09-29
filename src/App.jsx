
import "./App.css"
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import Users from './User'

function App() {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route  path='/' element={<Users/>}></Route>
      <Route  path='/create' element={<Users/>}></Route>
      </Routes>
      </BrowserRouter>
     </>
  )
}

export default App
