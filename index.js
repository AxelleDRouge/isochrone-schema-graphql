const { ApolloServer } = require('apollo-server')
const gql = require('graphql-tag')
const { GraphQLSchema } = require('graphql')
const resolverSchema = require('./resolvers')

// @ts-ignore
const typeDefs = gql`
  scalar Point

  type Query {
    hello:  String
  }
`

const resolvers = new GraphQLSchema(resolverSchema)

const schema = new ApolloServer({ typeDefs, resolvers })

schema.listen({ port: process.env.PORT }).then(({ url }) => {
  console.log(`schema ready at ${url}`)
})
