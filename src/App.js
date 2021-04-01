
import React, { useEffect, useState } from 'react'
import './App.css';

const waitTron = () => {
  return new Promise((resolve, reject) => {
    let attempts = 0, maxAttempts = 100;
    const checkTron = () => {
      if(window.tronWeb){
        resolve(true);
        return;
      }
      attempts++;
      if(attempts >= maxAttempts){
        reject(false);
        return;
      }
      setTimeout(checkTron, 100);
    };
    checkTron();
  })
};

const initContract = async() => {
  let tronExists = await waitTron();
  if(!tronExists){
    alert('Please login into TronLink extension!');
    return null;
  }
  const contractHEXAddress = 'TBm2j7mnhcWt6YP2SUqmejDvSCC3aVHhHX';
  let contract = await window.tronWeb.contract().at(contractHEXAddress);
  window.tronWeb.trx.getBalance("TDkSEfajmqX42Yt35WiqdyHmxBQiVRtqtv").then(result => console.log(result))
  window.tronWeb.trx.getBandwidth("TDkSEfajmqX42Yt35WiqdyHmxBQiVRtqtv", (error, bandwidth) => {
    if(error)
      return console.log("Error!!!!!!!!!! " + error);
    console.log("Bandwidth: " + bandwidth);
  });


  return contract;
}

function App() {
  const [contract, setContract] = useState(null);
  useEffect(()=>{
    initContract().then(contract=>{setContract(contract)});
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        {console.log(contract)}
        {!contract && "No contract is deployed"}
        {contract && "Contract address: " + window.tronWeb.address.fromHex(contract.address)}
        <br/>
        {window.tronLinkInitialData && "Tronlink is installed"}
        <br/>
        {window.tronLinkInitialData?window.tronLinkInitialData.address && window.tronLinkInitialData.address:"Not installed"}
        <br/>
      </header>
    </div>
  );
}

export default App;
