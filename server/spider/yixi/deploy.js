require('dotenv').config()

const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.MYSQL_DATABSE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST,
  dialect: 'mysql'
})

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.')
}).catch((e) => {
  console.log('Unable to connect to the database', e)
})