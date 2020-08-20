import React, { useState, useEffect } from 'react'

function getDataFromAPI({updateBeers}){
  fetch('https://api.punkapi.com/v2/beers')
    .then(response => response.json())
    .then(data => {
      const sortedByABV = data.sort((a,b) => a.abv - b.abv)
      console.log(data, sortedByABV)
      updateBeers(sortedByABV)
    })
    .catch((error) => {
      console.error('Error:', error);
    })
}

function App() {
  const [beers, updateBeers] = useState(null)
  const [searchQuery, updateSearchQuery] = useState('')
  const [searchResults, updateSearchResults] = useState([])

  useEffect(() => {
    getDataFromAPI({updateBeers})
  }, [])

  useEffect(() => {
    if (beers !== null) {

      const beerSearch = beers.filter(beer => (
        beer.name.toLowerCase().includes(searchQuery.toLowerCase())
      ))
      updateSearchResults(beerSearch)
    }
  }, [searchQuery])

  return (
    <main>
      <input
        type="search" defaultValue={searchQuery}
        placeholder="Search within in beer name, tagline and description"
        onChange={(e) => updateSearchQuery(e.target.value)}
      />
      {!beers && <p>Loading...</p>}
      {beers && searchQuery === '' &&
        <ul>
          {beers.map(b => (
            <li key={b.id}>[{b.abv}%] {b.name} - {b.tagline}</li>
            ))}
        </ul>
      }
      {beers && searchQuery !== '' &&
        <>
          <h2>Search Results</h2>
          {searchResults.length > 0 && searchResults.map(b => (
            <li key={b.id}>[{b.abv}%] {b.name} - {b.tagline}</li>
          ))}
          {searchResults.length === 0 && <p>No results found</p>}
        </>
      }
    </main>
  );
}

export default App;
