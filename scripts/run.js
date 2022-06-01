async function main(){
    const nftContract=await hre.ethers.getContractFactory("MyEpicNFT");
const deployedNftContract=await nftContract.deploy();
await deployedNftContract.deployed();
console.log("Nft Contract deployed at:",deployedNftContract.address)
}
const runMain=async()=>{
try{
   await main()
    process.exit(0)
}catch(error){
    console.log(error)
    process.exit(1)
}
}

runMain()
