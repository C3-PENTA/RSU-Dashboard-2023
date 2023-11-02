import { LoadingOverlay, MantineProvider } from '@mantine/core';
import { Notifications, notifications } from '@mantine/notifications';
import 'dayjs/locale/ko';
import { Suspense, createContext, useEffect, useId, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import PageLayout from './components/PageLayout';
import { SocketEvents } from './config/httpConfig/socket';
import routesConfig from './config/routesConfig';
import { IEdgeConnectionStatus, INotificationEventSocket } from './interfaces/interfaceListEvent';
import useGlobalStore from './stores';
import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';
import { Authentication } from './pages';
import { userInfo } from './interfaces/interfaceAuthentication';
import { Path } from './config/path';
import { LoadingProvider } from './LoadingContext';
import { customTheme } from './config/mantineProvider';
import { CircleX } from 'tabler-icons-react';

const initUser: userInfo = {
  username: '',
  email: '',
  role: {
    id: -1,
    name: '',
  },
  iat: -1,
  exp: -1,
};

export const LoginContext = createContext({
  loginState: false,
  setLoginState: (loginState: boolean) => {
    return;
  },
  setIsFirstAccess: (firstAccess: boolean) => {
    return;
  },
  currentUser: initUser,
});

function App() {
  const { socket, setEdgeConnectionStatus } = useGlobalStore((state) => ({
    socket: state.socket,
    setEdgeConnectionStatus: state.setEdgeConnectionStatus,
  }));
  const uID = useId();
  let currentUser: userInfo = initUser;
  const accessToken = Cookies.get('accessToken');
  if (accessToken !== undefined) {
    currentUser = jwtDecode(accessToken);
  }
  const [loginState, setLoginState] = useState<boolean>(
    currentUser !== initUser && currentUser.exp > Date.now() / 1000,
  );

  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [userId, setUserId] = useState(currentUser.username);
  const navigate = useNavigate();

  useEffect(() => {
    if (loginState && isFirstAccess) {
      navigate('/');
      setIsFirstAccess(false);
    }
    if (!loginState) {
      navigate('/login');
    }
  }, [loginState, isFirstAccess]);

  useEffect(() => {
    socket.on('connect_error', () => {
      socket.disconnect();
    });

    return () => {
      socket.off('connect_error');
    };
  }, []);

  useEffect(() => {
    loginState &&
      socket.on(SocketEvents.NEW_NOTIFICATION, (event: INotificationEventSocket) => {
        setTimeout(() => {
          notifications.show({
            icon: <CircleX size="1rem" color="red" />,
            autoClose: 3000,
            color: 'red',
            title: 'Error: ' + event.nodeID,
            message: event.detail,
          });
        }, 200);
      });

    loginState &&
      socket.on(SocketEvents.KEEP_ALIVE, (event: IEdgeConnectionStatus) => {
        setEdgeConnectionStatus(event.status);
      });

    return () => {
      loginState && socket.off(SocketEvents.NEW_NOTIFICATION);
      loginState && socket.off(SocketEvents.KEEP_ALIVE);
    };
  }, [loginState]);

  return (
    <LoadingProvider>
      <LoginContext.Provider
        value={{
          loginState,
          setLoginState,
          setIsFirstAccess,
          currentUser,
        }}
      >
        <MantineProvider withGlobalStyles withNormalizeCSS theme={customTheme}>
          <Notifications />
          <Suspense fallback={<LoadingOverlay overlayOpacity={0} visible />}>
            <Routes>
              <Route
                path={Path.LOGIN}
                element={
                  <Authentication
                    setLoginState={setLoginState}
                    setUserId={setUserId}
                    setIsFirstAccess={setIsFirstAccess}
                  />
                }
              />

              <Route path="/" element={<PageLayout />}>
                {routesConfig.map((route, index) => (
                  <Route key={`${uID}-${index}`} path={route.path} element={<route.component />} />
                ))}
              </Route>
            </Routes>
          </Suspense>
        </MantineProvider>
      </LoginContext.Provider>
    </LoadingProvider>
  );
}

export default App;
