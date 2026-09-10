const app = require('./app');
const env = require('./config/environment');
const { connectDB } = require('./config/database');

const startServer = async () => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(`=================================================`);
    console.log(`🚀 ATS Chatbot Backend running on port ${env.port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health Check: http://localhost:${env.port}/health`);
    console.log(`=================================================`);
  });
};

startServer();
