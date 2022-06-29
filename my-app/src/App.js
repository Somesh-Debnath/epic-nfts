import "./styles/App.css";
import twitterLogo from "./assests/twitter-logo.svg";
import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
// Constants
const TWITTER_HANDLE = "_buildspace";
const MY_TWITTER_HANDLE = "SomeshDebnath73";
const MY_TWITTER_LINK=`https://twitter.com/${MY_TWITTER_HANDLE}`;
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = "0x41d288E1817b7CF60d3FE829095d0bEE40fadFDE";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [networkId, setNetworkId] = useState();
  const [nftMinted, setNftMinted] = useState(0);
  const [minting, setMinting] = useState(false);

  const checkIfWalletIsConnected = useCallback(async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
    getTotalNFTsMintedSoFar();
    setupEventListener();

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
    if (ethereum) setNetworkId(parseInt(ethereum.chainId, 16));
    ethereum.on("chainChanged", (chainId) => {
      console.log(chainId);
      setNetworkId(parseInt(chainId, 16));
    });
  }, []);

  useEffect(() => {
    checkIfWalletIsConnected();
    setNftMinted(JSON.parse(localStorage.getItem("nftMinted")));
  }, []);
useEffect(() => {
  localStorage.setItem("nftMinted", JSON.stringify(nftMinted)); 
},[nftMinted]);
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button
      onClick={askContractToMintNft}
      disabled={networkId !== 4}
      className="cta-button connect-wallet-button"
    >
      {networkId !== 4
        ? "Wrong Network! Switch to Rinkeby."
        : minting
        ? "Minting..."
        : "Mint NFT"}
    </button>
  );
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;
    
      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setNftMinted(tokenId.toNumber() + 1);
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setMinting(true);
        console.log("Mining...please wait.");
        await nftTxn.wait();
        setMinting(false);
        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getTotalNFTsMintedSoFar = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        const tokenId = await connectedContract.nftMintedSoFar();
        console.log(tokenId);
        setNftMinted(tokenId.toString());
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {nftMinted>0 ? (<h4 className='sub-text'>{nftMinted}/50 NFTs have been minted</h4>)
          :
          (<h4 className='sub-text'>0/50 NFTs have been minted</h4>)}
          
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}{" "}
        </div>
        <div className="footer-container">
        <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={MY_TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${MY_TWITTER_HANDLE}`}</a>
           <a
            className="footer-text"
            href={`https://testnets.opensea.io/collection/squarenft-24oboflpdc`}
            target="_blank"
            rel="noreferrer"
          >{`🌊 View Collection on OpenSea`}</a>
        </div>
      </div>
    </div>
    
  );
};

export default App;