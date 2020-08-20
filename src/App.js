import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import reactStringReplace from 'react-string-replace'

function getDataFromAPI({updateBeers}){
  fetch('https://api.punkapi.com/v2/beers')
    .then(response => response.json())
    .then(data => {
      const beersSortedByABV = data.sort((a,b) => a.abv - b.abv)
      const beersWithStrengthRating = beersSortedByABV.map(b => {
        let strengthRating = 0
        if (b.abv <= 5) {
          strengthRating = 1
        } else if (b.abv > 5 && b.abv <= 10) {
          strengthRating = 2
        } else if (b.abv > 10 && b.abv <= 15) {
          strengthRating = 3
        } else if (b.abv > 15 && b.abv <= 20) {
          strengthRating = 4
        } else if (b.abv > 20) {
          strengthRating = 5
        }
        return {...b, strength: strengthRating}
      })
      console.log(beersWithStrengthRating)
      updateBeers(beersWithStrengthRating)
    })
    .catch((error) => {
      console.error('Error:', error);
    })
}

const HighlightText = ({content, searchQuery}) => {
  if (searchQuery === null) {
    return content
  }
  if (content.toLowerCase().includes(searchQuery.toLowerCase())){
    const searchRegex = new RegExp(`(${searchQuery})`,"gi");
    return reactStringReplace(content, searchRegex, (match, i) => (
      <span key={i} className="font-bold bg-white bg-opacity-75">{match}</span>
    ))
  } else {
    return content
  }
}

const BeerRow = ({beer, searchQuery = null}) => {
  const [rowOpenState, updateRowOpenState] = useState(false)
  useEffect(() => {
    if (searchQuery !== null && beer.description.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 2){
      updateRowOpenState(true)
    } else {
      updateRowOpenState(false)
    }
  }, [searchQuery, beer.description])

  const descriptionSearchQuery = searchQuery !== null ? searchQuery.length > 2 ? searchQuery : null : null
  return (
    <li
      className="mb-2"
    >
      <div
        onClick={() => updateRowOpenState(!rowOpenState)}
        className={classNames("p-2 cursor-pointer flex justify-between items-center", {
          "bg-green-300": beer.strength === 1,
          "bg-yellow-300": beer.strength === 2,
          "bg-orange-300": beer.strength === 3,
          "bg-red-300": beer.strength === 4,
          "bg-purple-300": beer.strength === 5,
          "rounded-sm": !rowOpenState,
          "rounded-t-sm": rowOpenState
        })}
      >
        <p>
          <HighlightText content={beer.name + ': ' + beer.tagline} searchQuery={searchQuery} /> ({beer.abv}%)</p>
        {rowOpenState ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      <div
        className={classNames("p-2 flex rounded-b-sm", {
          "bg-green-200": beer.strength === 1,
          "bg-yellow-200": beer.strength === 2,
          "bg-orange-200": beer.strength === 3,
          "bg-red-200": beer.strength === 4,
          "bg-purple-200": beer.strength === 5,
          "hidden": !rowOpenState
        })}
      >
        <img
          alt={`${beer.name}`}
          src={beer.image_url}
          style={{maxHeight: "20rem", maxWidth: "20rem"}}
          className="m-2"
        />
        <p><HighlightText content={beer.description} searchQuery={descriptionSearchQuery} /></p>
      </div>
    </li>
  )
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

      const beerSearchResults = beers.filter(beer => {
        const beerString = [beer.name, beer.tagline, beer.description].join(' ')
        if (beerString.toLowerCase().includes(searchQuery.toLowerCase())) {
          return true
        } else {
          return false
        }
      })
      updateSearchResults(beerSearchResults)
    }
  }, [searchQuery, beers])

  return (
    <main className="p-4 flex justify-center" >
      <div className="max-w-full" style={{width:1000}}>
        <input
          type="search" defaultValue={searchQuery}
          placeholder="Search using a beer name, tagline or description"
          onChange={(e) => updateSearchQuery(e.target.value)}
          className="w-full py-2 mb-2 text-xl appearance-none border-0 border-b-2 border-gray-400 text-gray-800 leading-tight focus:outline-none focus:border-gray-600"
        />
        {!beers && <p>Loading...</p>}
        {beers && searchQuery === '' &&
          <ul>
            {beers.map(b => (
              <BeerRow beer={b} key={b.id} />
            ))}
          </ul>
        }
        {beers && searchQuery !== '' &&
          <>
            <h2 className="text-lg mb-2">Search Results</h2>
            <ul>
              {searchResults.length > 0 && searchResults.map(b => (
                <BeerRow beer={b} key={b.id} searchQuery={searchQuery} />
              ))}
            </ul>
            {searchResults.length === 0 && <p>No results found</p>}
          </>
        }
      </div>
    </main>
  );
}

export default App;
