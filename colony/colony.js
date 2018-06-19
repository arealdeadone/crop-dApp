const { providers, Wallet } = require('ethers');
const { default: EthersAdapter } = require('@colony/colony-js-adapter-ethers');
const { TrufflepigLoader } = require('@colony/colony-js-contract-loader-http');
const { default: ColonyNetworkClient } = require('@colony/colony-js-client');

const loader = new TrufflepigLoader();
const provider = new providers.JsonRpcProvider('http://localhost:8545/');

const createNewColony = async (privateKey, tokenName, tokenSymbol) => {

    const wallet = new Wallet(privateKey, provider);

    const adapter = new EthersAdapter({
        loader,
        provider,
        wallet
    });

    let name = tokenName, symbol = tokenSymbol;

    const networkClient = new ColonyNetworkClient({adapter});
    await networkClient.init();

    const tokenAddress = await networkClient.createToken({
        name,
        symbol
    });
    const {
        eventData: { colonyId, colonyAddress },
    } = await networkClient.createColony.send({ tokenAddress });

    return {
        colonyId,
        colonyAddress,
        tokenAddress
    }
};

const getColony = async (privateKey, colonyId = null, colonyAddress = null) => {

    const wallet = new Wallet(privateKey, provider);

    const adapter = new EthersAdapter({
        loader,
        provider,
        wallet
    });

    const networkClient = new ColonyNetworkClient({adapter});
    await networkClient.init();

    if(!colonyAddress)
        return [await networkClient.getColonyClient(colonyId), await networkClient.getMetaColonyClient()];
    if(!colonyId)
        return [await networkClient.getColonyClient(colonyAddress), await networkClient.getMetaColonyClient()];
};

module.exports = {createNewColony, getColony};