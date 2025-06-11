import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../Common Files/firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  Search,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import { CommonContext } from '../Context/CommonContext';
import CarouselComponent from '../Common Files/CarouselComponent';

const Home = () => {
  const { dataChanged, cart, addToCart } = useContext(CommonContext);
  const navigate = useNavigate();

  // Pagination constants
  const ITEMS_PER_PAGE = 10;

  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('');
  const [dataLoading, setDataLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Notification modal state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationItem, setNotificationItem] = useState(null);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Get current page items with lazy loading simulation
  const currentItems = useMemo(() => {
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, startIndex, endIndex]);

  useEffect(() => {
    fetchItems();
  }, [dataChanged]);

  const fetchItems = async () => {
    setDataLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'hotwheels'));
      const list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(list);
      setFilteredItems(list);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = () => {
    applyFilters();
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        [item.brand, item.name, item.series, item.uniqueId].some((field) =>
          field?.toString().toLowerCase().includes(query)
        )
      );
    }

    // Apply brand filter
    if (brandFilter) {
      filtered = filtered.filter(
        (item) => item.brand?.toLowerCase() === brandFilter.toLowerCase()
      );
    }

    // Apply sort filter
    if (sortFilter) {
      filtered.sort((a, b) => {
        const priceA = parseFloat(a.mrp) || 0;
        const priceB = parseFloat(b.mrp) || 0;

        if (sortFilter === 'low-to-high') {
          return priceA - priceB;
        } else if (sortFilter === 'high-to-low') {
          return priceB - priceA;
        }
        return 0;
      });
    }

    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Auto-apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery, brandFilter, sortFilter, items]);

  const handlePageChange = async (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setItemsLoading(true);

      // Simulate lazy loading delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      setCurrentPage(newPage);
      setItemsLoading(false);

      // Scroll to top of items section
      const itemsSection = document.getElementById('items-section');
      if (itemsSection) {
        itemsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getPaginationRange = () => {
    const range = [];
    const showPages = 5; // Number of page buttons to show
    let start = Math.max(1, currentPage - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  // Handle add to cart with notification
  const handleAddToCart = (item) => {
    addToCart(item);
    setNotificationItem(item);
    setShowNotification(true);
  };

  const [viewingItem, setViewingItem] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);

  const handleViewItem = (item) => {
    setViewingItem(item);
    setShowDetailView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setShowDetailView(false);
    setViewingItem(null);
  };

  // Close notification
  const closeNotification = () => {
    setShowNotification(false);
  };

  // Notification Modal Component
  const NotificationModal = () => {
    if (!showNotification || !notificationItem) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onClick={closeNotification}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            padding: '20px',
            width: 'auto',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            transform: showNotification ? 'scale(1)' : 'scale(0.8)',
            transition: 'transform 0.3s ease',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={closeNotification}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
            }}
          >
            <X size={20} color="#666" />
          </button>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#4CAF50',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 15px',
              }}
            >
              <Check size={30} color="white" />
            </div>

            <h3 style={{ color: '#333', marginBottom: '10px' }}>
              Added to Cart!
            </h3>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px',
                marginBottom: '15px',
              }}
            >
              <img
                src={notificationItem.image}
                alt={notificationItem.name}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                }}
              />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>
                  {notificationItem.name}
                </p>
                <p style={{ color: '#666', margin: '0 0 5px 0' }}>
                  {notificationItem.brand}
                </p>
                <p
                  style={{ color: '#007bff', fontWeight: 'bold', margin: '0' }}
                >
                  ₹{notificationItem.mrp}
                </p>
              </div>
            </div>

            <div
              style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}
            >
              <button
                onClick={closeNotification}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f8f9fa',
                  color: '#333',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Continue Shopping
              </button>
              <button
                onClick={() => {
                  closeNotification();
                  navigate('/cart');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Pagination component
  const PaginationControls = () => {
    if (filteredItems.length <= ITEMS_PER_PAGE) return null;

    const paginationRange = getPaginationRange();

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          margin: '20px 0',
          padding: '20px',
          borderTop: '1px solid #eee',
        }}
      >
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || itemsLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: currentPage === 1 ? '#f5f5f5' : 'white',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
          }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        {paginationRange.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            disabled={itemsLoading}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: currentPage === pageNum ? '#007bff' : 'white',
              color: currentPage === pageNum ? 'white' : 'black',
              cursor: 'pointer',
              fontWeight: currentPage === pageNum ? 'bold' : 'normal',
            }}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || itemsLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: currentPage === totalPages ? '#f5f5f5' : 'white',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
          }}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  // Calculate total cart items
  const cartItemCount = cart?.length || 0;

  if (isLoading) {
    return (
      <div style={{ backgroundColor: 'black' }}>
        <div
          style={{
            height: '100vh',
            width: '100%',
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
  // Add this component inside your Home component or create it separately
  const DetailView = () => {
    if (!viewingItem) return null;

    return (
      <>
        <div style={{ padding: '20px' }}>
          {/* Back button */}
          <button
            onClick={handleBackFromDetail}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginBottom: '20px',
              padding: '8px 12px',
              backgroundColor: 'black',
              border: '1px solid #ddd',
              borderRadius: '5px',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            <ChevronLeft size={16} />
            Back to Items
          </button>

          {/* Item details */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              maxWidth: '600px',
              margin: '0 auto',
              gap: '10px',
            }}
          >
            <img
              src={viewingItem.image}
              alt={viewingItem.name}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            />

            <div style={{ width: '100%', textAlign: 'left' }}>
              <h2>{viewingItem.name}</h2>
              <p>
                <strong>Brand:</strong> {viewingItem.brand}
              </p>
              <p>
                <strong>Series:</strong> {viewingItem.series}
              </p>
              {/* <p>
              <strong>Unique ID:</strong> {viewingItem.uniqueId}
            </p> */}
              <p>
                <strong>MRP:</strong> ₹{viewingItem.mrp}
              </p>
            </div>
          </div>
        </div>
        <CarouselComponent />
      </>
    );
  };
  return (
    <>
      {/* Header with Search */}
      <div
        style={{
          backgroundColor: 'black',
          padding: '10px',
          boxShadow: '0px 4px 16px rgba(0,0,0,1)',
        }}
      >
        {/* Top row with title and cart */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <h2 style={{ color: 'white', margin: 0 }}>
            <span style={{ color: 'red' }}>Endless</span> Vault
          </h2>

          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              cursor: 'pointer',
            }}
          >
            <ShoppingCart
              onClick={() => navigate('/cart')}
              style={{ color: 'white' }}
            />
            {cartItemCount > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  minWidth: '20px',
                }}
              >
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar - Full width on mobile */}
        {!showDetailView && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              gap: '5px',
            }}
          >
            <input
              type="search"
              placeholder="Search..."
              style={{
                padding: '8px 12px',
                flex: 1,
                borderRadius: '5px',
                border: '1px solid #ccc',
                fontSize: '14px',
                minWidth: 0, // Allow input to shrink
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              style={{
                padding: '8px 12px',
                color: 'white',
                backgroundColor: '#007bff',
                border: 'none',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0, // Prevent button from shrinking
              }}
              onClick={handleSearch}
            >
              <Search size={16} />
            </button>
          </div>
        )}
      </div>

      {showDetailView ? (
        <DetailView />
      ) : (
        <>
          <br />
          {/* Filter Section */}
          <div
            style={{
              padding: '10px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
          >
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="">All Brands</option>
              <option value="Hotwheels">Hotwheels</option>
              <option value="MiniGT">MiniGT</option>
              <option value="POPRACE">POPRACE</option>
              <option value="INNO64">INNO64</option>
              <option value="BBURAGO">BBURAGO</option>
              <option value="MAISTO">MAISTO</option>
              <option value="MAJORETTE">MAJORETTE</option>
              <option value="TOMICA">TOMICA</option>
              <option value="GREENLIGHT">GREENLIGHT</option>
              <option value="AUTOWORLD">AUTOWORLD</option>
              <option value="JOHNNYIGHTNING">JOHNNYIGHTNING</option>
              <option value="MATCHBOX">MATCHBOX</option>
              <option value="SPECIALS">SPECIALS</option>
            </select>

            <select
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="">Sort by Price</option>
              <option value="low-to-high">Low to High</option>
              <option value="high-to-low">High to Low</option>
            </select>
          </div>

          {dataLoading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading items...
            </div>
          )}

          {/* Results summary */}
          {!dataLoading &&
            filteredItems.length > 0 &&
            (searchQuery || brandFilter || sortFilter) && (
              <div style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '20px' }}>
                  {searchQuery ? 'Search Results' : 'Filtered Results'} (
                  {filteredItems.length} items found)
                  {filteredItems.length > ITEMS_PER_PAGE &&
                    ` - Page ${currentPage} of ${totalPages}`}
                </h3>
              </div>
            )}

          {/* No results message */}
          {!dataLoading &&
            filteredItems.length === 0 &&
            (searchQuery || brandFilter) && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#666', fontSize: '16px' }}>
                  No items found matching your filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setBrandFilter('');
                    setSortFilter('');
                  }}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}

          {/* Loading indicator for pagination */}
          {itemsLoading && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
                color: '#666',
              }}
            >
              Loading items...
            </div>
          )}

          {/* Items Display Section */}
          <div
            id="items-section"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              padding:
                searchQuery || brandFilter || sortFilter
                  ? '0 20px 20px 20px'
                  : '20px',
              opacity: itemsLoading ? 0.5 : 1,
              transition: 'opacity 0.3s ease',
            }}
          >
            {currentItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  border: '1px solid #ccc',
                  borderRadius: 10,
                  padding: 15,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  backgroundColor: 'white',
                  minWidth: '280px',
                }}
              >
                <img
                  src={item.image}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: 8,
                    marginBottom: '10px',
                  }}
                  loading="lazy" // Native lazy loading for images
                  onError={(e) => {
                    e.target.style.backgroundColor = '#f0f0f0';
                    e.target.alt = 'Image not available';
                  }}
                />

                <div style={{ width: '100%' }}>
                  <p>
                    <strong>Brand:</strong> {item.brand}
                  </p>
                  <p>
                    <strong>Name:</strong> {item.name}
                  </p>
                  <p>
                    <strong>Series:</strong> {item.series}
                  </p>
                  <p>
                    <strong>MRP:</strong> ₹{item.mrp}
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                    }}
                  >
                    <button
                      onClick={() => handleAddToCart(item)}
                      style={{
                        marginTop: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = '#0056b3';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = '#007bff';
                      }}
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleViewItem(item)}
                      style={{
                        marginTop: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <PaginationControls />

          {/* Only show carousel when not filtering/searching or when no items match */}
          {!searchQuery && !brandFilter && !sortFilter && (
            <>
              <CarouselComponent />
            </>
          )}

          {/* Notification Modal */}
          <NotificationModal />
        </>
      )}
    </>
  );
};

export default Home;
