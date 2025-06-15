import React, { useContext, useEffect, useState } from 'react';
import { CommonContext } from '../Context/CommonContext';
import emailjs from '@emailjs/browser';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
  const { cart } = useContext(CommonContext);

  const [selectedPayment, setSelectedPayment] = useState('');
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // EmailJS Configuration - REPLACE WITH YOUR ACTUAL VALUES
  const EMAILJS_SERVICE_ID = 'service_muq90tb';
  const EMAILJS_TEMPLATE_ID = 'template_qktns1o';
  const EMAILJS_PUBLIC_KEY = '-OIVSsPbkISTkWIQv';

  // Initialize EmailJS (add this useEffect)
  useEffect(() => {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }, []);

  const handleAddressChange = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handlePaymentSelect = (method) => {
    if (method === 'ONLINE') return;
    setSelectedPayment(method);

    if (errors.payment) {
      setErrors((prev) => ({
        ...prev,
        payment: '',
      }));
    }
  };

  // Validation functions (keeping existing ones)
  const validateFullName = (name) => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(name.trim()))
      return 'Name can only contain letters and spaces';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return 'Phone number is required';
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, '')))
      return 'Enter a valid 10-digit Indian mobile number';
    return '';
  };

  const validateStreet = (street) => {
    if (!street.trim()) return 'Street address is required';
    if (street.trim().length < 5) return 'Please enter a complete address';
    return '';
  };

  const validateCity = (city) => {
    if (!city.trim()) return 'City is required';
    if (city.trim().length < 2) return 'Enter a valid city name';
    if (!/^[a-zA-Z\s]+$/.test(city.trim()))
      return 'City name can only contain letters and spaces';
    return '';
  };

  const validateState = (state) => {
    if (!state.trim()) return 'State is required';
    if (state.trim().length < 2) return 'Enter a valid state name';
    if (!/^[a-zA-Z\s]+$/.test(state.trim()))
      return 'State name can only contain letters and spaces';
    return '';
  };

  const validatePincode = (pincode) => {
    if (!pincode.trim()) return 'PIN code is required';
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(pincode.trim()))
      return 'Enter a valid 6-digit PIN code';
    return '';
  };

  const validateForm = () => {
    const newErrors = {};

    newErrors.fullName = validateFullName(address.fullName);
    newErrors.phone = validatePhone(address.phone);
    newErrors.street = validateStreet(address.street);
    newErrors.city = validateCity(address.city);
    newErrors.state = validateState(address.state);
    newErrors.pincode = validatePincode(address.pincode);

    if (!selectedPayment) {
      newErrors.payment = 'Please select a payment method';
    }

    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendEmail = async (orderData) => {
    try {
      // Calculate total amount
      const calculateTotal = (cartItems) => {
        if (!cartItems || cartItems.length === 0) return 0;
        return cartItems.reduce((total, item) => {
          const price = parseFloat(item.price || item.mrp || 0);
          return total + price;
        }, 0);
      };

      // Format cart items for email
      const formatCartItems = (cartItems) => {
        if (!cartItems || cartItems.length === 0) {
          return 'No items in cart';
        }

        return cartItems
          .map((item, index) => {
            return `${index + 1}. ${item.name || item.title || 'Unknown Product'} 
   Brand: ${item.brand || 'N/A'} 
   Price: ₹${item.price || item.mrp || 0} 
   ID: ${item.id || 'N/A'}`;
          })
          .join('\n\n');
      };

      const totalAmount = calculateTotal(cart);
      const formattedCartItems = formatCartItems(cart);

      // EmailJS template parameters
      const templateParams = {
        // Basic order info
        order_id: orderData.orderId,
        order_date: new Date().toLocaleString('en-IN'),

        // Customer details
        customer_name: orderData.fullName,
        customer_phone: orderData.phone,
        customer_address: `${orderData.street}, ${orderData.city}, ${orderData.state} - ${orderData.pincode}`,
        landmark: orderData.landmark || 'Not provided',

        // Payment info
        payment_method: orderData.paymentMethod,

        // Cart details
        cart_items: formattedCartItems,
        total_items: cart.length,
        total_amount: `₹${totalAmount.toFixed(2)}`,

        // Your email (where you want to receive orders)
        to_email: 'your-email@example.com', // Replace with your actual email

        // Additional details
        message: `New order received from ${orderData.fullName}. Please process this order.`,
      };

      console.log('Sending email with params:', templateParams);

      // Send email using EmailJS
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('Email sent successfully:', result);
      return { success: true, result };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (!cart || cart.length === 0) {
      toast.info(
        'Your cart is empty. Please add items before placing an order.'
      );
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      fullName: address.fullName.trim(),
      phone: address.phone.trim(),
      street: address.street.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
      landmark: address.landmark.trim(),
      paymentMethod:
        selectedPayment === 'COD' ? 'Cash on Delivery' : 'Online Payment',
      orderDate: new Date().toISOString(),
      orderId: `ORD${Date.now()}`,
    };

    try {
      const emailResult = await sendEmail(orderData);

      if (emailResult.success) {
        toast.success(
          `🎉 Order placed successfully!\n\nOrder ID: ${orderData.orderId}\nPayment: ${orderData.paymentMethod}\n\n | You will get a confirmation call/mail, please approve once received.`
        );

        // Reset form
        setAddress({
          fullName: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          pincode: '',
          landmark: '',
        });
        setSelectedPayment('');
        setErrors({});
        setTimeout(() => {
          navigate('/');
        }, [3000]);
      } else {
        console.error('Email error:', emailResult.error);
        alert(
          `Order details saved but email failed to send.\nError: ${emailResult.error}\n\nOrder ID: ${orderData.orderId}`
        );
      }
    } catch (error) {
      console.error('Order processing error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rest of your component JSX remains the same...
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <ToastContainer
        theme="colored"
        position="bottom-center"
        autoClose={3000}
      />
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '8px',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(24px, 5vw, 32px)',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 8px 0',
            }}
          >
            Payment Details
          </h1>
          <p
            style={{
              color: '#64748b',
              fontSize: '16px',
              margin: '0',
            }}
          >
            Complete your order by providing delivery address and payment method
          </p>
        </div>

        {/* Address Card */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: 'clamp(20px, 4vw, 32px)',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: '600',
              color: '#1e293b',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: '700',
              }}
            >
              1
            </span>
            Delivery Address
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            <div style={{ gridColumn: 'span 1' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Full Name *
              </label>
              <input
                type="text"
                value={address.fullName}
                onChange={(e) =>
                  handleAddressChange('fullName', e.target.value)
                }
                placeholder="Enter your full name"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${errors.fullName ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = errors.fullName
                    ? '#ef4444'
                    : '#3b82f6')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.fullName
                    ? '#ef4444'
                    : '#e2e8f0')
                }
              />
              {errors.fullName && (
                <p
                  style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    margin: '4px 0 0 0',
                    fontWeight: '500',
                  }}
                >
                  {errors.fullName}
                </p>
              )}
            </div>

            <div style={{ gridColumn: 'span 1' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Phone Number *
              </label>
              <input
                type="tel"
                value={address.phone}
                onChange={(e) => handleAddressChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${errors.phone ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = errors.phone
                    ? '#ef4444'
                    : '#3b82f6')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.phone
                    ? '#ef4444'
                    : '#e2e8f0')
                }
              />
              {errors.phone && (
                <p
                  style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    margin: '4px 0 0 0',
                    fontWeight: '500',
                  }}
                >
                  {errors.phone}
                </p>
              )}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Street Address *
              </label>
              <input
                type="text"
                value={address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="House/Flat number, Building name, Street"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${errors.street ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = errors.street
                    ? '#ef4444'
                    : '#3b82f6')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.street
                    ? '#ef4444'
                    : '#e2e8f0')
                }
              />
              {errors.street && (
                <p
                  style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    margin: '4px 0 0 0',
                    fontWeight: '500',
                  }}
                >
                  {errors.street}
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                City *
              </label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="Enter city"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${errors.city ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = errors.city
                    ? '#ef4444'
                    : '#3b82f6')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.city
                    ? '#ef4444'
                    : '#e2e8f0')
                }
              />
              {errors.city && (
                <p
                  style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    margin: '4px 0 0 0',
                    fontWeight: '500',
                  }}
                >
                  {errors.city}
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                State *
              </label>
              <input
                type="text"
                value={address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                placeholder="Enter state"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${errors.state ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = errors.state
                    ? '#ef4444'
                    : '#3b82f6')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.state
                    ? '#ef4444'
                    : '#e2e8f0')
                }
              />
              {errors.state && (
                <p
                  style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    margin: '4px 0 0 0',
                    fontWeight: '500',
                  }}
                >
                  {errors.state}
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                PIN Code *
              </label>
              <input
                type="text"
                value={address.pincode}
                onChange={(e) => handleAddressChange('pincode', e.target.value)}
                placeholder="Enter PIN code"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `2px solid ${errors.pincode ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = errors.pincode
                    ? '#ef4444'
                    : '#3b82f6')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = errors.pincode
                    ? '#ef4444'
                    : '#e2e8f0')
                }
              />
              {errors.pincode && (
                <p
                  style={{
                    color: '#ef4444',
                    fontSize: '12px',
                    margin: '4px 0 0 0',
                    fontWeight: '500',
                  }}
                >
                  {errors.pincode}
                </p>
              )}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={address.landmark}
                onChange={(e) =>
                  handleAddressChange('landmark', e.target.value)
                }
                placeholder="Nearby landmark for easy delivery"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>
          </div>
        </div>

        {/* Payment Method Card */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: 'clamp(20px, 4vw, 32px)',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e2e8f0',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: '600',
              color: '#1e293b',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                fontWeight: '700',
              }}
            >
              2
            </span>
            Payment Method
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: window.innerWidth < 640 ? 'column' : 'row',
              gap: '16px',
            }}
          >
            {/* COD Option */}
            <div
              onClick={() => handlePaymentSelect('COD')}
              style={{
                flex: '1',
                padding: '20px',
                border:
                  selectedPayment === 'COD'
                    ? '2px solid #3b82f6'
                    : '2px solid #e2e8f0',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor:
                  selectedPayment === 'COD' ? '#eff6ff' : 'white',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (selectedPayment !== 'COD') {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.backgroundColor = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPayment !== 'COD') {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = 'white';
                }
              }}
            >
              {selectedPayment === 'COD' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}
                >
                  ✓
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#fbbf24',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}
                >
                  💰
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1e293b',
                      margin: '0',
                    }}
                  >
                    Cash on Delivery
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#64748b',
                      margin: '4px 0 0 0',
                    }}
                  >
                    Pay when you receive
                  </p>
                </div>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: '#64748b',
                  margin: '0',
                  lineHeight: '1.4',
                }}
              >
                Pay with cash when your order is delivered to your doorstep.
                Safe and convenient.
              </p>
            </div>

            {/* Online Payment Option - Disabled */}
            <div
              style={{
                flex: '1',
                padding: '20px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                position: 'relative',
                opacity: '0.6',
                cursor: 'not-allowed',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: '#64748b',
                  color: 'white',
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: '600',
                }}
              >
                COMING SOON
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#cbd5e1',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}
                >
                  💳
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#64748b',
                      margin: '0',
                    }}
                  >
                    Online Payment
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#64748b',
                      margin: '4px 0 0 0',
                    }}
                  >
                    Currently unavailable
                  </p>
                </div>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: '#64748b',
                  margin: '0',
                  lineHeight: '1.4',
                }}
              >
                Online payment options will be available soon. For now, please
                use Cash on Delivery.
              </p>
            </div>
          </div>

          {errors.payment && (
            <p
              style={{
                color: '#ef4444',
                fontSize: '14px',
                margin: '12px 0 0 0',
                fontWeight: '500',
                textAlign: 'center',
              }}
            >
              {errors.payment}
            </p>
          )}
        </div>

        {/* Proceed Button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '8px',
          }}
        >
          <button
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#cbd5e1' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.target.style.backgroundColor = '#3b82f6';
              }
            }}
            onClick={handlePlaceOrder}
          >
            {isSubmitting ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                ></div>
                Processing...
              </>
            ) : (
              'Place Order'
            )}
          </button>
        </div>

        {/* Add CSS for spinner animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Payment;
