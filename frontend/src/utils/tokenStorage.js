const getTabId = () => {
  let tabId = sessionStorage.getItem("__tabId__");

  if (!tabId) {
    tabId = Math.random().toString(36).slice(2);
    sessionStorage.setItem("__tabId__", tabId);
  }

  return tabId;
};

const TAB_ID = getTabId();

const ACCESS_KEY = `accessToken_${TAB_ID}`;
const REFRESH_KEY = `refreshToken_${TAB_ID}`;

export const tokenStorage = {
  getAccess: () => sessionStorage.getItem(ACCESS_KEY),
  getRefresh: () => sessionStorage.getItem(REFRESH_KEY),

  setAccess: (token) => sessionStorage.setItem(ACCESS_KEY, token),
  setRefresh: (token) => sessionStorage.setItem(REFRESH_KEY, token),

  clear: () => {
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};