const { providers, Wallet } = require('ethers');
const { default: EthersAdapter } = require('@colony/colony-js-adapter-ethers');
const { TrufflepigLoader } = require('@colony/colony-js-contract-loader-http');

// Import the ColonyNetworkClient
const { default: ColonyNetworkClient } = require('@colony/colony-js-client');

// Create an instance of the Trufflepig contract loader
const loader = new TrufflepigLoader();

// Create a provider for local TestRPC (Ganache)
const provider = new providers.JsonRpcProvider('http://localhost:8545/');

// The following methods use Promises
const example = async () => {

  // Get the private key from the first account from the ganache-accounts
  // through trufflepig
  const {address, privateKey} = await loader.getAccount(0);
  // Create a wallet with the private key (so we have a balance we can use)
  const wallet = new Wallet(privateKey, provider);

  // Create an adapter (powered by ethers)
  const adapter = new EthersAdapter({
    loader,
    provider,
    wallet,
  });

  // Connect to ColonyNetwork with the adapter!
  const networkClient = new ColonyNetworkClient({ adapter });
  await networkClient.init();

  // Let's deploy a new ERC20 token for our Colony.
  // You could also skip this step and use a pre-existing/deployed contract.
  const tokenAddress = await networkClient.createToken({
    name: 'Cool Colony Token',
    symbol: 'COLNY',
  });
  console.log('Token address: ' + tokenAddress);

  // Create a cool Colony!
  const {
    eventData: { colonyId, colonyAddress },
  } = await networkClient.createColony.send({ tokenAddress });

  // Congrats, you've created a Colony!
  console.log('Colony ID: ' + colonyId);
  console.log('Colony address: ' + colonyAddress);

  // For a colony that exists already, you just need its ID:
  const colonyClient = await networkClient.getColonyClient(colonyId);

  // Or alternatively, just its address:
  // const colonyClient = await networkClient.getColonyClientByAddress(colonyAddress);

  // You can also get the Meta Colony:
  const metaColonyClient = await networkClient.getMetaColonyClient();
  console.log('Meta Colony address: ' + metaColonyClient.contract.address);

  const { eventData: { taskId } } = await colonyClient.createTask.send({
      specificationHash: "QmbjBxfco6BzykJtSxXt9ZXajMhMSsuYVmPzT5Z4RSMdAi",
      domainId: 1,
  });
  await colonyClient.setTaskRoleUser.send({
  taskId: 1,
  role: 'MANAGER',
  user: `${address}`
});

// Set the worker
await colonyClient.setTaskRoleUser.send({
  taskId: 1,
  role: 'WORKER',
  user: `${address}`,
});
const dueDate = new Date("Fri, 23 Jun 2018 11:00:21 GMT");
const ms = await colonyClient.setTaskDueDate.startOperation({ taskId, dueDate })
// console.log(ms.missingSignees);

};

example()
.then(() => process.exit(0))
.catch(err => console.log(err));
