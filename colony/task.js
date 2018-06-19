import * as ecp from './ecp';
import {bigNumberify as BigNumber} from 'ethers/utils/bignumber'
import {randomBytes} from 'crypto';

const createNewTask = async (colonyClient, taskSpecification) => {

    await ecp.init();

    const specificationHash = ecp.saveTaskSpecification(taskSpecification);
    const { eventData: { taskId }} = await colonyClient.createTask.send({ specificationHash, domainId: 1 });
    const task = await colonyClient.getTask.call({ taskId });
    ecp.stop();

    return {task, specificationHash}
};


const modifyTask = async (colonyClient, taskId, options = {}) => {
    const {walletMananger, walletWorker, walletEvaluator, domainId, skillId} = options;
    if(walletMananger){
        await colonyClient.setTaskRoleUser.send({
            taskId: 1,
            role: 'MANAGER',
            user: walletMananger,
        });
    }
    if(walletWorker){
        await colonyClient.setTaskRoleUser.send({
            taskId: 1,
            role: 'WORKER',
            user: walletWorker,
        });
    }
    if(walletEvaluator){
        await colonyClient.setTaskRoleUser.send({
            taskId: 1,
            role: 'EVALUATOR',
            user: walletEvaluator,
        });
    }
    if(domainId){
        await colonyClient.setTaskDomain.send({
            taskId: 1,
            domainId: domainId,
        });
    }
    if(skillId){
        await colonyClient.setTaskSkill.send({
            taskId: 1,
            skillId: 5,
        });
    }

    return options;
};

const getCreatedTask = async (colonyClient, taskId) => {
    return await colonyClient.getTask.call({ taskId });
};

const rateTask = async (colonyClient, taskId, rating, role) => {
    const salt = randomBytes(16).toString('hex').slice(0,32);
    console.log(salt);
    rating = BigNumber(rating);
    const ratingSecret = colonyClient.generateSecret({salt, rating});
    colonyClient.submitTaskWorkRating.send({
        taskId,
        role,
        ratingSecret
    });
    return {taskId, rating, role};
};

module.exports = {createNewTask, modifyTask, getCreatedTask, rateTask};
