const express = require('express');
const router = express.Router();
const { TrufflepigLoader } = require('@colony/colony-js-contract-loader-http');
const loader = new TrufflepigLoader();
const {createNewColony, getColony} = require('../colony/colony');
const {createNewTask, getCreatedTask, modifyTask, rateTask, submitTask, setTaskDueDate, currentBlockTime} = require('../colony/task');
const {MultiSigEvents} = require('../colony/MultiSigEvents');


router.get('/', function (req, res, next) {
    res.json({status: 'OK', message: 'Nothing to see here folks!'});
});

router.post('/createColony', function(req, res, next) {

    const privateKey = req.body.privateKey;
    const tokenName = req.body.tokenName;
    const tokenSymbol = req.body.tokenSymbol;

    createNewColony(privateKey, tokenName, tokenSymbol)
        .then(response => res.json({response}))
        .catch(error => res.json({status: "error", error}));
});


router.post('/createTask', function (req, res, next) {
    const colonyAddress = req.body.colonyAddress || null;
    const colonyId = parseInt(req.body.colonyId) || null;
    const taskSpecification = req.body.taskSpecification;
    const privateKey = req.body.privateKey;

    getColony(privateKey, colonyId, colonyAddress)
        .then(data => {
            const colonyClient = data[0];
            createNewTask(colonyClient, taskSpecification)
                .then(response => res.json({response}))
                .catch(error => {
                    console.log(error);
                    res.json({status: 'Error', error})
                });
        })
        .catch(error => {console.log(error); res.json({status: 'Error', error})});
});

router.post('/getTask', function (req, res, next) {
    const colonyAddress = req.body.colonyAddress || null;
    const colonyId = req.body.colonyId || null;
    const privateKey = req.body.privateKey;
    const taskId = req.body.taskId;

    getColony(privateKey, colonyId, colonyAddress)
        .then(data => {
            const colonyClient = data[0];
            getCreatedTask(colonyClient, taskId)
                .then(response => res.json({response}))
                .catch(error => {
                    console.log(error);
                    res.json({status: 'Error', error})
                });
        })
        .catch(error => res.json({status: 'Error', error}));
});

router.post('/modifyTask', function (req, res, next) {
    const colonyAddress = req.body.colonyAddress || null;
    const colonyId = req.body.colonyId || null;
    const privateKey = req.body.privateKey;
    const taskId = req.body.taskId;
    const options = req.body.options;

    getColony(privateKey, colonyId, colonyAddress)
        .then(data => {
            const colonyClient = data[0];
            modifyTask(colonyClient, taskId, options)
                .then(response => res.json({response}))
                .catch(error => {
                    console.log(error);
                    res.json({status: 'Error', error})
                });
        })
        .catch(error => res.json({status: 'Error', error}));
});

router.post('/rateTask', function (req, res, next) {
    const colonyAddress = req.body.colonyAddress || null;
    const colonyId = req.body.colonyId || null;
    const privateKey = req.body.privateKey;
    const taskId = req.body.taskId;
    const role = req.body.role;
    const rating = req.body.rating;

    getColony(privateKey, colonyId, colonyAddress)
        .then(data => {
            const colonyClient = data[0];
            rateTask(colonyClient, taskId, rating, role)
                .then(response => res.json({response}))
                .catch(error => {
                    console.log(error);
                    res.json({status: 'Error', error})
                });
        })
        .catch(error => res.json({status: 'Error', error}));
});

router.post('/submitTask', function (req, res, next) {
    const colonyAddress = req.body.colonyAddress || null;
    const colonyId = req.body.colonyId || null;
    const privateKey = req.body.privateKey;
    const taskId = req.body.taskId;
    const taskDeliverable = req.body.taskDeliverable;

    getColony(privateKey, colonyId, colonyAddress)
        .then(data => {
            const colonyClient = data[0];
            submitTask(colonyClient,taskId,taskDeliverable)
                .then(response => res.json({response}))
                .catch(error => {
                    console.log(error);
                    res.json({status: 'Error', error})
                });
        })
        .catch(error => {
            console.log(error);
            res.json({status: 'Error', error})
        });
});

router.post('/setDueDate', function (req, res, next) {
    const colonyAddress = req.body.colonyAddress || null;
    const colonyId = req.body.colonyId || null;
    const privateKey = req.body.privateKey;
    const taskId = req.body.taskId;
    const dueDate = new Date(`${req.body.dueDate}`);
    console.log(dueDate, req.body.dueDate);
    getColony(privateKey, colonyId, colonyAddress)
        .then(data => {
            const colonyClient = data[0];
            console.log("Got Colony");
            const MultiSig = new MultiSigEvents();
            MultiSig.initialize(colonyClient, null, null);
            console.log("Initialized Multisig");
            try{
                setTaskDueDate(colonyClient, taskId, dueDate)
                    .then(response => {
                        console.log(response);
                        res.json({status: 'ok', ...response});
                    })
                    .catch(error => {
                        console.log(error);
                        res.json({status: 'Error', error})
                    });
            } catch (err) {
                console.log(err.message);
            }

        })
        .catch(error => {
            console.log(error);
            res.json({status: 'Error', error})
        });
});

router.post('/signOperation', function (req, res, next) {
    const colonyAddress = req.body.colonyAddress || null;
    const colonyId = req.body.colonyId || null;
    const privateKey = req.body.privateKey;
    const signTxn = req.body.functionName;
    const jsonRestore = req.body.restoreTxn || null;

    getColony(privateKey, colonyId, colonyAddress)
        .then(data => {
            const colonyClient = data[0];
            const MultiSig = new MultiSigEvents(colonyClient, null, jsonRestore);
            MultiSig.signOperation(`${signTxn}`)
                .then(response => res.json({response}))
                .catch(error => {
                    console.log(error);
                    res.json({status: 'Error', error})
                });
        })
        .catch(error => {
            console.log(error);
            res.json({status: 'Error', error})
        });
});

module.exports = router;
