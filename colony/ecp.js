const IPFS = require('ipfs');
const { Buffer } = require('buffer');

let node;

const waitForIPFS = () => {
    node = new IPFS({ start: false });
    return new Promise((resolve, reject) => {
        node.on('ready', () => resolve(true));
        node.on('error', err => reject(err));
    })
};

exports.init = async () => {
    await waitForIPFS();
    return node.start();
};

exports.saveTaskSpecification = async (spec) => {
    const data = Buffer.from(JSON.stringify(spec));
    const result = await node.files.add(data);
    return result[0].hash;
};

exports.getTaskSpecification = async (hash) => {
    const buf = await node.files.cat(`/ipfs/${hash}`);
    let spec;
    try {
        spec = JSON.parse(buf.toString());
    } catch (e) {
        throw new Error(`Could not get task specification for hash ${hash}`);
    }
    return spec;
};

exports.stop = () => node.stop();