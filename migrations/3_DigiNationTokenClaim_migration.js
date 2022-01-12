const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const DigiNationTokenClaim = artifacts.require("DigiNationTokenClaim");

module.exports = async function(deployer, network) {
	let msgSigner;

	if (network === 'live'){
		msgSigner = '0x0459a981E33Ea4f1E4713D35995da6c426C7c917';
	}else if (network === 'rinkeby' || network === 'development'){
		msgSigner = '0xD60de530175295dDb97f3ada1FA332824d4509A8';
	}

	await deployProxy(
		DigiNationTokenClaim,
		[
			msgSigner,
		],
		{
			deployer,
			initializer: 'initialize'
		}
	);
};
