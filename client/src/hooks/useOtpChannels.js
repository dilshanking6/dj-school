import { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * `GET /api/auth/otp-channels` se pata chalta hai ki server par email aur
 * mobile verification chalu hai ya nahi (SMTP / SMS provider set hai ya nahi).
 *
 * Isse UI un buttons ko khud disable kar deta hai. Pehle user "Send code"
 * dabaata tha, server error deta tha, aur error ka matlab samajhna mushkil
 * hota tha. Abhi endpoint fail ho to bhi sab normal dikhaya jaata hai —
 * check sirf better UX deta hai, zaruri nahi.
 */
const useOtpChannels = () => {
  const [channels, setChannels] = useState({
    loading: true,
    email: { available: true },
    sms: { available: true }
  });

  useEffect(() => {
    let active = true;

    axios
      .get('/api/auth/otp-channels')
      .then(({ data }) => {
        if (!active) return;
        setChannels({
          loading: false,
          email: data.email || { available: true },
          sms: data.sms || { available: true }
        });
      })
      .catch(() => {
        // Server purana hai ya endpoint reachable nahi — default maan lete hain
        // ki dono channels hain, taaki UI kaam karta rahe.
        if (active) setChannels({ loading: false, email: { available: true }, sms: { available: true } });
      });

    return () => {
      active = false;
    };
  }, []);

  return channels;
};

export default useOtpChannels;
