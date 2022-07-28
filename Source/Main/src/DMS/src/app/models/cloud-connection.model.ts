export enum CloudConnectionStatus {
    notConfig = -1,
    lostConnect = 0,
    connected = 1,
    connecting = 2,
    apiLostConnect = 3,
}

export enum BlockUIState {
    chromeOnly = 1,
    blockAllCookie = 2,
    blockThirdPartyCookie = 3,
}
