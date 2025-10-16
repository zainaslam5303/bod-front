import './App.css';
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import PrivateComponent from './components/PrivateComponent';
import Login from './components/Login';
import Root from './components/Root';
function App() {
  return (
    <div className="">
      <BrowserRouter>
      <Root />
     {/* <h1>Hello Zain</h1> */}
     {/* <Nav /> */}
     
     </BrowserRouter>
    </div>
  );
}

export default App;
