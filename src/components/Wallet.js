import React, { useState } from 'react'
import { Paper, Grid } from '@material-ui/core';

function Wallet(props) {
    let { tronAddress, myBalance } = props;

    const [balance, setBalance] = useState(myBalance)

    if(!myBalance && tronAddress){
        window.tronWeb.trx.getBalance(tronAddress).then(result => { setBalance(result); });
    }
    return (
        <>
            <h2>Wallet</h2>
            <Paper elevation={1} className={"wallet_block"} >
                {"Account"}
                <br/>
                {(balance || balance === 0)?<span className="balance_value">{balance/1000000 + " TRX"}</span>:"Balance undefined!"}
                <br/>
                Address: {<span className="address_value">{tronAddress}</span> }
            </Paper>
        </>
    )
}

export default Wallet
