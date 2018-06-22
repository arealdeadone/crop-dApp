const {EventEmitter} = require('events');

class MultiSigEvents extends EventEmitter {


    initialize(_colonyClient, _ms, _jsonData){
        this.colonyClient = _colonyClient;
        this.ms = _ms;
        MultiSigEvents.jsonData = _jsonData;
    }

      async startSetPayment (asyncFunc,taskId, source, amount) {
        this.emit('startOperation');
        try{
            this.ms = this.colonyClient[asyncFunc].startOperation({taskId, source, amount});
            this.emit('signatureRequired', this.ms);
        } catch (err){
            this.emit('error', err);
        }
    };

    async setTaskDueDate (taskId, dueDate) {
        this.emit('startOperation');
        console.log(taskId);
        this.ms = await this.colonyClient.setTaskDueDate.startOperation({taskId, dueDate});
        this.emit('signatureRequired', this.ms);
        return {missingSignees: this.ms.missingSignees}
    }

     async signOperation (asyncFunc)  {
        this.emit('signingStart');
        try{
            if(MultiSigEvents.jsonData)
                this.ms = await this.colonyClient[asyncFunc].restoreOperation(MultiSigEvents.jsonData);
            console.log(this.ms.missingSignees);
            this.ms.refresh();
            this.ms.sign();
            MultiSigEvents.jsonData = this.ms.toJSON();
            this.emit('signingEnd', MultiSigEvents.jsonData);
            return {jsonRestore: MultiSigEvents.jsonData};
        } catch(err){
            this.emit('error', err);
        }
         return {jsonRestore: {}};
    };

     async finalizeOperations () {
         try{
             const {success} = await this.ms.send();
             this.emit('endOperation', success);
             console.log(success);
             return {success};
         } catch (err) {
             this.emit('error', err);
         }

         return {success: false};

    }

    getMissingSignees(){
         return this.ms.missingSignees;
    }
}

module.exports = {MultiSigEvents};