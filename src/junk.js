
    const contractHEXAddress = 'TBm2j7mnhcWt6YP2SUqmejDvSCC3aVHhHX';
    let contract = await window.tronWeb.contract().at(contractHEXAddress);
    window.tronWeb.trx.getBalance("TDkSEfajmqX42Yt35WiqdyHmxBQiVRtqtv").then(result => console.log(result))
    window.tronWeb.trx.getBandwidth("TDkSEfajmqX42Yt35WiqdyHmxBQiVRtqtv", (error, bandwidth) => {
      if(error)
        return console.log("Error!!!!!!!!!! " + error);
      console.log("Bandwidth: " + bandwidth);
    });
    return contract;