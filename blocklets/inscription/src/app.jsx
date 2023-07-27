import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams, useLocation } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { LocaleProvider, useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { ThemeProvider } from '@arcblock/ux/lib/Theme';
import { SnackbarProvider } from 'notistack';
import { useEffect, useRef } from 'react';
import { useSize } from 'ahooks';
import GlobalStyles from '@mui/material/GlobalStyles';
// eslint-disable-next-line import/no-unresolved
import { TrackerComponent } from '@nft-studio/react';
import CookieConsent from '@arcblock/ux/lib/CookieConsent';
import { useMessage } from '@blocklet/embed/lib/message';

import Layout from './layouts/layout';
// eslint-disable-next-line import/no-unresolved
import '@nft-studio/react/index.css';
import './app.css';
import Home from './pages/home';

import theme from './libs/theme';
import { isIframeWrapper } from './libs';
import { SessionProvider } from './contexts/session';
import { translations } from './locales/index';
import { EnvProvider } from './contexts/use-env';

function App() {
  const { locale } = useLocaleContext();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const iframeWrapper = isIframeWrapper() || searchParams.has('iframe');
  const isIframeEdit = iframeWrapper && searchParams.has('edit');

  if (isIframeEdit) {
    return '';
  }

  const notMintPage = pathname.indexOf('/mint') === -1;

  const { message } = useMessage();

  const rootRef = useRef(null);
  const hasInit = useRef(false);

  const size = useSize(rootRef);

  useEffect(() => {
    if (message) {
      // pages-kit 中会保障在 setting 面板 iframe 出现时，父容器中一定执行过 onInit 方法
      message.init(() => {
        hasInit.current = true;
      });
      message.on('config-set', () => {});
    }
  }, [message]);

  useEffect(() => {
    message?.send('resize', size);
    // 只需要监听 size 变动即可
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  useEffect(() => {
    return () => {
      message?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const { run } = useDebounceFn(
  //   () => {
  //     if (message && hasInit.current) {
  //       message.send('config', { });
  //     }
  //   },
  //   { wait: 300 }
  // );

  return (
    <div className="app" ref={rootRef}>
      <GlobalStyles
        styles={{
          '.app': iframeWrapper &&
            notMintPage && {
              border: '1px solid #eee',
              background: 'white',
              padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
              borderRadius: theme.spacing(2),
            },
        }}
      />
      <Routes>
        <Route element={iframeWrapper ? undefined : <Layout />}>
          <Route index element={<Home />} />
          <Route path=":currentTab" element={<Home />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <CookieConsent locale={locale} />
      <TrackerComponent />
    </div>
  );
}

function WrappedApp() {
  return (
    <ThemeProvider theme={theme}>
      <LocaleProvider translations={translations} fallbackLocale="en">
        <SessionProvider serviceHost={window?.blocklet?.prefix || '/'}>
          <CssBaseline />
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}>
            <EnvProvider>
              <App />
            </EnvProvider>
          </SnackbarProvider>
        </SessionProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}

// eslint-disable-next-line func-names
export default function () {
  // While the blocklet is deploy to a sub path, this will be work properly.
  const basename = window?.blocklet?.prefix || '/';

  return (
    <Router basename={basename}>
      <WrappedApp />
    </Router>
  );
}
