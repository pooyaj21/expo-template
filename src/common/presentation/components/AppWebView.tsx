import { useEffect, useRef, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import type {
  ShouldStartLoadRequest,
  WebViewOpenWindowEvent,
} from "react-native-webview/lib/WebViewTypes";
import { useAppTheme } from "@/common/business-logic/hooks/useAppTheme";
import { useLocalization } from "@/common/business-logic/hooks/useLocalization";
import { openUrl } from "@/common/business-logic/utils/openUrl";
import { Error as ErrorView } from "@/common/presentation/components/Error";
import { Loading } from "@/common/presentation/components/Loading";

const LOADING_TIMEOUT_MS = 15000;

// Capture phase runs before the page's own click handler, so a client-side
// router or target="_blank" cannot swallow the tap. In-page anchors stay here.
const openLinksOutsideScript = `
(function () {
  if (window.__appExternalLinks) return;
  window.__appExternalLinks = true;
  document.addEventListener("click", function (event) {
    var target = event.target;
    var node = target && target.closest ? target.closest("a") : null;
    if (!node || !node.href) return;
    if (/^(javascript|about|blob|data):/i.test(node.href)) return;
    if (node.href.split("#")[0] === location.href.split("#")[0]) return;
    if (!window.ReactNativeWebView) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.ReactNativeWebView.postMessage(node.href);
  }, true);
})();
true;
`;

export type AppWebViewProps = {
  url: string;
  onUrlChange?: (url: string) => void;
  /**
   * When true (default), Android hardware back navigates the web history
   * before leaving the screen.
   */
  enableAndroidBack?: boolean;
  testID?: string;
};

export const AppWebView = ({
  url,
  onUrlChange,
  enableAndroidBack = true,
  testID,
}: AppWebViewProps) => {
  const { colors } = useAppTheme();
  const { getString } = useLocalization();
  const ref = useRef<WebView>(null);
  const hasLoadedOnceRef = useRef(false);
  const loadedUrlRef = useRef(url);
  const sourceUrlRef = useRef(url);
  const lastExternalUrlRef = useRef<string | null>(null);
  const lastExternalAtRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  if (sourceUrlRef.current !== url) {
    sourceUrlRef.current = url;
    loadedUrlRef.current = url;
  }

  const finishLoading = () => {
    hasLoadedOnceRef.current = true;
    setLoading(false);
  };

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(finishLoading, LOADING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (!enableAndroidBack) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!canGoBack) return false;
      ref.current?.goBack();
      return true;
    });
    return () => sub.remove();
  }, [canGoBack, enableAndroidBack]);

  const openOutside = (nextUrl?: string | null) => {
    if (!nextUrl || !canLeaveWebView(nextUrl)) return;
    const now = Date.now();
    if (
      lastExternalUrlRef.current === nextUrl &&
      now - lastExternalAtRef.current < 800
    ) {
      return;
    }
    lastExternalUrlRef.current = nextUrl;
    lastExternalAtRef.current = now;
    void openUrl(nextUrl);
  };

  const handleShouldStartLoadWithRequest = (
    request: ShouldStartLoadRequest,
  ) => {
    if (!shouldOpenLinkOutside(request, loadedUrlRef.current)) return true;
    openOutside(request.url);
    return false;
  };

  const handleOpenWindow = (event: WebViewOpenWindowEvent) => {
    openOutside(event.nativeEvent.targetUrl);
  };

  const handleLinkMessage = (event: WebViewMessageEvent) => {
    openOutside(event.nativeEvent.data);
  };

  return (
    <View style={{ flex: 1 }} testID={testID}>
      {!hasError && (
        <WebView
          ref={ref}
          mediaCapturePermissionGrantType="deny"
          javaScriptCanOpenWindowsAutomatically
          injectedJavaScriptBeforeContentLoaded={openLinksOutsideScript}
          style={{ backgroundColor: colors.background.white }}
          containerStyle={{ backgroundColor: colors.background.white }}
          source={{ uri: url }}
          onNavigationStateChange={(navState) => {
            loadedUrlRef.current = navState.url;
            setCanGoBack(navState.canGoBack);
            onUrlChange?.(navState.url);
          }}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onOpenWindow={handleOpenWindow}
          onMessage={handleLinkMessage}
          onLoadStart={() => {
            setHasError(false);
            if (!hasLoadedOnceRef.current) setLoading(true);
          }}
          onLoadEnd={finishLoading}
          onLoadProgress={({ nativeEvent }) => {
            if (nativeEvent.progress >= 1) finishLoading();
          }}
          onError={() => {
            setLoading(false);
            setHasError(true);
          }}
        />
      )}

      {hasError && (
        <ErrorView
          title={getString("webview.error")}
          onRetry={() => {
            hasLoadedOnceRef.current = false;
            setHasError(false);
            setLoading(true);
            ref.current?.reload();
          }}
        />
      )}

      {loading && !hasError && (
        <View style={StyleSheet.absoluteFill}>
          <Loading />
        </View>
      )}
    </View>
  );
};

export default AppWebView;

// "click" exists on iOS only. Android reports every load as "other", including
// the redirects a payment page makes on its own, so those stay in the web view.
// Android taps are handled by the injected listener above.
const shouldOpenLinkOutside = (
  request: ShouldStartLoadRequest,
  loadedUrl: string,
) => {
  if (request.navigationType !== "click" || request.isTopFrame === false) {
    return false;
  }
  if (!canLeaveWebView(request.url)) return false;
  return request.url.split("#")[0] !== loadedUrl.split("#")[0];
};

const NON_NAVIGABLE_URL = /^(javascript|about|blob|data):/i;

const canLeaveWebView = (nextUrl: string) =>
  nextUrl.length > 0 && !NON_NAVIGABLE_URL.test(nextUrl);
