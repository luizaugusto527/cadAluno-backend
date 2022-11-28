// API REST dos alunos
import express from "express"
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const nomeCollection = 'alunos'
const { db, ObjectId } = await connectToDatabase()

/**********************************************
 * Validações
 * 
 **********************************************/
 const validaAluno = [
  check('nome')
  .not().isEmpty().trim().withMessage('É obrigatório informar o nome')
  .isAlphanumeric('pt-BR', { ignore: '/. ' }).withMessage('O nome do aluno deve conter apenas caracteres alfanuméricos'),
    check('cpf')
    .not().isEmpty().trim().withMessage('É obrigatório informar o CPF do aluno')
    .isNumeric().withMessage('O CPF não pode conter caracteres especiais, apenas números')
    .isLength({ min: 11, max: 11 }).withMessage('O CPF deve conter 11 números.')
    .custom((value, { req }) => {
      return db.collection(nomeCollection).find({ cpf: { $eq: value } }).toArray()
        .then((cpf) => {
          if (cpf.length && !req.body._id) {
            return Promise.reject(`O cpf ${value} já está em uso por outro aluno`)
          }
        })
    }),

    check('cpf', 'O cpf deve ser um número').isNumeric(),
    check('curso').optional({nullable: true}),
    check('data_matricula')
    .optional({nullable: true})
    .isDate({format: 'YYYY-MM-DD'})
    .withMessage('A data de matricula não é úma data válida')
]


/**********************************************
 * GET /api/alunos
 **********************************************/
 router.get('/', async (req, res) => {
   
    try {
      db.collection(nomeCollection).find().sort({ razao_social: 1 }).toArray((err, docs) => {
        if (!err) {
        
          res.status(200).json(docs)
        }
      })
    } catch (err) {
      
      res.status(500).json({
        errors: [
          {
            value: `${err.message}`,
            msg: 'Erro ao obter a listagem dos prestadores de serviço',
            param: '/'
          }
        ]
      })
    }
  })

/**********************************************
 * GET /alunos/id/:id
 **********************************************/
router.get("/id/:id", async (req, res) => {
    
    try {
        db.collection(nomeCollection).find({ "_id": { $eq: ObjectId(req.params.id) } }).toArray((err, docs) => {
            if (err) {
                res.status(400).json(err) //bad request
            } else {
                res.status(200).json(docs) //retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({ "error": err.message })
    }
})


/**********************************************
 * POST /alunos/
 **********************************************/
 router.post('/', validaAluno, async (req, res) => {
   
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
            .insertOne(req.body)
            .then(result => res.status(201).send(result)) //retorna o ID do documento inserido)
            .catch(err => res.status(400).json(err))
    }
})

/**********************************************
 * PUT /alunos
 * Alterar um aluno pelo ID
 **********************************************/
router.put('/', validaAluno, async (req, res) => {
  let idDocumento = req.body._id
  delete req.body._id 
   
    const schemaErrors = validationResult(req)
    if (!schemaErrors.isEmpty()) {
        return res.status(403).json(({
            errors: schemaErrors.array() 
        }))
    } else {
        await db.collection(nomeCollection)
            .updateOne({ '_id': { $eq: ObjectId(idDocumento) } },
                { $set: req.body }
            )
            .then(result => res.status(202).send(result))
            .catch(err => res.status(400).json(err))
    }
})

/**********************************************
 * DELETE /alunos/
 **********************************************/
router.delete('/:id', async (req, res) => {
   
    await db.collection(nomeCollection)
        .deleteOne({ "_id": { $eq: ObjectId(req.params.id) } })
        .then(result => res.status(202).send(result))
        .catch(err => res.status(400).json(err))
})


export default router