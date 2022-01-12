const { assert, expect } = require('chai');
const EthCrypto = require("eth-crypto");
const {
	BN,	 // Big Number support
	constants,	// Common constants, like the zero address and largest integers
	expectEvent,	// Assertions for emitted events
	expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const Alpha = artifacts.require("Alpha");
const DigiNationTokenClaim = artifacts.require("DigiNationTokenClaim");

function toEthSignedMessageHash (messageHex) {
	const messageBuffer = Buffer.from(messageHex.substring(2), 'hex');
	const prefix = Buffer.from(`\u0019Ethereum Signed Message:\n${messageBuffer.length}`);
	return web3.utils.sha3(Buffer.concat([prefix, messageBuffer]));
}

contract("ECDSA", async accounts => {
	const [deployer, sender] = accounts;

	before(async function () {
		this.ecdsa = await DigiNationTokenClaim.deployed();
		this.alpha = await Alpha.deployed();

		await this.alpha.transfer(this.ecdsa.address, web3.utils.toWei((10000).toString(), 'ether'));
	});

	context('recover with valid signature', function () {
		context('using web3.eth.sign', function () {
			it('returns signer address with correct signature', async function () {
				const priKey = '0x59450985dc1328e6f6ab3d0333d6045f00355013b42b7cdcc58c7246edae1b59';
				const amount = web3.utils.toWei((100).toString(), 'ether');
				const nonce = 1;

				const message = EthCrypto.hash.keccak256([
					{ type: "address", value: sender },
					{ type: "address", value: this.alpha.address },
					{ type: "uint256", value: amount },
					{ type: "uint256", value: nonce },
				]);

				// console.debug(message);

				// Create the signature
				const signature = EthCrypto.sign(priKey, message);

				// console.debug(signature);

				const res = await this.ecdsa.claim(this.alpha.address, amount, nonce, signature, {from: sender});
				console.debug(res);

				const contract_balance = await this.alpha.balanceOf(this.ecdsa.address);
				console.debug(contract_balance.toString());

				const sender_balance = await this.alpha.balanceOf(sender);
				console.debug(sender_balance.toString());

			});
	
			// it('returns signer address with correct signature for arbitrary length message', async function () {
			// 	// Create the signature
			// 	const signature = await web3.eth.sign(NON_HASH_MESSAGE, other);
		
			// 	// Recover the signer address from the generated message and signature.
			// 	expect(await this.ecdsa.recover(
			// 		toEthSignedMessageHash(NON_HASH_MESSAGE),
			// 		signature,
			// 	)).to.equal(other);
			// });
		});
	});
	
	// context('toEthSignedMessageHash', function () {
	// 	it('prefixes bytes32 data correctly', async function () {
	// 		expect(await this.ecdsa.methods['toEthSignedMessageHash(bytes32)'](TEST_MESSAGE))
	// 		.to.equal(toEthSignedMessageHash(TEST_MESSAGE));
	// 	});
	
	// 	it('prefixes dynamic length data correctly', async function () {
	// 		expect(await this.ecdsa.methods['toEthSignedMessageHash(bytes)'](NON_HASH_MESSAGE))
	// 		.to.equal(toEthSignedMessageHash(NON_HASH_MESSAGE));
	// 	});
	// });
});
