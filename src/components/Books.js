import React, { useState } from 'react'


const Books = (props) => {
  const [FilteredBooks, setFilteredBooks] = useState('All Genres')
  if (!props.show) {
    return null
  }
  const books = props.allbooks.data.allBooks
  if (props.recommend) {
    if (props.filteredbooks === undefined)  {
      return <div>loading books...</div>
    }
    return (<div>
      <h2>recommendations</h2>
      <p>books in your fav genre patterns</p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {props.filteredbooks.allBooks.map(a => {
      return <tr key={a.title}>
      <td>{a.title}</td>
      <td>{a.author.name}</td>
      <td>{a.published}</td>
    </tr>
    })}

        </tbody>
      </table>
    </div>
  )



  }
  if (props.allbooks.loading)  {
    return <div>loading books...</div>
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>
              published
            </th>
          </tr>
          { FilteredBooks === 'All Genres' ?  books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ): ''}
          { FilteredBooks === 'Star' ? books.map(a => {
            if (a.genres.includes('Star')) {
              return <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>

            }
          }) : ''}
          { FilteredBooks === 'Deli Star' ? books.map(a => {
            if (a.genres.includes('Deli Star')) {
              return <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>

            }
          }) : ''}
          { FilteredBooks === 'HosStar' ? books.map(a => {
            if (a.genres.includes('goood')) {
              return <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>

            }
          }) : ''}

        </tbody>
      </table>
      <button onClick={() => setFilteredBooks('All Genres')}>All Genres</button>
      <button onClick={() => setFilteredBooks('Star')}>Star</button>
      <button onClick={() => setFilteredBooks('Deli Star')}>Deli Star</button>
      <button onClick={() => setFilteredBooks('HosStar')}>Hoş Star</button>
    </div>
  )
}

export default Books