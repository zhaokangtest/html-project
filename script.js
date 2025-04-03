function AppchargeCheckout({
  checkoutUrl,
  sessionToken,
  locale = "",
  onClose,
  onInitialLoad,
  onOrderCreated,
  onPaymentIntentFailed,
  onPaymentIntentSuccess,
  onOrderCompletedFailed,
  onOrderCompletedSuccessfully,
  checkoutToken,
}) {
  if (!checkoutToken) {
    throw Error("checkoutToken prop is missing in AppchargeCheckout function");
  }
  const queryParams = `checkout-token=${checkoutToken || ""}${
    locale ? `&locale=${locale}` : ""
  }`;
  const url = `${checkoutUrl}/${sessionToken}?${queryParams}`;

  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.className = "iframe";
  iframe.title = "checkout";
  iframe.allow = "payment *";

  const style = document.createElement("style");

  document.head.insertAdjacentHTML(
    "beforeend",
    `
    <style>
      .iframe {
        border: 0;
        width: 100%;
        height: 100vh;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 9999;
      }
      @supports (height: 100svh) {
        .iframe {
          border: 0;
          width: 100%;
          height: 100svh;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 9999;
        }
      }
    </style>`
  );

  function eventHandler(messageEvent) {
    if (messageEvent.origin !== checkoutUrl) return;
    const { params, event } = messageEvent.data;
    switch (event) {
      case "appcharge_order_created":
        onOrderCreated?.(params);
        break;
      case "appcharge_order_completed_failed":
        onOrderCompletedFailed?.(params);
        break;
      case "appcharge_order_completed_success":
        onOrderCompletedSuccessfully?.(params);
        break;
      case "appcharge_payment_intent_failed":
        onPaymentIntentFailed?.(params);
        break;
      case "appcharge_payment_intent_success":
        onPaymentIntentSuccess?.(params);
        break;
      case "appcharge_close_checkout":
        document.body.removeChild(iframe);
        window.removeEventListener("message", eventHandler);
        onClose?.(params);
        break;
    }
  }

  function onLoadHandler() {
    onInitialLoad?.();
  }

  iframe.addEventListener("load", onLoadHandler);

  document.body.appendChild(iframe);
  document.head.appendChild(style);

  window.addEventListener("message", eventHandler);
}

const INIT_FLAG_KEY = "ac_co_initialized";

function AppchargeCheckoutInit({
  domain = window.location.host,
  environment = "sandbox",
  checkoutToken,
}) {
  if (!checkoutToken) {
    throw Error(
      "checkoutToken prop is missing in AppchargeCheckoutInit function"
    );
  }
  const env = environment === "prod" ? "" : `-${environment}`;
  const style = document.createElement("style");
  style.innerHTML = `.iframe-transparent {
    width: 0px;
    height: 0px;
    visibility: hidden;
    position: absolute;
    top: -9999px;
    left: -9999px;
  };`;

  const queryParams = `checkout-token=${checkoutToken || ""}`;
  const iframe = document.createElement("iframe");
  iframe.src = `https://checkout-v2${env}.appcharge.com/handshake?${queryParams}`;
  iframe.className = "iframe-transparent";
  iframe.title = "checkout-transparent";

  document.body.appendChild(iframe);
  document.head.appendChild(style);
}

async function getPricePoints(env, domain) {
  env = env === "prod" ? "" : `-${env}`;
  domain = domain || window.location.host;
  const apiUrl = `https://api${env}.appcharge.com/checkout/v1/${domain}/pricingPoints`;
  const pricePointsResponse = await fetch(apiUrl);
  const pricePoints = await pricePointsResponse.json();
  if (!pricePointsResponse.ok) {
    throw pricePoints?.message;
  }
  return pricePoints;
}


window.fbLoaded = false;
window.fbAsyncInit = function() {
    FB.init({
        appId      : '760206844606333', // 替换为你的 App ID
        cookie     : true,
        xfbml      : true,
        version    : 'v18.0' // 使用的 Facebook Graph API 版本
    });
    window.fbLoaded = true; // 设置为已加载
};
(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));



function loadAppleLoginSDK(callback) {
  // 检查 SDK 是否已经加载
  if (typeof AppleID !== 'undefined') {
      callback();
      return;
  }
  // 创建 script 标签
  const script = document.createElement('script');
  script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
  script.onload = callback; // 加载完成后调用回调
  script.onerror = function() {
      console.error('Apple 登录 SDK 加载失败');
  };
  // 将 script 标签添加到 document
  document.head.appendChild(script);
}
// 使用示例
loadAppleLoginSDK(() => {
  // SDK 加载完成后进行初始化
  AppleID.auth.init({
      clientId: 'com.slots.web.vegas.jackpotland', // 替换为你的 Client ID
      scope: 'email name',
      redirectURI: "https://slots-web-client-test.bettagames.com/callback", // 替换为你的重定向 URI
      usePopup: true // 使用弹出窗口进行登录
  });
});