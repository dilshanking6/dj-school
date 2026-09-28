import { useEffect, useRef, useState } from 'react';
import { connectSocket, onTokenChange, getToken } from '../api/socket';

/**
 * Authenticated Socket.IO connection.
 *
 * Server har connection par JWT verify karta hai, isliye token zaroori hai.
 * Hook component ko ready socket instance deta hai (ya `null` jab login nahi hai),
 * taaki listeners effect mein reliably attach ho sakein. Cleanup par listeners
 * hatakar connection close kar diya jaata hai.
 *
 * Login/logout hone par token badalta hai — tab connection dobara ban-ta hai.
 */
const useSocket = () => {
  const [socket, setSocket] = useState(null);
  // closure me puraana connection chipak na jaaye — current socket ko ref
  // mein rakho, warna doosri baar token-change par purana/naaya connection
  // leak kar sakta tha (ghost socket banna hi rehta).
  const currentRef = useRef(null);

  useEffect(() => {
    const reconnect = () => {
      if (currentRef.current) {
        currentRef.current.removeAllListeners();
        currentRef.current.disconnect();
        currentRef.current = null;
      }
      const next = connectSocket(getToken());
      currentRef.current = next;
      setSocket(next);
    };

    const off = onTokenChange(reconnect);
    reconnect();

    return () => {
      off();
      if (currentRef.current) {
        currentRef.current.removeAllListeners();
        currentRef.current.disconnect();
        currentRef.current = null;
      }
      setSocket(null);
    };
  }, []);

  return socket;
};

export default useSocket;