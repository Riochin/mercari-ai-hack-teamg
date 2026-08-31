import Image from "next/image";
import { StatusBar, BottomNav } from "../PhoneChrome";
import { RobotIcon, Chevron } from "../icons";

interface Props {
  unread: number;
  onOpenBattle: () => void;
  onBell: () => void;
  onMypage: () => void;
}

export function ProductScreen({ unread, onOpenBattle, onBell, onMypage }: Props) {
  return (
    <div className="screen">
      <div className="content">
        <StatusBar />

        <div className="photo-wrap">
          <div className="back-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 5l-7 7 7 7" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <Image src="/dorodango.png" alt="泥だんご" width={473} height={507} priority />
        </div>

        <div className="info">
          <p className="p-title">泥だんご</p>
          <div className="p-price-row">
            <span className="p-price">
              <sup>¥</sup>3,000
            </span>
            <span className="p-shipping">送料込み</span>
          </div>
          <div className="installment">月々に分けてお支払いできます</div>

          <div className="action-row">
            <div className="item">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 20s-7-4.4-9.5-9C.8 7.2 2.6 4 6 4c2 0 3.5 1.1 4.3 2.4 0 0 .5.9.7 1.3.2-.4.7-1.3.7-1.3C12.5 5.1 14 4 16 4c3.4 0 5.2 3.2 3.5 7-2.5 4.6-9.5 9-9.5 9z"
                  stroke="#767676"
                  strokeWidth="1.6"
                />
              </svg>
              いいね！
            </div>
            <div className="item">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 11.5a8.4 8.4 0 01-8.9 8.5 9 9 0 01-3.6-.7L3 20l1.1-4A8.3 8.3 0 013.5 12 8.4 8.4 0 0112 3.5a8.5 8.5 0 019 8z"
                  stroke="#767676"
                  strokeWidth="1.6"
                />
              </svg>
              コメント
            </div>
            <div className="spacer" />
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#767676">
              <circle cx="5" cy="12" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="19" cy="12" r="1.8" />
            </svg>
          </div>

          <div className="coupon">
            <span>
              お買いものクーポンがもらえます。エントリーするだけ。《12/25まで》
              <br />
              ※特定カテゴリー限定
            </span>
            <Chevron />
          </div>

          <div className="ai-cta" onClick={onOpenBattle}>
            <RobotIcon />
            <span>AIに値下げ交渉してもらう</span>
          </div>

          <div className="buy-row">
            <div className="btn btn-outline">分けて支払う</div>
            <div className="btn btn-fill">購入手続きへ</div>
          </div>
        </div>
      </div>

      <BottomNav active="home" unread={unread} onBell={onBell} onMypage={onMypage} />
    </div>
  );
}
