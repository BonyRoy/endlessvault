import React, { useState, useRef, useContext, useEffect } from 'react';
import Webcam from 'react-webcam';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../Common Files/firebase';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { CommonContext } from '../Context/CommonContext';
import { Camera, UploadCloud, Home, Lock, User } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CarouselComponent from '../Common Files/CarouselComponent';
import Admin from './Admin';
import { useNavigate } from 'react-router-dom';

const Hotwheels = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  const navigate = useNavigate();

  // Hardcoded credentials
  const HARDCODED_USERNAME = 'siddhantroy225';
  const HARDCODED_PASSWORD = 'Lipi@2007';

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const webcamRef = useRef(null);
  const [mode, setMode] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    brand: 'Hotwheels',
    name: '',
    series: '',
    mrp: '',
    base64Image: '',
  });
  const { triggerReload } = useContext(CommonContext);

  const [generatedJson, setGeneratedJson] = useState(null);
  const [error, setError] = useState('');

  const generateShortUUID = () => uuidv4().replace(/-/g, '').slice(0, 7);

  const handleLogin = (e) => {
    e.preventDefault();

    if (
      loginData.username === HARDCODED_USERNAME &&
      loginData.password === HARDCODED_PASSWORD
    ) {
      setIsAuthenticated(true);
      toast.success('Login successful!');
    } else {
      toast.error('Unauthorized - Invalid credentials!');
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          base64Image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPreviewImage(imageSrc);
    setFormData((prev) => ({
      ...prev,
      base64Image: imageSrc,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const { brand, name, series, mrp, base64Image } = formData;

    if (!brand || !name || !series || !mrp || !base64Image) {
      toast.error('Please fill out all fields and provide an image.');
      return;
    }

    let uniqueId = generateShortUUID();

    const isUniqueIdExist = async (id) => {
      const q = query(collection(db, 'hotwheels'), where('uniqueId', '==', id));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    };

    while (await isUniqueIdExist(uniqueId)) {
      uniqueId = generateShortUUID();
    }

    const data = {
      brand,
      name,
      series,
      mrp,
      uniqueId,
      image: base64Image,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'hotwheels'), data);
      setGeneratedJson(data);
      setError('');
      triggerReload();
      toast.success('Saved to Firebase!');
    } catch (e) {
      console.error('Error saving to Firebase:', e);
      setError('Failed to save to Firebase');
    }
  };

  if (isLoading) {
    return (
      <div style={{ backgroundColor: 'black' }}>
        <div
          style={{
            height: '100vh',
            width: '100vw',
            background:
              'repeating-linear-gradient(45deg, white, white 10px, black 10px, black 20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            animation: 'shake 0.4s infinite alternate',
          }}
        >
          <h1
            style={{
              color: 'white',
              backgroundColor: 'black',
              padding: '20px 40px',
              borderRadius: '20px',
              fontFamily: 'monospace',
              fontSize: '32px',
              animation: 'bounce 1s infinite',
            }}
          >
            <span style={{ color: 'red' }}>Endless</span> Vault
          </h1>
          <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes shake {
          0% {
            transform: rotate(-1deg);
          }
          100% {
            transform: rotate(1deg);
          }
        }
      `}</style>
        </div>
      </div>
    );
  }

  // Login Page
  if (!isAuthenticated) {
    return (
      <div
        style={{
          backgroundColor: 'black',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ToastContainer
          theme="colored"
          position="bottom-center"
          autoClose={3000}
        />
        <div
          style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '20px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0px 8px 32px rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div
              style={{
                backgroundColor: 'black',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <Lock size={40} color="white" />
            </div>
            <h2 style={{ margin: '0', color: 'black' }}>
              <span style={{ color: 'red' }}>Endless</span> Vault
            </h2>
            <p style={{ color: '#666', margin: '10px 0 0' }}>
              Please login to continue
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '0 15px',
                  border: '2px solid #ddd',
                }}
              >
                <User size={20} color="#666" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  required
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    padding: '15px 10px',
                    width: '100%',
                    outline: 'none',
                    fontSize: '16px',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  padding: '0 15px',
                  border: '2px solid #ddd',
                }}
              >
                <Lock size={20} color="#666" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    padding: '15px 10px',
                    width: '100%',
                    outline: 'none',
                    fontSize: '16px',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: 'black',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = '#333')}
              onMouseOut={(e) => (e.target.style.backgroundColor = 'black')}
            >
              Login
            </button>
          </form>

          <div
            style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#666',
            }}
          >
            <strong>Demo Credentials:</strong>
            <br />
            Username: admin
            <br />
            Password: vault123
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
      }}
    >
      <ToastContainer
        theme="colored"
        position="bottom-center"
        autoClose={3000}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px',
          backgroundColor: 'black',
          boxShadow: '0px 4px 16px rgba(0,0,0,1)',
        }}
      >
        <h2 style={{ color: 'white' }}>
          <span style={{ color: 'red' }}>Endless</span> Vault
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div
            style={{
              backgroundColor: 'red',
              borderRadius: '100%',
              padding: '2px',
              height: '30px',
              width: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setIsAuthenticated(false)}
          >
            <Lock size={16} style={{ color: 'white' }} />
          </div>
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '100%',
              padding: '2px',
              height: '30px',
              width: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Home onClick={() => navigate('/')} style={{ color: 'black' }} />
          </div>
        </div>
      </div>
      <CarouselComponent />

      <br />
      <h4
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
        }}
      >
        Living the miniature dream — one diecast at a time!
      </h4>
      <br />
      {/* Mode Selection */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          padding: '0px 10px',
        }}
      >
        <button
          style={{
            padding: '10px',
            borderRadius: '31px',
            color: 'white',
            backgroundColor: 'black',
            border: '1px solid black',
          }}
          onClick={() => setMode('capture')}
        >
          {' '}
          Capture
        </button>
        <button
          style={{
            padding: '10px',
            borderRadius: '31px',
            color: 'black',
            backgroundColor: 'white',
            border: '1px solid black',
          }}
          onClick={() => setMode('upload')}
        >
          Upload
        </button>
      </div>
      <br />

      {mode === 'upload' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px',
          }}
        >
          <label
            htmlFor="upload-input"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              backgroundColor: 'black',
              color: 'white',
              cursor: 'pointer',
              border: '2px solid black',
            }}
          >
            <UploadCloud size={20} />
            Upload Image
          </label>
          <input
            id="upload-input"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {mode === 'capture' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '10px',
          }}
        >
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={250}
            height={200}
            style={{ marginBottom: 10, borderRadius: '10px' }}
          />
          <button
            onClick={handleCapture}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'black',
              color: 'white',
              border: '2px solid black',
              cursor: 'pointer',
            }}
          >
            <Camera size={18} />
            Capture
          </button>
        </div>
      )}

      {previewImage && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '10px',
          }}
        >
          <img src={previewImage} alt="Preview" width={150} />
        </div>
      )}
      {/* Form Fields */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          backgroundColor: 'black',
          padding: '20px',
        }}
      >
        <select
          style={{
            height: '42px',
            color: 'black',
            backgroundColor: 'white',
            border: '2px solid black',
          }}
          name="brand"
          value={formData.brand}
          onChange={handleChange}
        >
          <option value="Hotwheels">Hotwheels</option>
          <option value="minigt">MiniGT</option>
          <option value="minigt">POPRACE</option>
          <option value="minigt">INNO64</option>
          <option value="minigt">BBURAGO</option>
          <option value="minigt">MAISTO</option>
          <option value="minigt">MAJORETTE</option>
          <option value="minigt">TOMICA</option>
          <option value="minigt">GREENLIGHT</option>
          <option value="minigt">AUTOWORLD</option>
          <option value="minigt">JOHNNYIGHTNING</option>
          <option value="minigt">MATCHBOX</option>
          <option value="minigt">SPECIALS</option>
        </select>

        <input
          style={{
            height: '37.5px',
            color: 'black',
            backgroundColor: 'white',
            border: '2px solid black',
          }}
          name="name"
          placeholder="Name"
          onChange={handleChange}
          value={formData.name}
        />

        <input
          style={{
            height: '37.5px',
            color: 'black',
            backgroundColor: 'white',
            border: '2px solid black',
          }}
          name="series"
          placeholder="Series"
          onChange={handleChange}
          value={formData.series}
        />

        <input
          style={{
            height: '37.5px',
            color: 'black',
            backgroundColor: 'white',
            border: '2px solid black',
          }}
          name="mrp"
          placeholder="MRP"
          type="number"
          onChange={handleChange}
          value={formData.mrp}
        />
        <div />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button
          style={{
            height: '37.5px',
            color: 'white',
            backgroundColor: 'green',
            border: '2px solid green',
          }}
          onClick={handleSave}
        >
          Save
        </button>
      </div>
      <Admin />
    </div>
  );
};

export default Hotwheels;
