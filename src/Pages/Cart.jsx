import React, { useContext } from 'react';
import { CommonContext } from '../Context/CommonContext';
import { Trash2, Plus, Minus, CircleArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity } =
    useContext(CommonContext);

  const navigate = useNavigate();

  // Calculate total price
  const totalPrice =
    cart?.reduce((total, item) => {
      return total + item.mrp * (item.quantity || 1);
    }, 0) || 0;

  // Calculate total items
  const totalItems =
    cart?.reduce((total, item) => {
      return total + (item.quantity || 1);
    }, 0) || 0;

  if (!cart || cart.length === 0) {
    return (
      <div style={{ width: '100%', minHeight: '100%' }}>
        <div
          style={{
            backgroundColor: 'black',
            padding: '15px 20px',
            boxShadow: '0px 4px 16px rgba(0,0,0,1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <h2
            style={{
              color: 'white',
              margin: 0,
              fontSize: 'clamp(18px, 4vw, 24px)',
            }}
          >
            <span style={{ color: 'red' }}>Endless</span> Vault
          </h2>
          <CircleArrowLeft
            onClick={() => navigate('/')}
            style={{ color: 'white', cursor: 'pointer' }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70%',
            textAlign: 'center',
            padding: '40px 20px',
          }}
        >
          <h3
            style={{
              color: '#666',
              marginBottom: '15px',
              fontSize: 'clamp(16px, 3vw, 20px)',
            }}
          >
            Your cart is empty
          </h3>
          <p
            style={{
              color: '#999',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
            }}
          >
            Add some items to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '100%' }}>
      <div
        style={{
          backgroundColor: 'black',
          padding: '15px 20px',
          boxShadow: '0px 4px 16px rgba(0,0,0,1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <CircleArrowLeft
            onClick={() => navigate('/')}
            style={{ color: 'white', cursor: 'pointer' }}
          />
          <h2
            style={{
              color: 'white',
              margin: 0,
              fontSize: 'clamp(18px, 4vw, 24px)',
            }}
          >
            <span style={{ color: 'red' }}>Shopping</span> Cart
          </h2>
        </div>
        <div
          style={{
            color: 'white',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            whiteSpace: 'nowrap',
          }}
        >
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </div>
      </div>

      <div
        style={{
          padding: '20px',
          width: '100%',
          boxSizing: 'border-box',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
          }}
        >
          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                width: '100%',
                border: '1px solid #ccc',
                borderRadius: '10px',
                padding: 'clamp(12px, 2.5vw, 20px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backgroundColor: 'white',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    window.innerWidth <= 768 ? 'center' : 'flex-start',
                  marginBottom: window.innerWidth <= 768 ? '15px' : '0',
                  marginRight: window.innerWidth <= 768 ? '0' : '20px',
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: window.innerWidth <= 768 ? '120px' : '100px',
                    height: window.innerWidth <= 768 ? '140px' : '120px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    flexShrink: 0,
                  }}
                />
              </div>

              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <div style={{ flex: 1, marginBottom: '15px' }}>
                  <p
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: 'clamp(11px, 2vw, 12px)',
                      color: '#666',
                      wordBreak: 'break-all',
                    }}
                  >
                    <strong>ID:</strong> {item.uniqueId}
                  </p>
                  <p
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: 'clamp(12px, 2.2vw, 14px)',
                      wordBreak: 'break-word',
                    }}
                  >
                    <strong>Brand:</strong> {item.brand}
                  </p>
                  <p
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: 'clamp(14px, 2.5vw, 16px)',
                      fontWeight: 'bold',
                      lineHeight: '1.3',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.name}
                  </p>
                  <p
                    style={{
                      margin: '0 0 8px 0',
                      fontSize: 'clamp(12px, 2.2vw, 14px)',
                      color: '#666',
                      wordBreak: 'break-word',
                    }}
                  >
                    <strong>Series:</strong> {item.series}
                  </p>
                  <p
                    style={{
                      margin: '0 0 15px 0',
                      fontSize: 'clamp(14px, 2.5vw, 16px)',
                      fontWeight: 'bold',
                      color: '#007bff',
                    }}
                  >
                    ₹{item.mrp} each
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems:
                      window.innerWidth <= 480 ? 'flex-start' : 'center',
                    flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
                    gap: window.innerWidth <= 480 ? '15px' : '10px',
                    marginBottom: '15px',
                  }}
                >
                  {/* Quantity Controls */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      justifyContent:
                        window.innerWidth <= 480 ? 'center' : 'flex-start',
                    }}
                  >
                    <button
                      onClick={() =>
                        updateCartQuantity &&
                        updateCartQuantity(item.id, (item.quantity || 1) - 1)
                      }
                      style={{
                        width: 'clamp(28px, 6vw, 35px)',
                        height: 'clamp(28px, 6vw, 35px)',
                        borderRadius: '50%',
                        border: '1px solid #ccc',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        opacity: (item.quantity || 1) <= 1 ? 0.5 : 1,
                      }}
                      disabled={(item.quantity || 1) <= 1}
                    >
                      <Minus size={window.innerWidth <= 480 ? 14 : 16} />
                    </button>

                    <span
                      style={{
                        fontSize: 'clamp(14px, 3vw, 18px)',
                        fontWeight: 'bold',
                        minWidth: '30px',
                        textAlign: 'center',
                      }}
                    >
                      {item.quantity || 1}
                    </span>

                    <button
                      onClick={() =>
                        updateCartQuantity &&
                        updateCartQuantity(item.id, (item.quantity || 1) + 1)
                      }
                      style={{
                        width: 'clamp(28px, 6vw, 35px)',
                        height: 'clamp(28px, 6vw, 35px)',
                        borderRadius: '50%',
                        border: '1px solid #ccc',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={window.innerWidth <= 480 ? 14 : 16} />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart && removeFromCart(item.id)}
                    style={{
                      padding:
                        'clamp(6px, 1.5vw, 10px) clamp(10px, 2.5vw, 15px)',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: 'clamp(12px, 2.2vw, 14px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                      alignSelf: window.innerWidth <= 480 ? 'center' : 'auto',
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#c82333';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#dc3545';
                    }}
                  >
                    <Trash2 size={window.innerWidth <= 480 ? 12 : 14} />
                    Remove
                  </button>
                </div>

                {/* Item Total */}
                <div
                  style={{
                    textAlign: window.innerWidth <= 480 ? 'center' : 'right',
                    borderTop: '1px solid #eee',
                    paddingTop: '10px',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 'clamp(12px, 2.2vw, 14px)',
                      color: '#666',
                    }}
                  >
                    Subtotal:{' '}
                    <strong
                      style={{
                        color: '#007bff',
                        fontSize: 'clamp(14px, 2.5vw, 16px)',
                      }}
                    >
                      ₹{item.mrp * (item.quantity || 1)}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div
          style={{
            marginTop: '30px',
            padding: 'clamp(15px, 3vw, 25px)',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '1px solid #dee2e6',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <h3
              style={{
                margin: 0,
                color: '#333',
                fontSize: 'clamp(16px, 3.5vw, 20px)',
              }}
            >
              Cart Summary
            </h3>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              flexWrap: 'wrap',
              gap: '5px',
            }}
          >
            <span>Total Items:</span>
            <span>
              <strong>{totalItems}</strong>
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px',
              fontSize: 'clamp(16px, 3vw, 20px)',
              paddingTop: '15px',
              borderTop: '2px solid #dee2e6',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <span>
              <strong>Total Amount:</strong>
            </span>
            <span style={{ color: '#007bff', fontWeight: 'bold' }}>
              <strong>₹{totalPrice}</strong>
            </span>
          </div>

          <button
            style={{
              width: '100%',
              padding: 'clamp(12px, 2.5vw, 16px)',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: 'clamp(14px, 2.5vw, 18px)',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#218838';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#28a745';
            }}
            onClick={() => navigate('/payment')}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>

      <div
        style={{
          padding: '25px 20px',
          textAlign: 'center',
          borderTop: '1px solid #eee',
          marginTop: '20px',
        }}
      >
        <h4
          style={{
            color: '#666',
            fontStyle: 'italic',
            margin: 0,
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            lineHeight: '1.4',
          }}
        >
          Living the miniature dream — one diecast at a time!
        </h4>
      </div>
    </div>
  );
};

export default Cart;
