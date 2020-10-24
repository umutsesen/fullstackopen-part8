
const { ApolloServer, gql, UserInputError, PubSub } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/bookModel')
const Author = require('./models/authorModel')
const User = require('./models/userModel')
const jwt = require('jsonwebtoken')
const pubsub = new PubSub()

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'



const MONGODB_URI = 'mongodb+srv://nuksws77:xuLc52HxyhyQMrm6@phonebook.ew1pi.mongodb.net/<dbname>?retryWrites=true&w=majority'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })


const typeDefs = gql`
  type Query {
      authorCount: Int!
      bookCount: Int!
      getAuthor: Author!
      allBooks(author: String, genre: String): [Book]!
      allAuthors: [Author]!
      me: User
  }
  type Author {
      name: String
      born: Int
      bookCount: Int
      id: ID!
  }
  type Book {
      title: String!
      published: Int!
      author: Author!
      id: ID!
      genres: [String!]!
  }
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }

  type Subscription {
    bookAdded: Book!
  }
  
  type Mutation {
      addBook(
          title: String!
          author: String!
          published: Int!
          genres: [String]
      ): Book
      addAuthor(
        name: String!
        born: Int
        ): Author
      editAuthor(
          name: String!
          setBornTo: Int!
      ):  Author
      createUser(
        username: String!
        favoriteGenre: String!
      ): User
      login(
        username: String!
        password: String
      ): Token
    
  }
`

const resolvers = {
  Query: {
      bookCount: () => Book.collection.countDocuments(),
      authorCount: () => Author.collection.countDocuments(),
      allBooks: async (root, args) => {
        if (args.genre && args.author) {
            return await Book.find({ genres: [args.genre], author: args.author }).populate('author')  // could use $in
        }  
        if (args.genre) {
            return await Book.find({ genres: [args.genre] }).populate('author')
       }
       if (args.author) {
           return await Book.find({ author: args.author }).populate('author')
        }
        //, author: {...author, id: author.id}
        //          const author = await Author.find({ _id: args.author })
          return await Book.find({}).populate('author')
      },
      allAuthors: async () => {
        const authors = await Author.find({})
        const SpreadAuthors = { ...authors }
        let newreturnval = []
        const books = {...await Book.find({}).select('author -_id')}
        for (let authnum in SpreadAuthors) {
          let numbercount = 0
        for (let num in books) {
          if (JSON.stringify(books[num].author) === JSON.stringify(SpreadAuthors[authnum]._id)) {
            numbercount++
          } 
        }
        SpreadAuthors[authnum].bookCount = numbercount
        newreturnval.push(SpreadAuthors[authnum])
      }
          return newreturnval
      },
      me: (root, args, context) => {
        return context.currentUser
      }

  }, // FORGOT TO USE POPULATE.
  //Author: {
  //  name: async (root) => { 
   //   const thatauth = await Author.findById(root._id)
    //  return thatauth.name
//    },
  //  born: async (root) => {
   //   const thatauth = await Author.findById(root._id)
   //   return thatauth.born
    //}


 // },
  Mutation: {
      addBook: async (root, args, context) => {
          if (!context.currentUser) {
            return null
          }
          const newbook = new Book({ ...args })
          try {
             await newbook.save()
          } catch (error) {
            throw new UserInputError(error.message, {
              invalidArgs: args
            })
          }
          pubsub.publish('BOOK_ADDED', { bookAdded: newbook })
          return newbook

      },
      addAuthor: (root, args) => {
        const newauthor = new Author({ ...args })
        try {
          return newauthor.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        }
      },
      editAuthor: async (root, args, context) => {
        if (!context.currentUser) {
          return null
        }
          const foundauthor = await Author.findOne({ name: args.name })
          foundauthor.born = args.setBornTo
          try {
            return foundauthor.save()
          } catch (error) {
            throw new UserInputError(error.message, {
              invalidArgs: args
            })
          }
      },
      createUser: async (root, args) => {
        const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
        try {
          return user.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        }
      },
      login: async (root, args) => {
        const user = await User.findOne({ username: args.username })
        if (!user) {
          throw new UserInputError("wrong credentials")
        }
        const userForToken = {
          username: user.username,
          id: user._id,
        }
        return { value: jwt.sign(userForToken, JWT_SECRET) }
      },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`Server ready at ${url}`)
  console.log(`Subscriptions ready at ${subscriptionsUrl}`)
})