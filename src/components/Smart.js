import React, { useEffect, useState } from 'react'
import { Button, Box, AppBar, Tabs, Tab, LinearProgress, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText, TextField } from '@material-ui/core';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box p={3}>
            {children}
          </Box>
        )}
      </div>
    );
}
function SimpleDialog(props) {
    const { open, onClose } = props;

    const handleClose = () => {
        onClose();
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

function Smart() {
    const [tabs_smart, setTabs_smart] = useState(0);
    const [data_loading, setDataLoading] = useState(false);
  
    const [dialogOpened, setDialogOpened] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("No title");
    const [dialogText, setDialogText] = useState("No content");

    const [contractInstance, setContractInstance] = useState();

    const tabsSmartHandleChange = (event, newValue) => {
      setTabs_smart(newValue);
    };
    const setDialog = (title, text, open) => {
        setDialogTitle(title);
        setDialogText(text);
        open?setDialogOpened(true):setDialogOpened(false);
    }
    const deployContract = async (e) => {
        e.preventDefault(); 
        let publisherAddress = e.target.input_publisherAddress.value;
        let dealAmount = e.target.input_dealAmount.value;
        let abi = '[{"inputs":[{"internalType":"uint256","name":"_dealAmount","type":"uint256"},{"internalType":"address","name":"_publisherAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"dealAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getContractBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
        let code = '608060405234801561001057600080fd5b50d3801561001d57600080fd5b50d2801561002a57600080fd5b506040516102d33803806102d38339818101604052604081101561004d57600080fd5b508051602090910151600091909155600280546001600160a01b039092166001600160a01b0319928316179055600180549091163317905561023f806100946000396000f3fe6080604052600436106100345760003560e01c80633ccfd60b146100765780636f9fb98a146100a5578063df0a8589146100e6575b60005434146100745760405162461bcd60e51b81526004018080602001828103825260268152602001806101e46026913960400191505060405180910390fd5b005b34801561008257600080fd5b50d3801561008f57600080fd5b50d2801561009c57600080fd5b50610074610115565b3480156100b157600080fd5b50d380156100be57600080fd5b50d280156100cb57600080fd5b506100d46101a2565b60408051918252519081900360200190f35b3480156100f257600080fd5b50d380156100ff57600080fd5b50d2801561010c57600080fd5b506100d46101a6565b6002546001600160a01b031633148061013857506001546001600160a01b031633145b6101735760405162461bcd60e51b81526004018080602001828103825260378152602001806101ad6037913960400191505060405180910390fd5b60405133904780156108fc02916000818181858888f1935050505015801561019f573d6000803e3d6000fd5b50565b4790565b6000548156fe4f6e6c79207075626c697368657220616e6420616476657274697365722063616e20776974686472617720746865207061796d656e742e5061796d656e742073686f756c642062652074686520696e766f6963656420616d6f756e742ea26469706673582212203078c2fa49235cb0e65fd1d934f2e61a4682b3776acd619e54a12f1b59119ade64736f6c63430006000033';
    
        if(publisherAddress && dealAmount){
          const addressIsValid = window.tronWeb.isAddress(publisherAddress);
          if(addressIsValid){
            const transaction = await window.tronWeb.transactionBuilder.createSmartContract({
              abi: abi,
              bytecode: code,
              feeLimit: 1e9,
              callValue: 0, 
              userFeePercentage: 0,
              originEnergyLimit: 1e7,
              parameters: [dealAmount, publisherAddress]
            }, window.tronWeb.defaultAddress.hex);
            
            const signedTransaction = await window.tronWeb.trx.sign(transaction);
            const contract_instance = await window.tronWeb.trx.sendRawTransaction(signedTransaction);
            console.log(contract_instance);
            contract_instance.result?setDialog("Contract has been successfully deployed!", contract_instance.transaction.contract_address, 1):setDialog("Contract has NOT been deployed!", null, 1);
          }
          else{
            setDialog("Error", "Invalid TRON address!", 1);
          }
        }
        else{
            setDialog("Warning", "Fill all the fields!", 1);
        }
        setDataLoading(false);
    }
    async function getContract(contractAddress){
        return new Promise(async (resolve, reject) => {
            if(contractAddress){
                const isAddress = window.tronWeb.isAddress(contractAddress);
                if(isAddress){
                    try{
                        let res = await window.tronWeb.contract().at(contractAddress);
                        resolve(res);
                    }
                    catch(e){
                        reject(e);
                    }
                } else {
                    reject("Contract address is invalid!");
                }
            }
            else{
                reject("Input contract address!");
            }
        });
    }
    const getDealAmount = async (e) => {
        let contractAddress = document.getElementsByName("input_contractAddress")[0].value;
        await getContract(contractAddress).then(async (contract_instance)=>{
            let dealAmount = await contract_instance?.dealAmount().call();
            setDialog("Contract is here!", "Deal amount: " + parseInt(dealAmount?._hex, 16), 1);
            console.log(dealAmount);
        }, reason => {
            setDialog("Error", reason, 1);
        });
    }
    const getContractBalance = async (e) => {
        let contractAddress = document.getElementsByName("input_contractAddress")[0].value;
        await getContract(contractAddress).then(async (contract_instance)=>{
            let contractBalance = await contract_instance?.getContractBalance().call();
            setDialog("Done!", "Contract balance: " + parseInt(contractBalance?._hex, 16), 1);
            console.log(contractBalance);
        }, reason => {
            setDialog("Error", reason, 1);
        });
    }
    const callWithdraw = async (e) => {
        let contractAddress = document.getElementsByName("input_contractAddress")[0].value;
        await getContract(contractAddress).then(async (contract_instance)=>{
            let contract_withdraw = await contract_instance?.withdraw().send();
            setDialog("Done!", "Money has been withdrawn!", 1);
            console.log(contract_withdraw);
        }, reason => {
            setDialog("Error", reason, 1);
        });
    }
    const sendMoney = async (e) => {
        let contractAddress = document.getElementsByName("input_contractAddress")[0].value;
        let amount = document.getElementsByName("input_sendAmount")[0].value;
        if(amount > 0 && window.tronWeb.isAddress(contractAddress)){
            let sendObj = await window.tronWeb.transactionBuilder.sendTrx(contractAddress, amount, window.tronWeb.defaultAddress.hex);
            let signedSendObj = await window.tronWeb.trx.sign(sendObj);
            let receipt = await window.tronWeb.trx.sendRawTransaction(signedSendObj);
            console.log(receipt);

            setDialog("Done!", "Money has been sent!", 1);
        } else {
            setDialog("Error", "Input valid values!", 1);
        }
        // await getContract(contractAddress).then(async (contract_instance)=>{
        //     let contract_withdraw = await contract_instance?.withdraw().send();
        //     setDialog("Done!", "Money has been withdrawn!", 1);
        //     console.log(contract_withdraw);
        // }, reason => {
        //     setDialog("Error", reason, 1);
        // });
    }

    return (
        <>
            <SimpleDialog open={dialogOpened} onClose={() => setDialogOpened(false)} dialogTitle={dialogTitle} dialogText={dialogText}/>

            <h2>Smart-contract</h2>

            {data_loading?<LinearProgress />:null}

            <AppBar position="static">
                <Tabs value={tabs_smart} onChange={tabsSmartHandleChange} aria-label="simple tabs example">
                    <Tab label="Deploy" />
                    <Tab label="Call" />
                    <Tab label="Send" />
                </Tabs>
            </AppBar>

            <TabPanel value={tabs_smart} index={0}>
              <form onSubmit={(e) => {setDataLoading(true); deployContract(e)}} className="smart_form">
                <label>
                  <TextField type="text" name="input_publisherAddress" style={{width:"100%"}} placeholder="Publisher's address (i.e. TDkSEf...)" />
                </label>
                <label>
                  <TextField type="number" name="input_dealAmount" style={{width:"100%"}} placeholder="Amount of deal (in SUN)" />
                </label>
                <Button type="submit" color="primary" variant="contained">Deploy a contract</Button>
              </form>
            </TabPanel>

            <TabPanel value={tabs_smart} index={1}>
                <TextField type="text" name="input_contractAddress" style={{width:"100%"}} placeholder="Contract address" />
                <Button onClick={getDealAmount} variant="contained">Deal Amount</Button>
                <Button onClick={getContractBalance} variant="contained">Contract Balance</Button>
                <Button onClick={callWithdraw} color="primary" variant="contained">Withdraw</Button>
            </TabPanel>

            <TabPanel value={tabs_smart} index={2}>
                <TextField type="text" name="input_contractAddress" style={{width:"100%"}} placeholder="Contract address" />
                <TextField type="number" name="input_sendAmount" style={{width:"100%"}} placeholder="Amount of money to send (in SUN)" />
                <Button onClick={sendMoney} color="primary" variant="contained">Send</Button>
            </TabPanel>
        </>
    )
}

export default Smart
