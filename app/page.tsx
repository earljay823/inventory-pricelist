'use client'

import { useState, useEffect } from 'react';
import { getProducts } from './actions';
import Fuse from 'fuse.js';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [drawerProduct, setDrawerProduct] = useState<any[] | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getProducts();
      setProducts(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Animate drawer open with slight delay for mount
  useEffect(() => {
    if (drawerProduct) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setDrawerVisible(true));
      });
    } else {
      setDrawerVisible(false);
    }
  }, [drawerProduct]);

  const searchableData = products.map(prod => ({
    name: prod[0] || '',
    category: prod[1] || '',
    originalArray: prod
  }));

  const fuse = new Fuse(searchableData, {
    keys: ['name', 'category'],
    threshold: 0.4,
    ignoreLocation: true,
  });

  const searchResults = searchQuery
    ? fuse.search(searchQuery).map(result => result.item.originalArray)
    : [];

  const openDrawer = (prod: any[]) => {
    setImageError(false);
    setDrawerProduct(prod);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setTimeout(() => setDrawerProduct(null), 350);
  };

  // prod[0]=Name, prod[1]=Category, prod[2]=PerPack, prod[3]=BallpenPrice, prod[4]=CostPrice, prod[5]=ImageAddress

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Poppins:wght@400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Nunito', sans-serif;
          background: linear-gradient(160deg, #e8f4fd 0%, #d0eaf8 40%, #c5e4f5 100%);
          min-height: 100vh;
        }

        .app-header {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 60%, #60a5fa 100%);
          padding: 28px 20px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
          border-bottom-left-radius: 32px;
          border-bottom-right-radius: 32px;
          box-shadow: 0 8px 32px rgba(37,99,235,0.25);
        }

        .app-header::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 160px; height: 160px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
        }
        .app-header::after {
          content: '';
          position: absolute;
          bottom: -20px; left: -20px;
          width: 100px; height: 100px;
          background: rgba(255,255,255,0.06);
          border-radius: 50%;
        }

        .app-title {
          font-family: 'Poppins', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: white;
          letter-spacing: -0.3px;
          position: relative;
          z-index: 1;
        }

        .app-subtitle {
          font-size: 15px;
          color: rgba(255,255,255,0.75);
          margin-top: 4px;
          font-weight: 500;
          position: relative;
          z-index: 1;
        }

        .search-wrap {
          padding: 20px 16px 0;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 18px 20px 18px 52px;
          font-size: 20px;
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          border: none;
          border-radius: 20px;
          background: white;
          box-shadow: 0 4px 20px rgba(37,99,235,0.12);
          outline: none;
          color: #1e3a5f;
          transition: box-shadow 0.2s;
        }
        .search-input:focus {
          box-shadow: 0 4px 24px rgba(37,99,235,0.25);
        }
        .search-input::placeholder { color: #94a3b8; font-weight: 600; }
        .search-input:disabled { opacity: 0.6; }

        .search-icon {
          position: absolute;
          left: 32px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 22px;
          pointer-events: none;
        }

        .results-list {
          margin: 12px 16px 0;
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(37,99,235,0.12);
          overflow: hidden;
          max-height: 65vh;
          overflow-y: auto;
        }

        .result-item {
          padding: 18px 20px;
          border-bottom: 1px solid #f0f7ff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          transition: background 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .result-item:last-child { border-bottom: none; }
        .result-item:active { background: #eff6ff; }

        .result-left { flex: 1; min-width: 0; }

        .result-name {
          font-size: 19px;
          font-weight: 800;
          color: #1e3a5f;
          line-height: 1.2;
          word-break: break-word;
        }

        .result-category {
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          margin-top: 3px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .result-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          flex-shrink: 0;
        }

        .result-price {
          font-family: 'Poppins', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #2563eb;
        }

        .result-perpack {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          background: #f0f7ff;
          padding: 2px 8px;
          border-radius: 20px;
          white-space: nowrap;
        }

        .result-chevron {
          font-size: 18px;
          color: #cbd5e1;
          flex-shrink: 0;
        }

        .no-results {
          margin: 12px 16px 0;
          background: white;
          border-radius: 20px;
          padding: 32px 20px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(37,99,235,0.1);
        }
        .no-results-emoji { font-size: 40px; margin-bottom: 10px; }
        .no-results-text { font-size: 18px; font-weight: 700; color: #94a3b8; }

        /* ===== DRAWER ===== */
        .backdrop {
          position: fixed; inset: 0;
          background: rgba(15,30,60,0.5);
          z-index: 40;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s ease;
          backdrop-filter: blur(2px);
        }
        .backdrop.visible { opacity: 1; pointer-events: auto; }

        .drawer {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: white;
          border-top-left-radius: 32px;
          border-top-right-radius: 32px;
          z-index: 50;
          max-height: 92vh;
          overflow-y: auto;
          transform: translateY(100%);
          transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
          box-shadow: 0 -8px 40px rgba(37,99,235,0.18);
        }
        .drawer.visible { transform: translateY(0); }

        .drawer-handle-row {
          display: flex;
          justify-content: center;
          padding: 14px 0 8px;
        }
        .drawer-handle {
          width: 48px; height: 5px;
          background: #e2e8f0;
          border-radius: 99px;
        }

        .drawer-close {
          position: absolute;
          top: 14px; right: 18px;
          background: #f1f5f9;
          border: none;
          width: 38px; height: 38px;
          border-radius: 50%;
          font-size: 22px;
          color: #64748b;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-weight: 300;
          line-height: 1;
        }

        .drawer-image-wrap {
          margin: 0 20px 16px;
          border-radius: 24px;
          overflow: hidden;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          height: 220px;
          display: flex; align-items: center; justify-content: center;
        }
        .drawer-image {
          width: 100%; height: 100%;
          object-fit: contain;
        }
        .drawer-image-placeholder {
          font-size: 64px;
          opacity: 0.3;
        }

        .drawer-body { padding: 0 20px 40px; }

        .drawer-category-tag {
          display: inline-block;
          background: #eff6ff;
          color: #3b82f6;
          font-size: 13px;
          font-weight: 800;
          padding: 5px 14px;
          border-radius: 99px;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .drawer-product-name {
          font-family: 'Poppins', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #1e3a5f;
          line-height: 1.2;
          margin-bottom: 24px;
          word-break: break-word;
        }

        /* Price section */
        .price-main-card {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          border-radius: 24px;
          padding: 24px 24px 20px;
          margin-bottom: 12px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(37,99,235,0.3);
        }
        .price-main-card::before {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 120px; height: 120px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
        }

        .price-label {
          font-size: 13px;
          font-weight: 800;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase;
          letter-spacing: 1.2px;
          margin-bottom: 6px;
        }

        .price-value {
          font-family: 'Poppins', sans-serif;
          font-size: 52px;
          font-weight: 900;
          color: white;
          line-height: 1;
          position: relative;
          z-index: 1;
        }

        .price-secondary-row {
          display: flex;
          gap: 10px;
          margin-bottom: 12px;
        }

        .price-secondary-card {
          flex: 1;
          background: #f8faff;
          border: 2px solid #e8f0fe;
          border-radius: 20px;
          padding: 16px;
        }

        .price-secondary-label {
          font-size: 12px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 4px;
        }

        .price-secondary-value {
          font-family: 'Poppins', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #1e3a5f;
          line-height: 1.1;
        }

        .perpack-float {
          position: absolute;
          top: 16px; right: 20px;
          background: rgba(255,255,255,0.2);
          border-radius: 12px;
          padding: 6px 12px;
          z-index: 2;
        }
        .perpack-float-label {
          font-size: 10px;
          font-weight: 800;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .perpack-float-value {
          font-family: 'Poppins', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }
        .empty-state-emoji { font-size: 60px; margin-bottom: 16px; }
        .empty-state-title { font-size: 22px; font-weight: 800; color: #1e3a5f; margin-bottom: 8px; }
        .empty-state-sub { font-size: 16px; color: #94a3b8; font-weight: 600; }

        /* Scrollbar */
        .results-list::-webkit-scrollbar { width: 4px; }
        .results-list::-webkit-scrollbar-track { background: transparent; }
        .results-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      {/* HEADER */}
      <div className="app-header">
        <div className="app-title">Pricelist</div>
        <div className="app-subtitle">Product Price List</div>
      </div>

      {/* SEARCH */}
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder={isLoading ? "Loading..." : "Search product..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* RESULTS */}
      {searchQuery.length > 0 && searchResults.length > 0 && (
        <div className="results-list">
          {searchResults.map((prod, index) => (
            <div key={index} className="result-item" onClick={() => openDrawer(prod)}>
              <div className="result-left">
                <div className="result-name">{prod[0]}</div>
                {prod[1] && <div className="result-category">{prod[1]}</div>}
              </div>
              <div className="result-right">
                <div className="result-price">{prod[3] || '—'}</div>
                {prod[2] && <div className="result-perpack">Pack: {prod[2]}</div>}
              </div>
              <div className="result-chevron">›</div>
            </div>
          ))}
        </div>
      )}

      {searchQuery.length > 0 && searchResults.length === 0 && !isLoading && (
        <div className="no-results">
          <div className="no-results-emoji">🔎</div>
          <div className="no-results-text">No results for "{searchQuery}"</div>
        </div>
      )}

      {!searchQuery && !isLoading && (
        <div className="empty-state">
          <div className="empty-state-emoji">🛍️</div>
          <div className="empty-state-title">What are you looking for?</div>
          <div className="empty-state-sub">Type a product name above to search</div>
        </div>
      )}

      {/* BACKDROP */}
      <div
        className={`backdrop ${drawerVisible ? 'visible' : ''}`}
        onClick={closeDrawer}
      />

      {/* DRAWER */}
      <div className={`drawer ${drawerVisible ? 'visible' : ''}`}>
        {drawerProduct && (
          <>
            <div className="drawer-handle-row">
              <div className="drawer-handle" />
            </div>
            <button className="drawer-close" onClick={closeDrawer} aria-label="Close">×</button>

            {/* Image */}
            <div className="drawer-image-wrap">
              {drawerProduct[5] && !imageError ? (
                <img
                  src={drawerProduct[5]}
                  alt={drawerProduct[0]}
                  className="drawer-image"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="drawer-image-placeholder">📦</div>
              )}
            </div>

            <div className="drawer-body">
              {/* Category tag */}
              {drawerProduct[1] && (
                <div className="drawer-category-tag">{drawerProduct[1]}</div>
              )}

              {/* Product name */}
              <div className="drawer-product-name">{drawerProduct[0]}</div>

              {/* MAIN PRICE CARD — Selling Price + Per Pack floating */}
              <div className="price-main-card">
                {/* Per Pack floats top-right */}
                {drawerProduct[2] && (
                  <div className="perpack-float">
                    <div className="perpack-float-label">Per Pack</div>
                    <div className="perpack-float-value">{drawerProduct[2]}</div>
                  </div>
                )}
                <div className="price-label">Selling Price</div>
                <div className="price-value">{drawerProduct[3] || '—'}</div>
              </div>

              {/* Cost Price (secondary) */}
              {drawerProduct[4] && (
                <div className="price-secondary-row">
                  <div className="price-secondary-card">
                    <div className="price-secondary-label">Cost Price</div>
                    <div className="price-secondary-value">{drawerProduct[4]}</div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
