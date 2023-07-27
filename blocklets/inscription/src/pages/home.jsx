import { useRef, useEffect, useCallback } from 'react';
import { makeStyles } from '@mui/styles';
import joinUrl from 'url-join';
import { Select, MenuItem, TextField, IconButton, useMediaQuery } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useReactive, useRequest } from 'ahooks';
// eslint-disable-next-line import/no-unresolved
import { getProvider, waitForTxReceipt, waitFor } from '@arcblock/inscription-contract/contract';
import Empty from '@arcblock/ux/lib/Empty';
import ExploreIcon from '@mui/icons-material/Explore';
import DidAddress from '@arcblock/did-connect/lib/Address';
import DidAvatar from '@arcblock/did-connect/lib/Avatar';
import Badge from '@arcblock/ux/lib/Badge';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { styled } from '@arcblock/ux/lib/Theme';
import { ETHWallet, LottieAnimation } from '@nft-studio/react';
import AuthDialog from '../components/auth-dialog';
import QuoteComponent from '../components/quote-component';
import { useEnv } from '../contexts/use-env';
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
  });

  useEffect(() => {
    if (!state.chainId) {
      state.chainId = envMap?.chainList?.[0]?.chainId;
    }
  }, [envMap.chainList, state.chainId]);

  const playAnimation = () => {
    setTimeout(() => {
      lottieAnimationRef.current?.safePlay();
    }, 200);
  };

  const getAllMessage = useCallback(async () => {
    if (!state.chainId) return;
    playAnimation();
    state.messages = [];
    const { data } = await api.get(`/api/message/${state.chainId}`);
    state.animationData = getRandomAnimationData('loading');
    lottieAnimationRef.current?.pause();
    state.messages = data;
  });

  const { loading: requestLoading, refreshAsync } = useRequest(getAllMessage, {
    refreshDeps: [state.chainId],
  });

  const getCurrentChain = () => {
    return envMap?.chainList?.find((item) => item.chainId === state.chainId);
  };

  const openAuthDialog = () => {
    const { contractAddress } = getCurrentChain();
    const deployed = !!contractAddress;
    const i18nKey = deployed ? 'record' : 'create';
    authRef.current.open({
      action: deployed ? 'record-message' : 'deploy-contract',
      params: {
        message: state.newMessage,
        chainId: state.chainId,
        contractAddress,
      },
      messages: {
        title: t(`${i18nKey}.auth.title`),
        scan: t(`${i18nKey}.auth.scan`),
        confirm: t(`${i18nKey}.auth.confirm`),
        success: t(`${i18nKey}.auth.success`),
      },
      onSuccessAuth: async (res) => {
        const { txHash } = res;
        const provider = await getProvider(state.chainId);

        try {
          state.inputValue = '';
          state.loading = true;
          state.animationData = getRandomAnimationData('sending');
          playAnimation();
          authRef.current.close();
          // eslint-disable-next-line no-underscore-dangle
          await waitForTxReceipt({
            provider,
            txHash,
          }).then(async () => {
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
              { interval: 2000, timeout: 30 * 60 * 1000 }
            );
          });
        } catch (error) {
          console.error(error);
        } finally {
          state.loading = false;
          state.animationData = getRandomAnimationData('loading');
          lottieAnimationRef.current?.pause();
        }

        await refreshAsync();
      },
    });
  };

  const renderMessages = () => {
    if (state.messages.length === 0) {
      return <Empty>{t('common.noDataTip')}</Empty>;
    }
    return state.messages.map((item, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <QuoteComponent key={index} className="m-0.5 mb-4">
        {item.message}
      </QuoteComponent>
    ));
  };

  const getChainRenderItem = (item, { withDIDAddress = false } = {}) => {
    const { chainId, chainName, isTest, IconAvatar, contractAddress, explorer = '' } = item;
    const explorerUrl = explorer && contractAddress && joinUrl(explorer, 'address', contractAddress);
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
          <IconAvatar />
          <span className="ml-2 ">{chainName}</span>
          {isTest && (
            <StyledBadge className="!mb-0 !ml-2" fontSize="small">
              {t('common.betaChain')}
            </StyledBadge>
          )}
        </div>

        {withDIDAddress && checkIsETHWalletType(chainId) && explorerUrl && (
          <div className="flex items-center mt-0.25 mb-0.25">
            <DidAddress
              key="address"
              className={`${isMobile ? 'w-full' : 'w-200px'}  mr-0.5`}
              style={{
                textAlign: isMobile ? 'left' : 'right',
              }}
              prepend={<DidAvatar className="mr-2" did={contractAddress} size={24} />}>
              {contractAddress}
            </DidAddress>

            <IconButton
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
    if (!state.inputValue || state.loading || requestLoading) return;
    if (`${`${state.inputValue}`}`?.trim?.()?.length > 0) {
      state.newMessage = state.inputValue;
      await ethWalletRef.current?.open?.();
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Select
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
      </div>
      <div
        className={classes.messages}
        style={{
          minHeight: '400px',
        }}>
        {requestLoading || state.loading ? (
          <LottieAnimation
            style={{ height: '400px', width: '100%' }}
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
                disabled={!state.inputValue || state.loading || requestLoading}
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
      />
      <AuthDialog ref={authRef} popup />
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
    height: '100%',
    justifyContent: 'center',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
