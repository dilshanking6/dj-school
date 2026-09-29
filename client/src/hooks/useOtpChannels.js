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

    // `available: false` par bhi tab dikhana hai agar code screen par dikh raha
    // hai (development). Tab koi mail/SMS bhejna hi nahi hai — code seedha
    // response me aa jaata hai — isliye channel sach me kaam karta hai.
    const settle = (channel) => {
      if (!channel) return { available: true };
      return channel.codeExposed ? { ...channel, available: true } : channel;
    };

    axios
      .get('/api/auth/otp-channels')
      .then(({ data }) => {
        if (!active) return;
        setChannels({ loading: false, email: settle(data.email), sms: settle(data.sms) });
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
