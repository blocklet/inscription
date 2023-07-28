/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const forEach = require('lodash/forEach');
const last = require('lodash/last');
const { setupContractEnv, getDynamicChainMap } = require('./contract');

const cjsLibPath = path.join(__dirname, '../lib/cjs');

const localEnv = {
  INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
  GETBLOCK_API_KEY: process.env.GETBLOCK_API_KEY,
};

setupContractEnv(localEnv);

try {
  fs.rmdirSync(cjsLibPath, { recursive: true });
} catch (error) {
  console.log('lib folder not exists');
} finally {
  fs.mkdirSync(cjsLibPath, { recursive: true });
}

const contractName = 'Inscription';

// Copy contract ABI to lib folder
(() => {
  const source = fs.readFileSync(path.join(__dirname, `../artifacts/src/${contractName}.sol/${contractName}.json`));
  const json = JSON.parse(source);
  fs.writeFileSync(path.join(__dirname, `../tools/${contractName}.json`), JSON.stringify(json, null, 2));
  fs.writeFileSync(path.join(cjsLibPath, `${contractName}.json`), JSON.stringify(json, null, 2));
  console.log(`${contractName} contract compiled result copied`);
})();

// Copy Tools to lib folder
(() => {
  const tools = fs.readdirSync(path.join(__dirname, '../tools'));
  tools.forEach((name) => {
    if (['copy-to-lib.js', 'helper.js', '.DS_Store', 'batch-verify-contract.js'].includes(name)) return;
    const source = fs.readFileSync(path.join(__dirname, name));
    fs.writeFileSync(path.join(cjsLibPath, `${name}`), source);
    console.log(`tools/${name} copied`);
  });
})();

// Generate chainList
(() => {
  const evmChainIdList = [];

  forEach(getDynamicChainMap(localEnv), (_value) => {
    evmChainIdList.push(_value);
  });

  const fileName = 'EvmChainList.json';

  fs.writeFileSync(path.join(cjsLibPath, `${fileName}`), JSON.stringify(evmChainIdList, null, 2));
  fs.writeFileSync(path.join(__dirname, `../tools/${fileName}`), JSON.stringify(evmChainIdList, null, 2));
})();

// Generate verify contract json
(() => {
  const verifyContractJson = {
    module: 'contract',
    action: 'verifysourcecode',
    codeformat: 'solidity-single-file',
    runs: 200,
    optimizationUsed: 1,
    sourceCode: '',
    contractname: '',
    compilerversion: '',
  };

  // get source code
  const source = fs.readFileSync(path.join(__dirname, `../artifacts/src/${contractName}.sol/${contractName}.json`));
  const json = JSON.parse(source);

  // get buildInfo path
  const buildInfoSource = fs.readFileSync(
    path.join(__dirname, `../artifacts/src/${contractName}.sol/${contractName}.dbg.json`)
  );
  const { buildInfo } = JSON.parse(buildInfoSource);

  // get buildInfo
  const buildSource = fs.readFileSync(path.join(__dirname, '../artifacts/build-info/', last(buildInfo.split('/'))));
  const buildJson = JSON.parse(buildSource);

  verifyContractJson.sourceCode = fs.readFileSync(path.join(__dirname, `../${json.sourceName}`)).toString();
  verifyContractJson.contractname = json.contractName;
  verifyContractJson.compilerversion = `v${buildJson.solcLongVersion}`;

  const fileName = 'VerifyContract.json';

  fs.writeFileSync(path.join(cjsLibPath, `${fileName}`), JSON.stringify(verifyContractJson, null, 2));
  fs.writeFileSync(path.join(__dirname, `../tools/${fileName}`), JSON.stringify(verifyContractJson, null, 2));
})();
