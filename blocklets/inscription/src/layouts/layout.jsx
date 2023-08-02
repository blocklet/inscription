import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Header from '@blocklet/ui-react/lib/Header';
import Footer from '@blocklet/ui-react/lib/Footer';
import { styled } from '@arcblock/ux/lib/Theme';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import { IconButton } from '@mui/material';
// import ConnectButton from '@arcblock/did-connect/lib/Button';
import { useSessionContext } from '../contexts/session';

function Layout({ children }) {
  const { session } = useSessionContext();

  useEffect(() => {
    if (!session.user) {
      // session.login();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.user]);

  return (
    <Root>
      <Header
        className="layout-header"
        maxWidth={false}
        addons={(list) => {
          return [
            <IconButton key="github" href="https://github.com/blocklet/inscription.git" target="_blank">
              <GitHubIcon />
            </IconButton>,
            ...list,
          ];
        }}
      />
      <Container className="layout-container">
        <Box className="h-full" pt={2}>
          {children || <Outlet />}
        </Box>
        {/* {session.user || true ? (
          <Box className="h-full" pt={2}>
            {children || <Outlet />}
          </Box>
        ) : (
          <ConnectButton
            color="primary"
            onClick={session.login}
            style={{
              height: 'fit-content',
              width: 'fit-content',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              right: 0,
              margin: 'auto',
            }}
          />
        )} */}
      </Container>
      <Footer className="layout-footer" />
    </Root>
  );
}

Layout.propTypes = {
  children: PropTypes.any,
};

Layout.defaultProps = {
  children: null,
};

export default Layout;

const Root = styled(Box)`
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  .layout-header {
    position: sticky;
    top: 0;
    border-bottom: 1px solid #eee;
  }
  .layout-footer {
    margin-top: 16px;
  }
  .layout-main {
    padding: 24px 0;
  }
  .layout-main-full-height {
    /* TODO: 内部元素如果 height 过大, 会撑大 main 容器元素 */
    height: 100%;
  }
`;
