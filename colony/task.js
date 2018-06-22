const ecp =  require('./ecp');
const BigNumber =  require('ethers/utils/bignumber').bigNumberify;
const randomBytes = require('crypto').randomBytes;
const web3Utils = require('web3-utils');
const Web3 = require('web3');
// const getRandomString = require('./helper').getRandomString;

const createNewTask = async (colonyClient, taskSpecification) => {

    await ecp.init();

    const specificationHash = await ecp.saveTaskSpecification(taskSpecification);
    console.log(taskSpecification, specificationHash);
    const { eventData: { taskId }} = await colonyClient.createTask.send({ specificationHash, domainId: 1 });
    const task = await colonyClient.getTask.call({ taskId });
    ecp.stop();

    return {task, specificationHash}
};


const modifyTask = async (colonyClient, taskId, options = {}) => {
    const {walletManager, walletWorker, walletEvaluator, domainId, skillId} = options;
    console.log(walletEvaluator,walletManager, walletWorker);
    if(walletManager){
        await colonyClient.setTaskRoleUser.send({
            taskId: 1,
            role: 'MANAGER',
            user: `${walletManager}`,
        });
    }
    if(walletWorker){
        await colonyClient.setTaskRoleUser.send({
            taskId: 1,
            role: 'WORKER',
            user: `${walletWorker}`,
        });
    }
    if(walletEvaluator){
        await colonyClient.setTaskRoleUser.send({
            taskId: 1,
            role: 'EVALUATOR',
            user: `${walletEvaluator}`,
        });
    }
    if(domainId){
        await colonyClient.setTaskDomain.send({
            taskId: taskId,
            domainId: domainId,
        });
    }
    if(skillId){
        await colonyClient.setTaskSkill.send({
            taskId: taskId,
            skillId: skillId,
        });
    }

    return options;
};

const getCreatedTask = async (colonyClient, taskId) => {
    return await colonyClient.getTask.call({ taskId });
};

const rateTask = async (colonyClient, taskId, rating, role) => {
    await ecp.init();
    let salt = web3Utils.soliditySha3("abcdefghij");
    salt = `${salt}`;
    console.log(salt);
    rating = BigNumber(rating);
    let ratingSecret = await colonyClient.generateSecret.call({salt, value: rating});
    console.log(ratingSecret);
    ratingSecret = `${ratingSecret}`;
    await colonyClient.submitTaskWorkRating.send({
        taskId,
        role,
        ratingSecret
    });
    ecp.stop();
    return {taskId, rating, role};
};

const submitTask = async (colonyClient, taskId, taskDeliverable) => {
    await ecp.init();
    const deliverableHash = await ecp.saveTaskSpecification(taskDeliverable);
    console.log(deliverableHash);
    await colonyClient.submitTaskDeliverable.send({taskId, deliverableHash});
    return {taskId, taskDeliverable, deliverableHash};
};

const setTaskDueDate = async (colonyClient, taskId, dueDate) => {
    console.log(taskId, dueDate);
    const ms = await colonyClient.setTaskDueDate.startOperation({taskId, dueDate});
    return {missingSignees: ms.missingSignees}
};

async function currentBlockTime() {
    const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    const p = new Promise((resolve, reject) => {
        web3.eth.getBlock("latest", (err, res) => {
            if (err) {
                return reject(err);
            }
            return resolve(res.timestamp);
        });
    });
    return p;
}

module.exports = {createNewTask, modifyTask, getCreatedTask, rateTask, submitTask, setTaskDueDate, currentBlockTime};
