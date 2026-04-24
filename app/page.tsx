'use client'

import { useState, useEffect } from 'react';
import { getProducts } from './actions';
import Fuse from 'fuse.js';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Drawer state: holds the full product row, or null if closed
  const [drawerProduct, setDrawerProduct] = useState<any[] | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await getProducts();
      setProducts(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // --- SMART SEARCH (FUSE.JS) SETUP ---
  const searchableData = products.map(prod => ({
    name: prod[0] || '',
    category: prod[1] || '',
    costPrice: prod[2] || '',
    sellPrice: prod[3] || '',
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

  // Open drawer with a product; reset image error state
  const openDrawer = (prod: any[]) => {
    setImageError(false);
    setDrawerProduct(prod);
  };

  const closeDrawer = () => {
    setDrawerProduct(null);
  };

  // prod[0] = Product Name
  // prod[1] = Category
  // prod[2] = Per Pack price
  // prod[3] = Ballpen (selling) price
  // prod[4] = Cost Price
  // prod[5] = IMAGE ADDRESS

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-12 text-gray-900">
      <div className="max-w-2xl mx-auto w-full">

        <h1 className="text-3xl font-bold mb-6 text-center text-green-700">
          Price List Search
        </h1>

        <div className="relative">
          <input
            type="text"
            className="w-full p-4 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
            placeholder={isLoading ? "Loading data..." : "Search"}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            disabled={isLoading}
          />

          {/* DROPLIST */}
          {searchQuery.length > 0 && searchResults.length > 0 && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[60vh] overflow-y-auto z-50">
              {searchResults.map((prod, index) => (
                <div
                  key={index}
                  onClick={() => openDrawer(prod)}
                  className="p-4 border-b border-gray-100 cursor-pointer hover:bg-green-50 transition-colors"
                >
                  <div className="flex justify-between items-center gap-2">
                    <div>
                      <div className="font-bold text-gray-800 text-lg">{prod[0]}</div>
                      {prod[1] && (
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">{prod[1]}</div>
                      )}
                    </div>
                    <span className="font-extrabold text-green-600 text-xl whitespace-nowrap">
                      {prod[3]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* NO RESULTS */}
          {searchQuery.length > 0 && searchResults.length === 0 && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-gray-500 text-center z-50">
              No products found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* ===================== SLIDE-UP DRAWER ===================== */}
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          drawerProduct ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 transition-transform duration-400 ease-in-out ${
          drawerProduct ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {drawerProduct && (
          <>
            {/* Drag handle */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={closeDrawer}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-light leading-none"
              aria-label="Close"
            >
              ×
            </button>

            {/* Product Image */}
            <div className="px-6 pt-2 pb-4">
              {drawerProduct[5] && !imageError ? (
                <img
                  src={drawerProduct[5]}
                  alt={drawerProduct[0]}
                  onError={() => setImageError(true)}
                  className="w-full max-h-64 object-contain rounded-2xl bg-gray-100"
                />
              ) : (
                /* Blank placeholder if no image or broken link */
                <div className="w-full h-48 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-300 text-5xl">📦</span>
                </div>
              )}
            </div>

            {/* Product Info — large fonts for elderly users */}
            <div className="px-6 pb-10 space-y-5">

              {/* Product Name */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  Product
                </p>
                <p className="text-3xl font-extrabold text-gray-900 leading-tight">
                  {drawerProduct[0]}
                </p>
              </div>

              {/* Category */}
              {drawerProduct[1] && (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    Category
                  </p>
                  <p className="text-2xl font-semibold text-gray-700">
                    {drawerProduct[1]}
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Price Cards */}
              <div className="grid grid-cols-2 gap-4">

                {/* Selling Price (Ballpen) */}
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                  <p className="text-sm font-bold uppercase tracking-wider text-green-600 mb-1">
                    Selling Price
                  </p>
                  <p className="text-4xl font-black text-green-700">
                    {drawerProduct[3] || '—'}
                  </p>
                </div>

                {/* Per Pack */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
                  <p className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-1">
                    Per Pack
                  </p>
                  <p className="text-4xl font-black text-blue-700">
                    {drawerProduct[2] || '—'}
                  </p>
                </div>

              </div>

              {/* Cost Price (smaller, secondary info) */}
              {drawerProduct[4] && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
                  <p className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Cost Price
                  </p>
                  <p className="text-3xl font-bold text-gray-600">
                    {drawerProduct[4]}
                  </p>
                </div>
              )}

            </div>
          </>
        )}
      </div>
      {/* ===================== END DRAWER ===================== */}

    </main>
  );
}
