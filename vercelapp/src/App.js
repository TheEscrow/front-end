import { useEffect, useState } from 'react';
import './App.css';
import contract from './contract/OfferEscrow.json';
import { ethers } from 'ethers';
import { Formik, Field, Form } from "formik";

const contractAddress = "0xf1eE9Ff90cb29431B997CFbbb0755d6f81ffF2a3";
const abi = contract.abi;

function App() {
  
  const [currentAccount, setCurrentAccount] = useState(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  }

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
    }
  }
  
  const OfferHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);

        console.log("Initialize payment");
        let nftTxn = await nftContract.createOffer("TestName", { value: ethers.utils.parseEther("0.001") });

        console.log("Sending transaction... please wait");
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const createOfferButton = () => {
    return (
      <button onClick={OfferHandler} className='cta-button create-offer-button'>
        Create an Offer
      </button>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
    <div className='main-app'>
      <h1>Decentralised Fiverr - powered by the Escrow</h1>
      <div>
        {currentAccount ? createOfferButton() : connectWalletButton()}
        <Formik
        initialValues={{name: ""}}
        onSubmit={async (values) => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          alert(JSON.stringify(values, null, 2));
        }}
      >
        <Form>
          <Field name="offerName" type="text" />
          <button type="submit">Submit</button>
        </Form>
      </Formik>
      </div>
    </div>
  )
}

export default App;