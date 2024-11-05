import { DeflyWalletConnect } from '@blockshake/defly-connect'
import { DaffiWalletConnect } from '@daffiwallet/connect'
import { PeraWalletConnect } from '@perawallet/connect'
import { PROVIDER_ID, ProvidersArray, WalletProvider, useInitializeProviders } from '@txnlab/use-wallet'
import algosdk from 'algosdk'
import { SnackbarProvider } from 'notistack'
import Home from './Home'

import { SavingsGroupProvider } from './components/SavingsGroup/SavingsGroupProvider';
import GroupDashboard from './components/SavingsGroup/GroupDashboard';
import CreateGroup from './components/SavingsGroup/CreateGroup';
import ConnectWallet from './components/ConnectWallet';

// Reference existing provider setup code
import { getAlgodConfigFromViteEnvironment, getKmdConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

let providersArray: ProvidersArray
if (import.meta.env.VITE_ALGOD_NETWORK === '') {
  const kmdConfig = getKmdConfigFromViteEnvironment()
  providersArray = [
    {
      id: PROVIDER_ID.KMD,
      clientOptions: {
        wallet: kmdConfig.wallet,
        password: kmdConfig.password,
        host: kmdConfig.server,
        token: String(kmdConfig.token),
        port: String(kmdConfig.port),
      },
    },
  ]
} else {
  providersArray = [
    { id: PROVIDER_ID.DEFLY, clientStatic: DeflyWalletConnect },
    { id: PROVIDER_ID.PERA, clientStatic: PeraWalletConnect },
    { id: PROVIDER_ID.DAFFI, clientStatic: DaffiWalletConnect },
    { id: PROVIDER_ID.EXODUS },
    // If you are interested in WalletConnect v2 provider
    // refer to https://github.com/TxnLab/use-wallet for detailed integration instructions
  ]
}

export default function App() {
  const algodConfig = getAlgodConfigFromViteEnvironment();
  const walletProviders = useInitializeProviders({
    providers: providersArray,
    nodeConfig: {
      network: algodConfig.network,
      nodeServer: algodConfig.server,
      nodePort: String(algodConfig.port),
      nodeToken: String(algodConfig.token),
    },
  });

  return (
    <SnackbarProvider maxSnack={3}>
      <WalletProvider value={walletProviders}>
        <SavingsGroupProvider>
          <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-md p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">PouchWise</h1>
                <ConnectWallet openModal={true} closeModal={} />
              </div>
            </nav>

            <main className="container mx-auto py-8">
              <div className="grid gap-8">
                <CreateGroup />
                <GroupDashboard />
              </div>
            </main>
          </div>
        </SavingsGroupProvider>
      </WalletProvider>
    </SnackbarProvider>
  );
}
