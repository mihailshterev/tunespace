export default interface Auth {
  id?: string;
  username?: string;
  email?: string;
  accessToken?: string;
  role?: string;
  isExternalProvider?: boolean;
}
