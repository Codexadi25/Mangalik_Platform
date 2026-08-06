import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import { useHeader } from "../../context/HeaderContext";
import "./OrdersDashboard.css";
import { getProductImageUrl } from "../../utils/imageHelper";

const Catalog = () => {
  const { setHeaderData } = useHeader();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = add mode
  const [search, setSearch] = useState("");

  useEffect(() => {
    setHeaderData({
      title: "Products Database",
      searchPlaceholder: "Search products by title, description or tags...",
      searchValue: search,
      onSearchChange: setSearch,
      actionComponent: (
        <button className="admin-btn admin-btn-primary" onClick={openAddDrawer} style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
          + Add New Product
        </button>
      )
    });
    return () => setHeaderData({ title: "", subtitle: "", searchPlaceholder: "", searchValue: "", onSearchChange: null, actionComponent: null });
  }, [search, categories]);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    basePrice: "",
    stock: "",
    description: "",
    tags: "",
    gstPercent: 5,
    whatsInTheBox: []
  });
  const [newItem, setNewItem] = useState({ itemName: "", quantity: 1, itemValue: 0, gstRate: 5 });
  const [editingItemIdx, setEditingItemIdx] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [eligibleForReplacement, setEligibleForReplacement] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products", { params: { limit: 200, admin: "true", q: search } });
      setProducts(data.data || []);
    } catch (err) {
      toast.error("Failed to load products");
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      if (data.data && data.data.length > 0) {
        setCategories(data.data);
      }
    } catch (err) {
      setCategories([
        { _id: "6a5c4d55ac957fbf1a37c52b", name: "Puja Samagri" },
        { _id: "6a5c4d55ac957fbf1a37c52d", name: "Idols" }
      ]);
    }
  };

  const openAddDrawer = () => {
    setEditingProduct(null);
    setFormData({
      title: "",
      category: categories.length > 0 ? categories[0]._id : "",
      basePrice: "",
      stock: "",
      description: "",
      tags: "",
      gstPercent: 5,
      whatsInTheBox: []
    });
    setNewItem({ itemName: "", quantity: 1, itemValue: 0, gstRate: 5 });
    setEditingItemIdx(null);
    setUploadedImages([]);
    setIsActive(true);
    setEligibleForReplacement(true);
    setDrawerOpen(true);
  };

  const openEditDrawer = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      category: product.category?._id || product.category || "",
      basePrice: product.basePrice,
      stock: product.stock,
      description: product.description,
      tags: product.tags ? product.tags.join(", ") : "",
      gstPercent: product.gstPercent || 5,
      whatsInTheBox: product.whatsInTheBox || []
    });
    setNewItem({ itemName: "", quantity: 1, itemValue: 0, gstRate: 5 });
    setEditingItemIdx(null);
    setUploadedImages(product.images?.map(img => img.url) || []);
    setIsActive(product.isActive !== false);
    setEligibleForReplacement(product.eligibleForReplacement !== false);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingProduct(null);
    setEditingItemIdx(null);
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (uploadedImages.length + files.length > 4) {
      toast.warning("Maximum 4 images allowed.");
      return;
    }
    setIsUploading(true);
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        toast.warning(`"${file.name}" exceeds 2MB limit.`);
        continue;
      }
      const formData = new FormData();
      formData.append("image", file);
      try {
        const { data } = await api.post("/products/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setUploadedImages(prev => [...prev, data.url]);
        toast.success(`Uploaded "${file.name}"`);
      } catch (err) {
        toast.error(`Failed to upload "${file.name}"`);
      }
    }
    setIsUploading(false);
  };

  const removeUploadedImage = (idx) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.basePrice || !formData.description) {
      toast.warning("Please fill all required fields.");
      return;
    }

    const imagesToSubmit = uploadedImages.map(url => ({ url, alt: formData.title }));
    const tagsArray = formData.tags
      ? formData.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      basePrice: Number(formData.basePrice),
      stock: Number(formData.stock) || 0,
      images: imagesToSubmit,
      isActive,
      tags: tagsArray,
      gstPercent: Number(formData.gstPercent) || 5,
      whatsInTheBox: formData.whatsInTheBox,
      eligibleForReplacement,
    };

    try {
      if (editingProduct) {
        const { data } = await api.patch(`/products/${editingProduct._id}`, payload);
        toast.success("Product updated!");
        setProducts(products.map(p => p._id === editingProduct._id ? data.data : p));
      } else {
        payload.slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
        const { data } = await api.post("/products", payload);
        toast.success("Product added to shop!");
        setProducts([data.data, ...products]);
      }
      closeDrawer();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product.");
    }
  };

  const handleRemoveProduct = async (e, productId) => {
    e.stopPropagation();
    if (window.confirm("Remove this product permanently?")) {
      try {
        await api.delete(`/products/${productId}`);
        setProducts(products.filter(p => p._id !== productId));
        toast.success("Product removed.");
        if (editingProduct?._id === productId) closeDrawer();
      } catch (err) {
        toast.error("Failed to remove product.");
      }
    }
  };
  return (
    <div className="admin-dashboard-container">

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon orders">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          </div>
          <div className="admin-stat-info">
            <h3>Total Products</h3>
            <p>{products.length}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon completed">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div className="admin-stat-info">
            <h3>Active / Listed</h3>
            <p>{products.filter(p => p.isActive !== false).length}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon pending">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <div className="admin-stat-info">
            <h3>Out of Stock</h3>
            <p>{products.filter(p => p.stock <= 0).length}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon revenue">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div className="admin-stat-info">
            <h3>Unlisted</h3>
            <p>{products.filter(p => p.isActive === false).length}</p>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="admin-table-wrapper" style={{ overflow: 'visible', background: 'transparent', boxShadow: 'none', border: 'none' }}>
        {products.length === 0 ? (
          <div className="admin-empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
            <h3>No products yet</h3>
            <p>Click "Add New Product" to get started.</p>
          </div>
        ) : (
          <div className="admin-products-grid">
            {products.map((product) => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= 10;
              const stockClass = isOutOfStock ? "out-of-stock" : isLowStock ? "low-stock" : "in-stock";
              const stockText = isOutOfStock ? "Out of Stock" : isLowStock ? `Low: ${product.stock} left` : `${product.stock} in stock`;

              return (
                <div
                  key={product._id}
                  className="product-admin-card"
                  onClick={() => openEditDrawer(product)}
                  style={editingProduct?._id === product._id && drawerOpen ? { border: '2px solid #E33C24' } : {}}
                >
                  {product.isActive === false && (
                    <div className="unlisted-badge">Unlisted</div>
                  )}
                  <button
                    className="delete-product-btn"
                    title="Delete product"
                    onClick={(e) => handleRemoveProduct(e, product._id)}
                  >✕</button>
                  <img
                    src={getProductImageUrl(product.images?.[0]?.url)}
                    alt={product.title}
                    className="product-admin-card-img"
                  />
                  <div className="product-admin-card-body">
                    <h3>{product.title}</h3>
                    <div className={`product-admin-card-stock ${stockClass}`}>
                      ● {stockText}
                    </div>
                    <div className="product-admin-card-meta">
                      <span className="product-admin-card-price">₹{product.basePrice}</span>
                      <span className="product-admin-card-cat">
                        {categories.find(c => c._id === (product.category?._id || product.category)?.toString())?.name || "Product"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drawer Overlay — same pattern as Orders */}
      {drawerOpen && (
        <div className="admin-drawer-overlay" onClick={closeDrawer}>
          <div className="admin-drawer" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-drawer-header">
              <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <button className="close-drawer-btn" onClick={closeDrawer}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="admin-drawer-body">
              <form id="catalog-form" className="add-product-form" onSubmit={handleSubmit}>

                <div>
                  <label>Product Name *</label>
                  <input
                    type="text"
                    className="add-product-input"
                    placeholder="e.g. Pure Gangajal Water"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label>Category *</label>
                  <select
                    className="add-product-select"
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label>Base Price (₹) *</label>
                    <input
                      type="number"
                      className="add-product-input"
                      placeholder="150"
                      required
                      min="1"
                      value={formData.basePrice}
                      onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label>Stock Qty *</label>
                    <input
                      type="number"
                      className="add-product-input"
                      placeholder="100"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label>Product GST Rate (%) *</label>
                    <select
                      className="add-product-select"
                      required
                      value={formData.gstPercent}
                      onChange={e => setFormData({ ...formData, gstPercent: Number(e.target.value) })}
                    >
                      <option value={5}>5% (Standard Puja)</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label>Description *</label>
                  <textarea
                    className="add-product-textarea"
                    placeholder="Describe the product's features, ingredients, and benefits..."
                    required
                    rows="4"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* What's in the Box Items Management */}
                <div style={{
                  border: '1.5px solid #FF8C00',
                  borderRadius: '14px',
                  padding: '16px',
                  background: 'linear-gradient(to bottom, #fffcf9, #fff7ed)',
                  boxShadow: '0 4px 15px rgba(255, 140, 0, 0.05)',
                  marginBottom: '15px'
                }}>
                  <label style={{
                    fontWeight: 700,
                    color: '#c2410c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                    marginBottom: '12px'
                  }}>
                    <span>📦</span> What's in the Box (Included Items)
                  </label>
                  
                  {formData.whatsInTheBox && formData.whatsInTheBox.length > 0 ? (
                    <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', marginBottom: '16px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #fed7aa', textAlign: 'left', color: '#7c2d12' }}>
                          <th style={{ padding: '6px 4px', fontWeight: 700 }}>Item Name</th>
                          <th style={{ padding: '6px 4px', fontWeight: 700 }}>Qty</th>
                          <th style={{ padding: '6px 4px', fontWeight: 700 }}>Val (₹)</th>
                          <th style={{ padding: '6px 4px', fontWeight: 700 }}>GST %</th>
                          <th style={{ padding: '6px 4px', fontWeight: 700, textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.whatsInTheBox.map((item, idx) => (
                          <tr key={idx} style={{
                            borderBottom: '1px solid #ffedd5',
                            backgroundColor: editingItemIdx === idx ? '#ffedd5' : 'transparent'
                          }}>
                            <td style={{ padding: '8px 4px', fontWeight: 600, color: '#451a03' }}>{item.itemName}</td>
                            <td style={{ padding: '8px 4px', color: '#451a03' }}>{item.quantity}</td>
                            <td style={{ padding: '8px 4px', color: '#451a03' }}>₹{item.itemValue}</td>
                            <td style={{ padding: '8px 4px', color: '#451a03' }}>{item.gstRate}%</td>
                            <td style={{ padding: '8px 4px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                style={{
                                  color: '#ea580c',
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  padding: '2px 4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700
                                }}
                                onClick={() => {
                                  setNewItem({
                                    itemName: item.itemName,
                                    quantity: item.quantity,
                                    itemValue: item.itemValue,
                                    gstRate: item.gstRate
                                  });
                                  setEditingItemIdx(idx);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                style={{
                                  color: '#dc2626',
                                  border: 'none',
                                  background: 'transparent',
                                  cursor: 'pointer',
                                  padding: '2px 4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700
                                }}
                                onClick={() => {
                                  const updatedBox = formData.whatsInTheBox.filter((_, i) => i !== idx);
                                  setFormData({ ...formData, whatsInTheBox: updatedBox });
                                  if (editingItemIdx === idx) {
                                    setEditingItemIdx(null);
                                    setNewItem({ itemName: "", quantity: 1, itemValue: 0, gstRate: 5 });
                                  }
                                }}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ fontSize: '0.75rem', color: '#9a3412', fontStyle: 'italic', marginBottom: '16px' }}>
                      No items bundled yet. Add below.
                    </p>
                  )}

                  {/* Input Form Header for Add/Edit Context */}
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#c2410c',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    borderTop: '1px dashed #fed7aa',
                    paddingTop: '10px'
                  }}>
                    {editingItemIdx !== null ? "✏️ Edit Item Parameters" : "➕ Add Item Parameters"}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr', gap: '8px', alignItems: 'flex-end' }}>
                    <div>
                      <span style={{ fontSize: '0.68rem', display: 'block', color: '#7c2d12', fontWeight: 700, marginBottom: '4px' }}>Item Name</span>
                      <input
                        type="text"
                        placeholder="e.g. Kalawa"
                        value={newItem.itemName}
                        onChange={e => setNewItem({ ...newItem, itemName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          fontSize: '0.75rem',
                          border: '1.5px solid #fed7aa',
                          borderRadius: '8px',
                          outline: 'none',
                          backgroundColor: '#fff'
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', display: 'block', color: '#7c2d12', fontWeight: 700, marginBottom: '4px' }}>Qty</span>
                      <input
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) || 1 })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          fontSize: '0.75rem',
                          border: '1.5px solid #fed7aa',
                          borderRadius: '8px',
                          outline: 'none',
                          backgroundColor: '#fff'
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', display: 'block', color: '#7c2d12', fontWeight: 700, marginBottom: '4px' }}>Value (₹)</span>
                      <input
                        type="number"
                        min="0"
                        value={newItem.itemValue}
                        onChange={e => setNewItem({ ...newItem, itemValue: Number(e.target.value) || 0 })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          fontSize: '0.75rem',
                          border: '1.5px solid #fed7aa',
                          borderRadius: '8px',
                          outline: 'none',
                          backgroundColor: '#fff'
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.68rem', display: 'block', color: '#7c2d12', fontWeight: 700, marginBottom: '4px' }}>GST %</span>
                      <select
                        value={newItem.gstRate}
                        onChange={e => setNewItem({ ...newItem, gstRate: Number(e.target.value) })}
                        style={{
                          width: '100%',
                          padding: '7px 8px',
                          fontSize: '0.75rem',
                          border: '1.5px solid #fed7aa',
                          borderRadius: '8px',
                          outline: 'none',
                          backgroundColor: '#fff'
                        }}
                      >
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        fontSize: '0.78rem',
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        boxShadow: '0 4px 10px rgba(234, 88, 12, 0.2)',
                        transition: 'transform 0.1s ease'
                      }}
                      onClick={() => {
                        if (!newItem.itemName.trim()) {
                          toast.warning("Please enter an item name");
                          return;
                        }
                        if (editingItemIdx !== null) {
                          const updatedBox = [...(formData.whatsInTheBox || [])];
                          updatedBox[editingItemIdx] = { ...newItem };
                          setFormData({ ...formData, whatsInTheBox: updatedBox });
                          setEditingItemIdx(null);
                        } else {
                          setFormData({
                            ...formData,
                            whatsInTheBox: [...(formData.whatsInTheBox || []), { ...newItem }]
                          });
                        }
                        setNewItem({ itemName: "", quantity: 1, itemValue: 0, gstRate: 5 });
                      }}
                    >
                      {editingItemIdx !== null ? "✓ Save Item Modifications" : "＋ Add Item to Box"}
                    </button>
                    {editingItemIdx !== null && (
                      <button
                        type="button"
                        style={{
                          padding: '10px 16px',
                          fontSize: '0.78rem',
                          background: '#e2e8f0',
                          color: '#475569',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 700
                        }}
                        onClick={() => {
                          setEditingItemIdx(null);
                          setNewItem({ itemName: "", quantity: 1, itemValue: 0, gstRate: 5 });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label>Search Tags (comma-separated, for backend search keywords)</label>
                  <input
                    type="text"
                    className="add-product-input"
                    placeholder="e.g. gangajal, holy water, pure"
                    value={formData.tags || ""}
                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>

                {/* Listed / Unlisted toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1.5px solid #e2e8f0' }}>
                  <input
                    type="checkbox"
                    id="isActiveToggle"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#E33C24' }}
                  />
                  <label htmlFor="isActiveToggle" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}>
                    {isActive ? "✅ Listed on Platform" : "🚫 Unlisted (Hidden from customers)"}
                  </label>
                </div>

                {/* Replacement eligibility toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1.5px solid #e2e8f0' }}>
                  <input
                    type="checkbox"
                    id="eligibleForReplacementToggle"
                    checked={eligibleForReplacement}
                    onChange={e => setEligibleForReplacement(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#E33C24' }}
                  />
                  <label htmlFor="eligibleForReplacementToggle" style={{ margin: 0, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}>
                    {eligibleForReplacement ? "🔄 Eligible for Replacement" : "⚠️ Not Eligible for Replacement"}
                  </label>
                </div>

                {/* Image Upload */}
                <div>
                  <label>Product Images (max 4, 2MB each)</label>
                  <input
                    type="file"
                    className="add-product-input"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ padding: '8px', cursor: 'pointer' }}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <small style={{ color: '#E33C24', display: 'block', marginTop: '4px' }}>
                      ⏳ Uploading to MongoDB...
                    </small>
                  )}
                  {uploadedImages.length > 0 && (
                    <div className="image-previews-container" style={{ marginTop: '10px' }}>
                      {uploadedImages.map((imgSrc, idx) => (
                        <div key={idx} className="image-preview-wrapper">
                          <button
                            type="button"
                            className="remove-image-badge"
                            onClick={() => removeUploadedImage(idx)}
                          >✕</button>
                          <img src={getProductImageUrl(imgSrc)} alt={`Preview ${idx + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="admin-drawer-footer" style={{ justifyContent: 'space-between' }}>
              <button className="admin-btn admin-btn-secondary" onClick={closeDrawer}>Cancel</button>
              <button
                type="submit"
                form="catalog-form"
                className="admin-btn admin-btn-primary"
                disabled={isUploading}
              >
                {editingProduct ? "Save Changes" : "Add to Shop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
