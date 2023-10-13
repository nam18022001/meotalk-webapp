import { ClientConfig, createClient, createMicrophoneAndCameraTracks } from 'agora-rtc-react';

const serverTokenUrl = 'https://meotalk-token-agora.vercel.app/rtc/';
const appId = import.meta.env.VITE_APP_ID_AGORA;
const appCertificate = import.meta.env.VITE_APP_CERTIFICATE_AGORA;

const config: ClientConfig = {
  mode: 'rtc',
  codec: 'vp8',
};

const useClient = createClient(config);
const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

const settingAgora = { serverTokenUrl, appId, appCertificate, useClient, useMicrophoneAndCameraTracks };

export default settingAgora;
