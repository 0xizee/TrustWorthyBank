// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


error FailedToSendtoBob();
error FailedToSendtoAlice();
error wrongHashProvided();

contract Bank{
    address payable immutable public alice; 
    address payable immutable public bob;
    bytes32 private hash = 0xfd8ee9c38ade5c6a064af914e2032fc97a53fd3af9ae11358ed3b7bafe4c3d1c;

    struct withdraw{
        uint amount;
        bytes32 hash;
    }

    mapping(uint => withdraw) public withdrawAsMuchYouWant_Alice;

    modifier onlyBob(){
        require(msg.sender == bob , "OnlyBOB");
        _;
    }
    modifier onlyAlice(){
        require(msg.sender == alice,"OnlyAlice");
        _;
    }
    constructor (address payable _alice , address payable _bob){
        alice = _alice;
        bob = _bob;
    }
    function sendToBob() payable external onlyBob {
       (bool sucess , ) = payable(msg.sender).call{value:50000000000000000}("");
       if(!sucess){
           revert FailedToSendtoBob();
       }
    }
    function sendToAlice() payable external onlyAlice{
        (bool sucess , ) = payable(msg.sender).call{value:1 ether}("");
       if(!sucess){
           revert FailedToSendtoAlice();
       }
    }  
    function getHash(string memory alphabets) internal  pure returns(bytes32) { 
        return keccak256(abi.encode(alphabets)); 
    }

    function withdrawMore(uint _amount , string memory secretMessageOnlyAliceKnows) external onlyAlice{
        uint counter = 0;
        bytes32 _hash = getHash(secretMessageOnlyAliceKnows);
        if(_hash != hash){
            revert wrongHashProvided();
        }
        withdrawAsMuchYouWant_Alice[counter++] = withdraw({amount : _amount , hash : _hash });        
    }

   function bobVote(uint whichproposal) external payable  onlyBob {
            withdraw storage aliceWant = withdrawAsMuchYouWant_Alice[whichproposal];
            if(hash != aliceWant.hash) revert wrongHashProvided();
            (bool sucess , ) = alice.call{value:aliceWant.amount}(""); 
            if(!sucess) revert FailedToSendtoAlice();
            aliceWant.amount = 0;
            aliceWant.hash = "NaN";
    }
    function sendMoneyToThisContract() external payable  {
    } 
}