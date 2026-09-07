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
    note: 'Чистая классика. Узнаваемая с первого взгляда.', pitch: 'ЧИСТАЯ КЛАССИКА',
    benefits: [
      { title: 'Кожаный верх', text: 'Поддержка и прочность на каждый день.' },
      { title: 'Свежесть в движении', text: 'Перфорация помогает воздухообмену.' },
      { title: 'Nike Air', text: 'Лёгкая амортизация на весь день.' },
    ],
  },
  {
    name: 'AFTER HOURS', label: 'Графит', color: 'ink', price: 12900,
    note: 'Для тех, кто живёт после заката.', pitch: 'ГОРОДСКОЙ ГРАФИТ',
    benefits: [
      { title: 'Мягкая посадка', text: 'Низкий воротник комфортно сидит у щиколотки.' },
      { title: 'Уверенный шаг', text: 'Круговой рисунок подошвы даёт сцепление.' },
      { title: 'Запас прочности', text: 'Резина и прошитые накладки готовы к городу.' },
    ],
  },
  {
    name: 'MINT CUSTOM', label: 'Мятный', color: 'mint', price: 13900,
    note: 'Свежий взгляд на легендарную форму.', pitch: 'СВЕЖИЙ АКЦЕНТ',
    benefits: [
      { title: 'Комфорт весь день', text: 'Nike Air мягко принимает каждый шаг.' },
      { title: 'Больше воздуха', text: 'Перфорация поддерживает вентиляцию.' },
      { title: 'Мягкий контакт', text: 'Воротник с набивкой приятно ощущается на ноге.' },
    ],
  },
] as const;
const editorialStories = [
  {
    eyebrow: 'LIGHT / 01',
    title: 'ЧИСТЫЙ СВЕТ',
    detail: 'НОСОК / ПЕРФОРАЦИЯ',
    description: 'Белая кожа ловит мягкий свет и подчёркивает чистую геометрию силуэта.',
    tags: ['ВОЗДУХ', 'ФОРМА'],
    crop: 'toe',
  },
  {
    eyebrow: 'NIGHT / 02',
    title: 'ПОСЛЕ ЗАКАТА',
    detail: 'SWOOSH / СЛОИ',
    description: 'Графит раскрывается бликами: панели и строчка появляются только в движении.',
    tags: ['ТЕНЬ', 'КОНТРАСТ'],
    crop: 'swoosh',
  },
  {
    eyebrow: 'FRESH / 03',
    title: 'СВЕЖИЙ АКЦЕНТ',
    detail: 'ПЯТКА / ПОДОШВА',
    description: 'Мятный оттенок смягчает массивную форму и собирает взгляд на деталях.',
    tags: ['ЦВЕТ', 'РИТМ'],
    crop: 'heel',
  },
] as const;
const tickerWords = [
  'ТВОЙ РИТМ', 'ТВОИ ПРАВИЛА', 'ТВОЙ DROP',
  'ТВОЙ РИТМ', 'ТВОИ ПРАВИЛА', 'ТВОЙ DROP',
  'ТВОЙ РИТМ', 'ТВОИ ПРАВИЛА', 'ТВОЙ DROP',
];
const money = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
type Pair = { edition: number; size: string; qty: number };
const anatomyPoints = [
  { position: 'one', label: ['КОЖАНЫЕ', 'ПАНЕЛИ'], note: 'Многослойная кожа держит форму и раскрывает фактуру в движении.' },
  { position: 'two', label: ['ПЕРФОРАЦИЯ', 'НОСКА'], note: 'Точная сетка отверстий сохраняет узнаваемый ритм оригинала.' },
  { position: 'three', label: ['AIR', 'CUSHIONING'], note: 'Воздушная амортизация спрятана внутри массивной подошвы.' },
];
const detailItems = [
  { title: 'Объём имеет значение.', text: 'Выразительная подошва и многослойный силуэт. Пара, вокруг которой собирается весь образ.', spec: 'МНОГОСЛОЙНЫЙ ВЕРХ / ПЛОТНЫЙ СИЛУЭТ' },
  { title: 'Свой цвет. Свой маршрут.', text: 'Белый, графитовый или мятный — для спокойных сочетаний и смелых экспериментов.', spec: '3 COLORWAYS / ONE ICON' },
  { title: 'Без лишних рамок.', text: 'Унисекс-модель. Размеры от 36 до 45. Выбирай то, что подходит именно тебе.', spec: 'EU 36—45 / UNISEX' },
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
    <a className="skip-link" href="#product">Перейти к выбору кроссовок</a>
    <div className="drop-banner"><div><span>NEW DROP / AIR FORCE 1</span><span>БЕЛЫЙ · ГРАФИТ · МЯТНЫЙ</span><span>CONCEPT 2026</span></div></div>
    <header className="header">
      <a href="#top" className="wordmark" aria-label="DROP — на главную">drop<span>®</span></a>
      <nav aria-label="Основная навигация"><a href="#collection">Коллекция <span>03</span></a><a href="#details">В деталях</a></nav>
      <button className="bag-button" onClick={() => setBagOpen(true)}><ShoppingBag size={17}/><span>Мой выбор</span><b>{count.toString().padStart(2,'0')}</b></button>
    </header>
    <section className="flight-section" aria-labelledby="hero-heading">
      <div className="flight-sticky">
        <div className="hero-meta"><span><i/> НЕЗАВИСИМЫЙ СНИКЕР-ДРОП</span><span>КОЛЛЕКЦИЯ / 001</span></div>
        <h1 id="hero-heading">ВНЕ<br/><span>ГРАВИТАЦИИ.</span></h1>
        <div className="orbit" aria-hidden="true"/>
        <ShoeScene edition={edition} motion={motion}/>
        <div className="side-label"><span>СОЗДАНЫ ДЛЯ ДВИЖЕНИЯ</span><ArrowUpRight aria-hidden="true"/></div>
        {!heroProduct && <><div className="hero-copy"><span className="small-label">NIKE AIR FORCE 1 / 07</span><p>Земля подождёт.<br/>Твой следующий шаг — <strong>выше.</strong></p><a className="primary-button" href="#product">Выбрать свою пару <ArrowUpRight size={21}/></a></div>
        <div className="hero-sticker" aria-hidden="true">НИЖЕ<br/>ТОЛЬКО<br/><b>ГРАВИТАЦИЯ.</b><ArrowDown size={22}/></div></>}
        {heroProduct && <aside key={heroShowcaseRun} className={'hero-pitch '+heroProduct.color} aria-live="polite" aria-atomic="true">
          <div className="hero-pitch-head"><span><i aria-hidden="true"/> COLORWAY / 0{heroShowcaseIndex + 1}</span><span>ВЫБРАНО · {heroProduct.label.toUpperCase()}</span></div>
          <div className="hero-pitch-body">
            <div className="hero-pitch-name"><span>AIR FORCE 1 / 07</span><strong>{heroProduct.pitch}</strong></div>
            <p className="hero-pitch-price">{money(heroProduct.price)}<span>за пару</span></p>
            <div className="hero-pitch-benefits">{heroProduct.benefits.map((benefit,index)=><div key={benefit.title} style={{'--pitch-delay': `${.32 + index * .1}s`} as CSSProperties}><span>0{index + 1}</span><p><strong>{benefit.title}</strong><small>{benefit.text}</small></p></div>)}</div>
          </div>
        </aside>}
        <div className="hero-bottom"><span><ArrowDown size={16}/><span className="scroll-copy-full">ЛИСТАЙ. ПРИЗЕМЛИМСЯ ВМЕСТЕ.</span><span className="scroll-copy-short">ЛИСТАЙ</span></span><button onClick={() => setMotion(!motion)} aria-pressed={motion}>{motion ? <Pause aria-hidden="true"/> : <Play aria-hidden="true"/>}<span>Анимация {motion ? 'вкл.' : 'выкл.'}</span></button><span>01 — 03</span></div>
      </div>
    </section>
    <div className="ticker" aria-hidden="true"><div className="ticker-track"><TickerRun/><TickerRun offset={-1.3}/></div></div>
    <section id="product" className="product-section">
      <div className={'product-visual '+product.color}><span className="small-label">01 / ВЫБЕРИ СВОЮ СТОРОНУ</span><div className="product-watermark" aria-hidden="true"><span className="watermark-meta">COLORWAY / 0{edition + 1}</span><strong>{edition === 0 ? 'AIR' : edition === 1 ? 'DARK' : 'MINT'}</strong><span className="watermark-note">AIR FORCE 1 / 07</span></div><ProductModel edition={edition} label={product.label}/><span className="visual-caption"><span>AIR FORCE 1</span><span className="visual-drag-note"><MoveHorizontal size={13} aria-hidden="true"/><span className="drag-desktop">ДВИГАЙ МЫШЬЮ</span><span className="drag-mobile">ПРОВЕДИ ПО МОДЕЛИ</span></span><span>EVERYDAY, BUT LOUDER.</span></span></div>
      <div className="product-config" data-reveal><span className="eyebrow">ОДИН СИЛУЭТ. ТРИ ХАРАКТЕРА.</span><h2>AIR FORCE 1<br/><span>{product.name}</span></h2><p className="product-note">{product.note} Кожаные панели, перфорация на носке и узнаваемая массивная подошва.</p><p className="price">{money(product.price)} <span>за пару</span></p>
        <div className="option-label">Цвет <span>{product.label}</span></div>
        <RadioGroup aria-label="Цвет кроссовок" value={String(edition)} onValueChange={v=>showcaseEdition(Number(v))} className="color-options">
          {editions.map((e,i)=><div key={e.color} className={'color-choice '+(edition===i?'chosen':'')} onPointerUp={()=>{if(i===edition) showcaseEdition(i)}}><RadioGroupItem id={'color-'+i} value={String(i)} aria-label={e.label} className={'color-dot '+e.color}/><label htmlFor={'color-'+i}>{e.label}</label></div>)}
        </RadioGroup>
        <div className="option-label" id="sizes" tabIndex={-1}>Размер <span>EU / унисекс</span></div>
        <fieldset className="size-options">
          <legend className="visually-hidden">Размер EU</legend>
          {['36','37','38','39','40','41','42','43','44','45'].map(s=><button type="button" aria-pressed={size===s} key={s} className={'size-choice '+(size===s?'chosen':'')} onClick={()=>{setSize(s);setSizeError(false)}}>{s}</button>)}
        </fieldset>
        <p className="size-feedback" aria-live="polite">{sizeError?'Сначала выбери размер.':size?`Твой размер — ${size} EU`:'Выбери привычный европейский размер.'}</p>
        <button className="primary-button add-button" onClick={addPair}>{added?'Пара в твоём выборе':'Забрать в мой выбор'}{added?<Check size={21}/>:<Plus size={21}/>}</button>
        <span className="demo-note">Концепт-магазин. Цветные варианты — концепты кастомизации. Без оплаты.</span>
      </div>
    </section>
    <section id="collection" className="collection"><div className="section-heading"><span className="small-label">02 / ТРИ СОСТОЯНИЯ</span><h2>ОДИН СИЛУЭТ.<br/><span>ТРИ ХАРАКТЕРА.</span></h2><span className="count-tag">СВЕТ / ТЕНЬ<br/>/ АКЦЕНТ</span></div>
      <div className="edition-grid editorial-grid" data-reveal>{editions.map((e,i)=>{const story=editorialStories[i];return <article className={'editorial-card '+e.color+' story-'+story.crop} key={e.name} data-tilt><div className="story-top"><span>{story.eyebrow}</span><span>3D COLOR STUDY</span></div><div className="story-frame"><span className="story-index" aria-hidden="true">0{i+1}</span><ProductModel edition={i} label={e.label} view={story.crop}/><span className="story-detail">{story.detail}</span></div><div className="story-copy"><h3>{story.title}</h3><p>{story.description}</p></div><div className="story-tags" aria-label="Характер образа">{story.tags.map(tag=><span key={tag}>{tag}</span>)}</div></article>})}</div>
    </section>
    <section className="anatomy" aria-labelledby="anatomy-title">
      <div className="anatomy-head" data-reveal><span className="small-label">03 / АНАТОМИЯ ЛЕГЕНДЫ</span><h2 id="anatomy-title">СМОТРИ<br/><span>БЛИЖЕ.</span></h2><p>Культовый силуэт читается в деталях. <span className="pointer-copy">Наведи мышь</span><span className="touch-copy">Коснись точки</span> — поверхность отреагирует на движение.</p></div>
      <div className="anatomy-visual" data-reveal data-tilt>
        <div className="anatomy-plate" aria-hidden="true" />
        <span className="anatomy-word" aria-hidden="true">AIR</span>
        <ShoeImage alt="Белый Nike Air Force 1, вид сбоку" className="anatomy-shoe tint-white" loading="lazy"/>
        {anatomyPoints.map((point,index)=><button type="button" key={point.position} className={`callout callout-${point.position} ${activeHotspot===index?'is-active':''}`} aria-pressed={activeHotspot===index} onMouseEnter={()=>setActiveHotspot(index)} onMouseLeave={()=>setActiveHotspot(null)} onFocus={()=>setActiveHotspot(index)} onBlur={()=>setActiveHotspot(null)} onClick={()=>setActiveHotspot(current=>current===index?null:index)}><b>{String(index+1).padStart(2,'0')}</b><span>{point.label[0]}<br/>{point.label[1]}</span><small>{point.note}</small></button>)}
        <div className="anatomy-foot"><span>EST. 1982</span><span className="anatomy-cta">ВЫБЕРИ ТОЧКУ <ArrowUpRight aria-hidden="true"/></span></div>
      </div>
    </section>
    <section className="details" id="details"><div data-reveal><span className="small-label">04 / БЛИЖЕ К ДЕЛУ</span><h2>БОЛЬШЕ<br/>ЧЕМ <span className="details-highlight">ФОРМА.</span></h2></div><div className="detail-list" data-reveal>{detailItems.map((item,index)=><article key={item.title} className={openDetail===index?'is-open':''}><span className="detail-number">{String(index+1).padStart(2,'0')}</span><div><h3>{item.title}</h3><p>{item.text}</p><div className="detail-extra" aria-hidden={openDetail!==index}><span>{item.spec}</span><ShoeImage alt="" className={`detail-preview detail-preview-${index+1}`}/></div></div><button className="detail-toggle" type="button" aria-expanded={openDetail===index} aria-label={`${openDetail===index?'Свернуть':'Раскрыть'}: ${item.title}`} onClick={()=>setOpenDetail(current=>current===index?null:index)}><ArrowUpRight/></button></article>)}</div></section>
    <footer>
      <div className="footer-head"><span className="small-label">DROP / AIR FORCE 1</span><span>05 / СВОЙ ХОД</span></div>
      <div className="footer-brand-row"><a href="#top" className="footer-brand"><span>drop</span><sup>®</sup></a><p className="footer-message">ИДИ СВОИМ ХОДОМ.<br/><span>Ниже только гравитация.</span></p><a href="#top" className="footer-arrow" aria-label="Наверх"><ArrowUpRight/></a></div>
      <div className="footer-meta"><span>КОНЦЕПТ / 2026</span><a href="/credits.txt" target="_blank" rel="noreferrer">Источники 3D и фото</a><span>© DROP STUDIO</span></div>
    </footer>
    <Dialog open={bagOpen} onOpenChange={setBagOpen}><DialogContent className="bag-dialog" showCloseButton={false}><DialogClose className="dialog-close" aria-label="Закрыть"><X/></DialogClose><DialogTitle className="bag-title">ТВОЙ ВЫБОР<span> / {count}</span></DialogTitle><DialogDescription>Твои пары в одном месте. Это демонстрационный магазин — оплату не принимаем.</DialogDescription>
      {!bag.length?<div className="empty-bag"><ShoppingBag size={42}/><p>Здесь скоро будет твой DROP.</p><DialogClose className="primary-button">Продолжить выбор <ArrowUpRight size={20}/></DialogClose></div>:<><div className="bag-items">{bag.map((p,i)=><div className="bag-item" key={p.edition+'-'+p.size}><ShoeImage src="/air-force-1-white.png" className={'tint-'+editions[p.edition].color} alt=""/><div><strong>{editions[p.edition].name}</strong><p>EU {p.size} · {money(editions[p.edition].price)}</p><div className="quantity"><button aria-label="Уменьшить количество" onClick={()=>setBag(b=>b.flatMap((x,j)=>j!==i?[x]:x.qty>1?[{...x,qty:x.qty-1}]:[]))}><Minus size={14}/></button><span>{p.qty}</span><button aria-label="Увеличить количество" onClick={()=>setBag(b=>b.map((x,j)=>j===i?{...x,qty:x.qty+1}:x))}><Plus size={14}/></button></div></div><button className="remove-pair" aria-label={'Удалить '+editions[p.edition].name} onClick={()=>setBag(b=>b.filter((_,j)=>j!==i))}><X size={18}/></button></div>)}</div><div className="bag-total">Итого <strong>{money(bag.reduce((s,p)=>s+editions[p.edition].price*p.qty,0))}</strong></div><DialogClose className="primary-button">Продолжить выбор <ArrowUpRight size={20}/></DialogClose></>}
    </DialogContent></Dialog>
  </main>;
}
