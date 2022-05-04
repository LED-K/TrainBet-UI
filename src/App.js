import logo from './train.gif';
import route_logo from './route.svg';
import './App.css';
import React from 'react'
import { useState, useEffect } from 'react';
import {ethers, Contract, providers}  from 'ethers';
import Trainbetting from '../src/artifacts/contracts/TrainBetting.sol/TrainBetting.json';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { deepOrange, green,red } from '@mui/material/colors';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

function App() {
  //use State's to store data
  const [error, setError] = useState('');
  const [data, setData] = useState({});
  const [account, setAccount] = useState([]);
  const [bet,setBet]=useState('');
  const [status,setStatus]=('');

  //Contract address
  const contract_address = "0x10F4652dD38E67c982Efbdcb211f709F379716aD";

  //Refresh page data
  useEffect(() => {
    getData();
    requestAccount();
  }, [])

  //Event listeners for Metamask interactions
  window.ethereum.addListener('connect', async(reponse) => {
    requestAccount();
  })

  window.ethereum.on('accountsChanged', () => {
    window.location.reload();
  })

  window.ethereum.on('chainChanged',() => {
    window.location.reload();
  })

  window.ethereum.on('disconnect',() => {
    window.location.reload();
  })

  //Get connected acounts
  async function requestAccount() {
    if(typeof window.ethereum !== 'undefined') {
      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accounts);
    } else{
      setError("Please connect your Metamask Wallet with Iexec Sidechain Network");
    }
  }

//Get data from smart contract
  async function getData() {
    if(typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contract_address, Trainbetting.abi, provider);
      try { 
        const status = await contract.getStatus();
        const nbPlayers = await contract.getNumberOfPlayers();
        const takeoffAmount = await contract.getAmountBetsOnAsPlanned();
        const canceledAmount = await contract.getAmountBetsOnCanceled();
        const object = {"Status": String(status), "NbPlayers":String(nbPlayers), "Takeoff":String(takeoffAmount),"Canceled":String(canceledAmount)}
        setData(object);
      }
      catch(err) {
        console.log(err);
      }
    }
  }


  //Sends a transaction to the smart contract in order to update status via getOracleData()
  async function updateStatus(){
    if(typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contract_address, Trainbetting.abi, signer);
      try {
        const status = await contract.getOracleData(); 
        console.log( status);
        setStatus(status);
      }
      catch(err) {
        console.log(err);
      }
    }
  }

  //Place bet on planned journey
  async function betOnPlanned(){
    if(typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contract_address, Trainbetting.abi, signer);
      //we pass in the value and the account from which we're placing the bet
      let overrides = {
        from : account[0],
        value : (bet*1000000000000000000).toString(),
        gasLimit: 5000000
      }
      try {
        const bet = await contract.bet(1,overrides);
      }
      catch(err) {
        console.log(err);
      }
    }
  }
  //Place bet on canceled or delayed journey
  async function betOnCanceled(){
    if(typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contract_address, Trainbetting.abi, signer);
      //we pass in the value and the account from which we're placing the bet
      let overrides = {
        from : account[0],
        value : (bet*1000000000000000000).toString(),
        gasLimit: 5000000
      }
      try {
        const bet = await contract.bet(2,overrides);
      }
      catch(err) {
        console.log(err);
      }
    }
  }

  //Claim after journey too place

  async function claimPrize(){
    if(typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contract_address, Trainbetting.abi, signer);
      try {
        const prize = await contract.distributePrizes();
      }
      catch(err) {
        console.log(err);
      }
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1 className='text-4xl' >TRAIN PRONOSTICS</h1>
        <img src={logo}  alt="logo" className='App-logo'/>
          <div className="flex justify-items-center">
          <Stack direction="row" spacing={5}>
            <Avatar sx={{ bgcolor: deepOrange[500] }} variant="square">
            </Avatar>
            {data.NbPlayers && <p>{data.NbPlayers} Players</p>}
            <Avatar sx={{ bgcolor: green[500] }} variant="rounded">
              <AttachMoneyIcon />
            </Avatar>
            {data.Takeoff && <p> {data.Takeoff/1000000000000000000} xRLC on planned</p>}
            <Avatar sx={{ bgcolor: red[500] }} variant="rounded">
              <AttachMoneyIcon />
            </Avatar>
            {data.Takeoff && <p> {data.Canceled/1000000000000000000} xRLC on canceled</p>}
          </Stack>
          </div>
      </header>
      <Container fixed>
        <Box sx={{ bgcolor: '#daa455', height: '100vh' }}>
        <div className='my-3.5'>
        {data.Status && !status && <p className='my-3.5'>Status : {data.Status}</p>}
        {status && <p className='my-3.5'>Status : {status}</p>}
        <button onClick={updateStatus} class="h-10 px-5 text-black transition-colors duration-150 border border-black rounded-lg focus:shadow-outline hover:bg-black hover:text-indigo-100">Update Status</button>
        </div>
        <div className="flex justify-items-center my-28">
          <div className=" departure flex-none h-14">
          <p className='font-bold'>Departure</p>
          <p>8h40</p>
          <p>10/05/2022</p>
          <p>Lyon Part-dieu</p>
          </div>
          <div className="grow h-14 divide-black">
          <img src={route_logo}  alt="logo"/>
          </div>
          <div className=" arrival flex-none h-14  ">
          <p className='font-bold'>Arrival</p>
          <p>10h45</p>
          <p>10/05/2022</p>
          <p>Genève Cornavin</p>
          </div>
        </div>
        <div className="my-38">
          <input onChange={e => setBet(e.target.value)} class="h-12 px-4 mb-2 text-lg text-gray-700 placeholder-gray-600 border rounded-lg focus:shadow-outline" type="number" min="0.001" placeholder="Minimum: 0.001 xRLC"/>
        </div>
        <div className="my-20 space-x-7">
        <button onClick={betOnPlanned} className="h-10 px-5 text-black transition-colors duration-150 border border-black rounded-lg focus:shadow-outline hover:bg-black hover:text-indigo-100 ">The train will leave as planned</button>
        <button onClick={betOnCanceled} className="h-10 px-5 text-black transition-colors duration-150 border border-black rounded-lg focus:shadow-outline hover:bg-black hover:text-indigo-100">The train will be canceled/delayed</button>
        </div>
        <div className="my-20">
        <button onClick={claimPrize} className="h-10 px-5 textblack transition-colors duration-150 border border-black rounded-lg focus:shadow-outline hover:bg-black hover:text-indigo-100">Claim prize</button>
        </div>
        </Box>
      </Container>
    </div>
  );
}

export default App;
