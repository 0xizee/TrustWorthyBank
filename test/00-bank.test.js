const { assert, expect, util } = require("chai");
const { parse } = require("dotenv");
const { utils } = require("ethers");
const { deployments, network, ethers } = require("hardhat");
const { resolveConfig } = require("prettier");
const devlopmentChains = ["hardhat","localhost"];
require("dotenv").config()

!devlopmentChains.includes(network.name)
 ?describe.skip 
 :describe("Bank" , () =>{
    let bank,playerOne , playerTwo , playerThree ,  bobAmount , aliceAmount , amount;
    beforeEach("BANK",async function(){
        await deployments.fixture(["all"]);
        const accounts = await ethers.getSigners();
        playerOne = accounts[1];
        playerTwo = accounts[2];
        playerThree = accounts[3];
        bank = await ethers.getContract("Bank",accounts[0]);
        bobAmount = ethers.utils.parseEther("0.05");
        aliceAmount = ethers.utils.parseEther("1");
        amount = ethers.utils.parseEther("10");
        const playerOneConnect = bank.connect(playerOne);
        await playerOneConnect.sendMoneyToThisContract({value:amount});
    })

    describe("Set the Constructor with address one" ,()=>{
        it("Set alice and bob address",async function(){
            const alice = await bank.alice();
            const bob = await bank.bob();
            assert.equal(alice.toString(),playerOne.address.toString());
            assert.equal(bob.toString(),playerTwo.address.toString());
        })
    })

    describe('SendToBob', () => { 
        it("OnlyBob",async function(){
            const playerThreeConnect = await bank.connect(playerThree);
            await expect(playerThreeConnect.sendToBob()).to.be.revertedWith("OnlyBOB");
        })
        it("BobWillGETMoney",async function(){
            const playerTwoConnect = await bank.connect(playerTwo);
            await playerTwoConnect.sendToBob();  
        })
     })

     describe('sendToAlice',function(){
        it("Only Alice",async function(){
            const playerThreeConnect = await bank.connect(playerThree);
            await expect(playerThreeConnect.sendToAlice()).to.be.revertedWith("OnlyAlice");
        })
        it("AliceWillGetMoney",async function(){
            const playerOneConnect = await bank.connect(playerOne);
            await playerOneConnect.sendToAlice();
        })
     })
     describe("WithDrawMore",function(){
        it("Revert if the password is wrong",async function(){
            const playerOneConnect = await bank.connect(playerOne);
            await expect(playerOneConnect.withdrawMore(ethers.utils.parseEther("5"),"smoke")).to.be.revertedWith("wrongHashProvided");
        })
        it("Check only alice",async function(){
            const playerTwoConnect = await bank.connect(playerTwo);
            await expect(playerTwoConnect.withdrawMore(ethers.utils.parseEther("4"),"Smoke")).to.be.revertedWith("OnlyAlice");
        })
        it("Now send to alice",async function(){
            const playerOneConnect = await bank.connect(playerOne);
            const withdrawAsMuchYouWant_Alice = await bank.withdrawAsMuchYouWant_Alice(0);
            const addtoVoting = await playerOneConnect.withdrawMore(ethers.utils.parseEther("4"),"Ayush");
            await addtoVoting.wait();
            const afterVoting = await bank.withdrawAsMuchYouWant_Alice(0);
            assert.equal(withdrawAsMuchYouWant_Alice.toString(),("0,0x0000000000000000000000000000000000000000000000000000000000000000"))
            assert.equal(afterVoting.toString(),(`${ethers.utils.parseEther("4")},0xfd8ee9c38ade5c6a064af914e2032fc97a53fd3af9ae11358ed3b7bafe4c3d1c`))
        })     
     })
     describe('BobWillVote', () => { 
        it("Bob will vote",async function(){
            const playerOneConnect = await bank.connect(playerOne);
            const withdrawAsMuchYouWant_Alice = await bank.withdrawAsMuchYouWant_Alice(0);
            const addtoVoting = await playerOneConnect.withdrawMore(ethers.utils.parseEther("4"),"Ayush");
            await addtoVoting.wait();
            const playerTwoConnect = await bank.connect(playerTwo);
            const beforeVote = await bank.withdrawAsMuchYouWant_Alice(0);
            const vote = await playerTwoConnect.bobVote(0);
            const afterVote = await playerOneConnect.withdrawAsMuchYouWant_Alice(0);
            assert.equal(beforeVote.toString(),(`${ethers.utils.parseEther("4")},0xfd8ee9c38ade5c6a064af914e2032fc97a53fd3af9ae11358ed3b7bafe4c3d1c`))
            assert.equal(afterVote.toString(),(`0,0x4e614e0000000000000000000000000000000000000000000000000000000000`));
        })
      })
 })