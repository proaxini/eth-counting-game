import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ChakraProvider } from "@chakra-ui/react";

const chains = [sepolia];
const projectId = "2d69b6118fb503787dd6337bf8a6edab";

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 2, chains }),
  publicClient,
});
const ethereumClient = new EthereumClient(wagmiConfig, chains);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </WagmiConfig>
    <Web3Modal
      projectId={projectId}
      ethereumClient={ethereumClient}
      themeMode="dark"
      themeVariables={{
        "--w3m-font-family": "Roboto, sans-serif",
        "--w3m-accent-color": "#F25F5C",
      }}
    />
  </React.StrictMode>
);
