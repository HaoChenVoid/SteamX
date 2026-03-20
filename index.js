import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search, Gamepad2, Play, Star, Globe, WalletCards, Sparkles, BadgePercent, Clock3,
  Activity, LayoutGrid, SlidersHorizontal, Bell, CheckCircle2, X, Menu, TrendingUp,
  ChevronRight, CircleDollarSign, ShieldCheck, Radio, Flame, MonitorPlay, BadgeInfo,
  Music4, Heart, Layers3
} from 'lucide-react';
import { THEMES } from '../styles/themes';
import { LANGUAGES, CURRENCIES, formatMoney, pct, normalize, getStoreCountry, getStoreLanguage } from '../utils/format';
import { fetchSteamApp, fetchSteamReviews } from '../utils/apiClient';

const DEMO_IDS = [1245620, 1091500, 730, 252490, 570];
const SECRET_CODE = 'HaoChen我爱你';
const SPECIAL_SKILLS = ['星轨弹幕', '蓝焰冲刺', '量子护盾', '时停残影', '极光切换', '幻影连击', '脉冲回响', '终章跃迁', '霓虹折跃', '超频觉醒'];

function loadLS(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function saveLS(key, value) { try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {} }

function Pill({ children }) { return <span className="pill">{children}</span>; }

function StatCard({ theme, label, value, icon, hint }) {
  return (
    <div className="panel stat-card" style={{ boxShadow: `0 24px 80px ${theme.glow}` }}>
      <div className="stat-head">
        <div>
          <div className="eyebrow">{label}</div>
          <div className="stat-value">{value}</div>
          {hint ? <div className="hint">{hint}</div> : null}
        </div>
        <div className="icon-box">{icon}</div>
      </div>
    </div>
  );
}

function GameCard({ game, active, currency, onClick, theme }) {
  return (
    <button
      onClick={onClick}
      className={`game-card ${active ? 'active' : ''}`}
      style={{
        background: active ? `linear-gradient(135deg, ${theme.accent}18, transparent)` : theme.panel2,
        borderColor: active ? `${theme.accent}66` : theme.border,
        boxShadow: active ? `0 0 0 1px ${theme.accent}22, 0 18px 40px ${theme.glow}` : 'none',
      }}
    >
      <div className="game-card-inner">
        <div className="game-thumb-wrap">
          <img src={game.header} alt={game.name} className="game-thumb" />
          <div className="thumb-glow" />
        </div>
        <div className="game-meta">
          <div className="game-meta-top">
            <div>
              <div className="game-title">{game.name}</div>
              <div className="game-tag">{game.tag}</div>
            </div>
            <div className="rating-box">
              <div className="eyebrow small">好评率</div>
              <div className="rating" style={{ color: theme.price }}>{pct(game.rating)}</div>
            </div>
          </div>
          <div className="game-pills">
            <Pill>{game.discount > 0 ? `-${game.discount}%` : 'Free'}</Pill>
            <Pill>{game.languages?.[0] || '多语言'}</Pill>
            <Pill>{formatMoney(game.price, currency)}</Pill>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function Home() {
  const [themeKey, setThemeKey] = useState('steam');
  const [language, setLanguage] = useState('中文');
  const [currency, setCurrency] = useState('CNY');
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(DEMO_IDS[0]);
  const [intro, setIntro] = useState(true);
  const [secretCode, setSecretCode] = useState('');
  const [secretUsed, setSecretUsed] = useState(false);
  const [secretBurst, setSecretBurst] = useState(false);
  const [activeSkill, setActiveSkill] = useState(null);
  const [pulse, setPulse] = useState(false);
  const [tracking, setTracking] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [storeData, setStoreData] = useState({});
  const [loading, setLoading] = useState(false);

  const theme = THEMES[themeKey] || THEMES.steam;

  useEffect(() => {
    setThemeKey(loadLS('steam_theme', 'steam'));
    setLanguage(loadLS('steam_lang', '中文'));
    setCurrency(loadLS('steam_currency', 'CNY'));
    setSecretUsed(loadLS('steam_secret', false));
    setTracking(loadLS('steam_tracking', []));
  }, []);
  useEffect(() => saveLS('steam_theme', themeKey), [themeKey]);
  useEffect(() => saveLS('steam_lang', language), [language]);
  useEffect(() => saveLS('steam_currency', currency), [currency]);
  useEffect(() => saveLS('steam_secret', secretUsed), [secretUsed]);
  useEffect(() => saveLS('steam_tracking', tracking), [tracking]);
  useEffect(() => { const t = setTimeout(() => setIntro(false), 1800); return () => clearTimeout(t); }, []);
  useEffect(() => { const timer = setInterval(() => { setPulse(true); setHeroIndex(v => (v + 1) % DEMO_IDS.length); setTimeout(() => setPulse(false), 700); }, 12000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    if (!secretBurst) return;
    const t = setTimeout(() => setSecretBurst(false), 5400);
    return () => clearTimeout(t);
  }, [secretBurst]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(DEMO_IDS.map(async (appid) => {
          const cc = getStoreCountry(currency);
          const l = getStoreLanguage(language);
          const [app, reviews] = await Promise.all([fetchSteamApp(appid, cc, l), fetchSteamReviews(appid)]);
          if (!app || !app.success || !app.data) return null;
          const d = app.data;
          const priceInfo = d.price_overview || {};
          const game = {
            appid,
            name: d.name,
            tag: (d.genres && d.genres[0] && d.genres[0].description) || 'Steam Game',
            rating: reviews?.query_summary?.review_score_desc?.includes('Overwhelmingly') ? 98 : reviews?.query_summary?.review_score_desc?.includes('Very Positive') ? 92 : reviews?.query_summary?.review_score_desc?.includes('Positive') ? 85 : reviews?.query_summary?.review_score_desc?.includes('Mixed') ? 60 : 75,
            discount: priceInfo.discount_percent || 0,
            base: (priceInfo.initial || 0) / 100,
            price: (priceInfo.final || 0) / 100,
            languages: [language, 'English', '日本語', '한국어'],
            genres: (d.genres || []).slice(0, 3).map(g => g.description),
            description: d.short_description || '',
            trailer: d.movies?.[0]?.mp4?.max || d.movies?.[0]?.webm?.max || d.movies?.[0]?.mp4?.480 || '',
            header: d.header_image || '',
            screenshots: (d.screenshots || []).slice(0, 3).map(s => s.path_full),
            history: priceInfo.initial ? [priceInfo.initial / 100, priceInfo.final / 100, priceInfo.final / 100] : [0],
          };
          return { game, reviews };
        }));
        const next = {};
        results.filter(Boolean).forEach(({ game }) => { next[game.appid] = { game }; });
        setStoreData(next);
      } catch (e) {
        // keep fallback data below
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currency, language]);

  const games = useMemo(() => {
    const base = Object.values(storeData).map(x => x.game);
    const fallback = [
      { appid: 1245620, name: 'ELDEN RING', tag: 'Action RPG', rating: 96, discount: 40, base: 59.99, price: 35.99, languages: ['中文','English','日本語','한국어'], genres: ['Action','RPG','Adventure'], description: '探索辽阔的开放世界，挑战强敌，收集装备，体验高密度的战斗和史诗级的艺术呈现。', trailer: 'https://www.youtube.com/embed/E3Huy2cdih0', header: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg', screenshots: ['https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_1.jpg','https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_2.jpg','https://cdn.akamai.steamstatic.com/steam/apps/1245620/ss_3.jpg'], history: [59.99,49.99,44.99,39.99,35.99] },
      { appid: 1091500, name: 'Cyberpunk 2077', tag: 'Open World RPG', rating: 86, discount: 50, base: 59.99, price: 29.99, languages: ['中文','English','日本語','한국어'], genres: ['RPG','Open World','Sci-Fi'], description: '在夜之城中扮演雇佣兵，体验密集叙事、沉浸式城市漫游与高度风格化的未来世界。', trailer: 'https://www.youtube.com/embed/LembwKDo1Dk', header: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg', screenshots: ['https://cdn.akamai.steamstatic.com/steam/apps/1091500/ss_1.jpg','https://cdn.akamai.steamstatic.com/steam/apps/1091500/ss_2.jpg','https://cdn.akamai.steamstatic.com/steam/apps/1091500/ss_3.jpg'], history: [59.99,49.99,39.99,29.99] },
      { appid: 730, name: 'Counter-Strike 2', tag: 'Tactical Shooter', rating: 88, discount: 0, base: 0, price: 0, languages: ['中文','English','日本語','한국어'], genres: ['Action','Shooter','Competitive'], description: '经典战术射击的最新进化，强调枪法、团队协作和高强度竞技对抗。', trailer: 'https://www.youtube.com/embed/edYCtaNueQY', header: 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg', screenshots: ['https://cdn.akamai.steamstatic.com/steam/apps/730/ss_1.jpg','https://cdn.akamai.steamstatic.com/steam/apps/730/ss_2.jpg','https://cdn.akamai.steamstatic.com/steam/apps/730/ss_3.jpg'], history: [0,0,0] },
      { appid: 252490, name: 'Rust', tag: 'Survival Sandbox', rating: 85, discount: 33, base: 39.99, price: 26.79, languages: ['English','Deutsch','Русский','Türkçe'], genres: ['Survival','Multiplayer','Open World'], description: '从赤手空拳开始求生，采集、建造、交易、战斗，每一局都在和环境与其他玩家较量。', trailer: 'https://www.youtube.com/embed/RZy3wZ0yJSM', header: 'https://cdn.akamai.steamstatic.com/steam/apps/252490/header.jpg', screenshots: ['https://cdn.akamai.steamstatic.com/steam/apps/252490/ss_1.jpg','https://cdn.akamai.steamstatic.com/steam/apps/252490/ss_2.jpg','https://cdn.akamai.steamstatic.com/steam/apps/252490/ss_3.jpg'], history: [39.99,34.99,29.99,26.79] },
      { appid: 570, name: 'Dota 2', tag: 'MOBA', rating: 83, discount: 0, base: 0, price: 0, languages: ['中文','English','ไทย','한국어'], genres: ['MOBA','Strategy'], description: '深度策略、团队协作与英雄组合构成的经典多人在线竞技体验。', trailer: 'https://www.youtube.com/embed/rJGH1t7QqGQ', header: 'https://cdn.akamai.steamstatic.com/steam/apps/570/header.jpg', screenshots: ['https://cdn.akamai.steamstatic.com/steam/apps/570/ss_1.jpg','https://cdn.akamai.steamstatic.com/steam/apps/570/ss_2.jpg','https://cdn.akamai.steamstatic.com/steam/apps/570/ss_3.jpg'], history: [0,0,0] }
    ];
    const all = [...base, ...fallback.filter(f => !base.some(b => b.appid === f.appid))];
    const q = normalize(query);
    return q ? all.filter(g => [g.name, g.tag, g.description, ...(g.genres || []), ...(g.languages || [])].join(' ').toLowerCase().includes(q)) : all;
  }, [storeData, query]);

  useEffect(() => {
    if (games.length && !games.find(g => g.appid === selectedId)) setSelectedId(games[0].appid);
  }, [games, selectedId]);

  const selected = games.find(g => g.appid === selectedId) || games[0];
  const hero = games[heroIndex % games.length] || selected || games[0];

  const handleSecret = () => {
    if (secretCode.trim() !== SECRET_CODE) return;
    if (secretUsed) {
      setActiveSkill('已输入过总换码');
      setTimeout(() => setActiveSkill(null), 2200);
      return;
    }
    setSecretUsed(true);
    setSecretBurst(true);
    let i = 0;
    setActiveSkill(SPECIAL_SKILLS[i]);
    const timer = setInterval(() => {
      i += 1;
      if (i >= SPECIAL_SKILLS.length) {
        clearInterval(timer);
        setTimeout(() => setActiveSkill(null), 700);
        return;
      }
      setActiveSkill(SPECIAL_SKILLS[i]);
    }, 420);
  };

  const addTrack = (game) => {
    if (!game) return;
    if (tracking.some(x => x.appid === game.appid)) return;
    setTracking(prev => [...prev, { appid: game.appid, name: game.name, discount: game.discount, price: game.price }]);
  };

  const currentPrice = selected ? formatMoney(selected.price, currency) : '$0.00';
  const currentBase = selected ? formatMoney(selected.base, currency) : '$0.00';
  const currentDiscount = selected ? (selected.discount > 0 ? `-${selected.discount}%` : 'Free') : 'Free';

  const bgStyle = { background: `radial-gradient(circle at 15% 10%, ${theme.accent}22, transparent 28%), radial-gradient(circle at 85% 0%, ${theme.accent2}18, transparent 24%), linear-gradient(180deg, ${theme.bg2}, ${theme.bg})`, color: theme.text };

  return (
    <>
      <Head>
        <title>Steam Deals Ultimate</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Steam style deals monitor with theme switch, live Steam data proxy and premium UI." />
      </Head>
      <div className="app-shell" style={bgStyle}>
        <AnimatePresence>
          {intro && (
            <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="intro">
              <motion.div initial={{ scale: 0.88, opacity: 0, y: 18 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="intro-card">
                <div className="intro-badge"><Sparkles size={34} color="#000" /></div>
                <div className="intro-title">STEAM DEALS ULTIMATE</div>
                <div className="intro-sub">High-end UI · Themes · Search · Live Pricing · Secret Mode</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeSkill && (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="toast" style={{ background: theme.panel, borderColor: theme.border }}>
              <Sparkles size={16} style={{ color: theme.accent, marginRight: 8 }} />{activeSkill}
            </motion.div>
          )}
        </AnimatePresence>

        {secretBurst && (
          <div className="burst-layer">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div key={i} initial={{ y: '110vh', x: `${6 + i * 5}%`, opacity: 0, rotate: 0, scale: 0.6 }} animate={{ y: '-10vh', opacity: [0,1,0], rotate: [0,180,360], scale: [0.6,1.1,0.7] }} transition={{ duration: 3.2 + i * 0.06, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }} className="burst-dot" style={{ background: i % 2 === 0 ? theme.accent : theme.accent2, boxShadow: `0 0 24px ${theme.glow}` }} />
            ))}
          </div>
        )}

        <header className="topbar" style={{ background: `${theme.bg2}cc`, borderColor: theme.border }}>
          <div className="topbar-inner">
            <button onClick={() => setMenuOpen(v => !v)} className="icon-btn mobile-only">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>

            <div className="brand">
              <div className="brand-icon" style={{ boxShadow: `0 0 0 1px ${theme.border}, 0 18px 48px ${theme.glow}` }}><Gamepad2 size={22} color={theme.accent} /></div>
              <div>
                <div className="brand-title">STEAM DEALS+</div>
                <div className="brand-sub">Ultimate UI Edition</div>
              </div>
            </div>

            <div className="search-wrap desktop-only">
              <Search className="search-icon" size={18} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={language === '中文' ? '搜索游戏名、类型、语言...' : 'Search games, genres, languages...'} className="search-input" style={{ background: theme.panel, borderColor: theme.border, color: theme.text }} />
              {query && games.length > 0 && (
                <div className="suggestions" style={{ background: theme.panel2, borderColor: theme.border }}>
                  {games.slice(0, 6).map((g) => (
                    <button key={g.appid} onClick={() => { setSelectedId(g.appid); setQuery(g.name); }} className="suggestion-item" style={{ borderColor: theme.border }}>
                      <div>
                        <div className="suggestion-title">{g.name}</div>
                        <div className="suggestion-tag">{g.tag}</div>
                      </div>
                      <div className="suggestion-right">{pct(g.rating)} 好评率</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="desktop-only controls">
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="select">{LANGUAGES.map((l) => <option key={l}>{l}</option>)}</select>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="select">{Object.entries(CURRENCIES).map(([code, cur]) => <option key={code} value={code}>{code} · {cur.label}</option>)}</select>
              <select value={themeKey} onChange={(e) => setThemeKey(e.target.value)} className="select">{Object.entries(THEMES).map(([key, value]) => <option key={key} value={key}>{value.name}</option>)}</select>
            </div>
          </div>

          {menuOpen && (
            <div className="mobile-panel" style={{ borderColor: theme.border }}>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={language === '中文' ? '搜索游戏名、类型、语言...' : 'Search games, genres, languages...'} className="mobile-input" style={{ background: theme.panel, borderColor: theme.border, color: theme.text }} />
              <div className="mobile-grid">
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="select">{LANGUAGES.map((l) => <option key={l}>{l}</option>)}</select>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="select">{Object.entries(CURRENCIES).map(([code, cur]) => <option key={code} value={code}>{code} · {cur.label}</option>)}</select>
              </div>
              <select value={themeKey} onChange={(e) => setThemeKey(e.target.value)} className="select">{Object.entries(THEMES).map(([key, value]) => <option key={key} value={key}>{value.name}</option>)}</select>
            </div>
          )}
        </header>

        <main className="page">
          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="hero panel" style={{ background: theme.hero, borderColor: theme.border, boxShadow: `0 28px 120px ${theme.glow}` }}>
            <div className="hero-glow hero-glow-left" style={{ background: theme.glow }} />
            <div className="hero-glow hero-glow-right" style={{ background: `${theme.accent}1f` }} />
            <div className="hero-grid">
              <div className="hero-copy">
                <div className="pill-row">
                  <Pill><BadgePercent size={12} /> Hot Deals</Pill>
                  <Pill><Radio size={12} /> Live Monitor</Pill>
                  <Pill><ShieldCheck size={12} /> Real Data Ready</Pill>
                </div>
                <h1 className="hero-title">像 Steam 一样专业，<span style={{ color: theme.accent }}>更像一个真正的产品</span></h1>
                <p className="hero-desc">大首屏、高清封面、动态卡片、强对比价格区、搜索联想、主题切换、历史价格与实时监控都整合到一个更高级的界面里。</p>
                <div className="stat-grid">
                  <StatCard theme={theme} label="当前折扣" value={currentDiscount} icon={<BadgePercent size={20} style={{ color: theme.accent }} />} hint="醒目展示当前促销力度" />
                  <StatCard theme={theme} label="好评率" value={pct(selected?.rating || 0)} icon={<Star size={20} style={{ color: theme.accent }} />} hint="来自 Steam 风格评分区" />
                  <StatCard theme={theme} label="价格状态" value={(selected && selected.price === 0) ? 'Free' : currentPrice} icon={<CircleDollarSign size={20} style={{ color: theme.accent }} />} hint="实时价格显示位" />
                </div>
                <div className="hero-actions">
                  <button onClick={() => addTrack(selected)} className="primary-btn" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` }}><Bell size={16} /> 监控这款游戏</button>
                  <button onClick={() => setSelectedId(games[(games.findIndex((g) => g.appid === selected?.appid) + 1) % games.length]?.appid || selectedId)} className="secondary-btn" style={{ borderColor: theme.border, background: theme.panel, color: theme.text }}><ChevronRight size={16} /> 切换下一款</button>
                </div>
                <div className="summary-grid">
                  <div className="summary-card" style={{ background: theme.panel, borderColor: theme.border }}><div className="eyebrow"><TrendingUp size={14} /> 近期最低</div><div className="summary-value" style={{ color: theme.price }}>{(selected && selected.price === 0) ? 'Free' : currentPrice}</div></div>
                  <div className="summary-card" style={{ background: theme.panel, borderColor: theme.border }}><div className="eyebrow"><Clock3 size={14} /> 原价</div><div className="summary-value strike">{(selected && selected.base === 0) ? '-' : currentBase}</div></div>
                  <div className="summary-card" style={{ background: theme.panel, borderColor: theme.border }}><div className="eyebrow"><Globe size={14} /> 语言</div><div className="summary-value">{language}</div></div>
                </div>
              </div>
              <div className="hero-media">
                <div className="hero-visual panel2">
                  <div className="overlay" />
                  <img src={hero?.header || selected?.header || 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg'} alt={hero?.name || 'game'} className="hero-image" />
                  <div className="hero-bottom">
                    <div className="mini-pills"><Pill><Flame size={12} /> {hero?.tag || 'Steam Game'}</Pill><Pill><Play size={12} /> Trailer</Pill><Pill><Heart size={12} /> {pct(hero?.rating || 0)}</Pill></div>
                    <div className="hero-game-name">{hero?.name || 'Game'}</div>
                    <div className="hero-game-desc">{hero?.description || ''}</div>
                    <div className="genre-row">{(hero?.genres || []).slice(0, 4).map((g) => <Pill key={g}>{g}</Pill>)}</div>
                  </div>
                  <div className="hero-badge-right"><div className="eyebrow">当前折扣</div><div className="hero-discount" style={{ color: theme.price }}>{currentDiscount}</div></div>
                  <div className="hero-badge-left"><div className="eyebrow">热门推荐</div><div className="mini-name">{hero?.name || 'Game'}</div></div>
                </div>
              </div>
            </div>
          </motion.section>

          <section className="content-grid">
            <div className="left-col">
              <div className="two-col">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel list-panel">
                  <div className="panel-head"><LayoutGrid size={18} style={{ color: theme.accent }} /> 精选游戏</div>
                  <div className="list-body">{games.map((g) => <GameCard key={g.appid} game={g} active={g.appid === selected?.appid} currency={currency} theme={theme} onClick={() => setSelectedId(g.appid)} />)}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel detail-panel">
                  <div className="panel-head"><MonitorPlay size={18} style={{ color: theme.accent }} /> 游戏详情与视频</div>
                  <div className="detail-grid">
                    <div>
                      <div className="video-wrap">
                        {selected?.trailer ? <iframe title={`${selected?.name || 'game'} trailer`} src={selected.trailer} className="video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <div className="video-fallback">暂无可用视频</div>}
                      </div>
                      <div className="shot-grid">
                        {(selected?.screenshots || []).slice(0, 3).map((src, idx) => <div key={idx} className="shot-card"><img src={src} alt={`${selected?.name} screenshot ${idx + 1}`} className="shot-img" /></div>)}
                      </div>
                    </div>
                    <div className="detail-stack">
                      <div className="info-card"><div className="eyebrow"><BadgeInfo size={14} /> 简介</div><div className="info-text">{selected?.description || ''}</div></div>
                      <div className="two-stats"><div className="mini-info"><div className="eyebrow">原价</div><div className="mini-price strike">{(selected && selected.base === 0) ? '-' : currentBase}</div></div><div className="mini-info"><div className="eyebrow">现价</div><div className="mini-price" style={{ color: theme.price }}>{(selected && selected.price === 0) ? 'Free' : currentPrice}</div></div></div>
                      <div className="info-card"><div className="eyebrow"><Layers3 size={14} /> 标签 / 语言</div><div className="tag-wrap">{(selected?.genres || []).map((g) => <Pill key={g}>{g}</Pill>)}{(selected?.languages || []).map((l) => <Pill key={l}>{l}</Pill>)}</div></div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="three-grid">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel mini-panel">
                  <div className="panel-head"><Clock3 size={18} style={{ color: theme.accent }} /> 历史价格</div>
                  <div className="history-list">{(selected?.history || []).map((p, idx) => <div key={idx} className="history-row" style={{ background: theme.panel2, borderColor: theme.border }}><span className="history-label">历史 #{idx + 1}</span><span className="history-price" style={{ color: theme.price }}>{formatMoney(p, currency)}</span></div>)}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel mini-panel">
                  <div className="panel-head"><SlidersHorizontal size={18} style={{ color: theme.accent }} /> 设置</div>
                  <div className="settings-grid">
                    <div>
                      <div className="setting-label">配色主题</div>
                      <div className="theme-grid">{Object.entries(THEMES).map(([k, v]) => <button key={k} onClick={() => setThemeKey(k)} className="theme-card" style={{ background: themeKey === k ? `linear-gradient(135deg, ${theme.accent}22, transparent)` : theme.panel2, borderColor: themeKey === k ? `${theme.accent}77` : theme.border }}><div className="theme-name">{v.name}</div><div className="theme-sub">点击切换</div></button>)}</div>
                    </div>
                    <div className="mini-grid"><div className="mini-box" style={{ background: theme.panel2, borderColor: theme.border }}><div className="setting-label">语言</div><div className="mini-value">{language}</div></div><div className="mini-box" style={{ background: theme.panel2, borderColor: theme.border }}><div className="setting-label">货币</div><div className="mini-value">{currency}</div></div></div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel mini-panel">
                  <div className="panel-head"><Sparkles size={18} style={{ color: theme.accent }} /> 总换码</div>
                  <div className="redeem-row"><input value={secretCode} onChange={(e) => setSecretCode(e.target.value)} placeholder="输入总换码" className="redeem-input" style={{ background: theme.panel2, borderColor: theme.border, color: theme.text }} /><button onClick={handleSecret} className="primary-btn" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, color: '#000' }}>兑换</button></div>
                  <div className="redeem-note">{secretUsed ? <span className="inline-note"><CheckCircle2 size={16} /> 已输入过，状态已自动保存。</span> : <span className="inline-note"><LockIcon /> 输入后会解锁 10 个特殊动画。</span>}</div>
                </motion.div>
              </div>
            </div>

            <div className="right-col">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel monitor-panel">
                <div className="panel-head"><Activity size={18} style={{ color: theme.accent }} /> 监控面板</div>
                <div className="monitor-body">
                  <div className="monitor-card" style={{ background: theme.panel2, borderColor: theme.border }}>
                    <div className="eyebrow">实时折扣</div>
                    <div className={`monitor-value ${pulse ? 'pulse' : ''}`} style={{ color: theme.price }}>{currentDiscount}</div>
                  </div>
                  <div className="monitor-card" style={{ background: theme.panel2, borderColor: theme.border }}>
                    <div className="eyebrow">监控列表</div>
                    <div className="monitor-list">{tracking.length === 0 ? <div className="empty-box" style={{ borderColor: theme.border }}>还没有游戏被加入监控。</div> : tracking.map((g) => <div key={g.appid} className="track-row" style={{ background: theme.panel, borderColor: theme.border }}><div><div className="track-name">{g.name}</div><div className="track-sub">{g.discount > 0 ? `-${g.discount}%` : 'Free'}</div></div><CheckCircle2 size={16} style={{ color: theme.accent }} /></div>)}</div>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel theme-panel"><div className="panel-head"><Music4 size={18} style={{ color: theme.accent }} /> Spotify 风切换</div><div className="theme-note">你现在可以在设置里切换到 Spotify 风格。默认 Steam 风更适合折扣页，Spotify 风则会更黑、更绿、更像媒体播放器。</div></motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel tag-panel"><div className="panel-head"><Layers3 size={18} style={{ color: theme.accent }} /> 高级标签</div><div className="tag-wrap">{(selected?.genres || []).concat(selected?.languages || []).map((x) => <Pill key={x}>{x}</Pill>)}</div></motion.div>
            </div>
          </section>
        </main>

        <style jsx global>{`
          .app-shell { min-height: 100%; overflow: hidden; position: relative; }
          .panel { background: ${theme.panel}; border: 1px solid ${theme.border}; border-radius: 30px; backdrop-filter: blur(24px); box-shadow: 0 20px 80px rgba(0,0,0,0.32); }
          .panel2 { background: ${theme.panel2}; border: 1px solid ${theme.border}; }
          .intro { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; background: ${theme.bg}; }
          .intro-card { text-align: center; }
          .intro-badge { margin: 0 auto 20px; width: 96px; height: 96px; border-radius: 28px; display: grid; place-items: center; border: 1px solid ${theme.border}; background: rgba(255,255,255,0.08); box-shadow: 0 20px 60px ${theme.glow}; }
          .intro-title { font-size: 32px; font-weight: 900; letter-spacing: 0.18em; }
          .intro-sub { margin-top: 12px; opacity: 0.7; font-size: 14px; }
          .toast { position: fixed; left: 50%; top: 16px; transform: translateX(-50%); z-index: 90; border-radius: 999px; padding: 10px 16px; border: 1px solid; display: inline-flex; align-items: center; backdrop-filter: blur(24px); }
          .burst-layer { position: fixed; inset: 0; z-index: 80; pointer-events: none; overflow: hidden; }
          .burst-dot { position: absolute; bottom: 0; width: 12px; height: 12px; border-radius: 999px; }
          .topbar { position: sticky; top: 0; z-index: 50; border-bottom: 1px solid; backdrop-filter: blur(24px); }
          .topbar-inner { max-width: 1280px; margin: 0 auto; padding: 16px 16px; display: flex; align-items: center; gap: 12px; }
          .brand { display: flex; align-items: center; gap: 12px; flex: 0 0 auto; }
          .brand-icon { width: 48px; height: 48px; border-radius: 18px; display: grid; place-items: center; border: 1px solid ${theme.border}; background: rgba(255,255,255,0.08); }
          .brand-title { font-size: 17px; font-weight: 900; letter-spacing: 0.06em; }
          .brand-sub { font-size: 12px; opacity: 0.65; }
          .search-wrap { position: relative; flex: 1; }
          .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); opacity: 0.5; }
          .search-input, .mobile-input, .select, .redeem-input { width: 100%; border-radius: 18px; border: 1px solid; outline: none; padding: 14px 16px; }
          .search-input { padding-left: 48px; transition: transform .2s ease, border-color .2s ease; }
          .search-input:focus { transform: scale(1.01); }
          .suggestions { position: absolute; left: 0; right: 0; top: calc(100% + 10px); border: 1px solid; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.36); z-index: 20; }
          .suggestion-item { width: 100%; display: flex; justify-content: space-between; gap: 12px; padding: 14px 16px; text-align: left; border-bottom: 1px solid; background: transparent; color: inherit; cursor: pointer; }
          .suggestion-item:hover { background: rgba(255,255,255,0.05); }
          .suggestion-title { font-weight: 700; }
          .suggestion-tag { font-size: 12px; opacity: 0.65; margin-top: 4px; }
          .suggestion-right { font-size: 12px; opacity: 0.65; }
          .controls, .mobile-grid { display: flex; align-items: center; gap: 8px; }
          .controls { flex: 0 0 auto; }
          .select { min-width: 124px; background: ${theme.panel}; color: ${theme.text}; padding: 12px 14px; }
          .icon-btn { width: 44px; height: 44px; border-radius: 16px; border: 1px solid ${theme.border}; background: rgba(255,255,255,0.06); color: ${theme.text}; display: grid; place-items: center; }
          .mobile-only { display: none; }
          .desktop-only { display: flex; }
          .mobile-panel { border-top: 1px solid; padding: 14px 16px 18px; display: grid; gap: 12px; }
          .page { max-width: 1280px; margin: 0 auto; padding: 24px 16px 48px; }
          .hero { position: relative; overflow: hidden; }
          .hero-glow { position: absolute; width: 240px; height: 240px; border-radius: 999px; filter: blur(70px); pointer-events: none; }
          .hero-glow-left { left: -80px; top: 20px; }
          .hero-glow-right { right: 0; top: 0; }
          .hero-grid { position: relative; z-index: 1; display: grid; grid-template-columns: 1.12fr 0.88fr; }
          .hero-copy { padding: 24px; }
          .pill-row { display: flex; flex-wrap: wrap; gap: 8px; }
          .pill { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; border: 1px solid ${theme.border}; background: rgba(255,255,255,0.06); color: ${theme.text}; padding: 8px 12px; font-size: 12px; font-weight: 700; }
          .hero-title { margin: 20px 0 0; font-size: clamp(40px, 7vw, 68px); font-weight: 900; line-height: 1.03; letter-spacing: -0.03em; max-width: 860px; }
          .hero-desc { margin-top: 18px; max-width: 760px; line-height: 1.85; opacity: 0.78; font-size: 15px; }
          .stat-grid { margin-top: 24px; display: grid; gap: 12px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .stat-card { padding: 18px; }
          .stat-head { display: flex; justify-content: space-between; gap: 12px; }
          .eyebrow { font-size: 11px; opacity: 0.55; text-transform: uppercase; letter-spacing: 0.22em; display: flex; align-items: center; gap: 6px; }
          .eyebrow.small { font-size: 10px; }
          .stat-value { margin-top: 8px; font-size: 26px; font-weight: 900; }
          .hint { margin-top: 6px; font-size: 12px; opacity: 0.62; }
          .icon-box { width: 48px; height: 48px; border-radius: 16px; border: 1px solid ${theme.border}; background: rgba(255,255,255,0.05); display: grid; place-items: center; }
          .hero-actions { margin-top: 24px; display: flex; flex-wrap: wrap; gap: 12px; }
          .primary-btn, .secondary-btn { display: inline-flex; align-items: center; gap: 8px; border-radius: 18px; padding: 14px 18px; font-weight: 800; border: 1px solid transparent; cursor: pointer; transition: transform .2s ease, opacity .2s ease; }
          .primary-btn { color: #000; }
          .secondary-btn { border: 1px solid; }
          .primary-btn:hover, .secondary-btn:hover { transform: translateY(-1px); }
          .summary-grid { margin-top: 24px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
          .summary-card { padding: 16px; border-radius: 22px; border: 1px solid; }
          .summary-value { margin-top: 8px; font-weight: 900; font-size: 22px; }
          .strike { text-decoration: line-through; opacity: 0.55; }
          .hero-media { padding: 16px; }
          .hero-visual { position: relative; min-height: 620px; overflow: hidden; border-radius: 28px; }
          .overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.26), transparent); z-index: 1; }
          .hero-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.72; transform: scale(1.02); }
          .hero-bottom { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: 24px; }
          .mini-pills, .genre-row, .tag-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
          .hero-game-name { margin-top: 12px; font-size: 38px; font-weight: 900; letter-spacing: -0.04em; }
          .hero-game-desc { margin-top: 10px; max-width: 680px; line-height: 1.8; opacity: 0.82; font-size: 14px; }
          .hero-badge-right, .hero-badge-left { position: absolute; z-index: 2; border-radius: 18px; border: 1px solid ${theme.border}; background: rgba(0,0,0,0.48); backdrop-filter: blur(16px); padding: 14px 16px; }
          .hero-badge-right { top: 18px; right: 18px; }
          .hero-badge-left { top: 18px; left: 18px; }
          .hero-discount { margin-top: 4px; font-size: 28px; font-weight: 900; }
          .mini-name { margin-top: 6px; font-weight: 800; }
          .content-grid { margin-top: 24px; display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 24px; }
          .left-col, .right-col { min-width: 0; }
          .two-col { display: grid; grid-template-columns: 0.86fr 1.14fr; gap: 24px; }
          .list-panel, .detail-panel, .mini-panel, .monitor-panel, .theme-panel, .tag-panel { overflow: hidden; }
          .panel-head { padding: 18px 20px; border-bottom: 1px solid ${theme.border}; display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 800; }
          .list-body { padding: 14px; display: grid; gap: 12px; }
          .game-card { width: 100%; border-radius: 24px; border: 1px solid; padding: 0; text-align: left; color: inherit; cursor: pointer; transition: transform .25s ease, box-shadow .25s ease; overflow: hidden; }
          .game-card:hover { transform: translateY(-3px); }
          .game-card-inner { display: flex; gap: 14px; padding: 16px; }
          .game-thumb-wrap { position: relative; width: 135px; min-width: 135px; height: 92px; border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.2); }
          .game-thumb { width: 100%; height: 100%; object-fit: cover; opacity: 0.95; transition: transform .3s ease; }
          .game-card:hover .game-thumb { transform: scale(1.06); }
          .thumb-glow { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.35), transparent); }
          .game-meta { min-width: 0; flex: 1; }
          .game-meta-top { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
          .game-title { font-size: 18px; font-weight: 800; line-height: 1.15; }
          .game-tag { margin-top: 6px; font-size: 11px; opacity: 0.55; letter-spacing: 0.18em; text-transform: uppercase; }
          .rating-box { text-align: right; }
          .rating { font-size: 20px; font-weight: 900; margin-top: 2px; }
          .game-pills { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px; }
          .detail-grid { padding: 16px; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 16px; }
          .video-wrap { border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: #000; }
          .video { width: 100%; aspect-ratio: 16 / 9; border: 0; display: block; }
          .video-fallback { aspect-ratio: 16 / 9; display: grid; place-items: center; opacity: 0.6; }
          .shot-grid { margin-top: 14px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
          .shot-card { border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.2); }
          .shot-img { width: 100%; height: 95px; object-fit: cover; transition: transform .3s ease; }
          .shot-card:hover .shot-img { transform: scale(1.05); }
          .detail-stack { display: grid; gap: 12px; }
          .info-card, .mini-info, .mini-box, .monitor-card, .track-row, .theme-card, .history-row, .empty-box { border: 1px solid; border-radius: 22px; }
          .info-card { padding: 16px; background: rgba(255,255,255,0.04); }
          .info-text { margin-top: 12px; line-height: 1.85; opacity: 0.85; font-size: 14px; }
          .two-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .mini-info { background: rgba(255,255,255,0.04); padding: 14px; }
          .mini-price { margin-top: 8px; font-size: 21px; font-weight: 900; }
          .settings-grid { padding: 16px; display: grid; gap: 14px; }
          .setting-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.18em; opacity: 0.58; margin-bottom: 10px; }
          .theme-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
          .theme-card { padding: 14px; background: rgba(255,255,255,0.04); color: inherit; }
          .theme-name { font-weight: 800; }
          .theme-sub { margin-top: 5px; font-size: 11px; opacity: 0.6; }
          .mini-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .mini-box { padding: 14px; background: rgba(255,255,255,0.04); }
          .mini-value { margin-top: 8px; font-weight: 800; }
          .redeem-row { padding: 16px; display: flex; gap: 10px; }
          .redeem-input { flex: 1; background: rgba(255,255,255,0.04); color: inherit; }
          .redeem-note { padding: 0 16px 16px; opacity: 0.8; font-size: 14px; }
          .inline-note { display: inline-flex; align-items: center; gap: 8px; }
          .monitor-body { padding: 16px; display: grid; gap: 12px; }
          .monitor-card { padding: 16px; background: rgba(255,255,255,0.04); }
          .monitor-value { margin-top: 10px; font-size: 34px; font-weight: 900; }
          .pulse { transform: scale(1.03); }
          .monitor-list { margin-top: 12px; display: grid; gap: 10px; }
          .empty-box { padding: 16px; border-style: dashed; opacity: 0.6; }
          .track-row { padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.04); }
          .track-name { font-weight: 800; }
          .track-sub { font-size: 12px; opacity: 0.6; margin-top: 5px; }
          .theme-note { padding: 16px; line-height: 1.85; opacity: 0.84; font-size: 14px; }
          .tag-panel { margin-top: 24px; }
          @media (max-width: 1100px) {
            .content-grid { grid-template-columns: 1fr; }
            .two-col { grid-template-columns: 1fr; }
            .hero-grid { grid-template-columns: 1fr; }
            .hero-visual { min-height: 460px; }
          }
          @media (max-width: 820px) {
            .desktop-only { display: none; }
            .mobile-only { display: grid; }
            .stat-grid, .summary-grid, .two-stats, .mini-grid, .theme-grid, .shot-grid { grid-template-columns: 1fr; }
            .topbar-inner { flex-wrap: wrap; }
            .brand { flex: 1; }
            .hero-copy, .hero-media { padding: 16px; }
            .hero-title { font-size: 38px; }
            .hero-visual { min-height: 420px; }
            .hero-game-name { font-size: 28px; }
            .hero-discount { font-size: 24px; }
            .detail-grid { grid-template-columns: 1fr; }
            .game-card-inner { flex-direction: column; }
            .game-thumb-wrap { width: 100%; min-width: 0; height: 150px; }
            .redeem-row { flex-direction: column; }
          }
        `}</style>
      </div>
    </>
  );
}

function LockIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11V8a5 5 0 1110 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" /></svg>;
}
