const ecp =  require('./ecp');
const web3Utils = require('web3-utils');
const Web3 = require('web3');


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
    let salt = web3Utils.soliditySha3("aaaaaaaaaa");
    let ratingSecret;
    try{
        ratingSecret = await colonyClient.generateSecret.call({salt, value: rating});
    } catch (err) {
        console.log(err.message);
    }
    console.log(ratingSecret);
    await colonyClient.submitTaskWorkRating.send({
        taskId,
        role,
        secret: ratingSecret.secret
    });
    return {taskId, rating, role};
};

const submitTask = async (colonyClient, taskId, taskDeliverable) => {
    await ecp.init();
    const deliverableHash = await ecp.saveTaskSpecification(taskDeliverable);
    console.log(deliverableHash);
    await colonyClient.submitTaskDeliverable.send({taskId, deliverableHash});
    ecp.stop();
    return {taskId, taskDeliverable, deliverableHash};
};

module.exports = {createNewTask, modifyTask, getCreatedTask, rateTask, submitTask};
