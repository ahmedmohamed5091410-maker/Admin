/* Filter, Sort, and Paginate Utilities */

/**
 * Filter collection based on multiple criteria
 * @param {Array} collection - Array of objects
 * @param {Object} criteria - Key-value map (e.g. { status: 'active', category: 'Electronics' })
 * @returns {Array} - The filtered results
 */
export function filterCollection(collection, criteria = {}) {
  if (!collection || collection.length === 0) return [];
  
  return collection.filter(item => {
    for (const [key, value] of Object.entries(criteria)) {
      if (value === undefined || value === null || value === '' || value === 'all') continue;
      
      // If criteria value is an array, check if item value is inside it
      if (Array.isArray(value)) {
        if (!value.includes(item[key])) return false;
      }
      // Direct comparison
      else if (String(item[key]).toLowerCase() !== String(value).toLowerCase()) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Sort a collection of objects by a key
 * @param {Array} collection 
 * @param {string} key 
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array}
 */
export function sortCollection(collection, key, direction = 'asc') {
  if (!collection || !key) return collection;
  
  const sorted = [...collection];
  const factor = direction === 'desc' ? -1 : 1;
  
  return sorted.sort((a, b) => {
    let valA = a[key];
    let valB = b[key];
    
    // Check numbers
    if (typeof valA === 'number' && typeof valB === 'number') {
      return (valA - valB) * factor;
    }
    
    // Check dates
    const dateA = Date.parse(valA);
    const dateB = Date.parse(valB);
    if (!isNaN(dateA) && !isNaN(dateB)) {
      return (dateA - dateB) * factor;
    }
    
    // Default to string comparison
    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();
    
    if (strA < strB) return -1 * factor;
    if (strA > strB) return 1 * factor;
    return 0;
  });
}

/**
 * Get paginated subset of a collection
 * @param {Array} collection 
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} - Sliced items and pagination meta
 */
export function paginateCollection(collection, page = 1, limit = 10) {
  const totalItems = collection.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));
  
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);
  const items = collection.slice(startIndex, endIndex);
  
  return {
    items,
    pagination: {
      currentPage,
      totalPages,
      limit,
      totalItems,
      startIndex: totalItems === 0 ? 0 : startIndex + 1,
      endIndex
    }
  };
}
