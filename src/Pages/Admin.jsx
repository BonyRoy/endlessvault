import React, { useContext, useEffect, useState, useMemo } from 'react';
import { db } from '../Common Files/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CommonContext } from '../Context/CommonContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfirmDialog from '../Common Files/ConfirmDialog';

const Admin = () => {
  const { dataChanged } = useContext(CommonContext);

  // Pagination constants
  const ITEMS_PER_PAGE = 10;

  // State management
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Get current page items with lazy loading simulation
  const currentItems = useMemo(() => {
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, startIndex, endIndex]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'hotwheels'));
      const list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(list);
      setFilteredItems(list);
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [dataChanged]);

  const handleDeleteRequest = (id) => {
    setSelectedDeleteId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDoc(doc(db, 'hotwheels', selectedDeleteId));
      toast.success('Deleted successfully');

      // Check if current page becomes empty after deletion
      const newFilteredItems = filteredItems.filter(
        (item) => item.id !== selectedDeleteId
      );
      const newTotalPages = Math.ceil(newFilteredItems.length / ITEMS_PER_PAGE);

      // If current page is now empty and not the first page, go to previous page
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }

      fetchItems();
    } catch (e) {
      toast.error('Error deleting document');
    } finally {
      setShowConfirm(false);
      setSelectedDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setSelectedDeleteId(null);
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setEditData({
      brand: item.brand,
      name: item.name,
      series: item.series,
      mrp: item.mrp,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (id) => {
    try {
      const docRef = doc(db, 'hotwheels', id);
      await updateDoc(docRef, {
        brand: editData.brand,
        name: editData.name,
        series: editData.series,
        mrp: editData.mrp,
      });
      setEditId(null);
      toast.success('Updated successfully');
      fetchItems();
    } catch (error) {
      toast.error('Error updating document');
    }
  };

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const filtered = items.filter((item) =>
      [item.brand, item.name, item.series, item.uniqueId].some((field) =>
        field?.toString().toLowerCase().includes(query)
      )
    );
    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = async (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setItemsLoading(true);

      // Simulate lazy loading delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      setCurrentPage(newPage);
      setItemsLoading(false);
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

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          fontSize: '18px',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
        }}
      >
        Current Data
      </h2>

      <div
        style={{
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: '3fr 1fr',
          gap: '5px',
        }}
      >
        <input
          type="search"
          placeholder="Search by name, brand, series or ID"
          style={{ width: '100%', height: '35px', padding: '0 10px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          style={{
            color: 'white',
            backgroundColor: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={handleSearch}
        >
          <Search />
        </button>
      </div>

      {/* Results summary */}
      {filteredItems.length > 0 && (
        <div style={{ padding: '0 20px', marginBottom: '10px', color: '#666' }}>
          {filteredItems.length === items.length
            ? `Showing all ${filteredItems.length} items`
            : `Found ${filteredItems.length} items`}
          {filteredItems.length > ITEMS_PER_PAGE &&
            ` (Page ${currentPage} of ${totalPages})`}
        </div>
      )}

      {filteredItems.length === 0 && (
        <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No data found.
        </p>
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

      {/* Items display */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '20px',
          opacity: itemsLoading ? 0.5 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        {currentItems.map((item) => {
          const isEditing = editId === item.id;

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                border: '1px solid #ccc',
                borderRadius: 10,
                padding: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                backgroundColor: 'white',
              }}
            >
              <img
                src={item.image}
                alt="Preview"
                style={{
                  width: 120,
                  height: 140,
                  objectFit: 'cover',
                  borderRadius: 8,
                  marginRight: 15,
                }}
                loading="lazy" // Native lazy loading for images
                onError={(e) => {
                  e.target.style.backgroundColor = '#f0f0f0';
                  e.target.alt = 'Image not available';
                }}
              />

              <div style={{ flex: 1, padding: '5px' }}>
                <p>
                  <strong>ID:</strong> {item.uniqueId}
                </p>
                {isEditing ? (
                  <>
                    <div style={{ marginBottom: '8px' }}>
                      <label>Brand:</label>
                      <select
                        name="brand"
                        value={editData.brand}
                        onChange={handleEditChange}
                        style={{ marginLeft: '8px', padding: '4px' }}
                      >
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
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <label>Name:</label>
                      <input
                        name="name"
                        value={editData.name}
                        onChange={handleEditChange}
                        style={{
                          marginLeft: '8px',
                          padding: '4px',
                          width: '200px',
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <label>Series:</label>
                      <input
                        name="series"
                        value={editData.series}
                        onChange={handleEditChange}
                        style={{
                          marginLeft: '8px',
                          padding: '4px',
                          width: '200px',
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <label>MRP:</label>
                      <input
                        name="mrp"
                        type="number"
                        value={editData.mrp}
                        onChange={handleEditChange}
                        style={{
                          marginLeft: '8px',
                          padding: '4px',
                          width: '100px',
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}

                <div style={{ marginTop: 10 }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        style={{
                          borderRadius: '5px',
                          border: '1px solid black',
                          color: 'white',
                          backgroundColor: 'black',
                          padding: '8px 12px',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleUpdate(item.id)}
                      >
                        Save
                      </button>
                      <button
                        style={{
                          borderRadius: '5px',
                          border: '1px solid red',
                          color: 'white',
                          backgroundColor: 'red',
                          padding: '8px 12px',
                          cursor: 'pointer',
                        }}
                        onClick={() => setEditId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{ display: 'flex', gap: '10px', marginTop: 10 }}
                    >
                      <button
                        style={{
                          border: '1px solid black',
                          backgroundColor: 'white',
                          padding: '6px',
                          borderRadius: '100%',
                          cursor: 'pointer',
                        }}
                        onClick={() => startEdit(item)}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        style={{
                          border: '1px solid black',
                          backgroundColor: 'white',
                          padding: '6px',
                          borderRadius: '100%',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleDeleteRequest(item.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} color="red" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <PaginationControls />

      {/* Toast and Confirm Dialog */}
      <ToastContainer
        theme="colored"
        position="bottom-center"
        autoClose={3000}
      />

      <ConfirmDialog
        show={showConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        message="Are you sure you want to delete this item?"
      />
    </div>
  );
};

export default Admin;
