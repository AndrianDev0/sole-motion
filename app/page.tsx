'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowUpRight, ArrowDown, Plus, Minus, ShoppingBag, X, Check, MoveHorizontal, Asterisk, Pause, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import ShoeScene from './shoe-scene';
import ShoeImage from './shoe-image';
import MotionLayer from './motion-layer';
import ProductModel from './product-model';

const editions = [
  {
    name: 'WHITE CLASSIC', label: 'Белый', color: 'white', price: 12900,
    note: 'Белый без лишнего шума — чистый холст для любого образа.', pitch: 'ЧИСТЫЙ ЛИСТ',
    benefits: [
      { title: 'Чистая основа', text: 'Гладкая кожа держит форму и легко входит в образ.' },
      { title: 'Воздух внутри', text: 'Перфорация на носке поддерживает вентиляцию.' },
      { title: 'Мягкий шаг', text: 'Nike Air смягчает каждый контакт с городом.' },
    ],
  },
  {
    name: 'AFTER HOURS', label: 'Графит', color: 'ink', price: 12900,
    note: 'Графит гасит лишний блеск и делает силуэт собраннее.', pitch: 'ПОСЛЕ СВЕТА',
    benefits: [
      { title: 'Точный контур', text: 'Тёмный тон подчёркивает панели и строчку.' },
      { title: 'Спокойная посадка', text: 'Мягкий воротник комфортно держит щиколотку.' },
      { title: 'Городской запас', text: 'Резиновая подошва рассчитана на долгий маршрут.' },
    ],
  },
  {
    name: 'MINT CUSTOM', label: 'Мятный', color: 'mint', price: 13900,
    note: 'Мятный добавляет свежий акцент, не споря с формой.', pitch: 'СВЕЖИЙ ХОД',
    benefits: [
      { title: 'Цвет в фокусе', text: 'Мятный оттенок работает как точный акцент.' },
      { title: 'Лёгкое движение', text: 'Nike Air мягко принимает каждый шаг.' },
      { title: 'Комфорт у щиколотки', text: 'Воротник с набивкой смягчает посадку.' },
    ],
  },
] as const;
const editorialStories = [
  {
    eyebrow: 'LIGHT / 01',
    title: 'БЕЛЫЙ. ТОЧКА.',
    detail: 'НОСОК / ПЕРФОРАЦИЯ',
    description: 'Чистый цвет оставляет главное: линии панелей, перфорацию и массивную подошву.',
    tags: ['ЧИСТО', 'БЕЗ ШУМА'],
    crop: 'toe',
  },
  {
    eyebrow: 'NIGHT / 02',
    title: 'ГОРОД ПОСЛЕ ВОСЬМИ',
    detail: 'SWOOSH / СЛОИ',
    description: 'Матовый графит собирает силуэт, а свет вытягивает из тени швы и Swoosh.',
    tags: ['ТЕНЬ', 'НОЧЬ'],
    crop: 'swoosh',
  },
  {
    eyebrow: 'FRESH / 03',
    title: 'СВЕЖИЙ СИГНАЛ',
    detail: 'ПЯТКА / ПОДОШВА',
    description: 'Мятный работает как точный акцент: заметный, но без лишнего шума.',
    tags: ['ЦВЕТ', 'ИМПУЛЬС'],
    crop: 'heel',
  },
] as const;
const tickerWords = [
  'ФОРМА ГОВОРИТ', 'ЦВЕТ РЕШАЕТ', 'ХОД ЗА ТОБОЙ',
  'ФОРМА ГОВОРИТ', 'ЦВЕТ РЕШАЕТ', 'ХОД ЗА ТОБОЙ',
  'ФОРМА ГОВОРИТ', 'ЦВЕТ РЕШАЕТ', 'ХОД ЗА ТОБОЙ',
];
const money = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
type Pair = { edition: number; size: string; qty: number };
const anatomyPoints = [
  { position: 'one', label: ['КОЖАНЫЕ', 'ПАНЕЛИ'], note: 'Слои кожи собирают объём и держат узнаваемый контур.' },
  { position: 'two', label: ['ПЕРФОРАЦИЯ', 'НОСКА'], note: 'Ровная сетка отверстий добавляет воздухообмен там, где он нужен.' },
  { position: 'three', label: ['AIR', 'CUSHIONING'], note: 'Амортизация Nike Air скрыта внутри массивной подошвы.' },
];
const detailItems = [
  { title: 'Силуэт держит образ.', text: 'Массивная подошва задаёт вес, а кожаные панели собирают чёткий профиль.', spec: 'МНОГОСЛОЙНЫЙ ВЕРХ / ПЛОТНЫЙ СИЛУЭТ' },
  { title: 'Цвет меняет сценарий.', text: 'Белый очищает, графит собирает, мятный ставит акцент. Форма остаётся той самой.', spec: '3 COLORWAYS / ONE ICON' },
  { title: 'Посадка без ярлыков.', text: 'Унисекс-размеры от 36 до 45 EU. Выбирай по ноге, носи по-своему.', spec: 'EU 36—45 / UNISEX' },
];

function TickerRun({ offset = 0 }: { offset?: number }) {
  let letterIndex = 0;
  return <div className="ticker-run">
    {tickerWords.map((word, wordIndex) => <span className="ticker-word" key={`${word}-${wordIndex}`}>
      {Array.from(word).map((letter, charIndex) => {
        const delay = `${(letterIndex++ % 24) * 0.11 + offset}s`;
        return <span className="ticker-letter" style={{ animationDelay: delay }} key={`${wordIndex}-${charIndex}`}>{letter === ' ' ? '\u00a0' : letter}</span>;
      })}
      <Asterisk className="ticker-symbol" aria-hidden="true" strokeWidth={2.25}/>
    </span>)}
  </div>;
}

export default function Home() {
  const [edition, setEdition] = useState(0);
  const [size, setSize] = useState('');
  const [bag, setBag] = useState<Pair[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const [motion, setMotion] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const [openDetail, setOpenDetail] = useState<number | null>(0);
  const [heroShowcaseEdition, setHeroShowcaseEdition] = useState<number | null>(null);
  const [heroShowcaseRun, setHeroShowcaseRun] = useState(0);
  const cancelColorFlight = useRef<null | (() => void)>(null);
  const product = editions[edition];
  const heroProduct = heroShowcaseEdition === null ? null : editions[heroShowcaseEdition];
  const heroShowcaseIndex = heroShowcaseEdition ?? 0;
  const count = bag.reduce((s,p) => s+p.qty,0);
  useEffect(() => () => cancelColorFlight.current?.(), []);
  function addPair() {
    if (!size) { setSizeError(true); document.getElementById('sizes')?.focus(); return; }
    setBag(prev => {
      const exists = prev.find(p => p.edition === edition && p.size === size);
      return exists ? prev.map(p => p === exists ? {...p,qty:p.qty+1} : p) : [...prev,{edition,size,qty:1}];
    });
    setAdded(true); setTimeout(() => setAdded(false),2200);
  }
  function showcaseEdition(i: number) {
    cancelColorFlight.current?.();
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setEdition(i);
    setHeroShowcaseEdition(i);
    setHeroShowcaseRun(run => run + 1);
    setAdded(false);
    setMotion(true);

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    const restoreScrollBehavior = () => previousScrollBehavior
      ? root.style.setProperty('scroll-behavior', previousScrollBehavior)
      : root.style.removeProperty('scroll-behavior');
    root.style.setProperty('scroll-behavior', 'auto');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        restoreScrollBehavior();
      });
      return;
    }

    let frame = 0;
    let interruptTimer = 0;
    let finished = false;
    const cleanUp = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(interruptTimer);
      restoreScrollBehavior();
      window.removeEventListener('wheel', cleanUp);
      window.removeEventListener('touchstart', cleanUp);
      window.removeEventListener('keydown', cleanUp);
      cancelColorFlight.current = null;
    };
    cancelColorFlight.current = cleanUp;
    frame = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      interruptTimer = window.setTimeout(() => {
        window.addEventListener('wheel', cleanUp, { passive: true });
        window.addEventListener('touchstart', cleanUp, { passive: true });
        window.addEventListener('keydown', cleanUp);
      }, 450);
      frame = requestAnimationFrame(() => {
        const section = document.querySelector<HTMLElement>('.flight-section');
        const sticky = section?.querySelector<HTMLElement>('.flight-sticky');
        if (!section || !sticky) { cleanUp(); return; }
        const target = section.offsetTop + Math.max(1, section.offsetHeight - sticky.offsetHeight);
        const duration = 2350;
        const hold = 180;
        const startedAt = performance.now() + hold;
        const animate = (time: number) => {
          if (finished) return;
          const progress = Math.min(1, Math.max(0, (time - startedAt) / duration));
          const eased = progress < .5 ? 4 * progress ** 3 : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          window.scrollTo(0, target * eased);
          if (progress < 1) frame = requestAnimationFrame(animate);
          else cleanUp();
        };
        frame = requestAnimationFrame(animate);
      });
    });
  }
  return <main id="top">
    <MotionLayer/>
    <a className="skip-link" href="#product">Перейти к выбору пары</a>
    <div className="drop-banner"><div><span>NEW DROP / AIR FORCE 1</span><span>БЕЛЫЙ · ГРАФИТ · МЯТНЫЙ</span><span>CONCEPT 2026</span></div></div>
    <header className="header">
      <a href="#top" className="wordmark" aria-label="DROP — на главную">drop<span>®</span></a>
      <nav aria-label="Основная навигация"><a href="#collection">Три цвета <span>03</span></a><a href="#details">Почему AF1</a></nav>
      <button className="bag-button" onClick={() => setBagOpen(true)}><ShoppingBag size={17}/><span>Мой выбор</span><b>{count.toString().padStart(2,'0')}</b></button>
    </header>
    <section className="flight-section" aria-labelledby="hero-heading">
      <div className="flight-sticky">
        <div className="hero-meta"><span><i/> ИНТЕРАКТИВНЫЙ СНИКЕР-КОНЦЕПТ</span><span>DROP / 001</span></div>
        <h1 id="hero-heading">ВНЕ<br/><span>ГРАВИТАЦИИ.</span></h1>
        <div className="orbit" aria-hidden="true"/>
        <ShoeScene edition={edition} motion={motion}/>
        <div className="side-label"><span>ПРОКРУТИ — ПАРА ОЖИВЁТ</span><ArrowUpRight aria-hidden="true"/></div>
        {!heroProduct && <><div className="hero-copy"><span className="small-label">AIR FORCE 1 / ТРИ ЦВЕТА</span><p>Тот самый силуэт.<br/>Три цвета — <strong>выбирай свой.</strong></p><a className="primary-button" href="#product">Выбрать цвет <ArrowUpRight size={21}/></a></div>
        <div className="hero-sticker" aria-hidden="true">ФОРМА<br/>ЛОВИТ<br/><b>ДВИЖЕНИЕ.</b><ArrowDown size={22}/></div></>}
        {heroProduct && <aside key={heroShowcaseRun} className={'hero-pitch '+heroProduct.color} aria-live="polite" aria-atomic="true">
          <div className="hero-pitch-head"><span><i aria-hidden="true"/> COLORWAY / 0{heroShowcaseIndex + 1}</span><span>ВЫБРАНО · {heroProduct.label.toUpperCase()}</span></div>
          <div className="hero-pitch-body">
            <div className="hero-pitch-name"><span>AIR FORCE 1 / 07</span><strong>{heroProduct.pitch}</strong></div>
            <p className="hero-pitch-price">{money(heroProduct.price)}<span>за пару</span></p>
            <div className="hero-pitch-benefits">{heroProduct.benefits.map((benefit,index)=><div key={benefit.title} style={{'--pitch-delay': `${.32 + index * .1}s`} as CSSProperties}><span>0{index + 1}</span><p><strong>{benefit.title}</strong><small>{benefit.text}</small></p></div>)}</div>
          </div>
        </aside>}
        <div className="hero-bottom"><span><ArrowDown size={16}/><span className="scroll-copy-full">ЛИСТАЙ — ПОЙМАЙ ПРИЗЕМЛЕНИЕ</span><span className="scroll-copy-short">ЛИСТАЙ</span></span><button onClick={() => setMotion(!motion)} aria-pressed={motion}>{motion ? <Pause aria-hidden="true"/> : <Play aria-hidden="true"/>}<span>Движение {motion ? 'вкл.' : 'выкл.'}</span></button><span>01 — 03</span></div>
      </div>
    </section>
    <div className="ticker" aria-hidden="true"><div className="ticker-track"><TickerRun/><TickerRun offset={-1.3}/></div></div>
    <section id="product" className="product-section">
      <div className={'product-visual '+product.color}><span className="small-label">01 / НАСТРОЙ ПАРУ</span><div className="product-watermark" aria-hidden="true"><span className="watermark-meta">COLORWAY / 0{edition + 1}</span><strong>{edition === 0 ? 'AIR' : edition === 1 ? 'DARK' : 'MINT'}</strong><span className="watermark-note">AIR FORCE 1 / 07</span></div><ProductModel edition={edition} label={product.label}/><span className="visual-caption"><span>AIR FORCE 1</span><span className="visual-drag-note"><MoveHorizontal size={13} aria-hidden="true"/><span className="drag-desktop">ПОВЕРНИ МОДЕЛЬ</span><span className="drag-mobile">ПРОВЕДИ ПО МОДЕЛИ</span></span><span>CLASSIC SHAPE. YOUR COLOR.</span></span></div>
      <div className="product-config" data-reveal><span className="eyebrow">ТРИ ЦВЕТА. ОДИН ТОЧНЫЙ СИЛУЭТ.</span><h2>AIR FORCE 1<br/><span>{product.name}</span></h2><p className="product-note">{product.note} Гладкая кожа, перфорация на носке и амортизация Nike Air.</p><p className="price">{money(product.price)} <span>за пару</span></p>
        <div className="option-label">Цвет <span>{product.label}</span></div>
        <RadioGroup aria-label="Цвет кроссовок" value={String(edition)} onValueChange={v=>showcaseEdition(Number(v))} className="color-options">
          {editions.map((e,i)=><div key={e.color} className={'color-choice '+(edition===i?'chosen':'')} onPointerUp={()=>{if(i===edition) showcaseEdition(i)}}><RadioGroupItem id={'color-'+i} value={String(i)} aria-label={e.label} className={'color-dot '+e.color}/><label htmlFor={'color-'+i}>{e.label}</label></div>)}
        </RadioGroup>
        <div className="option-label" id="sizes" tabIndex={-1}>Размер <span>EU / унисекс</span></div>
        <fieldset className="size-options">
          <legend className="visually-hidden">Размер EU</legend>
          {['36','37','38','39','40','41','42','43','44','45'].map(s=><button type="button" aria-pressed={size===s} key={s} className={'size-choice '+(size===s?'chosen':'')} onClick={()=>{setSize(s);setSizeError(false)}}>{s}</button>)}
        </fieldset>
        <p className="size-feedback" aria-live="polite">{sizeError?'Сначала укажи размер.':size?`Выбран ${size} EU`:'Ориентируйся на привычный размер EU.'}</p>
        <button className="primary-button add-button" onClick={addPair}>{added?'Пара уже в выборе':'Добавить в мой выбор'}{added?<Check size={21}/>:<Plus size={21}/>}</button>
        <span className="demo-note">Концепт-магазин: здесь можно собрать образ, но нельзя оформить оплату.</span>
      </div>
    </section>
    <section id="collection" className="collection"><div className="section-heading"><span className="small-label">02 / ЦВЕТ КАК ХАРАКТЕР</span><h2>ЦВЕТ<br/><span>МЕНЯЕТ СЦЕНАРИЙ.</span></h2><span className="count-tag">СВЕТ / НОЧЬ<br/>/ ИМПУЛЬС</span></div>
      <div className="edition-grid editorial-grid" data-reveal>{editions.map((e,i)=>{const story=editorialStories[i];return <article className={'editorial-card '+e.color+' story-'+story.crop} key={e.name} data-tilt><div className="story-top"><span>{story.eyebrow}</span><span>3D COLOR STUDY</span></div><div className="story-frame"><span className="story-index" aria-hidden="true">0{i+1}</span><ProductModel edition={i} label={e.label} view={story.crop}/><span className="story-detail">{story.detail}</span></div><div className="story-copy"><h3>{story.title}</h3><p>{story.description}</p></div><div className="story-tags" aria-label="Характер образа">{story.tags.map(tag=><span key={tag}>{tag}</span>)}</div></article>})}</div>
    </section>
    <section className="anatomy" aria-labelledby="anatomy-title">
      <div className="anatomy-head" data-reveal><span className="small-label">03 / ПОЧЕМУ ЕГО УЗНАЮТ</span><h2 id="anatomy-title">ФОРМА<br/><span>ГОВОРИТ.</span></h2><p>Кожа, строчка и подошва объясняют силуэт лучше громких слов. <span className="pointer-copy">Наведи мышь</span><span className="touch-copy">Коснись точки</span> — откроется деталь.</p></div>
      <div className="anatomy-visual" data-reveal data-tilt>
        <div className="anatomy-plate" aria-hidden="true" />
        <span className="anatomy-word" aria-hidden="true">AIR</span>
        <ShoeImage alt="Белый Nike Air Force 1, вид сбоку" className="anatomy-shoe tint-white" loading="lazy"/>
        {anatomyPoints.map((point,index)=><button type="button" key={point.position} className={`callout callout-${point.position} ${activeHotspot===index?'is-active':''}`} aria-pressed={activeHotspot===index} onMouseEnter={()=>setActiveHotspot(index)} onMouseLeave={()=>setActiveHotspot(null)} onFocus={()=>setActiveHotspot(index)} onBlur={()=>setActiveHotspot(null)} onClick={()=>setActiveHotspot(current=>current===index?null:index)}><b>{String(index+1).padStart(2,'0')}</b><span>{point.label[0]}<br/>{point.label[1]}</span><small>{point.note}</small></button>)}
        <div className="anatomy-foot"><span>EST. 1982</span><span className="anatomy-cta">ОТКРОЙ ДЕТАЛЬ <ArrowUpRight aria-hidden="true"/></span></div>
      </div>
    </section>
    <section className="details" id="details"><div data-reveal><span className="small-label">04 / ВСЁ ПО ДЕЛУ</span><h2>СОБРАН<br/>ДЛЯ <span className="details-highlight">ГОРОДА.</span></h2></div><div className="detail-list" data-reveal>{detailItems.map((item,index)=><article key={item.title} className={openDetail===index?'is-open':''}><span className="detail-number">{String(index+1).padStart(2,'0')}</span><div><h3>{item.title}</h3><p>{item.text}</p><div className="detail-extra" aria-hidden={openDetail!==index}><span>{item.spec}</span><ShoeImage alt="" className={`detail-preview detail-preview-${index+1}`}/></div></div><button className="detail-toggle" type="button" aria-expanded={openDetail===index} aria-label={`${openDetail===index?'Свернуть':'Раскрыть'}: ${item.title}`} onClick={()=>setOpenDetail(current=>current===index?null:index)}><ArrowUpRight/></button></article>)}</div></section>
    <footer>
      <div className="footer-head"><span className="small-label">DROP / AIR FORCE 1</span><span>05 / ТВОЯ ПАРА</span></div>
      <div className="footer-brand-row"><a href="#top" className="footer-brand"><span>drop</span><sup>®</sup></a><p className="footer-message">ЦВЕТ ВЫБРАН.<br/><span>Маршрут придумаешь сам.</span></p><a href="#top" className="footer-arrow" aria-label="Наверх"><ArrowUpRight/></a></div>
      <div className="footer-meta"><span>КОНЦЕПТ / 2026</span><a href="/credits.txt" target="_blank" rel="noreferrer">Источники 3D и фото</a><span>© DROP STUDIO</span></div>
    </footer>
    <Dialog open={bagOpen} onOpenChange={setBagOpen}><DialogContent className="bag-dialog" showCloseButton={false}><DialogClose className="dialog-close" aria-label="Закрыть"><X/></DialogClose><DialogTitle className="bag-title">МОЙ ВЫБОР<span> / {count}</span></DialogTitle><DialogDescription>Собери здесь свои пары. Это визуальный концепт — без оплаты и оформления заказа.</DialogDescription>
      {!bag.length?<div className="empty-bag"><ShoppingBag size={42}/><p>Пока пусто. Начни с цвета, который цепляет первым.</p><DialogClose className="primary-button">Выбрать пару <ArrowUpRight size={20}/></DialogClose></div>:<><div className="bag-items">{bag.map((p,i)=><div className="bag-item" key={p.edition+'-'+p.size}><ShoeImage src="/air-force-1-white.png" className={'tint-'+editions[p.edition].color} alt=""/><div><strong>{editions[p.edition].name}</strong><p>EU {p.size} · {money(editions[p.edition].price)}</p><div className="quantity"><button aria-label="Уменьшить количество" onClick={()=>setBag(b=>b.flatMap((x,j)=>j!==i?[x]:x.qty>1?[{...x,qty:x.qty-1}]:[]))}><Minus size={14}/></button><span>{p.qty}</span><button aria-label="Увеличить количество" onClick={()=>setBag(b=>b.map((x,j)=>j===i?{...x,qty:x.qty+1}:x))}><Plus size={14}/></button></div></div><button className="remove-pair" aria-label={'Удалить '+editions[p.edition].name} onClick={()=>setBag(b=>b.filter((_,j)=>j!==i))}><X size={18}/></button></div>)}</div><div className="bag-total">Итого <strong>{money(bag.reduce((s,p)=>s+editions[p.edition].price*p.qty,0))}</strong></div><DialogClose className="primary-button">Вернуться к цветам <ArrowUpRight size={20}/></DialogClose></>}
    </DialogContent></Dialog>
  </main>;
}
