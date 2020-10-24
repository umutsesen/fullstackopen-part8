import React, { useState } from 'react'
import Select from 'react-select';

const Authors = (props) => {
  const [name, setName] = useState(null)
  const [born, setBorn] = useState('')
  
  if (!props.show) {
    return null
  }
  if (props.allauthors.loading)  {
    return <div>loading authors...</div>
  }
  const authors = props.allauthors.data.allAuthors
  const updateAuthor = async (event) => {
    event.preventDefault()
    await props.updateauthor( { variables : { name, year: +born } } )
    setName(null)
    setBorn('')
  }
 
  const names = authors.map(a => a.name)
  const options = []
  for (let x of names) {
    let val = { value: x, label: x }
    options.push(val)
  }
  

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              born
            </th>
            <th>
              books
            </th>
          </tr>
          {authors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          )}
        </tbody>
      </table>
      <form onSubmit={updateAuthor}>
        <Select value={name} onChange={ ({target}) => setName(target.value)} options={options} />
        <input type='number' onChange={ ({target}) => setBorn(target.value)} />
        <button type='submit'> Update Author</button>

      </form>

    </div>
  )
}

export default Authors
