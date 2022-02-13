
import React, { useEffect, useState } from 'react'
import './App.css';
import loading_svg from './img/infinity.svg'
import Wallet from './components/Wallet'
import Smart from './components/Smart'
import { Button, Grid, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';

function SimpleDialog(props) {
    const { open, onClose } = props;

    const handleClose = () => {
        onClose();
		document.location.reload();
    };

    return (
        <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
        <DialogTitle id="simple-dialog-title">{props.dialogTitle}</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
            {props.dialogText}
            </DialogContentText>
            <DialogActions>
            <Button onClick={handleClose} color="primary" autoFocus>
                Ok
            </Button>
            </DialogActions>
        </DialogContent>
        </Dialog>
    );
}

const waitTron = () => {
  return new Promise((resolve, reject) => {
    let attempts = 0, maxAttempts = 30;
    const checkTron = () => {
      if(window.tronWeb && window.tronWeb.defaultAddress.base58){
        resolve(true);
        return;
      }
      attempts++;
      console.log("Attempt")
      if(attempts >= maxAttempts){
        reject("notConnected");
        return;
      }
      setTimeout(checkTron, 100);
    };
    checkTron();
  })
};

function App() {
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState(null);
  const [tronWebObj, setTronWebObj] = useState(undefined);
  const [tronAddress, setTronAddress] = useState(null);
  const [chainType, setChainType] = useState(null);
  const [chainName, setChainName] = useState("");
  const [myBalance, setMyBalance] = useState(null);
  const [tronStatus, setTronStatus] = useState("Not loaded");


  const [dialogOpened, setDialogOpened] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("No title");
  const [dialogText, setDialogText] = useState("No content");

  const setDialog = (title, text, open) => {
	  setDialogTitle(title);
	  setDialogText(text);
	  open?setDialogOpened(1):setDialogOpened(0);
  }

  const fetchTron = (address) => {
    setTronWebObj(window.tronWeb);
    if(address){
      setTronAddress(address);
      window.tronWeb.trx.getBalance(address).then(balance => setMyBalance(balance));
    }
  }
  const initTron = () => {
    setLoading(1);
    waitTron().then(()=>{
      if(window.tronWeb && window.tronWeb.defaultAddress.base58){
        setLoading(0);
      }
    }, (error) => {
      if(error === "notConnected")
        setDialog("TronLink", "Please log into TronLink browser extension!", 1);
      return null;
    });
  }
  useEffect(()=>{
    initTron();
    let obj = setInterval(async ()=>{
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
          clearInterval(obj)
          setTronWebObj(window.tronWeb);
          setTronAddress(window.tronWeb.defaultAddress.base58);
      }
    }, 200);

    window.addEventListener('message', function (e) {
      if (e.data.message && e.data.message.action === "tabReply") {
          console.log("tabReply event", e.data.message)
		  setChainName(e.data.message.data.data.node?.name);
          fetchTron()
          if (e.data.message.data.data.node?.chain === '_'){
            setChainType(1);
          }else{
            setChainType(0);
          }
      }
      if (e.data.message && e.data.message.action === "setAccount") {
          initTron();
          // console.log("setAccount event", e.data.message)
          // console.log("current address:", e.data.message.data.address)
          fetchTron(e.data.message.data.address);
      }
      if (e.data.message && e.data.message.action === "setNode") {
          console.log("setNode event", e.data.message)
		//   setChainName(e.data.message);
			setNodeName(e.data.message.data.node?.fullNode);
          if (e.data.message.data.node?.chain === '_'){
            setChainType(1);
          }else{
            setChainType(0);
          }
		  setDialogOpened(0);
      }
  })
  }, []);

  const setNodeName = (fullNode) => {
	switch(fullNode){
		case 'https://api.shasta.trongrid.io':
			setChainName('Shasta Testnet');
		break;
		case 'https://api.nileex.io':
			setChainName('Nile Testnet');
		break;
		case 'https://api.tronstack.io':
			setChainName('Mainnet');
		break;
		case 'https://api.trongrid.io':
			setChainName('Mainnet');
		break;
		default:
			setChainName('Side Chain');
		break;
	}
  }
  
  return (
    <div className="App" style={{}}>
	<SimpleDialog open={dialogOpened} onClose={() => setDialogOpened(0)} dialogTitle={dialogTitle} dialogText={dialogText}/>
      <div className="main_canvas">
        <div className={`overlay_loading ${loading?"loading":null}`}><img src={loading_svg}/></div>
        <header className="main_header">
          <h1>Smart-Contract testing platform</h1>
          <div className={`chain_type chain_type_${chainType} noselect`} >{chainName}</div>
		  {/* {chainType===1?"Main chain":chainType===0?"Side chain":"No chain"}: */}
        </header>
        <div className="canvas_content">
			<Grid container justify="space-evenly" spacing={2}>
				<Grid key={1} item>
					<Wallet tronAddress={tronAddress} myBalance={myBalance} />
				</Grid>
				<Grid key={2} item>
					<Smart />
				</Grid>
			</Grid>
        </div>
      </div>
    </div>
  );
}

export default App;
