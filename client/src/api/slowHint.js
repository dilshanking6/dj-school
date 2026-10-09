import axios from 'axios';
import toast from 'react-hot-toast';

// Render ke free plan par pehli request 20-60 second leti hai (service ka cold
// start + Apps Script ka cold start). Us waqt screen par sirf spinner ghoomta
// hai aur user sochta hai ki app hang ho gaya hai — ek baar ye hint dikh jaaye
// to wo wait kar leta hai, warna tab band kar ke dobara kholta hai aur phir se
// cold start chalta hai.
//
// Ye module axios ke *default* instance ke interceptors lagata hai, aur client
// ka har page wahi instance use karta hai — isliye ek hi jagah laga kar sab
// jagah kaam ho jaata hai. Response kabhi nahi badalta; sirf ek baar toast
// dikhai jaati hai aur wo tabhi jab koi request 8 second se zyada chal rahi ho.

const SLOW_MS = 8000;
const MAX_HINTS = 1;

let hinted = 0;
let active = 0;
let timer = null;

const showHint = () => {
  timer = null;
  if (hinted >= MAX_HINTS) return;
  hinted += 1;
  toast('The server is still waking up — the first request can take up to a minute. It only happens once.', {
    icon: '⏳',
    duration: 10000
  });
};

// active counter = abhi kitni requests chal rahi hain. Jab tak ek bhi chal
// rahi hai, timer zinda; sab khattam hote hi band. Is tarah ek tez request
// doosri slow wali ka hint cancel nahi kar deti.
const onRequest = (config) => {
  active += 1;
  if (!timer && hinted < MAX_HINTS) timer = setTimeout(showHint, SLOW_MS);
  return config;
};

const onSettle = () => {
  active = Math.max(0, active - 1);
  if (active === 0 && timer) {
    clearTimeout(timer);
    timer = null;
  }
};

export const installSlowHint = () => {
  axios.interceptors.request.use(onRequest);
  axios.interceptors.response.use(
    (response) => {
      onSettle();
      return response;
    },
    (error) => {
      onSettle();
      return Promise.reject(error);
    }
  );
};
