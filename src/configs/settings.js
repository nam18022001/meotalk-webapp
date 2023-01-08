import { createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "be62961e14ee432ea0edc38b988b6ee3";
const appCertificate = "b4657d2926204606921c41982b632826"


export const config = { mode: "rtc", codec: "vp8", appId: appId, appCertificate: appCertificate };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
// export const channelName = "main";
