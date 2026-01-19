import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Package, AlertTriangle, ArrowUpRight,
    Trash2, Edit2, Save, X, ExternalLink, Download, Upload,
    Filter, TrendingUp, DollarSign
} from 'lucide-react';

const CATEGORIES = ['Cañas', 'Carretes', 'Carnada', 'Anzuelos/Plomos', 'Ropa', 'Accesorios', 'Otros'];

const App = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('Todas');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Cañas',
        cost: '',
        price: '',
        margin: '30',
        stock: '',
        minStock: '5'
    });

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('fishing_stock');
        if (saved) {
            setProducts(JSON.parse(saved));
        }
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        localStorage.setItem('fishing_stock', JSON.stringify(products));
    }, [products]);

    const calculatePrice = (cost, margin) => {
        const c = parseFloat(cost) || 0;
        const m = parseFloat(margin) || 0;
        return (c * (1 + m / 100)).toFixed(2);
    };

    const handleCostChange = (e) => {
        const cost = e.target.value;
        const price = calculatePrice(cost, formData.margin);
        setFormData({ ...formData, cost, price });
    };

    const handleMarginChange = (e) => {
        const margin = e.target.value;
        const price = calculatePrice(formData.cost, margin);
        setFormData({ ...formData, margin, price });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingProduct) {
            setProducts(products.map(p => p.id === editingProduct.id ? { ...formData, id: p.id } : p));
        } else {
            setProducts([...products, { ...formData, id: Date.now() }]);
        }
        closeModal();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({
            name: '',
            category: 'Cañas',
            cost: '',
            price: '',
            margin: '30',
            stock: '',
            minStock: '5'
        });
    };

    const editProduct = (p) => {
        setEditingProduct(p);
        setFormData(p);
        setIsModalOpen(true);
    };

    const deleteProduct = (id) => {
        if (window.confirm('¿Está seguro de eliminar este producto?')) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    const exportData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "stock_pesca_" + new Date().toISOString().split('T')[0] + ".json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const importData = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    setProducts(imported);
                    alert('Datos importados con éxito');
                }
            } catch (err) {
                alert('Error al importar archivo');
            }
        };
        reader.readAsText(file);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'Todas' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const lowStockCount = products.filter(p => parseInt(p.stock) <= parseInt(p.minStock)).length;

    return (
        <div className="app-container">
            <header className="header">
                <div className="logo-section">
                    <div className="logo-icon">⚓</div>
                    <h1>Ancla & Sedal</h1>
                </div>
                <div className="header-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Buscar artículos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Nuevo Artículo
                    </button>
                </div>
            </header>

            <main className="main-content">
                <aside className="sidebar">
                    <div className="stats-card">
                        <div className="stat">
                            <Package size={20} />
                            <div>
                                <span>Total Artículos</span>
                                <strong>{products.length}</strong>
                            </div>
                        </div>
                        <div className={`stat ${lowStockCount > 0 ? 'warning' : ''}`}>
                            <AlertTriangle size={20} />
                            <div>
                                <span>Stock Bajo</span>
                                <strong>{lowStockCount}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="filter-section">
                        <h3>Categorías</h3>
                        <button
                            className={`filter-btn ${filterCategory === 'Todas' ? 'active' : ''}`}
                            onClick={() => setFilterCategory('Todas')}
                        >
                            Todas
                        </button>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
                                onClick={() => setFilterCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="utility-buttons">
                        <button className="btn btn-outline" onClick={exportData}>
                            <Download size={16} /> Exportar
                        </button>
                        <label className="btn btn-outline cursor-pointer">
                            <Upload size={16} /> Importar
                            <input type="file" hidden onChange={importData} accept=".json" />
                        </label>
                    </div>
                </aside>

                <section className="inventory-section">
                    <div className="inventory-header">
                        <h2>Inventario de Existencias</h2>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Artículo</th>
                                    <th>Categoría</th>
                                    <th>Costo</th>
                                    <th>Margen</th>
                                    <th>Precio Venta</th>
                                    <th>Stock</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(p => (
                                    <tr key={p.id} className={parseInt(p.stock) <= parseInt(p.minStock) ? 'row-warning' : ''}>
                                        <td>
                                            <div className="product-name">
                                                {p.name}
                                                {parseInt(p.stock) <= parseInt(p.minStock) && <AlertTriangle size={14} className="icon-warning" />}
                                            </div>
                                        </td>
                                        <td><span className="badge">{p.category}</span></td>
                                        <td>${parseFloat(p.cost).toFixed(2)}</td>
                                        <td>{p.margin}%</td>
                                        <td><strong>${parseFloat(p.price).toFixed(2)}</strong></td>
                                        <td className="stock-cell">
                                            <span className={`stock-badge ${parseInt(p.stock) <= parseInt(p.minStock) ? 'danger' : 'success'}`}>
                                                {p.stock} / {p.minStock}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button className="action-btn edit" onClick={() => editProduct(p)}><Edit2 size={16} /></button>
                                                <button className="action-btn delete" onClick={() => deleteProduct(p.id)}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="empty-state">
                                            No se encontraron artículos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{editingProduct ? 'Editar Artículo' : 'Nuevo Artículo'}</h2>
                            <button className="close-btn" onClick={closeModal}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre del Artículo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Caña de Pescar Carbono 2.1m"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Categoría</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Costo ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formData.cost}
                                        onChange={handleCostChange}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Margen (%)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.margin}
                                        onChange={handleMarginChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Precio de Venta ($)</label>
                                    <input
                                        type="text"
                                        readOnly
                                        className="readonly-input"
                                        value={formData.price}
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Stock Actual</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stock Mínimo (Alerta)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.minStock}
                                        onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? 'Guardar Cambios' : 'Crear Artículo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .app-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }

        .header {
          padding: 1rem 2rem;
          background: var(--primary);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-icon {
          font-size: 2rem;
          background: rgba(255,255,255,0.1);
          padding: 0.5rem;
          border-radius: 12px;
        }

        .header-actions {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .search-bar {
          background: rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          width: 300px;
          transition: background 0.3s;
        }

        .search-bar:focus-within {
          background: rgba(255,255,255,0.25);
        }

        .search-bar input {
          background: transparent;
          border: none;
          color: white;
          margin-left: 0.5rem;
          outline: none;
          width: 100%;
        }

        .search-bar input::placeholder {
          color: rgba(255,255,255,0.7);
        }

        .main-content {
          display: flex;
          flex: 1;
          overflow: hidden;
          padding: 1.5rem;
          gap: 1.5rem;
        }

        .sidebar {
          width: 280px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .stats-card {
          background: white;
          padding: 1.25rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border-radius: 8px;
          background: #f1f5f9;
        }

        .stat.warning {
          background: #fee2e2;
          color: var(--danger);
        }

        .stat span {
          display: block;
          font-size: 0.8rem;
          color: #64748b;
        }

        .stat strong {
          font-size: 1.5rem;
        }

        .filter-section {
          background: white;
          padding: 1.25rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .filter-section h3 {
          margin-bottom: 1rem;
          font-size: 1rem;
          color: var(--primary);
        }

        .filter-btn {
          width: 100%;
          text-align: left;
          padding: 0.6rem 0.8rem;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 0.25rem;
          transition: all 0.2s;
          color: #4b5563;
        }

        .filter-btn:hover {
          background: #f1f5f9;
        }

        .filter-btn.active {
          background: var(--primary);
          color: white;
        }

        .utility-buttons {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .inventory-section {
          flex: 1;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .inventory-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-container {
          flex: 1;
          overflow-y: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        th {
          background: #f8fafc;
          padding: 1rem 1.5rem;
          font-weight: 600;
          color: #64748b;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }

        tr:hover {
          background: #f8fafc;
        }

        .row-warning {
          background: #fff7ed;
        }

        .product-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }

        .icon-warning {
          color: var(--warning);
        }

        .badge {
          background: #e0f2fe;
          color: #0369a1;
          padding: 0.25rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .stock-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-block;
        }

        .stock-badge.success {
          background: #dcfce7;
          color: #15803d;
        }

        .stock-badge.danger {
          background: #fee2e2;
          color: #b91c1c;
        }

        .actions-cell {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
          color: #64748b;
        }

        .action-btn:hover.edit {
          color: var(--primary);
          border-color: var(--primary);
        }

        .action-btn:hover.delete {
          color: var(--danger);
          border-color: var(--danger);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: var(--accent);
          color: var(--text);
        }

        .btn-primary:hover {
          background: var(--accent-dark);
          transform: translateY(-1px);
        }

        .btn-outline {
          background: transparent;
          border: 1px solid #e2e8f0;
          color: #4b5563;
        }

        .btn-outline:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .cursor-pointer { cursor: pointer; }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(2, 48, 71, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .modal {
          background: white;
          width: 600px;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #94a3b8;
        }

        form {
          padding: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: #475569;
        }

        .form-group input, 
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .readonly-input {
          background: #f8fafc;
          font-weight: 700;
          color: var(--primary);
        }

        .modal-footer {
          margin-top: 1rem;
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem !important;
          color: #94a3b8;
          font-style: italic;
        }
      `}</style>
        </div>
    );
};

export default App;
