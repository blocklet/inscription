import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useReactive } from 'ahooks';
import PropTypes from 'prop-types';
import DidConnect from '@arcblock/did-connect/lib/Connect';
import { useLocaleContext } from '@arcblock/ux/lib/Locale/context';
import { styled } from '@arcblock/ux/lib/Theme';
import { useEnv } from '../contexts/use-env';
import api from '../libs/api';

const AuthDialog = forwardRef((props, ref) => {
  const { popup } = props;
  const { locale } = useLocaleContext();
  const dataTmp = {
    open: false,
    action: '',
    content: '',
    params: {},
    // use open to setup messages
    messages: {
      title: '',
      scan: '',
      confirm: '',
      success: '',
    },
    onSuccessAuth: () => {},
    onCloseAuth: () => {},
    onErrorAuth: () => {},
  };

  const state = useReactive(dataTmp);

  useImperativeHandle(ref, () => ({
    open: (data = {}) => {
      Object.assign(state, dataTmp, data, { open: true });
    },
    close: () => {
      state.open = false;
    },
  }));

  return (
    state.open && (
      <StyledDidConnect
        popup={popup}
        open={state.open}
        action={state.action}
        checkFn={api.get}
        checkTimeout={5 * 60 * 1000}
        onSuccess={state.onSuccessAuth}
        onError={state.onErrorAuth}
        // cancelWhenScanned={state.onErrorAuth}
        onClose={() => {
          state.open = false;
          state.onCloseAuth?.();
        }}
        messages={state.messages}
        locale={locale}
        extraParams={state.params}
      />
    )
  );
});

AuthDialog.propTypes = {
  popup: PropTypes.bool,
};

AuthDialog.defaultProps = {
  popup: true,
};

export default AuthDialog;

const StyledDidConnect = styled(DidConnect)`
  background: none !important;
`;

export const CloneContractAuthDialog = forwardRef((props, ref) => {
  const refAuth = useRef(null);
  const { env } = useEnv();

  const { t } = useLocaleContext();

  useImperativeHandle(ref, () => ({
    cloneContract: ({ onSuccessAuth, params, messages } = {}) => {
      refAuth.current.open({
        action: 'clone-contract',
        params: {
          didSpacesDisplayUrl: env.didSpacesDisplayUrl,
          ...params,
        },
        messages: {
          title: t('contract.auth.title'),
          scan: t('contract.auth.scan'),
          confirm: t('contract.auth.confirm'),
          success: t('contract.auth.success'),
          ...messages,
        },
        onSuccessAuth: async (res) => {
          refAuth.current.close();
          onSuccessAuth?.(res);
        },
      });
    },
  }));

  return <AuthDialog ref={refAuth} {...props} />;
});
