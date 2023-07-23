const Router = require("express")
const Clusterboard = require("../models/Clusterboard")
const User = require('../models/User')
const authMiddleware = require('../middleware/auth.middleware')
const {ParseCSVService, NetworkService} = require('../modules')

const router = new Router()

router.post('/upload', authMiddleware, async (req, res) => {
    try {
        console.log(req.files)
        if(!req.files)
        {
            throw new Error("File was not found")
        }
        let files = []
        if(Array.isArray(req.files.files)) {
            files = req.files.files
        }
        else files.push(req.files.files)
        const parsingFiles = await ParseCSVService(files)
        const user = await User.findOne({_id: req.user.id})
        if (!user) 
        {
            throw new Error("User is not defined")
        }
        const clusterboard = new Clusterboard({
            data: parsingFiles, 
            name: req.body.name, 
            user: user._id
        })
        await clusterboard.save()
        return res.status(200).json({id: clusterboard._id, name: clusterboard.name})
    }
    catch (e) {
        console.error(e)
        res.status(500).json({ message: 'Internal server error' })
    }
})

router.get('/', authMiddleware, async (req, res) => {
    try {
        const clusterboards = await Clusterboard.find({user: req.user.id})
        return res.status(200).json(clusterboards.map(clusterboard => ({ 
            id: clusterboard._id,
            name: clusterboard.name
        })))
    }
    catch (e) {
        console.log(e)
        res.status(500).json({ message: 'Internal server error' })
    }
})

router.post('/cluster', authMiddleware, async (req, res) => {
    try {
        const clusterboard = await Clusterboard.findOne({_id: req.query.id})

        if (!clusterboard) throw new Error('Clusterboard is not defined')
        const data = NetworkService.getClusteringGraph(
            clusterboard.data, 
            req.body.minClusterValue, 
            req.body.minLinksValue,
            req.body.minNodeValue
        )
        res.json(data)
    }
    catch(e) {
        console.log(e)
        res.status(500).json({ message: 'Internal server error' })
    }
})

module.exports = router


