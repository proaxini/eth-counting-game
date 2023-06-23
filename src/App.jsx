import { useEffect, useState } from "react";
import "./App.css";
import { Web3Button } from "@web3modal/react";
import { waitForTransaction, fetchBalance } from "@wagmi/core";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Heading,
  Input,
  Skeleton,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useContractReads, useContractWrite, useAccount } from "wagmi";
import counterABI from "./assets/abi.json";
import { ethers } from "ethers";

function App() {
  const [amount, setAmount] = useState("");
  const [isLoadingConfirm, setIsLoadingConfirm] = useState(false);
  const [balance, setBalance] = useState({});

  const toast = useToast();
  const { connector: activeConnector, isConnected } = useAccount();

  const counterContract = {
    address: "0xEE15C3aFd46d442bDd155BD7E9807AAeeE2D1882",
    abi: counterABI,
  };

  const {
    data: contractData,
    isError,
    isLoading,
  } = useContractReads({
    contracts: [
      {
        ...counterContract,
        functionName: "countdown",
      },
      {
        ...counterContract,
        functionName: "currentPrice",
      },
    ],
    watch: true,
  });

  const {
    data: writeData,
    isLoading: isLoadingWrite,
    isSuccess,
    write: tick,
  } = useContractWrite({
    ...counterContract,
    functionName: "tick",
    onSuccess: () => {
      toast({
        title: "Transaction sent !",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    },
    onError(error) {
      toast({
        title: "Error !",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    },
  });

  async function isConfirmed() {
    setIsLoadingConfirm(true);
    await waitForTransaction({ hash: writeData.hash });
    setIsLoadingConfirm(false);
    toast({
      title: "Transaction confirmed !",
      description: `Transaction ${writeData.hash} is confirmed.`,
      status: "success",
      duration: 9000,
      isClosable: true,
    });
  }

  async function getBalance() {
    const balance = await fetchBalance({
      address: '0xEE15C3aFd46d442bDd155BD7E9807AAeeE2D1882',
    })
    console.log(balance);
    setBalance(balance);
  }

  useEffect(() => {
    getBalance();
  }, [contractData])

  useEffect(() => {
    if (isSuccess) {
      isConfirmed();
    }
  }, [isSuccess]);

  return (
    <>
      <Container maxW="1200px" className="mx-auto my-0 h-screen">
        <div className="flex justify-center items-center h-full flex-col gap-5">
          <h1 className="text-7 font-bold">
            Welcome to <span className="text-[#F25F5C]">ETH</span>{" "}
            <span className="text-[#FFE066]">counting game</span>!
          </h1>
          <Web3Button />
          {isConnected && (
            <>
              <Input
                type="number"
                htmlSize={5}
                width="auto"
                placeholder="0.1"
                onChange={(e) => setAmount(e.target.value)}
                value={amount}
              />
              <Button
                colorScheme="yellow"
                size="md"
                isLoading={isLoadingWrite || isLoadingConfirm}
                loadingText="Sending transaction..."
                onClick={() => {
                  tick({
                    value: ethers.parseEther(amount),
                  });
                }}
              >
                Send
              </Button>
            </>
          )}
          {/* {isSuccess && isConfirmed() } */}
          {!isLoading ? (
            <Card size="lg" colorScheme="green">
              <CardBody>
              <Box>
                  <Heading size="sm" textTransform="uppercase">
                    Contract Balance
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    {balance.formatted}
                  </Text>
                </Box>
                <Box>
                  <Heading size="sm" textTransform="uppercase">
                    Counter
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    {parseInt(contractData[0].result)}
                  </Text>
                </Box>
                <Box>
                  <Heading size="sm" textTransform="uppercase">
                    Current Price
                  </Heading>
                  <Text pt="2" fontSize="sm">
                    {ethers.formatEther(contractData[1].result) + " ETH"}
                  </Text>
                </Box>
              </CardBody>
            </Card>
          ) : (
            <Stack width="20vw">
              <Skeleton height="20px" />
              <Skeleton height="20px" />
              <Skeleton height="20px" />
            </Stack>
          )}
        </div>
      </Container>
    </>
  );
}

export default App;
