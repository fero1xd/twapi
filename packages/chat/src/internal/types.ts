import { UserState } from './interfaces';

export type OnConnectedCallback = () => void;

export type OnGlobalUserState = (userstate: UserState) => void;
