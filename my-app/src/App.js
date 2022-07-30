import "./styles/App.css";
import twitterLogo from "./assests/twitter-logo.svg";
import {BsGithub} from "react-icons/bs";
import React, { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
import DarkModeToggle from "react-dark-mode-toggle";
// Constants
const TWITTER_HANDLE = "_buildspace";
const MY_TWITTER_HANDLE = "SomeshDebnath73";
const MY_TWITTER_LINK=`https://twitter.com/${MY_TWITTER_HANDLE}`;
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = "0x41d288E1817b7CF60d3FE829095d0bEE40fadFDE";
const INFURA_API_KEY="9aa3d95b3bc440fa88ea12eaa4456161"

const networks={
  polygon: {
    chainId: `0x${Number(137).toString(16)}`,
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com/"]
  },
};
const changeNetwork = async ({ networkName, setError }) => {
  try {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          ...networks[networkName],
          rpcUrls:["https://polygon-rpc.com/"]
        }
      ]
    });
    console.log(networks[networkName])
  } catch (err) {
    setError(err.message);
  }
};


const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [networkId, setNetworkId] = useState();
  const [nftMinted, setNftMinted] = useState(0);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState();
  const [darkMode, setDarkMode] = React.useState(true)
    
    function toggleDarkMode() {
        setDarkMode(prevMode => !prevMode)
    }


  const handleNetworkSwitch = async (networkName) => {
    setError();
    await changeNetwork({ networkName, setError });
  };
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
      }, [checkIfWalletIsConnected]);

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
      className="btn  background-animate"
    >
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => {
   return (
    
    <button
      onClick={askContractToMintNft}
      className="btn background-animate"
      >
      {
        minting
        ? "Minting..."
        : "Mint NFT"}
    </button>
   )
}
  const renderchangeNetworkUI=()=>(
    <button
    onClick={()=>handleNetworkSwitch('Rinkeby')}
    className="btn background-animate"
    > Change Network to Rinkeby
    </button>
  )

  const networkChanged = (chainId) => {
    console.log({ chainId });
  };

  useEffect(() => {
    window.ethereum.on("chainChanged", networkChanged);

    return () => {
      window.ethereum.removeListener("chainChanged", networkChanged);
    };
  }, []);
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
    <div className="h-screen font-sans w-screen content-center overflow-hidden
    bg-gradient-to-r from-red-400 via-gray-300 to-blue-500  text-center text-black font-bold justify-center pt-20 md:pt-24
    items-center">
    
      <div className="flex flex-col h-full space-y-62">
        <div className="pt-[30px] ">
          <h1 className="text-2xl md:text-6xl text-center py-4 
          font-bold text-transparent bg-clip-text 
          bg-[#0F172A]">Get your own NFT</h1>
          <p className="text-lg object-contain md:text-[25px] font-semibold py-2">
            Each unique. 
            Each beautiful. 
            Discover your NFT today.
          </p>
         <h4 className='text-lg object-contain md:text-[25px] font-semibold py-2 
         '>{nftMinted}/50 NFTs have been minted</h4>
                  
          {currentAccount === "" ? renderNotConnectedContainer() 
          :(networkId === 4)? renderMintUI():renderchangeNetworkUI()}{" "}

          <p className="py-4 text-xl text-gray-800 text-center md:mx-96">A non-fungible token is a non-interchangeable unit of
             data stored on a blockchain, a form of digital ledger, that can be 
             sold and traded. Types of NFT data units may be associated with digital
              files such as photos, videos, and audio.
          </p>
        </div>
        <div className="absolute bottom-0 w-full flex justify-center items-center ">
        <div className='transition pb-8 md:pb-0 ease-in-out delay-150 flex justify-center items-center mr-4 hover:-translate-y-1 hover:underline'>
          <img alt="Twitter Logo" className="object-contain w-9 h-9" src={twitterLogo} />
          <a
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
        <div className='transition pb-8 md:pb-0
        ease-in-out delay-150 flex justify-center items-center hover:-translate-y-1 hover:underline'>
        <img alt="Twitter Logo" className="object-contain w-9 h-9" src={twitterLogo} />
          <a
            href={MY_TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >
            built by {`@${MY_TWITTER_HANDLE}`}
          </a>          
        </div>
        </div>
           <a
            className=" absolute top-4 right-12 md:right-8 md:px-4 md:py-2 font-semibold rounded-md
            block bg-orange-400 transition duration-400 hover:scale-105 hover:bg-blue-600"
            href={`https://testnets.opensea.io/collection/squarenft-24oboflpdc`}
            target="_blank"
            rel="noreferrer"
          >{`🌊 `}</a>
     <a 
          className='transition ease-in-out delay-150 p-2 absolute top-2 left-4 text-2xl rounded-md  hover:text-blue-800'
          href="https://github.com/Somesh-Debnath/epic-nfts"
          target="_blank"
          rel="noreferrer"
        >
          <BsGithub/> 
      </a>
     
      </div>
    </div>
    
  );
};

export default App;