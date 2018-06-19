import {EventEmitter} from 'events';

class MultiSigEvents extends EventEmitter {


    private colonyClient;
    private ms;
    static jsonData = null;

    constructor(_colonyClient){
        super();
        this.colonyClient = _colonyClient;
    }

    startSetPayment = async (asyncFunc,taskId, source, amount) => {
        this.emit('startOperation');
        try{
            this.ms = this.colonyClient[asyncFunc].startOperation({taskId, source, amount});
            this.emit('signatureRequired', this.ms);
        } catch (err){
            this.emit('error', err);
        }
    };

    signOperation = async (asyncFunc) => {
        this.emit('signingStart');
        try{
            if(MultiSigEvents.jsonData)
                this.ms = await this.colonyClient[asyncFunc]().restoreOperation(MultiSigEvents.jsonData);
            this.ms.refresh();
            this.ms.sign();
            MultiSigEvents.jsonData = ms.toJSON();
            this.emit('signingEnd', ms.toJSON());
        } catch(err){
            this.emit('error', err);
        }
    };

    finalizeOperations = async () => {
        const {success} = await this.ms.send();
        this.emit('endOperation', success);
    }
}

module.exports = {MultiSigEvents};