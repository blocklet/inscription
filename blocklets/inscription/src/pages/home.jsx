import { useRef, useEffect, useCallback } from 'react';
import { makeStyles } from '@mui/styles';
import joinUrl from 'url-join';
import {
  Select,
  MenuItem,
  TextField,
  IconButton,
  useMediaQuery,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useSnackbar } from 'notistack';
import { useReactive, useRequest } from 'ahooks';
// eslint-disable-next-line import/no-unresolved
import { getProvider, waitForTxReceipt, waitFor, ethers } from '@arcblock/inscription-contract/contract';
// eslint-disable-next-line import/no-unresolved, no-unused-vars
import Inscription from '@arcblock/inscription-contract/lib/Inscription.json';
import Empty from '@arcblock/ux/lib/Empty';
import ExploreIcon from '@mui/icons-material/Explore';
import DidAddress from '@arcblock/did-connect/lib/Address';
import DidAvatar from '@arcblock/did-connect/lib/Avatar';
import Badge from '@arcblock/ux/lib/Badge';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { styled } from '@arcblock/ux/lib/Theme';
import { ETHWallet, LottieAnimation, ConfirmDialog } from '@nft-studio/react';
import AuthDialog from '../components/auth-dialog';
import QuoteComponent from '../components/quote-component';
import { useEnv } from '../contexts/use-env';
import { getExplorerUrl, formatTime } from '../libs';
import theme from '../libs/theme';
import api from '../libs/api';
import sending1 from '../assets/lottie/sending-1.json';
import sending2 from '../assets/lottie/sending-2.json';
import loading1 from '../assets/lottie/loading-1.json';
import loading2 from '../assets/lottie/loading-2.json';

const sendingList = [sending1, sending2];
const loadingList = [loading1, loading2];

const getRandomAnimationData = (type = 'sending') => {
  if (type === 'sending') {
    return sendingList[Math.floor(Math.random() * sendingList.length)];
  }
  return loadingList[Math.floor(Math.random() * loadingList.length)];
};

const checkIsETHWalletType = (chainId) => {
  return !['ocap', 'beta', 'main', 'default'].includes(chainId);
};

function Home() {
  const { enqueueSnackbar } = useSnackbar();
  const showSnackbar = (msg, { variant = 'info' } = {}) => {
    enqueueSnackbar(msg, { variant });
  };
  const confirmDialogRef = useRef(null);
  const ethWalletRef = useRef(null);
  const authRef = useRef(null);
  const lottieAnimationRef = useRef(null);
  const { t } = useLocaleContext();
  const classes = useStyles();
  const isMobile = useMediaQuery((_theme) => _theme.breakpoints.down('md'));
  const { env: envMap, refresh: refreshEnv } = useEnv();

  const state = useReactive({
    selectOpen: false,
    messages: [],
    newMessage: '',
    inputValue: '',
    chainId: localStorage.getItem('chainId') || '',
    loading: false,
    animationData: getRandomAnimationData('loading'),
    apiKey: '',
  });

  useEffect(() => {
    if (!state.chainId) {
      state.chainId = envMap?.chainList?.[0]?.chainId;
    }
  }, [envMap.chainList, state.chainId]);

  const playAnimation = () => {
    setTimeout(() => {
      lottieAnimationRef.current?.safePlay();
    }, 100);
  };

  const getAllMessage = useCallback(async () => {
    if (!state.chainId) return;
    playAnimation();
    state.messages = [];
    const queryChainId = `${state.chainId}`;
    const { data } = await api.get(`/api/message/${queryChainId}`);
    // ensure the chainId is not changed
    if (queryChainId === state.chainId) {
      // get next random animation data
      state.animationData = getRandomAnimationData('loading');
      lottieAnimationRef.current?.pause();
      state.messages = data;
    }
  });

  const { loading: requestLoading, refreshAsync } = useRequest(getAllMessage, {
    refreshDeps: [state.chainId],
  });

  const isLoading = requestLoading || state.loading;
  const isDisabled = isLoading || !state.inputValue;

  const getCurrentChain = () => {
    return envMap?.chainList?.find((item) => item.chainId === state.chainId);
  };

  // use other wallet auth
  // eslint-disable-next-line no-unused-vars
  const openAuthDialogOtherWallet = async () => {
    // use other wallet
    const setChainSuccess = await ethWalletRef.current?.setConnectedChain(state.chainId);

    // should set chain success
    if (!setChainSuccess) throw new Error(t('common.setChainFailureTip'));

    const connectWallet = ethWalletRef.current?.getWallet();
    const provider = new ethers.providers.Web3Provider(connectWallet.provider);

    // eslint-disable-next-line no-unused-vars
    const signer = provider.getSigner();
    const message = state.inputValue;
    const contract = new ethers.Contract(contractAddress, Inscription.abi, signer);
    try {
      const receipt = await contract.recordMessage(message);
      // adjust DID Wallet Auth
      await onSuccessAuth({ txHash: receipt.hash });
      await receipt.wait();
    } catch (error) {
      console.error(error);
      showSnackbar(error?.reason || error?.message || t('common.unknownError'), {
        variant: 'error',
      });
    }
  };

  const onSuccessAuth = async (res) => {
    const { contractAddress } = getCurrentChain();
    const deployed = !!contractAddress;
    let txHash;
    if (!deployed) {
      // second element has txHash, because it is nw
      txHash = res?.[1]?.txHash;
    } else {
      txHash = res.txHash;
    }

    const provider = await getProvider(state.chainId);

    try {
      state.inputValue = '';
      state.loading = true;
      playAnimation();
      authRef.current.close();

      // eslint-disable-next-line no-underscore-dangle
      await waitForTxReceipt({
        provider,
        txHash,
      }).then(async () => {
        // only wait for tx receipt when contract is not deployed
        if (!deployed) {
          await waitFor(
            async () => {
              const newEnvMap = await refreshEnv();
              const { contractAddress: newContractAddress } =
                newEnvMap?.chainList.find((item) => item.chainId === state.chainId) || {};
              if (newContractAddress) {
                return true;
              }
              return false;
            },
            { interval: 5000, timeout: 30 * 60 * 1000 }
          );
        }
      });
    } catch (error) {
      console.error(error);
      showSnackbar(error?.reason || error?.message || t('common.unknownError'), {
        variant: 'error',
      });
    } finally {
      state.loading = false;
      lottieAnimationRef.current?.pause();
    }

    state.animationData = getRandomAnimationData('loading');
    await refreshAsync();
  };

  // use DID Wallet Auth
  const openAuthDialog = async () => {
    const { contractAddress } = getCurrentChain();
    const deployed = !!contractAddress;
    const i18nKey = deployed ? 'record' : 'create';
    const defaultParams = {
      message: state.newMessage,
      chainId: state.chainId,
      contractAddress,
    };
    let extraParams = {};

    // deploy-contract should use nw to check if it's blocklet owner
    if (!deployed) {
      const nextUrl = new URL(window.location.href);
      // pathname is deploy-contract
      nextUrl.pathname = joinUrl(window?.blocklet?.prefix ?? '/', '/api/did/deploy-contract/token');
      // map defaultParams to query
      Object.keys(defaultParams).forEach((key) => {
        nextUrl.searchParams.append(key, defaultParams[key]);
      });
      // joinUrl
      extraParams = {
        nwUrl: nextUrl.href,
      };
    }

    authRef.current.open({
      action: deployed ? 'record-message' : 'verify-blocklet-owner',
      checkFn: api.get,
      params: {
        ...defaultParams,
        ...extraParams,
      },
      messages: {
        title: t(`${i18nKey}.auth.title`),
        scan: t(`${i18nKey}.auth.scan`),
        confirm: t(`${i18nKey}.auth.confirm`),
        success: t(`${i18nKey}.auth.success`),
      },
      onSuccessAuth,
    });
  };

  const renderMessages = () => {
    if (state.messages.length === 0) {
      return <Empty>{t('common.noDataTip')}</Empty>;
    }
    return state.messages.map((item, index) => {
      const { createdAt, transactionHash } = item;
      const { explorer } = getCurrentChain();
      const explorerUrl = getExplorerUrl({ explorer, value: transactionHash, type: 'tx' });
      return (
        <QuoteComponent
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          {...item}
          explorerUrl={explorerUrl}
          createdAt={formatTime(createdAt)}
          className="m-0.5 mb-4 !p-0"
          sx={{
            borderLeft: `3px solid ${theme.palette.primary.main}}`,
          }}>
          {item.message}
        </QuoteComponent>
      );
    });
  };

  const getChainRenderItem = (item, { withDIDAddress = false } = {}) => {
    const { chainId, chainName, isTest, IconAvatar, contractAddress, explorer = '' } = item;
    const explorerUrl = getExplorerUrl({ explorer, value: contractAddress, type: 'address' });
    return [
      <div
        key="item"
        className="flex items-center w-full"
        style={
          isMobile
            ? {
                flexDirection: 'column',
                alignItems: 'flex-start',
              }
            : {
                justifyContent: 'space-between',
              }
        }>
        <div className="flex items-center mr-1">
          <IconAvatar key={chainId} />
          <span className="ml-2 ">{chainName}</span>
          {isTest && (
            <StyledBadge className="!mb-0 !ml-2" fontSize="small">
              {t('common.betaChain')}
            </StyledBadge>
          )}
        </div>

        {withDIDAddress && checkIsETHWalletType(chainId) && explorerUrl && (
          <div
            className={`flex items-center ${isMobile ? 'mt-1' : 'mt-0.25'} mb-0.25 w-250px`}
            style={{
              justifyContent: isMobile ? 'flex-start' : 'flex-end',
            }}>
            <DidAddress
              key="address"
              className="mr-0.5"
              style={{
                textAlign: isMobile ? 'left' : 'right',
                lineHeight: '24px',
              }}
              prepend={<DidAvatar className="mr-2" did={contractAddress} size={24} />}>
              {contractAddress}
            </DidAddress>

            <IconButton
              disabled={isLoading}
              size="small"
              href={explorerUrl}
              target="_blank"
              onClick={(e) => {
                e.stopPropagation();
              }}>
              <ExploreIcon fontSize="small" />
            </IconButton>
          </div>
        )}
      </div>,
    ];
  };

  const handleChainIdChange = (event) => {
    const chainId = event.target.value;
    state.chainId = chainId;
    localStorage.setItem('chainId', chainId);
  };

  const handleSendMessage = async () => {
    if (isDisabled) return;
    if (`${`${state.inputValue}`}`?.trim?.()?.length > 0) {
      state.animationData = getRandomAnimationData('sending');
      state.newMessage = state.inputValue;

      const { contractAddress } = getCurrentChain();
      const deployed = !!contractAddress;

      // not deploy contract, should use DID Wallet
      if (!deployed) {
        await openAuthDialog();
        return;
      }

      const wallet = ethWalletRef.current?.getWallet();

      if (!wallet) {
        const connectedList = await ethWalletRef.current?.open?.();
        if (!connectedList?.length) return; // use DID Wallet, trigger wallet Module onclick
      }

      await openAuthDialogOtherWallet();
    }
  };

  const { contractAddress, verified = false } = getCurrentChain() || {};

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Select
          sx={{
            width: isMobile ? '100%' : 'auto',
          }}
          renderValue={() => {
            const currentChain = getCurrentChain();
            return currentChain
              ? getChainRenderItem(currentChain, {
                  withDIDAddress: true,
                })
              : null;
          }}
          open={state.selectOpen}
          onOpen={(e) => {
            if (!['path', 'svg'].includes(e.target.tagName)) {
              state.selectOpen = true;
            }
          }}
          onClose={() => {
            state.selectOpen = false;
          }}
          value={state.chainId}
          onChange={handleChainIdChange}>
          {envMap?.chainList?.map((item) => {
            const { chainId } = item;
            return (
              <MenuItem value={chainId} key={chainId}>
                {getChainRenderItem(item, {
                  withDIDAddress: true,
                })}
              </MenuItem>
            );
          })}
        </Select>
        {contractAddress && (
          <Button
            disabled={verified}
            className="mt-1"
            size="small"
            sx={
              verified && {
                color: '#5bb35f !important',
              }
            }
            startIcon={
              verified && (
                <CheckCircleIcon
                  sx={{
                    color: '#5bb35f',
                  }}
                />
              )
            }
            onClick={async () => {
              confirmDialogRef.current.open({
                title: t('common.verifyContract'),
                context: () => (
                  <div>
                    <FormControl sx={{ mt: 1, width: '100%', background: '#fff' }} variant="outlined">
                      <InputLabel>{t('common.apiKey')}</InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-password"
                        type="password"
                        label={t('common.apiKey')}
                        sx={{
                          textSecurity: 'unset',
                        }}
                        autoComplete="off"
                        value={state.apiKey}
                        onChange={(e) => {
                          state.verifyContractError = '';
                          state.apiKey = e.target.value;
                        }}
                      />
                      <FormHelperText id="filled-weight-helper-text" error={!!state.verifyContractError}>
                        <div
                          // eslint-disable-next-line react/no-danger
                          dangerouslySetInnerHTML={{
                            __html:
                              state.verifyContractError ||
                              t('common.apiKeyTip', {
                                explorer: getCurrentChain()?.explorer,
                                color: theme.palette.primary.main,
                              }),
                          }}
                        />
                      </FormHelperText>
                    </FormControl>
                  </div>
                ),
                onConfirm: async () => {
                  if (!state.apiKey) {
                    state.verifyContractError = t('common.apiKeyNotEmptyTip');
                    throw new Error(state.verifyContractError);
                  }
                  const { data } = await api.post('/api/verify-contract', {
                    chainId: state.chainId,
                    apiKey: state.apiKey,
                  });
                  if (data?.verified) {
                    confirmDialogRef.current.close();
                    state.apiKey = '';
                    refreshEnv();
                  } else {
                    const { verifyResult } = data;
                    state.verifyContractError =
                      verifyResult?.result || verifyResult?.message || t('common.unknownError');
                    throw new Error(state.verifyContractError);
                  }
                },
                onCancel: () => {
                  state.apiKey = '';
                  state.verifyContractError = '';
                },
                confirmColor: 'primary',
              });
            }}>
            {t('common.verifyContract')}
          </Button>
        )}
      </div>
      <div
        className={classes.messages}
        style={{
          ...(isLoading && {
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
            overflow: 'hidden',
          }),
        }}>
        {isLoading ? (
          <LottieAnimation
            style={{
              minHeight: '400px',
              height: '50vh',
              width: isMobile ? '100%' : '60vw',
              overflow: 'hidden',
              transform: state.loading ? 'scale(1.4)' : '', // sending animation is small, so scale it
            }}
            loop
            animationData={state.animationData}
            ref={lottieAnimationRef}
            onComplete={() => {}}
          />
        ) : (
          renderMessages()
        )}
      </div>
      <div className={classes.inputContainer}>
        <TextField
          className={classes.inputField}
          variant="outlined"
          value={state.inputValue}
          autoComplete="off"
          sx={{
            background: '#fff',
          }}
          onChange={(e) => {
            state.inputValue = e.target.value;
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSendMessage();
            }
          }}
          placeholder={t('common.inputPlaceholder')}
          InputProps={{
            endAdornment: (
              <IconButton
                disabled={isDisabled}
                type="button"
                color="primary"
                onClick={handleSendMessage}
                className={classes.button}>
                <SendIcon fontSize="small" />
              </IconButton>
            ),
          }}
        />
      </div>
      <ETHWallet
        ref={ethWalletRef}
        theme={theme}
        getDIDWalletProps={() => {
          return {
            onClick: openAuthDialog,
          };
        }}
        // filterWallet={(walletList) => [walletList[0]]} // only use DID Wallet
      />
      <AuthDialog ref={authRef} popup />

      <ConfirmDialog ref={confirmDialogRef} />
    </div>
  );
}

export default Home;

const StyledBadge = styled(Badge)`
  margin-left: 0.3rem !important;
  margin-bottom: 0.3rem !important;
  background: ${(props) => {
    return props.theme.palette.primary.main;
  }} !important;
`;

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 64px - 92px - 16px)',
    justifyContent: 'center',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  messages: {
    flex: '1',
    overflowY: 'auto',
    margin: '16px 0',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    bottom: 16,
    background: '#fff',
  },
  inputField: {
    flexGrow: '1',
  },
  button: {
    transform: 'rotate(-45deg)',
  },
}));
