import express from "express"
import cors from 'cors'
//import fs from 'fs'
//import swaggerUI from 'swagger-ui-express'
//import das rotas do app
import rotasAlunos from './routes/alunos.js'

const app = express()
const port = process.env.PORT || 3900

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json()) 

// Rotas do app
app.use('/api/alunos', rotasAlunos)

//Rota para tratar erros - deve ser sempre a última!
app.use(function(req, res) {
    res.status(404).json({
        errors: [{
            value: `${req.originalUrl}`,
            msg: `A rota ${req.originalUrl} não existe nesta API!`,
            param: 'invalid route'
        }]
    })
})
app.listen(port, function() {
    console.log(`Servidor rodando na porta ${port}!🚀`)
})