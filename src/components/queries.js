import { gql } from '@apollo/client';

const BOOK_DETAILS = gql`
fragment BookDetails on Book {
    title
    published
    author {
        name
        born
    }
    genres
}`


export const LOGIN = gql`
  mutation login($username: String!) {
    login(username: $username)  {
      value
    }
  }
`

export const FILTERED_BOOKS = gql`
query FilterBooks($genre: String) {
    allBooks(genre: $genre) {
        ...BookDetails
    }
}
${BOOK_DETAILS}
`

export const ALL_BOOKS = gql`
query {
    allBooks {
        ...BookDetails
    }
}
${BOOK_DETAILS}
`

export const ALL_AUTHORS = gql`
query {
    allAuthors {
        name
        born
        bookCount
    }
}
`
export const CURRENT_USER = gql`
query {
    me {
        username
        favoriteGenre
    }
}`
export const ADD_BOOK = gql`
mutation CreateBook($title: String!, $author: String!, $published: Int!, $genres: [String]) {
    addBook(
        title: $title,
        author: $author,
        published: $published,
        genres: $genres
    ) {
        title
    }
}
`
export const UPDATE_AUTHOR = gql`
mutation UpdateAuthor($name: String!, $year: Int!) {
    editAuthor(
        name: $name,
        setBornTo: $year
    ) {
        name
        born
    }
}`

export const BOOK_ADDED = gql`
subscription {
    bookAdded {
        ...BookDetails
    }
}
${BOOK_DETAILS}`