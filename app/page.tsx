'use client'

import { useState, useEffect } from 'react';
import { getProducts } from './actions';
import Fuse from 'fuse.js';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // This state tracks which item is currently clicked/enlarged
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      const data = await getProducts();
      setProducts(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // --- SMART SEARCH (FUSE.JS) SETUP ---
  // We format the raw Google Sheets data so Fuse.js knows where to look
  const searchableData = products.map(prod => ({
    name: prod[0] || '',       // Column A: Product Name
    category: prod[1] || '',   // Column B: Category
    costPrice: prod[2] || '',  // Column C: Cost Price
    sellPrice: prod[3] || '',  // Column D: Ballpen Price
    originalArray: prod        // Keep the original data to display it
  }));

  const fuse = new Fuse(searchableData, {
    keys: ['name', 'category'],
    threshold: 0.4, // This is the "smartness" level. 0.4 allows for typos like 'pwdr'
    ignoreLocation: true,
  });

  // If there's a query, use fuzzy search. Otherwise, show nothing.
  const searchResults = searchQuery 
    ? fuse.search(searchQuery).map(result => result.item.originalArray)
    : [];

  // --- SCROLL TO MINIMIZE ---
  const handleScroll = () => {
    if (expandedIndex !== null) {
      setExpandedIndex(null); // Minimizes the enlarged item
    }
  };

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
              setExpandedIndex(null); // Close any expanded item when typing
            }}
            disabled={isLoading}
          />

          {/* THE DROPLIST */}
          {searchQuery.length > 0 && searchResults.length > 0 && (
            <div 
              className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-[60vh] overflow-y-auto z-50 scroll-smooth"
              onScroll={handleScroll}
            >
              {searchResults.map((prod, index) => {
                const isExpanded = expandedIndex === index;
                
                return (
                  <div 
                    key={index} 
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-300 ease-in-out ${
                      isExpanded ? 'bg-green-50 py-8 shadow-inner' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-2">
                      {/* LEFT SIDE: Name & Details */}
                      <div>
                        <div className={`font-bold text-gray-800 transition-all ${isExpanded ? 'text-2xl mb-2 text-green-800' : 'text-lg'}`}>
                          {prod[0]}
                        </div>
                        
                        {/* Extra details only show when expanded */}
                        {isExpanded && (
                          <div className="text-sm text-gray-600 space-y-1 mt-2">
                            <p>Category: <span className="font-medium text-gray-900">{prod[1] || 'Uncategorized'}</span></p>
                            <p>Selling Price per Pack: <span className="font-medium text-gray-900">{prod[2] || '0.00'}</span></p>
                          </div>
                        )}

                        {!isExpanded && prod[1] && (
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {prod[1]}
                          </div>
                        )}
                      </div>

                      {/* RIGHT SIDE: Price */}
                      <div className="flex flex-col items-end">
                        {isExpanded && <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Selling Price</span>}
                        <span className={`font-extrabold text-green-600 transition-all ${isExpanded ? 'text-4xl' : 'text-xl'}`}>
                          {prod[3]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* NO RESULTS FOUND */}
          {searchQuery.length > 0 && searchResults.length === 0 && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-gray-500 text-center z-50">
              No products found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
