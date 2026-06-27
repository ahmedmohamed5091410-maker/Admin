/* Search Logic Utility */

/**
 * Perform a fuzzy/substring search over a collection of objects
 * @param {Array} collection - Array of objects to search
 * @param {string} query - The search query term
 * @param {Array} searchKeys - The keys of the object to search within
 * @returns {Array} - The filtered search results
 */
export function searchCollection(collection, query, searchKeys) {
  if (!query || !collection || collection.length === 0) return collection;
  
  const cleanQuery = query.toLowerCase().trim();
  if (cleanQuery === '') return collection;
  
  return collection.filter(item => {
    return searchKeys.some(key => {
      const val = item[key];
      if (val === null || val === undefined) return false;
      return String(val).toLowerCase().includes(cleanQuery);
    });
  });
}
