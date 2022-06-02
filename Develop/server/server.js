const express = require('express');
const path = require('path');

//db connection
const db = require('./config/connection');
const routes = require('./routes');

//import apollo server 
const { ApolloServer } = require('apollo-server-express');

//import typeDefs and resolvers as middleware 
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

//express server 
const app = express();
const PORT = process.env.PORT || 3001;

// apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware

});


//middleware parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// app.use(routes);

//get all data
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', async () => {
  await server.start()
  server.applyMiddleware({ app });
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
