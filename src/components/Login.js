import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from './queries'

const Login = ({ setToken, setPage }) => {
    
    const [username, setUsername] = useState('')

    const [ login, result ] = useMutation(LOGIN)

    useEffect(() => {
        if ( result.data ) {
          const token = result.data.login.value
          setToken(token)
          localStorage.setItem('library-user-token', token)
          setPage('books')
        }
      }, [result.data]) // eslint-disable-line

    const submit = async (event) => {
        event.preventDefault()
    
        login({ variables: { username } })
      }
      
    return (
        <div>
            <form onSubmit={submit}>
        <div>
          username <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <button type='submit'>login</button>
      </form>

        </div>
    )
}

export default Login