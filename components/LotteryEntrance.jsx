import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance () {

    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    // States
    const [entranceFee, setEntranceFee] = useState("0")
    const [numOfPlayers, setNumOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    // web3uikit
    const dispatch = useNotification()

    const { runContractFunction: enterRaffle, isLoading, isFetching } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {}
    })

    const { runContractFunction: getNumOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumOfPlayers",
        params: {}
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {}
    })

    async function updateUI () {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numOfPlayersFromCall = (await getNumOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()
        setEntranceFee(entranceFeeFromCall)
        setNumOfPlayers(numOfPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Successful",
            title: "Tx Notification",
            position: "topR",
            icon: "bell"
        })
    }

    return (
        <div className="p-5">Hi from LotteryEntrance
            {
                raffleAddress
                ?   <div>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={
                            async function () { await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error)
                            }) 
                        }}
                        disabled = {isLoading || isFetching}
                        >
                            {
                                isLoading || isFetching
                                ?   <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                                :   <div>Enter Raffle</div>
                            }
                        </button>

                        <div>Entrance fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                        <div>Num of Players: {numOfPlayers}</div>
                        <div>Recent Winner: {recentWinner}</div>
                    </div>
                :   <div>No raffle address detected</div>
            }
        </div>
    )
}