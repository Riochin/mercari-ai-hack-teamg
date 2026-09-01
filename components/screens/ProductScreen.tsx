import Image from "next/image";
import { StatusBar, BottomNav } from "../PhoneChrome";
import { RobotIcon } from "../icons";

interface Props {
  unread: number;
  active: boolean;
  onOpenBattle: () => void;
  onOpenSearch: () => void;
  onBell: () => void;
  onMypage: () => void;
}

export function ProductScreen({ unread, active, onOpenBattle, onOpenSearch, onBell, onMypage }: Props) {
  return (
    <div className="screen" aria-hidden={!active} inert={!active ? true : undefined}>
      <div className="content">
        <StatusBar />

        <div className="pw-header">
          <button className="pw-btn back" type="button" onClick={onOpenSearch} aria-label="検索結果へ戻る">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 5l-7 7 7 7" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="pw-btn menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#222">
              <circle cx="12" cy="5" r="1.9" />
              <circle cx="12" cy="12" r="1.9" />
              <circle cx="12" cy="19" r="1.9" />
            </svg>
          </div>
        </div>

        <div className="photo-wrap">
          <div className="photo-inner">
            <Image src="/dorodango.png" alt="泥だんご" width={473} height={507} priority />
            <div className="pw-zoom">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="10.5" cy="10.5" r="6.5" stroke="#fff" strokeWidth="1.8" />
                <path d="M15.5 15.5L20 20" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div className="pw-count">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
              1 / 7
            </div>
          </div>
        </div>

        <div className="info">
          <div className="react-row">
            <div className="react-item">
              <span className="react-ic">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 20s-7-4.4-9.5-9C.8 7.2 2.6 4 6 4c2 0 3.5 1.1 4.3 2.4 0 0 .5.9.7 1.3.2-.4.7-1.3.7-1.3C12.5 5.1 14 4 16 4c3.4 0 5.2 3.2 3.5 7-2.5 4.6-9.5 9-9.5 9z"
                    stroke="#767676"
                    strokeWidth="1.6"
                  />
                </svg>
              </span>
              <span className="react-n">1</span>
            </div>
            <div className="react-item">
              <span className="react-ic">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 11.5a8.4 8.4 0 01-8.9 8.5 9 9 0 01-3.6-.7L3 20l1.1-4A8.3 8.3 0 013.5 12 8.4 8.4 0 0112 3.5a8.5 8.5 0 019 8z"
                    stroke="#767676"
                    strokeWidth="1.6"
                  />
                </svg>
              </span>
              <span className="react-n">0</span>
            </div>
            <div className="react-spacer" />
            <div className="pricedown-btn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#767676" strokeWidth="1.5" />
                <path d="M9 8h6M9 11h6M12 8v8M9.5 13.5L12 16l2.5-2.5" stroke="#767676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              値下げ依頼
            </div>
          </div>

          <p className="p-title">泥だんご</p>
          <div className="p-tags">ハンドメイド ・ ピカピカ仕上げ ・ 目立った傷や汚れなし</div>
          <div className="p-time">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#B0B0B0" strokeWidth="1.6" />
              <path d="M12 7v5.5L15.5 15" stroke="#B0B0B0" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            3ヶ月前
          </div>

          <div className="p-price-row">
            <span className="p-price">
              <sup>¥</sup>3,000
            </span>
            <span className="p-shipping">送料込み</span>
          </div>

          <div className="mercard">
            <svg width="17" height="12" viewBox="0 0 24 16" fill="none">
              <rect x="1" y="1.5" width="22" height="13" rx="2.5" stroke="#0A7CFF" strokeWidth="1.5" />
              <path d="M1 5.5h22" stroke="#0A7CFF" strokeWidth="1.5" />
            </svg>
            <span>
              メルカード利用で <b>1.9%</b> 還元
            </span>
            <span className="mercard-more">詳細</span>
          </div>

          <button className="ai-cta" type="button" onClick={onOpenBattle}>
            <RobotIcon />
            <span>AIにおまかせで値下げ交渉</span>
          </button>

          <div className="p-desc">
            <div className="p-desc-h">商品の説明</div>
            <p className="p-desc-b">
              手のひらサイズの泥だんごです。時間をかけてピカピカに磨き上げました。
              目立った傷や汚れはありませんが、あくまで手づくり品のため神経質な方はご遠慮ください。
            </p>
          </div>
        </div>
      </div>

      <div className="buy-bar">
        <button className="btn btn-outline" type="button">翌月払い</button>
        <button className="btn btn-fill" type="button">購入へ</button>
      </div>

      <BottomNav active="home" unread={unread} onBell={onBell} onMypage={onMypage} />
    </div>
  );
}
