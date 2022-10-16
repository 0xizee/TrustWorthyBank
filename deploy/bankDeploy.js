const devlopmentChains = ["hardhat","localhost"];
const { ethers, network } = require("hardhat");

module.exports = async function({getNamedAccounts , deployments}){
    const {deployer} = await getNamedAccounts();
    const {deploy,log} = deployments;
    let args;

    if(devlopmentChains.includes(network.name)){
        const Accounts = await ethers.getSigners();
        const player = Accounts[1];
        const playerTwo = Accounts[2];
        args = [player.address,playerTwo.address];
    }else{

    }
    const Bank = await deploy('Bank',{
        from : deployer,
        args : args,
        log : true
    })
}
module.exports.tags = ["all","bank"];