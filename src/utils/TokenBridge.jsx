import { useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { registerTokenHandler } from './fetchWithToken';

const TokenBridge = () => {
  const { token, setToken } = useContext(AuthContext);

  useEffect(() => {
    registerTokenHandler(()=> token, setToken);
  }, [token]);

  return null; // It doesn’t render anything
};

export default TokenBridge;
