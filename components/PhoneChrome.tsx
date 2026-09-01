import { StatusIcons, NavIcons } from "./icons";

export function StatusBar() {
  return (
    <div className="statusbar">
      <span>10:36</span>
      <StatusIcons />
    </div>
  );
}

interface BottomNavProps {
  active: "home" | "bell" | "pay" | "mypage" | null;
  unread: number;
  onBell: () => void;
  onMypage: () => void;
}

export function BottomNav({ active, unread, onBell, onMypage }: BottomNavProps) {
  return (
    <div className="bottom-nav">
      <div className="nav-item">
        {NavIcons.home(active === "home")}
        <span>ホーム</span>
      </div>
      <button className="nav-item" type="button" onClick={onBell} aria-label="お知らせ">
        {NavIcons.bell(active === "bell")}
        {unread > 0 && <span className="nav-badge">{unread}</span>}
        <span>お知らせ</span>
      </button>
      <div className="nav-item">
        {NavIcons.sell(false)}
        <span>出品</span>
      </div>
      <div className="nav-item">
        {NavIcons.pay(active === "pay")}
        <span>支払い</span>
      </div>
      <button className="nav-item" type="button" onClick={onMypage} aria-label="マイページ">
        {NavIcons.mypage(active === "mypage")}
        <span>マイページ</span>
      </button>
    </div>
  );
}
