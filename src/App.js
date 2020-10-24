
import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client'
import { ALL_BOOKS, ALL_AUTHORS, ADD_BOOK, UPDATE_AUTHOR, CURRENT_USER, FILTERED_BOOKS, BOOK_ADDED  } from './components/queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [filteredbooks, setFilterBooks] = useState(null)
  const allbooks = useQuery(ALL_BOOKS)
  const allauthors = useQuery(ALL_AUTHORS)
  const userfav = useQuery(CURRENT_USER)
  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      updateCacheWith(addedBook)
      window.alert(`book named ${addedBook.title} added`)
    }
  })
  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) => 
      set.map(p => p.id).includes(object.id)  

    const dataInStore = client.readQuery({ query: ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks : dataInStore.allBooks.concat(addedBook) }
      })
    } }  
  
  const [ addbook ] = useMutation(ADD_BOOK, {
    update: async (store, response) => {
      updateCacheWith(response.data.addBook)
      if (store.data.data.ROOT_QUERY[`allBooks({\"genre\":\"${userfav.data.me.favoriteGenre}\"})`]) { // check manually
      const filteredDataInStore = store.readQuery({ query: FILTERED_BOOKS }) // does not return null if does not exist so we have to check manually
        await store.writeQuery({
          query: FILTERED_BOOKS,
          variables: {
            genre: userfav.data.me.favoriteGenre
          },
          data: {
            ...filteredDataInStore,
            allBooks: [...filteredDataInStore.allBooks, response.data.addBook]
          }
        })
      }
    }})
  const [ updateauthor ] = useMutation(UPDATE_AUTHOR, { refetchQueries: [ { query: ALL_AUTHORS }]})
  
  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('books')
  }
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={ () =>
          setPage('books')
            }>books</button>
        { token ? <button onClick={() => setPage('add')}>add book</button>: ''}
        { token ? <button onClick={ async () => {
          const { data } = await client.query({
            query: FILTERED_BOOKS
            , variables: { genre:  userfav.data.me.favoriteGenre }, 
          }) // if it does not exist on cache, query, else get from cache
          await client.writeQuery({
            query: FILTERED_BOOKS,
            data: {...data}
          })
          setFilterBooks(data)
          setPage('recommend')}}>Recommend</button>: ''}
  { !token ? <button onClick={() => setPage('Login')}>Login</button> : <button onClick={() => logout()}>Logout</button> }
      </div>

      <Authors
        show={page === 'authors'} allauthors={allauthors} updateauthor={updateauthor}
      />

      <Books
        show={page === 'books'} allbooks={allbooks}
      />
      <NewBook
        show={page === 'add'} addbook={addbook}
      />
      {page === 'Login' ? <Login setToken={setToken} setPage={setPage} /> : ''}
      <Books show={page === 'recommend'} allbooks={allbooks} recommend={'yes'}  filteredbooks={filteredbooks} />


    </div>
  )
}

export default App