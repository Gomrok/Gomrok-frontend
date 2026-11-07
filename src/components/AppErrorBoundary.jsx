import { Component } from "react";
export class AppErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="app-error" role="alert"><h1>صفحه به‌درستی آماده نشد</h1><p>صفحه را دوباره بارگذاری کنید. پیش‌نویس‌های ذخیره‌شدهٔ این تب پاک نمی‌شوند.</p><button className="button button-primary" onClick={() => window.location.reload()}>بارگذاری دوباره</button><a className="button button-outline" href="./">صفحهٔ اصلی</a></main>;
    return this.props.children;
  }
}
