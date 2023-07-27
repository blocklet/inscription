import dayjs from 'dayjs';
import joinUrl from 'url-join';
import throttle from 'lodash/throttle';
import cloneDeep from 'lodash/cloneDeep';

const { CHAIN_HOST } = window?.blocklet || {};
const { host: chainDomain } = new URL(CHAIN_HOST);
const prodList = ['main.abtnetwork.io', 'xenon.abtnetwork.io'];

export function getStoreUrl(did) {
  return joinUrl(window?.blocklet?.prefix || '/', `/mint/${did}`);
}

export function getBlenderTemplateUrl() {
  return joinUrl(
    window?.blocklet?.componentMountPoints.find((item) => item.did === 'z8ia1ieY5KhEC4LMRETzS5nUwD7PvAND8qkfX') // blender mount point
      ?.mountPoint,
    '/templates'
  );
}

export function getMarketplaceUrl(nftDid) {
  const marketplaceUrl = prodList.includes(chainDomain)
    ? 'https://marketplace.arcblock.io'
    : 'https://marketplace.staging.arcblock.io';
  if (!nftDid) {
    return marketplaceUrl;
  }
  return `${marketplaceUrl}/auctions/create?nftDid=${nftDid}`;
}

export function getETHMarketplaceUrl(item) {
  const { address, ethProps } = item;

  // only goerli testnet
  if (!address || ethProps?.chainId !== '5') {
    return '';
  }

  return `https://testnets.opensea.io/assets/goerli/${address}/1`;
}

export function getETHExplorerUrl(data) {
  // nft / asset / factory
  return data?.ethProps?.blockExplorerUrl;
}

export function getExplorerUrl(did, type) {
  const explorerUrl = prodList.includes(chainDomain) ? 'https://main.abtnetwork.io' : 'https://beta.abtnetwork.io';
  // asset
  if (type === 'asset') {
    return `${explorerUrl}/explorer/assets/${did}`;
  }
  // nft / factory
  return `${explorerUrl}/explorer/${type === 'nft' ? 'assets' : 'factories'}/${did}`;
}

export function getInitialCover(type) {
  let realType = type;
  if (realType === 'factory') {
    realType = 'collection';
  }
  const initialCover = `https://dummyimage.com/360x300/eee/fff.png&text=+${realType?.toUpperCase() || 'COVER'}+`;
  return initialCover;
}

export function getCover(data, type) {
  let coverUrl =
    type === 'nft'
      ? `${data?.display?.content}?assetId=${data?.address}&=${new Date().getTime()}`
      : data?.display || data?.output?.display?.content;

  // add webp
  if (coverUrl) {
    if (coverUrl.indexOf('?') > -1) {
      coverUrl = `${coverUrl}&f=webp`;
    } else {
      coverUrl = `${coverUrl}?f=webp`;
    }
  }
  return coverUrl || getInitialCover(type);
}

export function formatTime(timeText) {
  return dayjs(timeText).format('YYYY-MM-DD HH:mm');
}

export function getWalletUrl() {
  return 'https://www.didwallet.io';
}

export function factoryHadEndMint(data) {
  // had been Mint End
  if (data.limit !== '0' && data.numMinted >= data.limit) {
    return true;
  }
  // had been End Time
  const endTime = data?.endTime || data?.data?.value?.mintProps?.endTime;
  if (endTime) {
    return dayjs().isAfter(dayjs(endTime));
  }
  return false;
}

export function isIframeWrapper() {
  return (
    (window.self.frameElement && window.self.frameElement.tagName === 'IFRAME') ||
    window.frames.length !== window.parent.frames.length ||
    window.self !== window.top ||
    window?.parent !== window
  );
}

export function isValidURL(url) {
  try {
    const { host } = new URL(url); // this would check for the protocol
    return !!host;
  } catch (e) {
    return false;
  }
}

export function isNotIPAddress(url) {
  try {
    const { host } = new URL(url);
    return !host.match(/\d+\.\d+\.\d+\.\d+/);
  } catch (e) {
    return false;
  }
}

export function isNotDidDomain(url) {
  const regex = /^https?:\/\/(\w+\.)+(ip|did)\.abtnet\.io$/;
  return !regex.test(url);
}

export function loadImagesLazy({ imageList = [], maxLoadingNum = 1 }) {
  let index = 0;
  const needToLoadList = cloneDeep(imageList);
  const currentLoadedList = [];

  function startLoadImage() {
    if (currentLoadedList?.length >= maxLoadingNum) {
      return;
    }

    if (needToLoadList?.length <= 0) {
      return;
    }

    const props = needToLoadList[index];

    if (!props) {
      return;
    }

    const img = document.getElementById(props.id);

    // not load src
    if (img && !img.getAttribute('src')) {
      currentLoadedList.push(props);
      img.setAttribute('src', props.src);
      img.addEventListener('load', (e) => {
        removeListAndReloadImage(e);
      });
      img.addEventListener('error', (e) => {
        removeListAndReloadImage(e);
      });
    }
    index++;
    startLoadImage();
  }

  function stopLoadImage() {
    needToLoadList.forEach((item) => {
      const img = document.getElementById(item.id);
      if (img) {
        img.setAttribute('src', '');
        img.removeEventListener('load', (e) => {
          removeListAndReloadImage(e);
        });
        img.removeEventListener('error', (e) => {
          removeListAndReloadImage(e);
        });
      }
    });
    currentLoadedList.splice(0, currentLoadedList?.length);
  }

  function removeListAndReloadImage(e) {
    const loadedImageId = e.target.getAttribute('id');
    currentLoadedList.splice(
      currentLoadedList.findIndex((item) => item.imageId === loadedImageId),
      1
    );
    startLoadImage();
  }

  return {
    startLoadImage: throttle(startLoadImage, 50),
    stopLoadImage: throttle(stopLoadImage, 50),
  };
}
