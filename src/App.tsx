import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContextProvider } from '../src/Context/CommonContext';
import Admin from './Pages/Admin';
import Footer from './Pages/Footer';
import Hotwheels from './Pages/Hotwheels';
import Home from './Pages/Home';
import Cart from './Pages/Cart';

const App = () => {
  return (
    <ContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Admin" element={<Hotwheels />} />
          <Route path="/Cart" element={<Cart />} />
        </Routes>
        <Footer />
      </Router>
      <div style={{ height: '65px' }} />
    </ContextProvider>
  );
};

export default App;
